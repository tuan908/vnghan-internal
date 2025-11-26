import { customer, customerPlatform, platform } from "@/backend/db/schema";
import { nullsToUndefined } from "@/shared/utils";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NewCustomerRow } from "../models/customer.model";
import type { Database, QueryOptions } from "../types";
import type { CustomerRepository } from "./interfaces/customer-repository.interface";

export class CustomerRepositoryImpl implements CustomerRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async findBy(filters: Record<string, any>) {
		const { id, name, assignedTo, isAdmin } = filters;

		const defaultConditions = [isNull(customer.deletedAt)];
		const conditions = [];
		if (id) {
			conditions.push(eq(customer.id, id));
		}

		if (name) {
			conditions.push(eq(customer.name, name));
		}

		if (assignedTo && !isAdmin) {
			conditions.push(eq(customer.assignedTo, assignedTo));
		}

		const [row] = await this.db
			.select()
			.from(customer)
			.where(and(...conditions, ...defaultConditions));
		return nullsToUndefined(row);
	}
	create(entity: NewCustomerRow): Promise<{
		id: number;
		name: string | undefined;
		phone: string | undefined;
		address: string | undefined;
		nextMessageTime: string | undefined;
		note: string | undefined;
		money: string | undefined;
		createdAt: Date | undefined;
		updatedAt: Date | undefined;
		isDeleted: boolean | undefined;
		need: string | undefined;
		createdBy: number | undefined;
		updatedBy: number | undefined;
		assignedTo: number | undefined;
	}> {
		throw new Error("Method not implemented.");
	}
	update(
		id: number,
		entity: NewCustomerRow,
	): Promise<
		| {
				id: number;
				name: string | undefined;
				phone: string | undefined;
				address: string | undefined;
				nextMessageTime: string | undefined;
				note: string | undefined;
				money: string | undefined;
				createdAt: Date | undefined;
				updatedAt: Date | undefined;
				isDeleted: boolean | undefined;
				need: string | undefined;
				createdBy: number | undefined;
				updatedBy: number | undefined;
				assignedTo: number | undefined;
		  }
		| undefined
	> {
		throw new Error("Method not implemented.");
	}
	delete(id: number): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	async findAll(options: QueryOptions) {
		const defaultConditions = [isNull(customer.deletedAt)];
		const conditions = [];
		if (options.filter) {
			const { isAdmin, operatorId } = options.filter;
			if (!isAdmin) {
				conditions.push(eq(customer.assignedTo, operatorId));
			}
		}

		const customers = await this.db
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
			.where(and(...defaultConditions, ...conditions))
			.orderBy(desc(customer.updatedAt));
		return nullsToUndefined(customers);
	}
}
