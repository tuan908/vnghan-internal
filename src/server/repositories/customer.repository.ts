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
};
