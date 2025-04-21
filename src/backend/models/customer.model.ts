import { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { Customer } from "../db/schema";

export interface CustomerModel {
  name: string;
  phone: string;
  address: string;
  platform: string;
  need: string;
  money: string;
  nextMessageTime: string;
}

export interface SelectCustomer
  extends RecursivelyReplaceNullWithUndefined<typeof Customer.$inferSelect> {}

export type InsertCustomer = RecursivelyReplaceNullWithUndefined<
  typeof Customer.$inferInsert
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
