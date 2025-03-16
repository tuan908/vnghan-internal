import { screws } from "@/server/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { j, publicProcedure } from "../jstack";

export const fileRouter = j.router({
  recent: publicProcedure.query(async ({ c, ctx }) => {
    const { db } = ctx;

    const [recentPost] = await db
      .select()
      .from(screws)
      .orderBy(desc(screws.createdAt))
      .limit(1);

    return c.superjson(recentPost ?? null);
  }),

  excel: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input;
      const { db } = ctx;

      const post = await db
        .insert(screws)
        .values({
          material: 1,
          name: name,
          price: "0",
          size: 1,
          type: 1,
          stock: 0,
        })
        .execute();

      return c.superjson(post);
    }),
  pdf: publicProcedure.mutation(async ({ ctx, c }) => {}),
});
