import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { tryCatch } from "@/shared/utils";
import { decrypt } from "@/shared/utils/session";
import type { Context, MiddlewareHandler, Next } from "hono";
import { getCookie } from "hono/cookie";
import { createErrorResponse } from "../lib/api-response";

interface IJwtMiddlewareConfig {
  secret: string;
  algorithm?: string;
  tokenFromHeader?: boolean;
  tokenFromCookie?: boolean;
}

const defaultConfig: IJwtMiddlewareConfig = {
  secret: process.env.JWT_TOKEN_SECRET!,
  algorithm: "HS256",
  tokenFromHeader: true,
  tokenFromCookie: true,
};

export const createJwtMiddleware = (
  config: IJwtMiddlewareConfig,
): MiddlewareHandler => {
  const options = { ...defaultConfig, ...config };

  return async (c: Context, next: Next) => {
    let token: string | undefined = undefined;

    if (options.tokenFromHeader) {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token && options.tokenFromCookie) {
      token = getCookie(c, "access_token");
    }

    if (!token) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.FORBIDDEN,
          message: json.error.forbidden,
          statusCode: 401,
        }),
        401,
      );
    }

    const { data, error } = await tryCatch(decrypt(token));

    if (!data || error) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.FORBIDDEN,
          message: json.error.tokenExpired,
          statusCode: 401,
        }),
        401,
      );
    }

    await next();
  };
};
