import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "hono/adapter";
import { jstack } from "jstack";
import postgres from "postgres";

interface Env {
  Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

let sql: ReturnType<typeof postgres> | null = null;

/**
 * Type-safely injects database into all procedures
 *
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL } = env(c);

  if (!sql) {
    sql = postgres(DATABASE_URL, {
      max: 20, // Adjust based on your needs and database limits
      idle_timeout: 20, // Close connections after 20 seconds of inactivity
    });
  }
  const db = drizzle(sql);

  return await next({ db });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware);
