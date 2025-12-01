import { getCurrentDate } from "@/core/utils/date";
import { CustomerDto, ScrewDto } from "@/core/validations";
import { Buffer } from "buffer";
import { parse as csvParse } from "csv-parse/sync";
import { and, eq, inArray } from "drizzle-orm";
import ExcelJS from "exceljs";
import { DB } from "../db";
import {
	customer,
	customerPlatform,
	platform,
	screw,
	screwType,
} from "../db/schema";
import type { CustomerModel } from "../models/customer.model";
import type {
	ImportFileExtension,
	ImportOptions,
	ImportResult,
	ImportService,
	ImportType,
	ValidationErrorDetail,
	ValidationResult,
	ValidationWarning,
} from "./interfaces/import-service.interface";

export class ImportServiceImpl implements ImportService {
	async import(
		db: DB,
		file: Buffer | ReadableStream,
		fileType: ImportFileExtension,
		operatorId: number,
		type: ImportType,
		options: ImportOptions = {},
	) {
		if (type === "customer")
			return await this.importCustomers(
				db,
				file,
				fileType,
				operatorId,
				options,
			);
		if (type === "screw")
			return await this.importScrews(db, file, fileType, operatorId, options);

		return {
			success: false,
			totalProcessed: 0,
			rowsCreated: 0,
			rowsUpdated: 0,
			valid: false,
			errors: [],
			warnings: [],
			totalRecords: 0,
		};
	}

	private async importCustomers(
		db: DB,
		file: Buffer | ReadableStream,
		fileType: "csv" | "excel",
		operatorId: number,
		options: ImportOptions = {},
	): Promise<ImportResult> {
		const data = await this.parseFile(file, fileType, options);
		const validationResult = await this.validateCustomerData(
			file,
			fileType,
			options,
		);

		if (!validationResult.valid) {
			return {
				success: false,
				totalProcessed: data.length,
				rowsCreated: 0,
				rowsUpdated: 0,
				totalRecords: data.length,
				valid: validationResult.valid,
				errors: validationResult.errors,
				warnings: validationResult.warnings,
			};
		}

		return await db.transaction(async (tx) => {
			let rowsCreated = 0;
			let rowsUpdated = 0;

			const batchSize = options.batchSize || 100;
			for (let i = 0; i < data.length; i += batchSize) {
				const batch = data.slice(i, i + batchSize);

				// Prepare for batch operations
				const customerNames = batch.map(
					(record) => this.mapToCustomerModel(record).name,
				);

				// Get existing customers in one query
				const existingCustomers = options.updateExisting
					? await tx
							.select()
							.from(customer)
							.where(
								inArray(
									customer.name,
									customerNames.map((name) => `%${name}%`),
								),
							)
					: [];

				// Create maps for faster lookups
				const existingCustomerMap = new Map();
				existingCustomers.forEach((customer) => {
					// Use the customer name for lookup (simplified for this example)
					existingCustomerMap.set(customer.name, customer);
				});

				// Collect all platform names
				const platformNames = new Set(
					batch.map((record) => this.mapToCustomerModel(record).platform),
				);

				// Get existing platforms in one query
				const existingPlatforms = await tx
					.select()
					.from(platform)
					.where(inArray(platform.name, Array.from(platformNames)));

				// Create a map for faster platform lookups
				const platformMap = new Map();
				existingPlatforms.forEach((platform) => {
					platformMap.set(platform.name, platform);
				});

				// Collect platforms that need to be created
				const platformsToCreate = Array.from(platformNames)
					.filter((name) => !platformMap.has(name))
					.map((name) => ({ name }));

				// Bulk insert new platforms if any
				let newPlatforms: { id: number; name: string | null }[] = [];
				if (platformsToCreate.length > 0) {
					newPlatforms = await tx
						.insert(platform)
						.values(platformsToCreate)
						.returning({ id: platform.id, name: platform.name });

					// Add new platforms to the map
					newPlatforms.forEach((platform) => {
						platformMap.set(platform.name, platform);
					});
				}

				// Prepare collections for bulk operations
				const customersToCreate: any[] = [];
				const customersToUpdate: any[] = [];
				const customerPlatformsToCreate: any[] = [];
				const customerPlatformsToUpdate: any[] = [];

				// Process each record to prepare for bulk operations
				batch.forEach((record) => {
					const customerData = this.mapToCustomerModel(record);
					const existingCustomer = Array.from(
						existingCustomerMap.values(),
					).find((c) => c.name.includes(customerData.name));

					if (existingCustomer && options.updateExisting) {
						// Add to update collection
						customersToUpdate.push({
							...customerData,
							id: existingCustomer.id,
							updatedBy: operatorId,
							updatedAt: getCurrentDate(),
						});

						// Add platform relation to update
						const platform = platformMap.get(customerData.platform);
						if (platform) {
							customerPlatformsToUpdate.push({
								customerId: existingCustomer.id,
								platformId: platform.id,
								userId: operatorId,
								updatedAt: getCurrentDate(),
							});
						}

						rowsUpdated++;
					} else {
						// Add to create collection
						const newCustomerEntry = {
							...customerData,
							createdBy: operatorId,
							assignedTo: operatorId,
						};
						customersToCreate.push(newCustomerEntry);

						rowsCreated++;
					}
				});

				// Bulk create new customers
				let newCustomers: any[] = [];
				if (customersToCreate.length > 0) {
					newCustomers = await tx
						.insert(customer)
						.values(customersToCreate)
						.returning({ id: customer.id, name: customer.name });
				}

				// Bulk update existing customers
				if (customersToUpdate.length > 0) {
					for (const customerToUpdate of customersToUpdate) {
						await tx
							.update(customer)
							.set(customerToUpdate)
							.where(eq(customer.id, customerToUpdate.id));
					}

					// Bulk update customer platforms
					for (const cpToUpdate of customerPlatformsToUpdate) {
						await tx
							.update(customerPlatform)
							.set({
								platformId: cpToUpdate.platformId,
								updatedAt: cpToUpdate.updatedAt,
							})
							.where(
								and(
									eq(customerPlatform.customerId, cpToUpdate.customerId),
									eq(customerPlatform.userId, cpToUpdate.userId),
								),
							);
					}
				}

				// Prepare customer-platform relations for new customers
				if (newCustomers.length > 0) {
					const cpEntries = newCustomers.map((customer) => {
						const customerData = customersToCreate.find(
							(c) => c.name === customer.name,
						);
						const platform = platformMap.get(customerData.platform);

						return {
							customerId: customer.id,
							platformId: platform.id,
							userId: operatorId,
						};
					});

					// Bulk insert customer-platform relations
					if (cpEntries.length > 0) {
						await tx.insert(customerPlatform).values(cpEntries);
					}
				}
			}

			return {
				success: true,
				totalProcessed: data.length,
				rowsCreated,
				rowsUpdated,
				valid: true,
				errors: [],
				warnings: [],
				totalRecords: data.length,
			};
		});
	}

