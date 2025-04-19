import type { CustomerImportOptions } from "@/backend/services/ImportService";
import { CustomerImportServiceImpl } from "@/backend/services/ImportServiceImpl";
import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import type { ServerEnvironment } from "@/shared/types";
import { type Context, Hono, type MiddlewareHandler, type Next } from "hono";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";

const importService = new CustomerImportServiceImpl();

const FileUploadSchema = z.object({
  file: z.custom<File>(),
});

// Helper middleware to handle file upload and determine file type
const fileUploadMiddleware = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    try {
      const formData = await c.req.formData();
      const reqData: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        reqData[key] = value;
      }

      const parseResult = await FileUploadSchema.safeParseAsync(reqData);

      if (!parseResult.success) {
        return c.json(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            message: json.error.badRequest,
            errors: parseResult.error.errors.flatMap((x) => ({
              code: x.code as string,
              field: x.path.join(","),
              message: x.message,
            })),
          }),
        );
      }

      const { file } = parseResult.data;

      if (!file) {
        return c.json(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            message: json.error.invalidFile,
          }),
          400,
        );
      }

      // Extract file extension to determine type
      const filename = file.name.toLowerCase();
      let fileType: "csv" | "excel";

      if (filename.endsWith(".csv")) {
        fileType = "csv";
      } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
        fileType = "excel";
      } else {
        return c.json(
          {
            error: "Unsupported file format. Please upload CSV or Excel file.",
          },
          400,
        );
      }

      // Read file as Buffer
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Add to request context
      c.set("fileBuffer", buffer);
      c.set("fileType", fileType);

      await next();
    } catch (error) {
      console.error("File upload error:", error);
      return c.json({ error: "Failed to process file upload" }, 500);
    }
  };
};

const importRouterV1 = new Hono<{ Bindings: ServerEnvironment }>()
  .post("/validate", fileUploadMiddleware, async (c) => {
    try {
      const fileBuffer = c.get("fileBuffer");
      const fileType = c.get("fileType");

      const validationResult = await importService.validateCustomerData(
        fileBuffer,
        fileType,
      );

      return c.json(createSuccessResponse(validationResult), 200);
    } catch (error) {
      console.error("Validation error:", error);
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidFile,
        }),
        500,
      );
    }
  })
  .post("/", fileUploadMiddleware, async (c) => {
    const fileBuffer = c.get("fileBuffer");
    const fileType = c.get("fileType");
    const db = c.get("db");

    // Get options from request body or query params
    const formData = await c.req.formData();
    const updateExisting = formData.get("updateExisting") === "true";
    const batchSize = parseInt(formData.get("batchSize") as string) || 100;

    const options: CustomerImportOptions = {
      headerRow: true,
      updateExisting,
      batchSize,
    };

    // Optional column mapping
    const columnMappingParam = formData.get("columnMapping");
    if (columnMappingParam) {
      try {
        options.columnMapping = JSON.parse(columnMappingParam as string);
      } catch (e) {
        throw e;
      }
    }

    const importResult = await importService.importCustomers(
      db,
      fileBuffer,
      fileType,
      options,
    );

    return c.json(createSuccessResponse(importResult), 200);
  });

export default importRouterV1;
