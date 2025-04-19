import { drizzle } from "drizzle-orm/neon-serverless";
import { Context, Hono } from "hono";
import { logger } from "hono/logger";

import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import type { ServerEnvironment } from "@/shared/types";
import { createErrorResponse } from "@/shared/utils/api-response";
import { Session } from "@/shared/utils/session";

// Middleware + Routes
import { MiddlewareFactory } from "./middlewares";
import authRouterV1 from "./routes/v1/auth";
import customerRouterV1 from "./routes/v1/customer";
import customerCommonRouterV1 from "./routes/v1/customerCommon";
import fileRouterV1 from "./routes/v1/file";
import screwRouterV1 from "./routes/v1/screw";
import userRouteV1 from "./routes/v1/user";
import screwRouterV2 from "./routes/v2/screw";

// Extend Hono Context types
declare module "hono" {
  interface ContextVariableMap {
    db: ReturnType<typeof drizzle>;
    user: Session;
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
// app.use("*", async (c, next) => {
//   if (isAuthRoute(c)) return next();
//   return await cacheMiddleware(c, next);
// });

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
  .route("/v1/files", fileRouterV1)
  .route("/v1/screws", screwRouterV1)
  .route("/v1/customers", customerRouterV1)
  .route("/v1/customerCommon", customerCommonRouterV1)
  .route("/v1/users", userRouteV1)
  .route("/v2/screws", screwRouterV2);

export default app;
export type AppRoute = typeof route;

const isAuthRoute = (c: Context) => c.req.path.startsWith("/api/v1/auth");
