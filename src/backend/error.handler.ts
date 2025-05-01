import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import type { ErrorHandler } from "hono/types";
import { createErrorResponse } from "./lib/api-response";

export const errorHandler: ErrorHandler = async (err, c) => {
	console.error("[Unhandled Error]", err);
	return c.json(
		createErrorResponse({
			code: ErrorCodes.INTERNAL_SERVER_ERROR,
			message: json.error.internalServerError,
			statusCode: 500,
		}),
		500,
	);
};