	private async importScrews(
		db: DB,
		file: Buffer | ReadableStream,
		fileType: "csv" | "excel",
		operatorId: number,
		options: ImportOptions = {},
	): Promise<ImportResult> {
		const data = await this.parseFile<ScrewDto>(file, fileType, options);
		const validationResult = await this.validateScrewData(data);

		if (!validationResult.valid) {
			return {
				success: false,
				totalProcessed: data.length,
				rowsCreated: 0,
				rowsUpdated: 0,
				totalRecords: data.length,
				valid: validationResult.valid,
				errors: validationResult.errors,
				warnings: validationResult.warnings,
			};
		}

		return await db.transaction(async (tx) => {
			let rowsCreated = 0;
			let rowsUpdated = 0;

			const batchSize = options.batchSize || 100;
			for (let i = 0; i < data.length; i += batchSize) {
				const batch = data.slice(i, i + batchSize);

				// Get all screw names in the current batch
				const screwNames = batch.map((record) => record.name);

				// Get existing screws in one query
				const existingScrews = options.updateExisting
					? await tx.select().from(screw).where(inArray(screw.name, screwNames))
					: [];

				// Create map for faster lookups
				const existingScrewMap = new Map();
				existingScrews.forEach((screw) => {
					existingScrewMap.set(screw.name, screw);
				});

				// Collect all component types
				const componentTypes = new Set(
					batch.map((record) => record.componentType),
				);

				// Get existing component types in one query
				const existingTypes = await tx
					.select()
					.from(screwType)
					.where(inArray(screwType.name, Array.from(componentTypes)));

				// Create map for faster lookups
				const typeMap = new Map();
				existingTypes.forEach((type) => {
					typeMap.set(type.name, type);
				});

				// Collect types that need to be created
				const typesToCreate = Array.from(componentTypes)
					.filter((name) => !typeMap.has(name))
					.map((name) => ({ name }));

				// Bulk insert new component types
				if (typesToCreate.length > 0) {
					const newTypes = await tx
						.insert(screwType)
						.values(typesToCreate)
						.returning({ id: screwType.id, name: screwType.name });

					newTypes.forEach((type) => {
						typeMap.set(type.name, type);
					});
				}

				// Prepare collections for bulk operations
				const screwsToCreate: any[] = [];
				const screwsToUpdate: any[] = [];

				// Process each record
				batch.forEach((record) => {
					const screwData = record;
					const existingScrew = existingScrewMap.get(screwData.name);
					const componentType = typeMap.get(screwData.componentType);

					if (existingScrew && options.updateExisting) {
						// Add to update collection
						screwsToUpdate.push({
							...screwData,
							id: existingScrew.id,
							componentTypeId: componentType.id,
							updatedAt: getCurrentDate(),
						});

						rowsUpdated++;
					} else {
						// Add to create collection
						screwsToCreate.push({
							...screwData,
							componentTypeId: componentType.id,
							sizeId: 9999,
							materialId: 9999,
						});

						rowsCreated++;
					}
				});

				// Bulk insert new screws
				if (screwsToCreate.length > 0) {
					await tx.insert(screw).values(screwsToCreate);
				}

				// Bulk update existing screws
				if (screwsToUpdate.length > 0) {
					for (const screwToUpdate of screwsToUpdate) {
						await tx
							.update(screw)
							.set(screwToUpdate)
							.where(eq(screw.id, screwToUpdate.id));
					}
				}
			}

			return {
				success: true,
				totalProcessed: data.length,
				rowsCreated,
				rowsUpdated,
				totalRecords: data.length,
				valid: true,
				errors: [],
				warnings: [],
			};
		});
	}

