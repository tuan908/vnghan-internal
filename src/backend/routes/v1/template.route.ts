import { ExcelTemplate, ExcelTemplateHeader } from "@/backend/db/schema";
import { MiddlewareFactory } from "@/backend/middlewares";
import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { toStringValue } from "@/shared/utils";
import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import { Hono } from "hono";
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

// Utility function: generate template with ExcelJS
const generateExcelTemplate = async ({
	headers,
	sheetName,
}: {
	headers: string[];
	sheetName: string;
}): Promise<Buffer> => {
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet(sheetName);

	// Style and add header row
	const headerRow = sheet.addRow(headers);
	headerRow.eachCell((cell) => {
		cell.font = { bold: true };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFEEEEEE" },
		};
	});

	// Auto-width
	headers.forEach((_, i) => {
		sheet.getColumn(i + 1).width = 20;
	});

	// Write workbook to buffer
	const buffer = await workbook.xlsx.writeBuffer();
	return Buffer.from(buffer);
};

const templateRouterV1 = new Hono<{ Bindings: ServerEnvironment }>()
	.use("*", rateLimit)
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
						id: ExcelTemplate.id,
						name: ExcelTemplate.description,
					})
					.from(ExcelTemplate)
					.where(eq(ExcelTemplate.name, type));

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

				const headers = await db
					.select({ label: ExcelTemplateHeader.label })
					.from(ExcelTemplateHeader)
					.where(eq(ExcelTemplateHeader.templateId, template.id))
					.orderBy(asc(ExcelTemplateHeader.id));

				if (!headers.length) {
					return c.json(
						createErrorResponse({
							code: ErrorCodes.NOT_FOUND,
							message: json.error.notFound,
							statusCode: 404,
						}),
						404,
					);
				}

				const buffer = await generateExcelTemplate({
					headers: headers.map((h) => h.label),
					sheetName: toStringValue(template.name!),
				});

				c.header(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				);
				c.header(
					"Content-Disposition",
					`attachment; filename="${type}-template.xlsx"`,
				);

				return c.body(buffer);
			} catch (err) {
				console.error("Excel template generation error:", err);
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
