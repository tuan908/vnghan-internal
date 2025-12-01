import { ErrorCodes } from "@/core/constants";
import json from "@/core/i18n/locales/vi/vi.json";
import { nullsToUndefined, toStringValue } from "@/core/utils";
import { getCurrentDate } from "@/core/utils/date";
import { customer, customerPlatform, platform } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import {
	createErrorResponse,
	createSuccessResponse,
} from "../lib/api-response";
import { customerRepository } from "../repositories/customer.repository";
import { platformRepository } from "../repositories/platform.repository";

const customerRouter = new Hono()
	.get("/list", async (c) => {
		const session = c.get("session");
		const customerList = await customerRepository.listByOperatorId(session.id);
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
		const id = parseInt(c.req.param("id"));
		if (isNaN(id)) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.BAD_REQUEST,
					message: "Invalid ID",
				}),
			);
		}
		const customer = await customerRepository.findById(id);
		return c.json(createSuccessResponse(customer));
	})
	.post("/", async (c) => {
		const session = c.get("session");
		const body = await c.req.json();
		// const [need] = await db
		//   .select({id: DbSchema.Need.id})
		//   .from(DbSchema.Need)
		//   .where(eq(DbSchema.Need.description, body.need));
		const [platformRow] = await db
			.select({ id: platform.id })
			.from(platform)
			.where(eq(platform.name, body.platform));

		// if (!need?.id || !platform?.id) {
		//   return c.json(
		//     createErrorResponse({
		//       code: ErrorCodes.BAD_REQUEST,
		//       message: json.error.badRequest,
		//     }),
		//     400
		//   );
		// }

		if (!platformRow?.id) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.BAD_REQUEST,
					message: json.error.badRequest,
				}),
				400,
			);
		}

		const result = await db.transaction(async (tx) => {
			const [newCustomerRow] = await tx
				.insert(customer)
				.values({
					...body,
					createdBy: session.id,
					updatedBy: session.id,
					assignedTo: session.id,
				})
				.returning({ id: customer.id });
			if (!newCustomerRow) return undefined;

			const [newCustomerPlatformRow] = await tx
				.insert(customerPlatform)
				.values({
					customerId: newCustomerRow.id,
					platformId: platformRow.id,
					userId: session.id,
					updatedAt: getCurrentDate(),
				})
				.returning({ id: customerPlatform.id });
			if (!newCustomerPlatformRow) return undefined;

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
		const session = c.get("session");
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
		const platform = await platformRepository.findByName(body.platform);

		if (!platform?.id) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.BAD_REQUEST,
					message: json.error.badRequest,
				}),
				400,
			);
		}

		const [updatedCustomerRow] = await db.transaction(async (tx) => {
			return await tx
				.update(customer)
				.set({ ...body, updatedAt: getCurrentDate() })
				.where(eq(customer.id, id))
				.returning();
		});

		if (!updatedCustomerRow) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.INTERNAL_SERVER_ERROR,
					message: json.error.unknownError,
					statusCode: 500,
				}),
				500,
			);
		}

		const [updatedCustomerPlatformRow] = await db.transaction(async (tx) => {
			return await tx
				.update(customerPlatform)
				.set({
					// customerId: customer.id,
					// needId: need.id,
					platformId: platform.id,
					updatedAt: getCurrentDate(),
				})
				.where(
					and(
						eq(customerPlatform.customerId, updatedCustomerRow.id),
						eq(customerPlatform.userId, session.id),
					),
				)
				.returning();
		});

		if (!updatedCustomerPlatformRow) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.INTERNAL_SERVER_ERROR,
					message: json.error.unknownError,
					statusCode: 500,
				}),
				500,
			);
		}

		return c.json(createSuccessResponse(updatedCustomerRow));
	})
	.delete("/:id", async (c) => {
		const session = c.get("session");
		const id = parseInt(c.req.param("id"));
		if (isNaN(id)) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.BAD_REQUEST,
					message: "Invalid ID",
				}),
			);
		}
		const [newCustomerRow] = await db
			.update(customer)
			.set({ deletedAt: getCurrentDate(), updatedAt: getCurrentDate() })
			.where(eq(customer.id, id))
			.returning();

		if (!newCustomerRow) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.INTERNAL_SERVER_ERROR,
					message: json.error.unknownError,
					statusCode: 500,
				}),
				500,
			);
		}

		const [newCustomerPlatformRow] = await db
			.update(customerPlatform)
			.set({ deletedAt: getCurrentDate(), updatedAt: getCurrentDate() })
			.where(
				and(
					eq(customerPlatform.customerId, id),
					eq(customerPlatform.userId, session.id),
				),
			)
			.returning();

		if (!newCustomerPlatformRow) {
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
	})
	.get("/platform/list", async (c) => {
		const platforms = await platformRepository.list();
		return c.json(createSuccessResponse(platforms));
	});
export default customerRouter;
