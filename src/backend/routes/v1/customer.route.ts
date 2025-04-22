import { ErrorCodes } from "@/shared/constants";
import { UserRole } from "@/shared/constants/roles";
import json from "@/shared/i18n/locales/vi/vi.json";
import { nullsToUndefined, toStringValue } from "@/shared/utils";
import { getCurrentDate } from "@/shared/utils/date";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { Customer, CustomerPlatform, DbSchema } from "../../db/schema";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";

const customerRouterV1 = new Hono()
  .get("/", async (c) => {
    const user = c.get("user");
    const isAdmin = user.role === UserRole.Admin;
    const customerRepository = c.get("customerRepository");

    const customerList = await customerRepository.findAll({
      filter: {
        operatorId: user?.id,
        isAdmin,
      },
    });

    const customers = customerList.map((customer) => {
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
    const customerRepository = c.get("customerRepository");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        }),
      );
    }
    const customer = await customerRepository.findBy({ id });
    return c.json(createSuccessResponse(customer));
  })
  .post("/", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const body = await c.req.json();
    // const [need] = await db
    //   .select({id: DbSchema.Need.id})
    //   .from(DbSchema.Need)
    //   .where(eq(DbSchema.Need.description, body.need));
    const [platform] = await db
      .select({ id: DbSchema.Platform.id })
      .from(DbSchema.Platform)
      .where(eq(DbSchema.Platform.name, body.platform));

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
        400,
      );
    }

    const result = await db.transaction(async (tx) => {
      const [customer] = await tx
        .insert(DbSchema.Customer)
        .values({
          ...body,
          createdBy: user.id,
          updatedBy: user.id,
          assignedTo: user.id,
        })
        .returning({ id: Customer.id });
      if (!customer) return undefined;

      const [customerPlatform] = await tx
        .insert(DbSchema.CustomerPlatform)
        .values({
          customerId: customer.id,
          platformId: platform.id,
          userId: user.id,
          updatedAt: getCurrentDate(),
        })
        .returning({ id: CustomerPlatform.id });
      if (!customerPlatform) return undefined;

      return {
        customer: { id: customer.id },
        customerPlatform: { id: customerPlatform.id },
      };
    });

    if (!result) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500,
      );
    }

    return c.json(createSuccessResponse(nullsToUndefined(result)));
  })
  .put("/:id", async (c) => {
    const db = c.get("db");
    const platformRepository = c.get("platformRepository");
    const user = c.get("user");
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

    // const [need] = await db
    //   .select({id: DbSchema.Need.id})
    //   .from(DbSchema.Need)
    //   .where(eq(DbSchema.Need.description, body.need));
    const platform = await platformRepository.findBy({
      description: body.platform,
    });

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
        400,
      );
    }

    const [customer] = await db.transaction(async (tx) => {
      return await tx
        .update(DbSchema.Customer)
        .set({ ...body, updatedAt: getCurrentDate() })
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
        500,
      );
    }

    const [customerPlatform] = await db.transaction(async (tx) => {
      return await tx
        .update(DbSchema.CustomerPlatform)
        .set({
          // customerId: customer.id,
          // needId: need.id,
          platformId: platform.id,
          updatedAt: getCurrentDate(),
        })
        .where(
          and(
            eq(DbSchema.CustomerPlatform.customerId, customer.id),
            eq(DbSchema.CustomerPlatform.userId, user.id),
          ),
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
        500,
      );
    }

    return c.json(createSuccessResponse(customer));
  })
  .delete("/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: "Invalid ID",
        }),
      );
    }
    const [customer] = await db
      .update(DbSchema.Customer)
      .set({ isDeleted: true, updatedAt: getCurrentDate() })
      .where(eq(DbSchema.Customer.id, id))
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

    const [customerPlatform] = await db
      .update(DbSchema.CustomerPlatform)
      .set({ isDeleted: true, updatedAt: getCurrentDate() })
      .where(
        and(
          eq(DbSchema.CustomerPlatform.customerId, id),
          eq(DbSchema.CustomerPlatform.userId, user.id),
        ),
      )
      .returning();

    if (!customerPlatform) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        500,
      );
    }

    return c.json(createSuccessResponse({ message: "Customer deleted" }));
  });
export default customerRouterV1;
