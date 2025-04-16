import { ErrorCodes } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { nullsToUndefined, toStringValue, tryCatch } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";
import DbSchema from "../../schema";

const customerRouterV1 = new Hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const customerList = await db
      .select({
        id: DbSchema.Customer.id,
        name: DbSchema.Customer.name,
        phone: DbSchema.Customer.phone,
        address: DbSchema.Customer.address,
        nextMessageTime: DbSchema.Customer.nextMessageTime,
        need: DbSchema.Need.description,
        platform: DbSchema.Platform.description,
        money: DbSchema.Customer.money,
      })
      .from(DbSchema.Customer)
      .innerJoin(
        DbSchema.CustomersPlatforms,
        eq(DbSchema.Customer.id, DbSchema.CustomersPlatforms.customerId),
      )
      .innerJoin(
        DbSchema.Need,
        eq(DbSchema.CustomersPlatforms.needId, DbSchema.Need.id),
      )
      .innerJoin(
        DbSchema.Platform,
        eq(DbSchema.CustomersPlatforms.platformId, DbSchema.Platform.id),
      )
      .where(eq(DbSchema.Customer.isDeleted, false));

    const customers = nullsToUndefined(customerList).map((customer) => {
      return {
        id: customer.id,
        address: toStringValue(customer.address),
        money: toStringValue(customer.money),
        name: toStringValue(customer.name),
        need: toStringValue(customer.need),
        phone: toStringValue(customer.phone),
        platform: toStringValue(customer.platform),
        nextMessageTime: toStringValue(customer.nextMessageTime),
      };
    });
    return c.json(createSuccessResponse(customers), 200);
  })
  .get("/:id", async (c) => {
    const db = c.get("db");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        }),
      );
    }
    const customer = await db
      .select()
      .from(DbSchema.Customer)
      .where(
        and(
          eq(DbSchema.Customer.id, id),
          eq(DbSchema.Customer.isDeleted, false),
        ),
      );
    return c.json(createSuccessResponse(customer));
  })
  .post("/", async (c) => {
    const db = c.get("db");
    const body = await c.req.json();
    const needsPromise = db
      .select({ needId: DbSchema.Need.id })
      .from(DbSchema.Need)
      .where(eq(DbSchema.Need.description, body.need));
    const platformsPromise = db
      .select({ platformId: DbSchema.Platform.id })
      .from(DbSchema.Platform)
      .where(eq(DbSchema.Platform.description, body.platform));

    const { data } = await tryCatch(
      Promise.all([needsPromise, platformsPromise]),
    );

    const [needsResult, platformsResult] = Array.isArray(data) ? data : [];

    if (!needsResult || !platformsResult) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.badRequest,
        }),
        400,
      );
    }

    const [customer] = await db
      .insert(DbSchema.Customer)
      .values(body)
      .returning();

    if (!customer) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500,
      );
    }

    const [needId] = needsResult;
    const [platformsId] = platformsResult;

    await db
      .insert(DbSchema.CustomersPlatforms)
      .values({
        customerId: customer.id,
        needId: needId?.needId!,
        platformId: platformsId?.platformId!,
      })
      .returning();

    return c.json(createSuccessResponse(nullsToUndefined(customer)));
  })
  .put("/:id", async (c) => {
    const db = c.get("db");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        }),
      );
    }
    const body = await c.req.json();
    const result = await db
      .update(DbSchema.Customer)
      .set(body)
      .where(eq(DbSchema.Customer.id, id))
      .returning();
    return c.json(createSuccessResponse(result));
  })
  .delete("/:id", async (c) => {
    const db = c.get("db");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        }),
      );
    }
    await db
      .update(DbSchema.Customer)
      .set({ isDeleted: true })
      .where(eq(DbSchema.Customer.id, id));
    return c.json(createSuccessResponse({ message: "Customer deleted" }));
  });
export default customerRouterV1;
