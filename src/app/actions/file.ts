"use server";

import { ErrorCodes } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { createErrorResponse } from "@/lib/api-response";
import { getApiUrl } from "@/lib/utils";
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

  const response = await fetch(`${getApiUrl()}/files/importExcel`, {
    method: "post",
    body: formData,
  });

  return response.json();
}
