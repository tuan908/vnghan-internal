import { ErrorCodes } from "@/core/constants";
import json from "@/core/i18n/locales/en/en.json";
import type { Session } from "@/core/utils/session";
import { type Context, Hono } from "hono";
import { logger } from "hono/logger";
import type { DB } from "./db";
import { createErrorResponse } from "./lib/api-response";
import { createJwtMiddleware } from "./middlewares/jwt.middleware";
import authRouter from "./routes/auth.route";
import customerRouter from "./routes/customer.route";
import exportRouter from "./routes/export.route";
import importRouter from "./routes/import.route";
import inventoryRouter from "./routes/inventory.route";
import userRouter from "./routes/user.route";
import type { ServerEnvironment } from "./types";

// Extend Hono Context types
declare module "hono" {
	interface ContextVariableMap {
		db: DB;
		session: Session;
	}
}

// --- Configurable Middleware ---
const jwt = createJwtMiddleware({
	secret: process.env.JWT_TOKEN_SECRET!,
	algorithm: "HS256",
	tokenFromHeader: true,
	tokenFromCookie: true,
});

const app = new Hono<{ Bindings: ServerEnvironment }>().basePath("/api");

// --- Global Logging ---
app.use("*", logger());

// --- JWT + Cache middleware (skip for auth routes) ---
app.use("*", async (c, next) => {
	if (isAuthRoute(c)) return next();
	return await jwt(c, next);
});

// --- Global Error Handler ---
app.onError(async (err, c) => {
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
	.route("/auth", authRouter)
	.route("/inventory", inventoryRouter)
	.route("/customer", customerRouter)
	.route("/import", importRouter)
	.route("/user", userRouter)
	.route("/export", exportRouter);

export default app;
export type AppRoute = typeof route;

const isAuthRoute = (c: Context) => c.req.path.startsWith("/api/auth");
