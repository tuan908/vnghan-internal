import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi.json";
import { createErrorResponse } from "@/shared/utils/api-response";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Hono } from "hono";
import { createDbMiddleware as createDbMiddlewareFactory } from "./middlewares/db";
import fileRouterV1 from "./routes/v1/file";
import screwRouterV1 from "./routes/v1/screw";
import screwRouterV2 from "./routes/v2/screw";

declare module "hono" {
  interface ContextVariableMap {
    db: ReturnType<typeof drizzle>;
  }
}

const app = new Hono().basePath("/api");

app.use("*", createDbMiddlewareFactory());
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
  .route("/v2/screws", screwRouterV2);

export default app;

export type AppRoute = typeof route;
