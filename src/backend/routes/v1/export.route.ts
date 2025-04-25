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
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { Hono } from "hono";
import Papa from "papaparse";
import { PassThrough, Readable } from "stream";
import { z } from "zod";

const exportRouterV1 = new Hono<{ Variables: ContextVariableMap }>()
  .get("/customers", async (c) => {
    const customerRepository = c.get("customerRepository");
    const excelTemplateHeaderRepository = c.get(
      "excelTemplateHeaderRepository",
    );

    const querySchema = z.object({
      format: z.enum(["csv", "excel"]),
    });

    const parseResult = querySchema.safeParse(c.req.query());

    if (!parseResult.success) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidQueryParams,
          errors: parseResult.error.errors.map((err) => ({
            code: ErrorCodes.BAD_REQUEST,
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        400,
      );
    }

    const { format } = parseResult.data;
    const user = c.get("user") as Session;

    if (!user) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.UNAUTHORIZED,
          message: json.error.unauthorized,
        }),
        401,
      );
    }

    const isAdmin = user.role === UserRole.Admin;
    const raw = await customerRepository.findAll({
      filter: { operatorId: user.id, isAdmin },
    });

    const filename = `export_customers_${formatDateToString()}`;
    const dbColumns = await excelTemplateHeaderRepository.findBy({
      templateName: TemplateTypes.Customer,
    });
    const data = mapData(dbColumns, raw);

    if (format === "csv") {
      const csv = Papa.unparse(data);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=${filename}.csv`,
        },
      });
    }

    if (format === "excel") {
      const stream = new PassThrough();
      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream });
      const worksheet = workbook.addWorksheet("Sheet1");

      if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]!).map((key) => ({
          header: key,
          key,
          width: 20,
        }));
      }

      for (const row of data) {
        worksheet.addRow(row).commit();
      }

      workbook.commit().catch(console.error);

      const webStream = Readable.toWeb(stream);

      return new Response(webStream as any, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=${filename}.xlsx`,
        },
      });
    }

    return c.json(
      createErrorResponse({
        code: ErrorCodes.BAD_REQUEST,
        message: json.error.invalidFormat,
      }),
      400,
    );
  })

  .get("/screws", async (c) => {
    const screwRepository = c.get("screwRepository");
    const excelTemplateHeaderRepository = c.get(
      "excelTemplateHeaderRepository",
    );

    const querySchema = z.object({
      format: z.enum(["csv", "excel"]),
    });

    const parseResult = querySchema.safeParse(c.req.query());

    if (!parseResult.success) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidQueryParams,
          errors: parseResult.error.errors.map((err) => ({
            code: ErrorCodes.BAD_REQUEST,
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        400,
      );
    }

    const { format } = parseResult.data;
    const raw = await screwRepository.findAll();
    const filename = `export_screws_${formatDateToString()}`;
    const dbColumns = await excelTemplateHeaderRepository.findBy({
      templateName: TemplateTypes.Screw,
    });
    const data = mapData(dbColumns, raw);

    if (format === "csv") {
      const csv = Papa.unparse(data);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=${filename}.csv`,
        },
      });
    }

    if (format === "excel") {
      const stream = new PassThrough();
      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream });
      const worksheet = workbook.addWorksheet("Sheet1");

      if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]!).map((key) => ({
          header: key,
          key,
          width: 20,
        }));
      }

      for (const row of data) {
        worksheet.addRow(row).commit();
      }

      workbook.commit().catch(console.error);

      const webStream = Readable.toWeb(stream);

      return new Response(webStream as any, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=${filename}.xlsx`,
        },
      });
    }

    return c.json(
      createErrorResponse({
        code: ErrorCodes.BAD_REQUEST,
        message: json.error.invalidFormat,
      }),
      400,
    );
  });

export default exportRouterV1;

// Helpers
const mapData = (dbColumns: ExcelTemplateHeaderModel[], data: any[]) => {
  const columnMapping: Record<string, any> = {};
  for (const dbColumn of dbColumns) {
    columnMapping[dbColumn.key!] = dbColumn.label;
  }

  return data.map((row) => {
    const newRow: Record<string, any> = {};
    Object.keys(columnMapping).forEach((sourceField) => {
      const targetField = columnMapping[sourceField];
      newRow[targetField] = row[sourceField];
    });
    return newRow;
  });
};

const formatDateToString = (
  formatStr: string = DATE_FORMAT_YYYY_MM_DD_HH_MM_SS_SSS,
) => {
  return dayjs(new Date()).format(formatStr);
};
