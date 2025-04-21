import { Customer, CustomerPlatform, Platform } from "@/backend/db/schema";
import { nullsToUndefined } from "@/shared/utils";
import { and, desc, eq } from "drizzle-orm";
import { SelectCustomer } from "../models/customer.model";
import type { Database, QueryOptions } from "../types";
import type { CustomerRepository } from "./interfaces/customer-repository.interface";

export class CustomerRepositoryImpl implements CustomerRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findBy(filters: Record<string, any>) {
    const {id, name, assignedTo, isAdmin} = filters;

    const defaultConditions = [eq(Customer.isDeleted, false)];
    const conditions = [];
    if (id) {
      conditions.push(eq(Customer.id, id));
    }

    if (name) {
      conditions.push(eq(Customer.name, name));
    }

    if (assignedTo && !isAdmin) {
      conditions.push(eq(Customer.assignedTo, assignedTo));
    }

    const [customer] = await this.db
      .select()
      .from(Customer)
      .where(and(...conditions, ...defaultConditions));
    return nullsToUndefined(customer);
  }
  create(entity: SelectCustomer): Promise<{
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
    entity: SelectCustomer
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
    const defaultConditions = [eq(Customer.isDeleted, false)];
    const conditions = [];
    if(options.filter) {
      const {isAdmin, operatorId} = options.filter
      if (!isAdmin) {
        conditions.push(eq(Customer.assignedTo, operatorId));
      }
    }

    const customers = await this.db
      .select({
        id: Customer.id,
        name: Customer.name,
        phone: Customer.phone,
        address: Customer.address,
        nextMessageTime: Customer.nextMessageTime,
        need: Customer.need,
        platform: Platform.name,
        money: Customer.money,
        note: Customer.note,
      })
      .from(Customer)
      .innerJoin(CustomerPlatform, eq(Customer.id, CustomerPlatform.customerId))
      .innerJoin(Platform, eq(CustomerPlatform.platformId, Platform.id))
      .where(and(...defaultConditions, ...conditions))
      .orderBy(desc(Customer.updatedAt));
    return nullsToUndefined(customers);
  }
}
