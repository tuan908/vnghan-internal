import { Database } from "../types";

export interface ImportService {
  /**
   * Imports customer data from a CSV/Excel file
   * @param file The file buffer or stream to import
   * @param fileType The type of file ('csv' or 'excel')
   * @param options Import configuration options
   * @returns Promise resolving to import results
   * @throws Error if import fails (transactional)
   */
  importCustomers(
    db: Database,
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
    operatorId: number,
    options?: CustomerImportOptions,
  ): Promise<CustomerImportResult>;

  /**
   * Validates customer data without performing the actual import
   * @param file The file buffer or stream to validate
   * @param fileType The type of file ('csv' or 'excel')
   * @returns Promise resolving to validation results
   */
  validateCustomerData(
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
  ): Promise<CustomerValidationResult>;
}

export interface CustomerImportOptions {
  headerRow?: boolean; // Whether the first row contains headers
  columnMapping?: Record<string, string>; // Maps file columns to database fields
  updateExisting?: boolean; // Whether to update existing customers
  batchSize?: number; // For processing in smaller chunks
}

export interface CustomerImportResult {
  success: boolean;
  totalProcessed: number;
  customersCreated: number;
  customersUpdated: number;
  transactionId?: string; // For referencing this import operation
}

export interface CustomerValidationResult {
  valid: boolean;
  errors: CustomerValidationError[];
  warnings: CustomerValidationWarning[];
  totalRecords: number;
}

export interface CustomerValidationError {
  row: number;
  column: string;
  message: string;
  value?: any;
}

export interface CustomerValidationWarning {
  row: number;
  column: string;
  message: string;
  value?: any;
}
