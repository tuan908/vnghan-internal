"use server";

import { ErrorCodes } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { createErrorResponse } from "@/lib/api-response";
import API from "@/lib/client";
import type { ApiResponse } from "@/types";

export async function importExcel(formData: FormData): Promise<ApiResponse> {
  const file = formData.get("file") as File | null;
  if (!file || !/\.(xlsx|xls)$/i.test(file.name)) {
    return createErrorResponse({
      code: ErrorCodes.BAD_REQUEST,
      statusCode: 400,
      message: !file ? json.error.invalidFile : json.error.invalidFileExtension,
    });
  }

  const response = await API.uploadFile<ApiResponse>(
    `/files/importExcel`,
    file
  );

  return response
    ? response
    : createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: json.error.internalServerError,
      });
}
