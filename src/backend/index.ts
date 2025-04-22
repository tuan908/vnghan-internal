import type { Session } from "@/shared/utils/session";
import { type Context, Hono } from "hono";
import { logger } from "hono/logger";
import { errorHandler } from "./error.handler";
import { MiddlewareFactory } from "./middlewares";
import type {
  CustomerRepository,
  ExcelTemplateHeaderRepository,
  ExcelTemplateRepository,
  PlatformRepository,
  ScrewMaterialRepository,
  ScrewRepository,
  ScrewTypeRepository,
  UserRepository,
} from "./repositories/interfaces";
import { Routes } from "./routes";
import type { Database, ImportFileExtension, ServerEnvironment } from "./types";

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

const app = new Hono<{ Bindings: ServerEnvironment }>().basePath("/api");

// --- Global Logging ---
app.use("*", logger());

// --- JWT + Cache middleware (skip for auth routes) ---
app.use("*", async (c, next) => {
  if (isAuthRoute(c)) return next();
  return await jwt(c, next);
});

app.use("*", async (c, next) => {
  if (isAuthRoute(c)) return next();
  if (c.req.path.startsWith("/api/v1/export")) {
    const fileCache = MiddlewareFactory.createCacheMiddleware({
      ttl: 3600, // 1 hour cache
      maxFileSizeBytes: 10 * 1024 * 1024, // 10MB limit
      cacheableFileTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      compressFiles: true,
    });
    return await fileCache(c, next);
  }
  return await cache(c, next);
});

// --- Database Middleware ---
app.use("*", db);

// --- Global Error Handler ---
app.onError(errorHandler);

// --- API Routes ---
const route = app
  .route("/v1/auth", Routes.V1.Auth)
  .route("/v1/templates", Routes.V1.Templates)
  .route("/v1/screws", Routes.V1.Screws)
  .route("/v1/customers", Routes.V1.Customers)
  .route("/v1/platforms", Routes.V1.Platforms)
  .route("/v1/import", Routes.V1.Import)
  .route("/v1/users", Routes.V1.Users)
  .route("/v1/export", Routes.V1.Export)
  .route("/v2/screws", Routes.V2.Screws);

export default app;
export type AppRoute = typeof route;

const isAuthRoute = (c: Context) => c.req.path.startsWith("/api/v1/auth");
