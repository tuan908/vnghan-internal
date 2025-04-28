import type { Database } from "../../types";

export interface ImportService {
  import(
    db: Database,
    file: Buffer | ReadableStream,
    fileType: ImportFileExtension,
    operatorId: number,
    type: ImportType,
    options?: ImportOptions,
  ): Promise<ImportResult>;

  /**
   * Validates customer data without performing the actual import
   * @param file The file buffer or stream to validate
   * @param fileType The type of file ('csv' or 'excel')
   * @returns Promise resolving to validation results
   */
  validateCustomerData(
    file: Buffer | ReadableStream,
    fileType: "csv" | "excel",
  ): Promise<ValidationResult>;
}

export interface ImportOptions {
  headerRow?: boolean; // Whether the first row contains headers
  columnMapping?: Record<string, string>; // Maps file columns to database fields
  updateExisting?: boolean; // Whether to update existing customers
  batchSize?: number; // For processing in smaller chunks
}

export interface ImportResult extends ValidationResult {
  success: boolean;
  totalProcessed: number;
  rowsCreated: number;
  rowsUpdated: number;
  transactionId?: string; // For referencing this import operation
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  totalRecords: number;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  row: number;
  column: string;
  message: string;
  value?: any;
}

export type ImportType = "customer" | "screw";

export type ImportFileExtension = "csv" | "excel";
