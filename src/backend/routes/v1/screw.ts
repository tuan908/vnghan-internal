import type { CreateScrewDto } from "@/backend/schema";
import {
  DEFAULT_MATERIAL_ID,
  DEFAULT_SIZE_ID,
  DEFAULT_TYPE_ID,
  ErrorCodes,
} from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import type {
  ScrewMaterialDto,
  ScrewTypeDto,
  ServerEnvironment,
} from "@/shared/types";
import { nullsToUndefined, tryCatch } from "@/shared/utils";
import { getCurrentDate } from "@/shared/utils/date";
import type { ScrewDto } from "@/shared/validations";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "hono/adapter";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";
import DbSchema from "../../schema";

const screwRouterV1 = new Hono<{ Bindings: ServerEnvironment }>()
  .get("/", async (c) => {
    const db = c.get("db");

    const screws = await db
      .select({
        id: DbSchema.Screw.id,
        name: DbSchema.Screw.name,
        quantity: DbSchema.Screw.quantity,
        componentType: DbSchema.ScrewType.name,
        material: DbSchema.ScrewMaterial.name,
        category: DbSchema.ScrewType.name,
        price: DbSchema.Screw.price,
        note: DbSchema.Screw.note,
      })
      .from(DbSchema.Screw)
      .innerJoin(
        DbSchema.ScrewMaterial,
        eq(DbSchema.Screw.materialId, DbSchema.ScrewMaterial.id),
      )
      .innerJoin(
        DbSchema.ScrewType,
        eq(DbSchema.Screw.componentTypeId, DbSchema.ScrewType.id),
      )
      .where(eq(DbSchema.Screw.isDeleted, false))
      .orderBy(DbSchema.Screw.id);

    return c.json(createSuccessResponse(screws), 200);
  })
  .post("/", async (c) => {
    const db = c.get("db");
    const { REDIS_TOKEN, REDIS_URL } = env(c);
    const newScrew = await c.req.json<ScrewDto>();

    const [screwType, screwMaterial] = await Promise.all([
      db
        .select({ id: DbSchema.ScrewType.id })
        .from(DbSchema.ScrewType)
        .where(eq(DbSchema.ScrewType.name, newScrew.name))
        .then((res) => res[0] || { id: DEFAULT_TYPE_ID }),

      db
        .select({ id: DbSchema.ScrewMaterial.id })
        .from(DbSchema.ScrewMaterial)
        .where(eq(DbSchema.ScrewMaterial.name, newScrew.material))
        .then((res) => res[0] || { id: DEFAULT_MATERIAL_ID }),
    ]);

    const entity: CreateScrewDto = {
      sizeId: DEFAULT_SIZE_ID,
      description: newScrew.category,
      name: newScrew.name,
      note: newScrew.note,
      price: newScrew.price.toString(),
      quantity: newScrew.quantity.toString(),
      componentTypeId: screwType.id,
      materialId: screwMaterial.id,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      isDeleted: false,
    };

    const { data: result, error: insertError } = await tryCatch(
      db.transaction(async (tx) => {
        return await tx.insert(DbSchema.Screw).values(entity);
      }),
    );
    if (insertError)
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.internalServerError,
        }),
      );

    return c.json(createSuccessResponse({ data: result }), 200);
  })
  .patch("/:id", async (c) => {
    const db = c.get("db");
    const { REDIS_TOKEN, REDIS_URL } = env(c);
    const body = await c.req.json<ScrewDto>();

    const screwPromise = db
      .select()
      .from(DbSchema.Screw)
      .where(eq(DbSchema.Screw.id, body.id!))
      .limit(1);

    const screwMaterialPromise = db
      .select()
      .from(DbSchema.ScrewMaterial)
      .where(eq(DbSchema.ScrewMaterial.name, body.material!))
      .limit(1);

    const screwTypePromise = db
      .select()
      .from(DbSchema.ScrewType)
      .where(eq(DbSchema.ScrewType.name, body.componentType!))
      .limit(1);

    const [[screw], [material], [type]] = await Promise.all([
      screwPromise,
      screwMaterialPromise,
      screwTypePromise,
    ]);

    if (!screw || !material || !type) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: json.error.unknownError,
          statusCode: 500,
        }),
        404,
      );
    }

    screw.name = body.name!;
    screw.note = body.note!;
    screw.price = body.price!;
    screw.quantity = body.quantity!;
    screw.materialId = material.id;
    screw.componentTypeId = type.id;

    const [result] = await db.transaction(async (tx) => {
      return await tx
        .update(DbSchema.Screw)
        .set(screw)
        .where(eq(DbSchema.Screw.id, screw.id))
        .returning();
    });

    if (!result) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: json.error.notFound,
          statusCode: 404,
        }),
        404,
      );
    }

    return c.json(createSuccessResponse({ data: result }), 200);
  })
  .delete("/:id", async (c) => {
    const { REDIS_TOKEN, REDIS_URL } = env(c);
    const db = c.get("db");
    const req = await c.req.json<ScrewDto>();

    const [screw] = await db
      .select()
      .from(DbSchema.Screw)
      .where(eq(DbSchema.Screw.id, req.id!))
      .limit(1);

    if (!screw) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.NOT_FOUND,
          message: json.error.notFound,
          statusCode: 404,
        }),
        404,
      );
    }

    const result = await db.transaction(async (tx) => {
      return await tx
        .update(DbSchema.Screw)
        .set({ isDeleted: true, updatedAt: getCurrentDate() })
        .where(eq(DbSchema.Screw.id, screw.id));
    });

    if (!result) {
      return c.json(
        createErrorResponse({
          code: ErrorCodes.BAD_REQUEST,
          message: json.error.operate,
          statusCode: 400,
        }),
        400,
      );
    }

    return c.json(createSuccessResponse({ data: result }), 200);
  })
  .get("/types", async (c) => {
    const db = c.get("db");
    const response = await db
      .select({ id: DbSchema.ScrewType.id, name: DbSchema.ScrewType.name })
      .from(DbSchema.ScrewType);
    return c.json(
      createSuccessResponse<ScrewTypeDto[]>(nullsToUndefined(response)),
      200,
    );
  })
  .get("/materials", async (c) => {
    const db = c.get("db");
    const response = await db
      .select({
        id: DbSchema.ScrewMaterial.id,
        name: DbSchema.ScrewMaterial.name,
      })
      .from(DbSchema.ScrewMaterial);
    return c.json(
      createSuccessResponse<ScrewMaterialDto[]>(nullsToUndefined(response)),
      200,
    );
  });

export default screwRouterV1;
