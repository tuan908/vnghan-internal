import { type Context, Hono } from "hono";
import { logger } from "hono/logger";

import type { Session } from "@/shared/utils/session";
import type { Database, ServerEnvironment } from "./types";

// Middleware + Routes
import { errorHandler } from "./error.handler";
import { MiddlewareFactory } from "./middlewares";
import { CustomerRepository } from "./repositories/interfaces/customer-repository.interface";
import { ExcelTemplateHeaderRepository } from "./repositories/interfaces/exceltemplate-header-repository.interface";
import { ExcelTemplateRepository } from "./repositories/interfaces/exceltemplate-repository.interface";
import { PlatformRepository } from "./repositories/interfaces/platform-repository.interface";
import { ScrewRepository } from "./repositories/interfaces/screw-repository.interface";
import { ScrewMaterialRepository } from "./repositories/interfaces/screwmaterial-repository.interface";
import { ScrewTypeRepository } from "./repositories/interfaces/screwtype-repository.interface";
import { UserRepository } from "./repositories/interfaces/user-repository.interface";
import authRouterV1 from "./routes/v1/auth.route";
import customerRouterV1 from "./routes/v1/customer.route";
import importRouterV1 from "./routes/v1/import.route";
import platformRouterV1 from "./routes/v1/platform.route";
import screwRouterV1 from "./routes/v1/screw.route";
import templateRouterV1 from "./routes/v1/template.route";
import userRouteV1 from "./routes/v1/user.route";
import screwRouterV2 from "./routes/v2/screw.route";
import type { ImportFileExtension } from "./types";

// Extend Hono Context types
declare module "hono" {
  interface ContextVariableMap {
    db: Database;
    user: Session;
    fileBuffer: Buffer<any>;
    fileType: ImportFileExtension;
    customerRepository: CustomerRepository;
    excelTemplateRepository: ExcelTemplateRepository;
    excelTemplateHeaderRepository: ExcelTemplateHeaderRepository;
    platformRepository: PlatformRepository;
    screwRepository: ScrewRepository;
    screwTypeRepository: ScrewTypeRepository;
    screwMaterialRepository: ScrewMaterialRepository;
    userRepository: UserRepository;
  }
}

// --- Configurable Middleware ---
const jwt = MiddlewareFactory.createJwtMiddleware({
  secret: process.env.JWT_TOKEN_SECRET!,
  algorithm: "HS256",
  tokenFromHeader: true,
  tokenFromCookie: true,
});

const cache = MiddlewareFactory.createCacheMiddleware({
  ttl: 300,
  cacheControl: "public, max-age=300",
  varyByHeaders: ["Accept-Language"],
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TOKEN: process.env.REDIS_TOKEN,
});

const db = MiddlewareFactory.createDbMiddleware();

const app = new Hono<{Bindings: ServerEnvironment}>().basePath("/api");

// --- Global Logging ---
app.use("*", logger());

// --- JWT + Cache middleware (skip for auth routes) ---
app.use("*", async (c, next) => {
  if (isAuthRoute(c)) return next();
  return await jwt(c, next);
});

app.use("*", async (c, next) => {
  if (isAuthRoute(c)) return next();
  return await cache(c, next);
});

// --- Database Middleware ---
app.use("*", db);

// --- Global Error Handler ---
app.onError(errorHandler);

// --- API Routes ---
const route = app
  .route("/v1/auth", authRouterV1)
  .route("/v1/templates", templateRouterV1)
  .route("/v1/screws", screwRouterV1)
  .route("/v1/customers", customerRouterV1)
  .route("/v1/platforms", platformRouterV1)
  .route("/v1/import", importRouterV1)
  .route("/v1/users", userRouteV1)
  .route("/v2/screws", screwRouterV2);

export default app;
export type AppRoute = typeof route;

const isAuthRoute = (c: Context) => c.req.path.startsWith("/api/v1/auth");
