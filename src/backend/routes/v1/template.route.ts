import { DbSchema } from "@/backend/db/schema";
import { MiddlewareFactory } from "@/backend/middlewares";
import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { format, toStringValue } from "@/shared/utils";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import * as xlsx from "xlsx";
import { z } from "zod";
import { createErrorResponse } from "../../lib/api-response";
import type { ServerEnvironment } from "../../types";

const rateLimit = MiddlewareFactory.createRateLimitMiddleware({
  limit: 10,
  window: 60 * 1000,
  onFailure: (c) =>
    c.json(
      createErrorResponse({
        code: ErrorCodes.TOO_MANY_REQUESTS,
        message: "Rate limit exceeded. Please try again later.",
        statusCode: 429,
      }),
      429,
    ),
});

const cache = MiddlewareFactory.createCacheMiddleware({
  namespace: "template-cache",
  cacheControl: "max-age=86400",
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TOKEN: process.env.REDIS_TOKEN,
});

interface TemplateDefinition {
  type: string;
  headers: string[];
}

// Create template generator function
const generateTemplate = (template: TemplateDefinition): Buffer => {
  // Create workbook and worksheet
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet([template.headers]);

  // Add styling information
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "EFEFEF" } },
  };

  // Add header styling (requires xlsx-style package in production)
  const range = xlsx.utils.decode_range(ws["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = xlsx.utils.encode_cell({ r: 0, c: col });
    if (!ws[cell]) continue;
    ws[cell].s = headerStyle;
  }

  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(wb, ws, `${template.type} Template`);

  // Generate buffer
  return xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
};

const templateRouterV1 = new Hono<{ Bindings: ServerEnvironment }>()
  // Apply rate limiting - 10 requests per minute
  .use("*", rateLimit)
  // Apply caching - cache templates for 24 hours
  .use("*", cache)
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        type: z.string(),
      }),
    ),
    async (c) => {
      try {
        const { type } = c.req.valid("query");
        const db = c.get("db");

        // Validate type parameter
        if (!type) {
          return c.json(
            createErrorResponse({
              code: ErrorCodes.BAD_REQUEST,
              message: format(json.error.fieldRequired, "type"),
              statusCode: 400,
            }),
            400,
          );
        }

        // Validate type is supported
        if (!["screw", "customer"].includes(type)) {
          return c.json(
            createErrorResponse({
              code: ErrorCodes.BAD_REQUEST,
              message: `Unsupported template type: ${type}`,
              statusCode: 400,
            }),
            400,
          );
        }

        const [template] = await db
          .select({
            id: DbSchema.ExcelTemplate.id,
            name: DbSchema.ExcelTemplate.description,
          })
          .from(DbSchema.ExcelTemplate)
          .where(eq(DbSchema.ExcelTemplate.name, type));

        if (!template) {
          return c.json(
            createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: json.error.notFound,
              statusCode: 404,
            }),
            404,
          );
        }

        const templateHeaders = await db
          .select({ label: DbSchema.ExcelTemplateHeader.label })
          .from(DbSchema.ExcelTemplateHeader)
          .where(eq(DbSchema.ExcelTemplateHeader.templateId, template.id));

        if (!templateHeaders || templateHeaders.length == 0) {
          return c.json(
            createErrorResponse({
              code: ErrorCodes.NOT_FOUND,
              message: json.error.notFound,
              statusCode: 404,
            }),
            404,
          );
        }

        // Generate template
        const buffer = generateTemplate({
          type: toStringValue(template.name!),
          headers: templateHeaders.map((x) => x.label),
        });

        // Set response headers
        c.header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        c.header(
          "Content-Disposition",
          `attachment; filename="${type}-template.xlsx"`,
        );

        return c.body(buffer);
      } catch (error) {
        return c.json(
          createErrorResponse({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to generate template",
            statusCode: 500,
          }),
          500,
        );
      }
    },
  );

export default templateRouterV1;
