import { RecursivelyReplaceNullWithUndefined } from "@/core/types";
import { customer } from "../db/schema";

export interface CustomerModel {
	name: string;
	phone: string;
	address: string;
	platform: string;
	need: string;
	money: string;
	nextMessageTime: string;
}

export interface CustomerRow
	extends RecursivelyReplaceNullWithUndefined<typeof customer.$inferSelect> {}

export type NewCustomerRow = RecursivelyReplaceNullWithUndefined<
	typeof customer.$inferInsert
>;

export type RawCustomer = RecursivelyReplaceNullWithUndefined<{
	id: number;
	name: string | null;
	phone: string | null;
	address: string | null;
	nextMessageTime: string | null;
	need: string | null;
	platform: string | null;
	money: string | null;
}>;