	async validateScrewData(data: any[]): Promise<ValidationResult> {
		const errors: ValidationErrorDetail[] = [];

		data.forEach((record, index) => {
			const rowNum = index + 2;

			if (!record.name) {
				errors.push({
					row: rowNum,
					column: "name",
					message: "Name is required",
					value: record.name,
				});
			}
		});

		return {
			valid: errors.length === 0,
			errors: [],
			warnings: [],
			totalRecords: data.length,
		};
	}

	public async validateCustomerData(
		file: Buffer | ReadableStream,
		fileType: "csv" | "excel",
		options: ImportOptions = {},
	): Promise<ValidationResult> {
		const data = await this.parseFile<CustomerDto>(file, fileType, options);
		const errors: ValidationErrorDetail[] = [];
		const warnings: ValidationWarning[] = [];

		data.forEach((record, index) => {
			const rowNum = index + 2;

			if (!record.name) {
				errors.push({
					row: rowNum,
					column: "name",
					message: "Name is required",
					value: record.name,
				});
			}

			if (record.phone && !this.isValidPhone(record.phone)) {
				warnings.push({
					row: rowNum,
					column: "phone",
					message: "Phone number format may be invalid",
					value: record.phone,
				});
			}

			if (!record.platform) {
				errors.push({
					row: rowNum,
					column: "platform",
					message: "Platform is required",
					value: record.platform,
				});
			}
		});

		return {
			valid: errors.length === 0,
			errors,
			warnings,
			totalRecords: data.length,
		};
	}

	private async parseFile<T>(
		file: Buffer | ReadableStream,
		fileType: "csv" | "excel",
		options: ImportOptions = {},
	): Promise<T[]> {
		let buffer: Buffer;

		if (file instanceof ReadableStream) {
			const chunks: Buffer[] = [];
			const reader = file.getReader();
			let result;
			do {
				result = await reader.read();
				if (result.value) chunks.push(Buffer.from(result.value));
			} while (!result.done);
			buffer = Buffer.concat(chunks);
		} else {
			buffer = file;
		}

		if (fileType === "csv") {
			if (options.headerRow === false) {
				// If no header row, csv-parse returns string[][]. We need to map it to T[] where T is an object.
				const records: string[][] = csvParse(buffer, {
					columns: false, // Ensure it returns string[][]
					skip_empty_lines: true,
				});
				// Map each string array to an object with numeric keys as strings
				return records.map((row) => {
					const obj: Record<string, string> = {};
					row.forEach((value, index) => {
						obj[index.toString()] = value;
					});
					return obj;
				}) as T[]; // Cast to T[]
			} else {
				// With header row, csv-parse returns Record<string, string>[]
				return csvParse(buffer, {
					columns: true, // Ensure it returns Record<string, string>[]
					skip_empty_lines: true,
				}) as T[]; // Cast to T[]
			}
		}

		if (fileType === "excel") {
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.load(buffer as any);
			const worksheet = workbook.worksheets[0];

			const rows: any[] = [];
			const headers: string[] = [];

			worksheet?.getRow(1).eachCell((cell, colNumber) => {
				headers[colNumber - 1] = cell.text.trim();
			});

			worksheet?.eachRow((row, rowNumber) => {
				if (rowNumber === 1) return;

				const rowData: Record<string, any> = {};
				row.eachCell((cell, colNumber) => {
					const header = headers[colNumber - 1];
					if (!header) return;
					const mappedKey = options.columnMapping?.[header] || header;
					const value = cell.text.trim();

					if (mappedKey === "nextMessageTime") {
						rowData[mappedKey] = new Date(value).toISOString();
					} else {
						rowData[mappedKey] = value;
					}
				});
				rows.push(rowData);
			});

			return rows;
		}

		throw new Error("Unsupported file type");
	}

	private mapToCustomerModel(
		record: any,
		columnMapping?: Record<string, string>,
	): CustomerModel {
		if (!columnMapping) return record as CustomerModel;

		const customer: any = {};
		for (const [sourceField, targetField] of Object.entries(columnMapping)) {
			customer[targetField] = record[sourceField];
		}
		return customer as CustomerModel;
	}

	private isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	private isValidPhone(phone: string): boolean {
		return /^[+]?[\d\s()-]{7,20}$/.test(phone);
	}

	private reverse(obj: Record<string, any>): Record<string, any> {
		const reversed: Record<string, string> = {};
		for (const [key, value] of Object.entries(obj)) {
			reversed[value] = key;
		}
		return reversed;
	}
}
