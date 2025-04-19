import { DbSchema } from "@/backend/db/schema";
import type { CustomerImportOptions } from "@/backend/services/ImportService";
import { CustomerImportServiceImpl } from "@/backend/services/ImportServiceImpl";
import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";
import type { ImportFileExtension, ServerEnvironment } from "../../types";

const importService = new CustomerImportServiceImpl();

const importRouterV1 = new Hono<{ Bindings: ServerEnvironment }>()
  .post("/validate", async (c) => {
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
  .post("/", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const formData = await c.req.formData();
    const reqData: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      reqData[key] = value;
    }

    const ValidateSchema = z.object({
      file: z.custom<File>(),
      type: z.string(),
    });

    const parseResult = await ValidateSchema.safeParseAsync(reqData);

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
    let fileType: ImportFileExtension;

    if (filename.endsWith(".csv")) {
      fileType = "csv";
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      fileType = "excel";
    } else {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidFileExtension,
          statusCode: 400,
        }),
        400,
      );
    }

    // Read file as Buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Get options from request body or query params
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

    const headers = await db
      .select({
        label: DbSchema.ExcelTemplateHeader.label,
        name: DbSchema.ExcelTemplateHeader.key,
      })
      .from(DbSchema.ExcelTemplateHeader)
      .innerJoin(
        DbSchema.ExcelTemplate,
        eq(DbSchema.ExcelTemplateHeader.templateId, DbSchema.ExcelTemplate.id),
      )
      .where(eq(DbSchema.ExcelTemplate.name, parseResult.data.type));

    if (!headers || headers.length == 0) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: json.error.notFound,
          statusCode: 404,
        }),
        404,
      );
    }

    const columnMapping: Record<string, any> = {};

    for (const header of headers) {
      columnMapping[header.label] = header.name;
    }

    const importResult = await importService.importCustomers(
      db,
      buffer,
      fileType,
      user?.id,
      {
        columnMapping,
      },
    );

    return c.json(createSuccessResponse(importResult), 200);
  });

export default importRouterV1;
