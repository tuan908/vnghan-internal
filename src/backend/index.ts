import { Context, Hono } from "hono";
import { logger } from "hono/logger";

import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { createErrorResponse } from "@/shared/utils/api-response";
import { Session } from "@/shared/utils/session";
import type { Database, ServerEnvironment } from "./types";

// Middleware + Routes
import { MiddlewareFactory } from "./middlewares";
import authRouterV1 from "./routes/v1/auth";
import customerRouterV1 from "./routes/v1/customer";
import customerCommonRouterV1 from "./routes/v1/customerCommon";
import importRouterV1 from "./routes/v1/import";
import screwRouterV1 from "./routes/v1/screw";
import templateRouterV1 from "./routes/v1/templates";
import userRouteV1 from "./routes/v1/user";
import screwRouterV2 from "./routes/v2/screw";
import { ImportFileExtension } from "./types";

// Extend Hono Context types
declare module "hono" {
  interface ContextVariableMap {
    db: Database;
    user: Session;
    fileBuffer: Buffer<any>;
    fileType: ImportFileExtension;
  }
}

// --- Configurable Middleware ---
const jwtMiddleware = MiddlewareFactory.createJwtMiddleware({
  secret: process.env.JWT_TOKEN_SECRET!,
  algorithm: "HS256",
  tokenFromHeader: true,
  tokenFromCookie: true,
});

const cacheMiddleware = MiddlewareFactory.createCacheMiddleware({
  ttl: 300,
  cacheControl: "public, max-age=300",
  varyByHeaders: ["Accept-Language"],
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TOKEN: process.env.REDIS_TOKEN,
});

const dbMiddleware = MiddlewareFactory.createDbMiddleware();

const app = new Hono<{ Bindings: ServerEnvironment }>().basePath("/api");

// --- Global Logging ---
app.use("*", logger());

// --- JWT + Cache middleware (skip for auth routes) ---
app.use("*", async (c, next) => {
  if (isAuthRoute(c)) return next();
  return await jwtMiddleware(c, next);
});

app.use("*", async (c, next) => {
  if (isAuthRoute(c)) return next();
  return await cacheMiddleware(c, next);
});

// --- Database Middleware ---
app.use("*", dbMiddleware);

// --- Global Error Handler ---
app.onError((err, c) => {
  console.error("[Unhandled Error]", err);
  return c.json(
    createErrorResponse({
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: json.error.internalServerError,
      statusCode: 500,
    }),
    500,
  );
});

// --- API Routes ---
const route = app
  .route("/v1/auth", authRouterV1)
  .route("/v1/templates", templateRouterV1)
  .route("/v1/screws", screwRouterV1)
  .route("/v1/customers", customerRouterV1)
  .route("/v1/customerCommon", customerCommonRouterV1)
  .route("/v1/import", importRouterV1)
  .route("/v1/users", userRouteV1)
  .route("/v2/screws", screwRouterV2);

export default app;
export type AppRoute = typeof route;

const isAuthRoute = (c: Context) => c.req.path.startsWith("/api/v1/auth");
