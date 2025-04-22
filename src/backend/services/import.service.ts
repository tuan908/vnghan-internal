import { getCurrentDate } from "@/shared/utils/date";
import { parse as csvParse } from "csv-parse/sync";
import { and, eq, like } from "drizzle-orm";
import * as XLSX from "xlsx";
import { DbSchema } from "../db/schema";
import type { CustomerModel } from "../models/customer.model";
import type { Database } from "../types";
import type {
  CustomerImportOptions,
  CustomerImportResult,
  CustomerValidationError,
  CustomerValidationResult,
  CustomerValidationWarning,
  ImportService,
} from "./interfaces/import-service.interface";

export class ImportServiceImpl implements ImportService {
  async importCustomers(
    db: Database,
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
    operatorId: number,
    options: CustomerImportOptions = {},
  ): Promise<CustomerImportResult> {
    // Parse the file based on type
    const data = await this.parseFile(file, fileType, options);

    // Validate before proceeding
    const validationResult = await this.validateCustomerData(
      file,
      fileType,
      options,
    );
    if (!validationResult.valid) {
      throw new Error(
        "Validation failed: " + JSON.stringify(validationResult.errors),
      );
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      let customersCreated = 0;
      let customersUpdated = 0;

      // Process in batches
      const batchSize = options.batchSize || 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        for (const record of batch) {
          const customerData = this.mapToCustomerModel(record);

          if (options.updateExisting) {
            // Try to find existing customer by name
            const [existingCustomer] = await tx
              .select()
              .from(DbSchema.Customer)
              .where(like(DbSchema.Customer.name, `%${customerData.name}%`))
              .limit(1);

            if (existingCustomer) {
              // Use onConflictDoUpdate for existing record
              await tx
                .insert(DbSchema.Customer)
                .values({ ...customerData, id: existingCustomer.id })
                .onConflictDoUpdate({
                  target: DbSchema.Customer.id,
                  set: {
                    ...customerData,
                    updatedBy: operatorId,
                    updatedAt: getCurrentDate(),
                  },
                });

              await tx
                .update(DbSchema.CustomerPlatform)
                .set({
                  platformId: DbSchema.Platform.id,
                  updatedAt: getCurrentDate(),
                })
                .from(DbSchema.CustomerPlatform)
                .innerJoin(
                  DbSchema.Platform,
                  eq(
                    DbSchema.CustomerPlatform.platformId,
                    DbSchema.Platform.id,
                  ),
                )
                .where(
                  and(
                    eq(
                      DbSchema.CustomerPlatform.customerId,
                      existingCustomer.id,
                    ),
                    eq(DbSchema.CustomerPlatform.userId, operatorId),
                    eq(DbSchema.Platform.name, customerData.platform),
                  ),
                );
              customersUpdated++;
              continue;
            }
          }

          // Insert new customer
          const [customer] = await tx
            .insert(DbSchema.Customer)
            .values({
              ...customerData,
              createdBy: operatorId,
              assignedTo: operatorId,
            })
            .returning();
          const [platform] = await tx
            .select({
              id: DbSchema.Platform.id,
            })
            .from(DbSchema.Platform)
            .where(eq(DbSchema.Platform.name, customerData.platform));
          await tx
            .insert(DbSchema.CustomerPlatform)
            .values({
              customerId: customer?.id!,
              platformId: platform?.id!,
              userId: operatorId,
            })
            .returning();
          customersCreated++;
        }
      }

      return {
        success: true,
        totalProcessed: data.length,
        customersCreated,
        customersUpdated,
      };
    });
  }

  async validateCustomerData(
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
    options: CustomerImportOptions = {},
  ): Promise<CustomerValidationResult> {
    const data = await this.parseFile(file, fileType, options);
    const errors: CustomerValidationError[] = [];
    const warnings: CustomerValidationWarning[] = [];

    // Validate each record
    data.forEach((record, index) => {
      const rowNum = index + (fileType === "csv" ? 2 : 2); // Adjust for header row

      // Check name
      if (!record.name) {
        errors.push({
          row: rowNum,
          column: "name",
          message: "Name is required",
          value: record.name,
        });
      }

      // Add warnings for potential issues
      if (record.phone && !this.isValidPhone(record.phone)) {
        warnings.push({
          row: rowNum,
          column: "phone",
          message: "Phone number format may be invalid",
          value: record.phone,
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

  // Helper methods
  private async parseFile(
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
    options: CustomerImportOptions = {},
  ): Promise<any[]> {
    let buffer: Buffer;

    if (file instanceof ReadableStream) {
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const reader = file.getReader();

      let result;
      do {
        result = await reader.read();
        if (result.value) {
          chunks.push(Buffer.from(result.value));
        }
      } while (!result.done);

      buffer = Buffer.concat(chunks);
    } else {
      buffer = file;
    }

    if (fileType === "csv") {
      const records = csvParse(buffer, {
        columns: options.headerRow !== false,
        skip_empty_lines: true,
      });
      return records;
    } else if (fileType === "excel") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName!];
      const raw = XLSX.utils.sheet_to_json(worksheet!, {
        defval: "",
        raw: false,
      });
      const columnMapping = options.columnMapping ?? {};

      const result = raw.map((row: any) => {
        const newRow: Record<string, any> = {};

        for (const [excelColumn, value] of Object.entries(row)) {
          if (columnMapping[excelColumn]) {
            const fieldName = columnMapping[excelColumn];
            if (fieldName === "nextMessageTime")
              newRow[fieldName] = new Date(value as string).toISOString();
            newRow[fieldName] = value;
          }
        }
        return newRow;
      });
      return result;
    }

    throw new Error("Unsupported file type");
  }

  private mapToCustomerModel(
    record: any,
    columnMapping?: Record<string, string>,
  ): CustomerModel {
    if (!columnMapping) {
      // Default mapping assumes column names match model properties
      return record as CustomerModel;
    }

    const customer: any = {};

    // Apply custom column mapping
    Object.keys(columnMapping).forEach((sourceField) => {
      const targetField = columnMapping[sourceField];
      customer[targetField!] = record[sourceField];
    });

    return customer as CustomerModel;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Simple validation - improve based on your requirements
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
