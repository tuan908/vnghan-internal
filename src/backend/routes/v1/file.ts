import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import type { ServerEnvironment } from "@/shared/types";
import { zValidator } from "@hono/zod-validator";
import { getDownloadUrl } from "@vercel/blob";
import { Hono } from "hono";
import { z } from "zod";
import { createErrorResponse } from "../../lib/api-response";

const filetRouterV1 = new Hono<{Bindings: ServerEnvironment}>()
  .get("/templates", async c => {
    const {type} = c.req.query();

    const downloadLink = getDownloadUrl(`${type}-template.xlsx`);
    if (downloadLink === "")
      return c.json(
        createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: json.error.notFound,
          statusCode: 404,
        }),
        404
      );

    return c.redirect(downloadLink);
  })
  .post(
    "/upload-template",
    zValidator(
      "form",
      z.object({
        file: z.custom<File>(),
      })
    ),
    async c => {
      const {file} = c.req.valid("form");
    }
  )
  .post("/pdf", async c => {});

export default filetRouterV1;
