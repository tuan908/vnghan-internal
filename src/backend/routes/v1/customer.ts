import { ErrorCodes } from "@/shared/constants";
import { UserRole } from "@/shared/constants/roles";
import json from "@/shared/i18n/locales/vi/vi.json";
import { nullsToUndefined, toStringValue } from "@/shared/utils";
import { getCurrentDate } from "@/shared/utils/date";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";
import DbSchema from "../../schema";

const customerRouterV1 = new Hono()
  .get("/", async c => {
    const db = c.get("db");
    const user = c.get("user");
    const isAdmin = user.role === UserRole.Admin;
    const customerList = await db
      .select({
        id: DbSchema.Customer.id,
        name: DbSchema.Customer.name,
        phone: DbSchema.Customer.phone,
        address: DbSchema.Customer.address,
        nextMessageTime: DbSchema.Customer.nextMessageTime,
        need: DbSchema.Customer.need,
        platform: DbSchema.Platform.description,
        money: DbSchema.Customer.money,
      })
      .from(DbSchema.Customer)
      .innerJoin(
        DbSchema.CustomersPlatforms,
        eq(DbSchema.Customer.id, DbSchema.CustomersPlatforms.customerId)
      )
      // .innerJoin(
      //   DbSchema.Need,
      //   eq(DbSchema.CustomersPlatforms.needId, DbSchema.Need.id)
      // )
      .innerJoin(
        DbSchema.Platform,
        eq(DbSchema.CustomersPlatforms.platformId, DbSchema.Platform.id)
      )
      .where(
        and(
          eq(DbSchema.Customer.isDeleted, false),
          ...(isAdmin ? [] : [eq(DbSchema.Customer.assignedTo, user.id)])
        )
      )
      .orderBy(desc(DbSchema.Customer.updatedAt));

    const customers = nullsToUndefined(customerList).map(customer => {
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
  .get("/:id", async c => {
    const db = c.get("db");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        })
      );
    }
    const customer = await db
      .select()
      .from(DbSchema.Customer)
      .where(
        and(
          eq(DbSchema.Customer.id, id),
          eq(DbSchema.Customer.isDeleted, false)
        )
      );
    return c.json(createSuccessResponse(customer));
  })
  .post("/", async c => {
    const db = c.get("db");
    const user = c.get("user");
    const body = await c.req.json();
    // const [need] = await db
    //   .select({id: DbSchema.Need.id})
    //   .from(DbSchema.Need)
    //   .where(eq(DbSchema.Need.description, body.need));
    const [platform] = await db
      .select({id: DbSchema.Platform.id})
      .from(DbSchema.Platform)
      .where(eq(DbSchema.Platform.description, body.platform));

    // if (!need?.id || !platform?.id) {
    //   return c.json(
    //     createErrorResponse({
    //       code: ErrorCodes.BAD_REQUEST,
    //       message: json.error.badRequest,
    //     }),
    //     400
    //   );
    // }

    if (!platform?.id) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.badRequest,
        }),
        400
      );
    }

    const [customer] = await db.transaction(async tx => {
      return await tx
        .insert(DbSchema.Customer)
        .values({
          ...body,
          createdBy: user.id,
          updatedBy: user.id,
          assignedTo: user.id,
        })
        .returning();
    });

    if (!customer) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500
      );
    }

    const [customerPlatform] = await db.transaction(async tx => {
      return await tx
        .insert(DbSchema.CustomersPlatforms)
        .values({
          customerId: customer.id,
          platformId: platform.id,
          userId: user.id,
          updatedAt: getCurrentDate(),
        })
        .returning();
    });

    if (!customerPlatform) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500
      );
    }

    return c.json(createSuccessResponse(nullsToUndefined(customer)));
  })
  .put("/:id", async c => {
    const db = c.get("db");
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        })
      );
    }
    const body = await c.req.json();

    // const [need] = await db
    //   .select({id: DbSchema.Need.id})
    //   .from(DbSchema.Need)
    //   .where(eq(DbSchema.Need.description, body.need));
    const [platform] = await db
      .select({id: DbSchema.Platform.id})
      .from(DbSchema.Platform)
      .where(eq(DbSchema.Platform.description, body.platform));

    // if (!need?.id || !platform?.id) {
    //   return c.json(
    //     createErrorResponse({
    //       code: ErrorCodes.BAD_REQUEST,
    //       message: json.error.badRequest,
    //     }),
    //     400
    //   );
    // }

    if (!platform?.id) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.badRequest,
        }),
        400
      );
    }

    const [customer] = await db.transaction(async tx => {
      return await tx
        .update(DbSchema.Customer)
        .set({...body, updatedAt: getCurrentDate()})
        .where(eq(DbSchema.Customer.id, id))
        .returning();
    });

    if (!customer) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500
      );
    }

    const [customerPlatform] = await db.transaction(async tx => {
      return await tx
        .update(DbSchema.CustomersPlatforms)
        .set({
          // customerId: customer.id,
          // needId: need.id,
          platformId: platform.id,
          updatedAt: getCurrentDate(),
        })
        .where(
          and(
            eq(DbSchema.CustomersPlatforms.customerId, customer.id),
            eq(DbSchema.CustomersPlatforms.userId, user.id)
          )
        )
        .returning();
    });

    if (!customerPlatform) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500
      );
    }

    return c.json(createSuccessResponse(customer));
  })
  .delete("/:id", async c => {
    const db = c.get("db");
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        })
      );
    }
    const [customer] = await db
      .update(DbSchema.Customer)
      .set({isDeleted: true, updatedAt: getCurrentDate()})
      .where(eq(DbSchema.Customer.id, id))
      .returning();

    if (!customer) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500
      );
    }

    const [customerPlatform] = await db
      .update(DbSchema.CustomersPlatforms)
      .set({isDeleted: true, updatedAt: getCurrentDate()})
      .where(
        and(
          eq(DbSchema.CustomersPlatforms.customerId, id),
          eq(DbSchema.CustomersPlatforms.userId, user.id)
        )
      )
      .returning();

    if (!customerPlatform) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500
      );
    }

    return c.json(createSuccessResponse({message: "Customer deleted"}));
  });
export default customerRouterV1;
