import type { RawCustomer, SelectCustomer } from "@/backend/models/customer.model";

export interface CustomerRepository {
  findAll(filters: Record<string, any>): Promise<RawCustomer[]>;
  findBy(filters: Record<string, any>): Promise<SelectCustomer | undefined>;
}
