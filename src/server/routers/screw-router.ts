import {
  DEFAULT_MATERIAL_ID,
  DEFAULT_TYPE_ID,
  ErrorCodes,
  PAGE_SIZE,
} from "@/constants";
import json from "@/i18n/locales/vi.json";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { nullsToUndefined } from "@/lib/utils";
import { ScrewDto, ScrewSchema } from "@/lib/validations";
import SCHEMA from "@/server/db";
import { ScrewTypeDto, ServerCreateScrewDto } from "@/types";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { j, publicProcedure } from "../jstack";

export const screwRouter = j.router({
  getAll: publicProcedure
    .input(z.object({ pageNumber: z.number() }))
    .query(async ({ c, ctx, input }) => {
      const { db } = ctx;
      const { pageNumber } = input;

      // First, get the total count for pagination metadata
      const totalCountResult = await db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(SCHEMA.SCREW)
        .where(eq(SCHEMA.SCREW.isDeleted, false));

      const totalCount = totalCountResult[0]!?.count;
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);

      // Then get the actual data for the current page
      const screws = await db
        .select({
          id: SCHEMA.SCREW.id,
          name: SCHEMA.SCREW.name,
          quantity: SCHEMA.SCREW.quantity,
          componentType: SCHEMA.SCREW_TYPE.name,
          material: SCHEMA.SCREW_MATERIAL.name,
          category: SCHEMA.SCREW_TYPE.name,
          price: SCHEMA.SCREW.price,
          note: SCHEMA.SCREW.note,
        })
        .from(SCHEMA.SCREW)
        .innerJoin(
          SCHEMA.SCREW_MATERIAL,
          eq(SCHEMA.SCREW.materialId, SCHEMA.SCREW_MATERIAL.id)
        )
        .innerJoin(
          SCHEMA.SCREW_TYPE,
          eq(SCHEMA.SCREW.componentTypeId, SCHEMA.SCREW_TYPE.id)
        )
        .where(eq(SCHEMA.SCREW.isDeleted, false))
        .orderBy(desc(SCHEMA.SCREW.createdAt))
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
            hasPreviousPage: pageNumber > 0,
          },
        }),
        200
      );
    }),

  create: publicProcedure
    .input(ScrewSchema)
    .mutation(async ({ ctx, c, input: newScrew }) => {
      const { db } = ctx;

      const entity: ServerCreateScrewDto = {
        description: newScrew.category,
        name: newScrew.name,
        note: newScrew.note,
        price: newScrew.price.toString(),
        quantity: newScrew.quantity.toString(),
        componentTypeId: 0,
        sizeId: 0,
        materialId: 0,
      };
      const [screwType] = await db
        .select({ id: SCHEMA.SCREW_TYPE.id })
        .from(SCHEMA.SCREW_TYPE)
        .where(eq(SCHEMA.SCREW_TYPE.name, newScrew.name));

      if (!screwType) {
        entity.componentTypeId = DEFAULT_TYPE_ID;
      } else {
        entity.componentTypeId = screwType.id;
      }

      const [screwMaterial] = await db
        .select({ id: SCHEMA.SCREW_MATERIAL.id })
        .from(SCHEMA.SCREW_MATERIAL)
        .where(eq(SCHEMA.SCREW_MATERIAL.name, newScrew.material));

      if (!screwMaterial) {
        entity.materialId = DEFAULT_MATERIAL_ID;
      } else {
        entity.materialId = screwMaterial.id;
      }

      const result = await db.insert(SCHEMA.SCREW).values(entity).execute();
      return c.superjson(createSuccessResponse({ data: result }), 200);
    }),

  update: publicProcedure
    .input(z.object({ body: z.custom<ScrewDto>() }))
    .mutation(async ({ ctx, c, input }) => {
      const { db } = ctx;

      const [screw] = await db
        .select()
        .from(SCHEMA.SCREW)
        .where(eq(SCHEMA.SCREW.id, input.body.id!))
        .limit(1);

      if (!screw) {
        return c.superjson(
          createErrorResponse({
            code: ErrorCodes.NOT_FOUND,
            message: json.error.notFound,
            statusCode: 404,
          }),
          404
        );
      }

      screw.name = input.body.name!;
      screw.note = input.body.note!;
      screw.price = input.body.price!;
      screw.quantity = input.body.quantity!;

      const [material] = await db
        .select()
        .from(SCHEMA.SCREW_MATERIAL)
        .where(eq(SCHEMA.SCREW_MATERIAL.name, input.body.material!))
        .limit(1);

      if (!material) {
        return;
      }
      screw.materialId = material.id;

      const result = await db
        .update(SCHEMA.SCREW)
        .set(screw)
        .where(eq(SCHEMA.SCREW.id, screw.id));

      if (!result) {
        return c.superjson(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            message: json.error.operate,
            statusCode: 400,
          }),
          400
        );
      }

      return c.superjson(createSuccessResponse({ data: result }), 200);
    }),

  delete: publicProcedure
    .input(z.object({ body: z.custom<ScrewDto>() }))
    .mutation(async ({ ctx, c, input }) => {
      const { db } = ctx;

      const [screw] = await db
        .select()
        .from(SCHEMA.SCREW)
        .where(eq(SCHEMA.SCREW.name, input.body.name!))
        .limit(1);

      if (!screw) {
        return c.superjson(
          createErrorResponse({
            code: ErrorCodes.NOT_FOUND,
            message: json.error.notFound,
            statusCode: 404,
          }),
          404
        );
      }

      const result = await db
        .update(SCHEMA.SCREW)
        .set({ isDeleted: true })
        .where(eq(SCHEMA.SCREW.id, screw.id));

      if (!result) {
        return c.superjson(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            message: json.error.operate,
            statusCode: 400,
          }),
          400
        );
      }

      return c.superjson(createSuccessResponse({ data: result }), 200);
    }),

  getScrewTypes: publicProcedure.get(async ({ ctx, c }) => {
    const { db } = ctx;

    const response = await db
      .select({ id: SCHEMA.SCREW_TYPE.id, name: SCHEMA.SCREW_TYPE.name })
      .from(SCHEMA.SCREW_TYPE);
    return c.json(
      createSuccessResponse<ScrewTypeDto[]>(nullsToUndefined(response)),
      200
    );
  }),

  getScrewMaterials: publicProcedure.get(async ({ ctx, c }) => {
    const { db } = ctx;

    const response = await db
      .select({
        id: SCHEMA.SCREW_MATERIAL.id,
        name: SCHEMA.SCREW_MATERIAL.name,
      })
      .from(SCHEMA.SCREW_MATERIAL);
    return c.json(
      createSuccessResponse<ScrewTypeDto[]>(nullsToUndefined(response)),
      200
    );
  }),
});
