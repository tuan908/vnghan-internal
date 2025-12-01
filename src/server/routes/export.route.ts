import {
	DATE_FORMAT_YYYY_MM_DD_HH_MM_SS_SSS,
	ErrorCodes,
	TemplateTypes,
} from "@/core/constants";
import json from "@/core/i18n/locales/vi/vi.json";
import { toStringValue } from "@/core/utils";
import type { Session } from "@/core/utils/session";
import { createErrorResponse } from "@/server/lib/api-response";
import type { ExcelTemplateHeaderModel } from "@/server/models/exceltemplate-header.model";
import type { ServerEnvironment } from "@/server/types";
import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";
import { asc, eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import { Hono } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import Papa from "papaparse";
import { PassThrough, Readable } from "stream";
import { z } from "zod";
import { importTemplate, importTemplateHeader } from "../db/schema";
import { customerRepository } from "../repositories/customer.repository";
import { importTemplateHeaderRepository } from "../repositories/import-template-header.repository";
import { screwRepository } from "../repositories/screw.repository";

const exportRouter = new Hono()
	.get("/customers", async (c) => {
		const querySchema = z.object({
			format: z.enum(["csv", "excel"]),
		});

		const parseResult = querySchema.safeParse(c.req.query());

		if (!parseResult.success) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.BAD_REQUEST,
					message: json.error.invalidQueryParams,
					errors: parseResult.error.issues.map((err) => ({
						code: ErrorCodes.BAD_REQUEST,
						field: err.path.join("."),
						message: err.message,
					})),
				}),
				400,
			);
		}

		const { format } = parseResult.data;
		const user = c.get("session") as Session;

		if (!user) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.UNAUTHORIZED,
					message: json.error.unauthorized,
				}),
				401,
			);
		}

		const raw = await customerRepository.listByOperatorId(user.id);

		const filename = `export_customers_${formatDateToString()}`;
		const dbColumns = await importTemplateHeaderRepository.search({
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
		const querySchema = z.object({
			format: z.enum(["csv", "excel"]),
		});

		const parseResult = querySchema.safeParse(c.req.query());

		if (!parseResult.success) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.BAD_REQUEST,
					message: json.error.invalidQueryParams,
					errors: parseResult.error.issues.map((err) => ({
						code: ErrorCodes.BAD_REQUEST,
						field: err.path.join("."),
						message: err.message,
					})),
				}),
				400,
			);
		}

		const { format } = parseResult.data;
		const raw = await screwRepository.list();
		const filename = `export_screws_${formatDateToString()}`;
		const dbColumns = await importTemplateHeaderRepository.findByTemplateName(
			TemplateTypes.Screw,
		);
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

export default exportRouter;

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

// Utility function: generate template with ExcelJS
const generateExcelTemplate = async ({
	headers,
	sheetName,
}: {
	headers: string[];
	sheetName: string;
}): Promise<ArrayBuffer> => {
	const ExcelJS = await import("exceljs");
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
	return buffer;
};

const templateRouter = new Hono<{ Bindings: ServerEnvironment }>().get(
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
					id: importTemplate.id,
					name: importTemplate.description,
				})
				.from(importTemplate)
				.where(eq(importTemplate.name, type));

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
				.select({ label: importTemplateHeader.label })
				.from(importTemplateHeader)
				.where(eq(importTemplateHeader.templateId, template.id))
				.orderBy(asc(importTemplateHeader.id));

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

			return c.body(buffer, 200 as ContentfulStatusCode);
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
