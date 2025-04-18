// services/customerImportService.ts
import { parse as csvParse } from "csv-parse/sync";
import { like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as XLSX from "xlsx";
import { DbSchema } from "../db/schema";
import type { CustomerModel } from "../models/Customer";
import type {
  CustomerImportOptions,
  CustomerImportResult,
  CustomerValidationError,
  CustomerValidationResult,
  CustomerValidationWarning,
  ImportService,
} from "./ImportService";

export class CustomerImportServiceImpl implements ImportService {
  async importCustomers(
    db: ReturnType<typeof drizzle>,
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
    options: CustomerImportOptions = {},
  ): Promise<CustomerImportResult> {
    // Parse the file based on type
    const data = await this.parseFile(file, fileType, options);

    // Validate before proceeding
    const validationResult = await this.validateCustomerData(file, fileType);
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
          const customerData = this.mapToCustomerModel(
            record,
            options.columnMapping,
          );

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
                  set: customerData,
                });
              customersUpdated++;
              continue;
            }
          }

          // Insert new customer
          await tx.insert(DbSchema.Customer).values(customerData);
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
  ): Promise<CustomerValidationResult> {
    const data = await this.parseFile(file, fileType);
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
      return XLSX.utils.sheet_to_json(worksheet!, { defval: "" });
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
}
