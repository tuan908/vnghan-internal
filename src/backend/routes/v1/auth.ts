import { DbSchema } from "@/backend/db/schema";
import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { tryCatch } from "@/shared/utils";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/shared/utils/api-response";
import { encrypt } from "@/shared/utils/session";
import type { SignInFormValues } from "@/shared/validations";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const authRouterV1 = new Hono()
  .post("/register", async (c) => {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidCredentials,
          statusCode: 400,
        }),
        400,
      );
    }

    const [existingUser] = await c
      .get("db")
      .select()
      .from(DbSchema.User)
      .where(eq(DbSchema.User.username, username));

    if (existingUser) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.FORBIDDEN,
          message: json.error.userAlreadyExists,
          statusCode: 403,
        }),
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await c
      .get("db")
      .insert(DbSchema.User)
      .values({
        username: username,
        passwordHash: hashedPassword,
      })
      .returning();

    const tokenPromise = encrypt({
      id: newUser?.id!,
      username: newUser?.username!,
      role: newUser?.role!,
    });

    const { data: token, error: tokenSignError } = await tryCatch(tokenPromise);

    if (tokenSignError) {
      console.log(tokenSignError);
      throw tokenSignError;
    }

    return c.json(createSuccessResponse({ token }));
  })
  .post("/login", async (c) => {
    const db = c.get("db");
    const { username, password } = await c.req.json<SignInFormValues>();

    if (!username || !password) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.invalidCredentials,
          statusCode: 400,
        }),
        400,
      );
    }

    let existingUser;

    try {
      const [user] = await db
        .select()
        .from(DbSchema.User)
        .where(eq(DbSchema.User.username, username));
      existingUser = user;
    } catch (error) {
      console.error(error instanceof Error ? error?.cause : error);
      throw error;
    }

    if (!existingUser) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.FORBIDDEN,
          message: json.error.invalidCredentials,
          statusCode: 403,
        }),
        403,
      );
    }

    const hashedPassword = existingUser?.passwordHash;

    if (!hashedPassword) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.internalServerError,
          statusCode: 500,
        }),
        500,
      );
    }

    const { data: passwordMatches, error: bcryptCompareError } = await tryCatch(
      bcrypt.compare(password, hashedPassword),
    );

    if (bcryptCompareError) {
      console.error(bcryptCompareError);
      throw bcryptCompareError;
    }

    if (!passwordMatches) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.FORBIDDEN,
          message: json.error.invalidCredentials,
          statusCode: 403,
        }),
        403,
      );
    }

    const tokenPromise = encrypt({
      id: existingUser?.id,
      username: existingUser?.username!,
      role: existingUser?.role!,
    });

    const { data: token, error: tokenSignError } = await tryCatch(tokenPromise);

    if (tokenSignError) {
      console.log(tokenSignError);
      throw tokenSignError;
    }

    return c.json(createSuccessResponse({ token }), 200);
  });

export default authRouterV1;
