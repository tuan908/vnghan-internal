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
		max: 4, // Reduced for serverless (fewer concurrent functions)
		min: 0, // Allow complete scaling to zero
		idleTimeoutMillis: 10000, // Faster cleanup than default 30s
		connectionTimeoutMillis: 2000, // Fail fast instead of default 60s
		allowExitOnIdle: true, // Allow pool to exit when idle
	});

	return drizzle({
		client: pool,
		schema,
		logger: process.env.NODE_ENV === "development",
		casing: "snake_case",
	});
}

export const db = createDb();

export type DB = typeof db;
