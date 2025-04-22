import { drizzle } from "drizzle-orm/neon-serverless";
import { CustomerRepositoryImpl } from "../repositories/customer.repository";
import { PlatformRepositoryImpl } from "../repositories/platform.repository";
import { UserRepositoryImpl } from "../repositories/user.repository";

export type ImportFileExtension = "csv" | "excel";

export interface Database extends ReturnType<typeof drizzle> {}

export interface ServerEnvironment {
  DATABASE_URL: string;
  REDIS_URL: string;
  REDIS_TOKEN: string;
}

export interface ContextVariableMap {
  db: Database;
  customerRepository: CustomerRepositoryImpl;
  platformRepository: PlatformRepositoryImpl;
  userRepository: UserRepositoryImpl;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: "asc" | "desc";
  filter?: Record<string, any>;
}
