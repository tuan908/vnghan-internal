import DbSchema from "@/backend/schema";
import { nullsToUndefined } from "@/shared/utils";
import { createSuccessResponse } from "@/shared/utils/api-response";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const customerCommonRouterV1 = new Hono().get("/platforms", async (c) => {
  const db = c.get("db");
  const results = await db
    .select({
      id: DbSchema.Platform.id,
      description: DbSchema.Platform.description,
    })
    .from(DbSchema.Platform)
    .where(eq(DbSchema.Platform.isDeleted, false));
  return c.json(createSuccessResponse(nullsToUndefined(results)));
});
// .get("/needs", async (c) => {
//   const db = c.get("db");
//   const results = await db
//     .select({ id: DbSchema.Need.id, description: DbSchema.Need.description })
//     .from(DbSchema.Need)
//     .where(eq(DbSchema.Need.isDeleted, false));
//   return c.json(createSuccessResponse(nullsToUndefined(results)));
// });

export default customerCommonRouterV1;
