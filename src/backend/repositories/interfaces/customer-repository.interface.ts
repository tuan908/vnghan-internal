import type {
	RawCustomer,
	SelectCustomer,
} from "@/backend/models/customer.model";
import type { QueryOptions } from "@/backend/types";

export interface CustomerRepository {
	findAll(options: QueryOptions): Promise<RawCustomer[]>;
	findBy(filters: Record<string, any>): Promise<SelectCustomer | undefined>;
}
