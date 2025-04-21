import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { MiddlewareHandler } from "hono";
import { DbSchema } from "../db/schema";
import { CustomerRepositoryImpl } from "../repositories/customer.repository";
import { ExcelTemplateHeaderRepositoryImpl } from "../repositories/exceltemplate-header.repository";
import { ExcelTemplateRepositoryImpl } from "../repositories/exceltemplate.repository";
import { PlatformRepositoryImpl } from "../repositories/platform.repository";
import ScrewRepositoryImpl from "../repositories/screw.repository";
import { ScrewMaterialRepositoryImpl } from "../repositories/screwmaterial-repository";
import { ScrewTypeRepositoryImpl } from "../repositories/screwtype-repository";
import { UserRepositoryImpl } from "../repositories/user.repository";
import type { ContextVariableMap, ServerEnvironment } from "../types";

/**
 * Create a Hono middleware for database access using Neon's HTTP client
 * which is better suited for serverless environments like Cloudflare Workers
 */

let pool: Pool | undefined = undefined;

export const createDbMiddleware = (
  connectionStringOverride?: string,
): MiddlewareHandler<{
  Bindings: ServerEnvironment;
  Variables: ContextVariableMap;
}> => {
  return async (c, next) => {
    const start = Date.now();

    try {
      // Get connection string from env or override
      const connectionString =
        connectionStringOverride || process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error("Database connection string is required");
      }

      // Create a new SQL client for this request using HTTP mode
      // HTTP mode is better for serverless environments as it doesn't maintain persistent connections
      if (!pool) {
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
      }

      // Create a Drizzle instance
      const db = drizzle({ client: pool, schema: DbSchema, logger: true });

      // Add to context
      c.set("db", db);
      c.set("customerRepository", new CustomerRepositoryImpl(db));
      c.set("excelTemplateRepository", new ExcelTemplateRepositoryImpl(db));
      c.set("excelTemplateHeaderRepository", new ExcelTemplateHeaderRepositoryImpl(db));
      c.set("platformRepository", new PlatformRepositoryImpl(db));
      c.set("screwRepository", new ScrewRepositoryImpl(db));
      c.set("screwMaterialRepository", new ScrewMaterialRepositoryImpl(db));
      c.set("screwTypeRepository", new ScrewTypeRepositoryImpl(db)); // Inject db
      c.set("platformRepository", new PlatformRepositoryImpl(db));
      c.set("userRepository", new UserRepositoryImpl(db)); // Inject db

      // Continue to next middleware/handler
      await next();

      // Log slow operations
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(
          `Slow database operation: ${duration}ms for ${c.req.path}`,
        );
      }
    } catch (error: any) {
      console.error("Database middleware error:", error?.message);

      // Return appropriate error response
      return c.json(
        {
          error: "Database connection error",
          message: "Unable to connect to the database",
          statusCode: 503,
        },
        503,
      );
    }
  };
};

/**
 * Simple health check function that creates a one-time connection
 */
export const checkDatabaseHealth = async (
  connectionString: string,
): Promise<{ healthy: boolean; latency: number }> => {
  const startTime = Date.now();

  try {
    // Create a one-time client
    const sql = neon(connectionString);

    // Test the connection
    await sql`SELECT 1`;

    return { healthy: true, latency: Date.now() - startTime };
  } catch (error) {
    console.error("Database health check failed:", error);
    return { healthy: false, latency: Date.now() - startTime };
  }
};
