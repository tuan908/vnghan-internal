import { createErrorResponse } from "@/backend/lib/api-response";
import type { ExcelTemplateHeaderModel } from "@/backend/models/exceltemplate-header.model";
import type { ContextVariableMap } from "@/backend/types";
import {
  DATE_FORMAT_YYYY_MM_DD_HH_MM_SS_SSS,
  ErrorCodes,
  TemplateTypes,
} from "@/shared/constants";
import { UserRole } from "@/shared/constants/roles";
import json from "@/shared/i18n/locales/vi/vi.json";
import type { Session } from "@/shared/utils/session";
import { formatDate } from "date-fns";
import { Hono } from "hono";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";

const exportRouterV1 = new Hono<{Variables: ContextVariableMap}>()
  .get("/customers", async c => {
    const customerRepository = c.get("customerRepository");
    const excelTemplateHeaderRepository = c.get(
      "excelTemplateHeaderRepository"
    );
    const querySchema = z.object({
      format: z.enum(["csv", "excel"]),
    });

    const parseResult = querySchema.safeParse(c.req.query());

    if (!parseResult.success) {
      return c.json(
        createErrorResponse({
          code: "BAD_REQUEST",
          message: "Invalid query parameters",
          errors: parseResult.error.errors.map(err => ({
            code: "INVALID_INPUT",
            field: err.path.join("."),
            message: err.message,
          })), // Zod error mapping
        }),
        400
      );
    }

    const {format} = parseResult.data;
    const user = c.get("user") as Session; // Assuming user session is in context

    let raw: any[] = [];
    let filename = `export_customers_${new Date().toISOString()}`;

    if (!user) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.UNAUTHORIZED,
          message: json.error.unauthorized,
        }),
        401
      );
    }
    const isAdmin = user.role === UserRole.Admin;
    raw = await customerRepository.findAll({
      filter: {operatorId: user.id, isAdmin},
    }); // Corrected method call
    filename = `export_customers_${formatDate(new Date(), DATE_FORMAT_YYYY_MM_DD_HH_MM_SS_SSS)}`;
    const dbColumns = await excelTemplateHeaderRepository.findBy({
      templateName: TemplateTypes.Customer,
    });

    const data = mapData(dbColumns, raw);

    if (format === "csv") {
      const csv = Papa.unparse(data);
      c.header("Content-Type", "text/csv");
      c.header("Content-Disposition", `attachment; filename=${filename}.csv`);
      return c.body(csv);
    } else if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      c.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      c.header("Content-Disposition", `attachment; filename=${filename}.xlsx`);
      return c.body(excelBuffer);
    }

    // Should not reach here due to schema validation, but as a fallback
    return c.json(
      createErrorResponse({
        code: ErrorCodes.BAD_REQUEST,
        message: json.error.invalidFormat,
      }),
      400
    );
  })
  .get("/screws", async c => {
    const querySchema = z.object({
      format: z.enum(["csv", "excel"]),
    });

    const parseResult = querySchema.safeParse(c.req.query());

    if (!parseResult.success) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidQueryParams,
          errors: parseResult.error.errors.map(err => ({
            code: ErrorCodes.BAD_REQUEST,
            field: err.path.join("."),
            message: err.message,
          })), // Zod error mapping
        }),
        400
      );
    }

    const {format} = parseResult.data;
    const screwRepository = c.get("screwRepository"); // Assuming screwRepository is in context

    let raw: any[] = [];
    let filename = `export_screws_${new Date().toISOString()}`;

    // Assuming ScrewRepository has a findAll method
    // Need to check if screwRepository exists and has findAll
    if (screwRepository && typeof screwRepository.findAll === "function") {
      raw = await screwRepository.findAll(); // Corrected method call
      filename = `export_screws_${new Date().toISOString()}`;
    } else {
      console.error("ScrewRepository or findAll method not available");
      return c.json(
        createErrorResponse({
          code: "INTERNAL_SERVER_ERROR",
          message: "Screw data source not configured correctly",
        }),
        500
      );
    }
    const excelTemplateHeaderRepository = c.get(
      "excelTemplateHeaderRepository"
    );
    const dbColumns = await excelTemplateHeaderRepository.findBy({
      templateName: TemplateTypes.Customer,
    });
    const data = mapData(dbColumns, raw);

    if (format === "csv") {
      const csv = Papa.unparse(data);
      c.header("Content-Type", "text/csv");
      c.header("Content-Disposition", `attachment; filename=${filename}.csv`);
      return c.body(csv);
    } else if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      c.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      c.header("Content-Disposition", `attachment; filename=${filename}.xlsx`);
      return c.body(excelBuffer);
    }

    // Should not reach here due to schema validation, but as a fallback
    return c.json(
      createErrorResponse({
        code: ErrorCodes.BAD_REQUEST,
        message: json.error.invalidFormat,
      }),
      400
    );
  });

export default exportRouterV1;

const mapData = (dbColumns: ExcelTemplateHeaderModel[], data: any[]) => {
  const columnMapping: Record<string, any> = {};
  for (const dbColumn of dbColumns) {
    columnMapping[dbColumn.key!] = dbColumn.label;
  }

  return data.map(row => {
    const newRow: Record<string, any> = {};
    Object.keys(columnMapping).forEach(sourceField => {
      const targetField = columnMapping[sourceField];
      newRow[targetField] = row[sourceField];
    });
    return newRow;
  });
};
