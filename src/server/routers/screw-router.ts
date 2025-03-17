import { PAGE_SIZE } from "@/constants";
import { createSuccessResponse } from "@/lib/api-response";
import { nullsToUndefined } from "@/lib/utils";
import schema from "@/server/db";
import { desc, eq, sql } from "drizzle-orm";
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
  getAll: publicProcedure
  .input(z.object({ pageNumber: z.number() }))
  .query(async ({ c, ctx, input }) => {
    const { db } = ctx;
    const { pageNumber } = input;

    // First, get the total count for pagination metadata
    const totalCountResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(schema.screw)
      .where(eq(schema.screw.isDeleted, false));

    const totalCount = totalCountResult[0]!?.count;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Then get the actual data for the current page
    const screws = await db
      .select({
        name: schema.screw.name,
        quantity: schema.screw.stock,
        category: schema.screw.description,
        material: schema.screwMaterial.name,
        features: schema.screwType.name,
        price: schema.screw.price,
        notes: schema.screw.note,
      })
      .from(schema.screw)
      .innerJoin(
        schema.screwMaterial,
        eq(schema.screw.material, schema.screwMaterial.id)
      )
      .innerJoin(schema.screwType, eq(schema.screw.type, schema.screwType.id))
      .where(eq(schema.screw.isDeleted, false))
      .orderBy(desc(schema.screw.createdAt))
      .limit(PAGE_SIZE)
      .offset(pageNumber * PAGE_SIZE);

    // Return data with pagination metadata
    return c.superjson(
      createSuccessResponse({
        data: nullsToUndefined(screws),
        pagination: {
          page: pageNumber,
          currentPage: pageNumber,
          totalPages,
          totalItems: totalCount,
          pageSize: PAGE_SIZE,
          hasNextPage: pageNumber < totalPages - 1,
          hasPreviousPage: pageNumber > 0
        }
      }),
      200
    );
  }),

  create: publicProcedure
    .input(createScrewDto)
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input;
      const { db } = ctx;

      const post = await db
        .insert(schema.screw)
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
