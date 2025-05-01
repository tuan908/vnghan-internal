import { ExcelTemplate, ExcelTemplateHeader } from "@/backend/db/schema";
import { invalidateCache } from "@/backend/lib/cache";
import { ImportServiceImpl } from "@/backend/services/import.service";
import {
	type ImportFileExtension,
	type ImportOptions,
	type ImportType,
} from "@/backend/services/interfaces/import-service.interface";
import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
	createErrorResponse,
	createSuccessResponse,
	generateRequestId,
} from "../../lib/api-response";
import type { ServerEnvironment } from "../../types";

const importService = new ImportServiceImpl();

const importRouterV1 = new Hono<{ Bindings: ServerEnvironment }>().post(
	"/",
	async (c) => {
		const db = c.get("db");
		const user = c.get("user");
		const formData = await c.req.formData();
		const reqData: Record<string, any> = {};

		for (const [key, value] of formData.entries()) {
			reqData[key] = value;
		}

		const ValidateSchema = z.object({
			file: z.custom<File>(),
			type: z.custom<ImportType>(),
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

		const options: ImportOptions = {
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
				label: ExcelTemplateHeader.label,
				name: ExcelTemplateHeader.key,
			})
			.from(ExcelTemplateHeader)
			.innerJoin(
				ExcelTemplate,
				eq(ExcelTemplateHeader.templateId, ExcelTemplate.id),
			)
			.where(eq(ExcelTemplate.name, parseResult.data.type));

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

		const type = parseResult.data.type;

		const importResult = await importService.import(
			db,
			buffer,
			fileType,
			user?.id,
			type,
			{
				columnMapping,
			},
		);

		if (!importResult.valid) {
			const response = {
				success: false,
				status: {
					code: 400,
					message: "Error",
				},
				requestId: generateRequestId(),
				timestamp: new Date().toISOString(),
				error: {
					errors: importResult.errors,
				},
				data: null,
			};
			return c.json(response);
		}

		await invalidateCache();
		return c.json(createSuccessResponse(importResult), 200);
	},
);

export default importRouterV1;
