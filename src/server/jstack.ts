import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "hono/adapter";
import { jstack } from "jstack";

interface Env {
  Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

let sql: Pool | null = null;

/**
 * Type-safely injects database into all procedures
 *
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL } = env(c);

  if (!sql) {
    sql = new Pool({
      connectionString: DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 15000,
    });
  }
  const db = drizzle({ client: sql, logger: true });

  return await next({ db });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware);
