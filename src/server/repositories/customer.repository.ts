import { nullsToUndefined } from "@/core/utils";
import { customer, customerPlatform, platform } from "@/server/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db";

export const customerRepository = {
	async findById(id: number) {
		const conditions = [isNull(customer.deletedAt), eq(customer.id, id)];
		const [result] = await db
			.select()
			.from(customer)
			.where(and(...conditions));
		return result;
	},
	async findByName(name: string) {
		const conditions = [isNull(customer.deletedAt), eq(customer.name, name)];
		const [result] = await db
			.select()
			.from(customer)
			.where(and(...conditions));
		return result;
	},
	async listByOperatorId(operatorId: number) {
		const conditions = [
			isNull(customer.deletedAt),
			eq(customer.assignedTo, operatorId),
		];
		const customers = await db
			.select({
				id: customer.id,
				name: customer.name,
				phone: customer.phone,
				address: customer.address,
				nextMessageTime: customer.nextMessageTime,
				need: customer.need,
				platform: platform.name,
				money: customer.money,
				note: customer.note,
			})
			.from(customer)
			.innerJoin(customerPlatform, eq(customer.id, customerPlatform.customerId))
			.innerJoin(platform, eq(customerPlatform.platformId, platform.id))
			.where(and(...conditions))
			.orderBy(desc(customer.updatedAt));
		return nullsToUndefined(customers);
	},

	async listByOperatorIdInfinite(
		operatorId: number,
		limit: number = 20,
		cursor?: string,
	) {
		const conditions = [
			isNull(customer.deletedAt),
			eq(customer.assignedTo, operatorId),
		];

		// Offset-based pagination for simplicity (can be upgraded to cursor-based later)
		let offset = 0;
		if (cursor) {
			const parsedOffset = parseInt(cursor);
			if (!isNaN(parsedOffset)) {
				offset = parsedOffset;
			}
		}

		const customers = await db
			.select({
				id: customer.id,
				name: customer.name,
				phone: customer.phone,
				address: customer.address,
				nextMessageTime: customer.nextMessageTime,
				need: customer.need,
				platform: platform.name,
				money: customer.money,
				note: customer.note,
			})
			.from(customer)
			.innerJoin(customerPlatform, eq(customer.id, customerPlatform.customerId))
			.innerJoin(platform, eq(customerPlatform.platformId, platform.id))
			.where(and(...conditions))
			.orderBy(customer.id)
			.limit(limit + 1) // +1 to check if there are more pages
			.offset(offset);

		const data = nullsToUndefined(customers);
		const hasNextPage = data.length > limit;
		const actualData = data.slice(0, limit);
		const nextCursor = hasNextPage ? (offset + limit).toString() : null;

		return {
			data: actualData,
			nextCursor,
			hasNextPage,
		};
	},
};
