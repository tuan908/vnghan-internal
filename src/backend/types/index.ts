import { drizzle } from "drizzle-orm/neon-serverless";

export type ImportFileExtension = "csv" | "excel";

export interface Database extends ReturnType<typeof drizzle> {}

export interface ServerEnvironment {
  DATABASE_URL: string;
  REDIS_URL: string;
  REDIS_TOKEN: string;
}
