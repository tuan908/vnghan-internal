import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { createErrorResponse } from "@/shared/utils/api-response";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { MiddlewareFactory } from "./middlewares";
import authRouterV1 from "./routes/v1/auth";
import customerRouterV1 from "./routes/v1/customer";
import customerCommonRouterV1 from "./routes/v1/customerCommon";
import fileRouterV1 from "./routes/v1/file";
import screwRouterV1 from "./routes/v1/screw";
import screwRouterV2 from "./routes/v2/screw";

declare module "hono" {
  interface ContextVariableMap {
    db: ReturnType<typeof drizzle>;
  }
}

const jwt = MiddlewareFactory.createJwtMiddleware({
  secret: process.env.JWT_TOKEN_SECRET!,
  algorithm: "HS256",
  tokenFromHeader: true,
  tokenFromCookie: true,
});
const db = MiddlewareFactory.createDbMiddleware();

const app = new Hono().basePath("/api");

app.use(logger())

app.use("*", async (c, next) => {
  const path = c.req.path;
  // Skip JWT middleware for auth routes
  if (path.startsWith("/api/v1/auth")) {
    return next();
  }
  // Apply JWT middleware for all other routes
  return jwt(c, next);
});
app.use("*", db);

app.onError((error, c) => {
  console.error(error.message);
  return c.json(
    createErrorResponse({
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: json.error.internalServerError,
    }),
    500,
  );
});

const route = app
  .route("/v1/files", fileRouterV1)
  .route("/v1/screws", screwRouterV1)
  .route("/v1/customers", customerRouterV1)
  .route("/v1/auth", authRouterV1)
  .route("/v1/customerCommon", customerCommonRouterV1)
  .route("/v2/screws", screwRouterV2);

export default app;

export type AppRoute = typeof route;
