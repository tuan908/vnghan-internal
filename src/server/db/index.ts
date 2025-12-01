import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function createDb() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL environment variable is not set");
	}

	const pool = new Pool({
		connectionString,
		max: 10, // Vercel serverless: keep this modest
		idleTimeoutMillis: 30_000,
	});

	return drizzle({
		client: pool,
		schema,
		logger: process.env.NODE_ENV === "development",
	});
}

export const db = createDb();

export type DB = typeof db;
