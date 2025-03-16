import { createSuccessResponse } from "@/lib/api-response";
import schema from "@/server/db";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { j, publicProcedure } from "../jstack";

const createScrewDto = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.number().int().positive("Type must be a positive integer"),
  size: z.number().int().positive("Size must be a positive integer"),
  material: z.number().int().positive("Material must be a positive integer"),
  note: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export type CreateScrewDto = z.infer<typeof createScrewDto>;

export const screwRouter = j.router({
  getAll: publicProcedure.query(async ({ c, ctx }) => {
    const { db } = ctx;

    const screws = await db
      .select()
      .from(schema.screws)
      .orderBy(desc(schema.screws.createdAt));

    return c.superjson(createSuccessResponse(screws), 200);
  }),

  create: publicProcedure
    .input(createScrewDto)
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input;
      const { db } = ctx;

      const post = await db
        .insert(schema.screws)
        .values({
          material: 1,
          name: name,
          price: "0",
          size: 1,
          stock: "",
          type: 1,
        })
        .execute();

      return c.superjson(createSuccessResponse(post), 200);
    }),
});
