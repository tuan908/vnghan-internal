import { DbSchema } from "@/backend/db/schema";
import type { InsertScrew } from "@/backend/models/screw.model";
import {
  DEFAULT_MATERIAL_ID,
  DEFAULT_SIZE_ID,
  DEFAULT_TYPE_ID,
  ErrorCodes,
} from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { ScrewMaterialDto, ScrewTypeDto } from "@/shared/types";
import { nullsToUndefined, tryCatch } from "@/shared/utils";
import { getCurrentDate } from "@/shared/utils/date";
import type { ScrewDto } from "@/shared/validations";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../lib/api-response";
import type { ServerEnvironment } from "../../types";

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
    const screwRepository = c.get("screwRepository");
    const screwTypeRepository = c.get("screwTypeRepository");
    const screwMaterialRepository = c.get("screwMaterialRepository");

    const newScrew = await c.req.json<ScrewDto>();

    const [screwType, screwMaterial] = await Promise.all([
      screwTypeRepository.findBy({
        name: newScrew.componentType,
      }),
      screwMaterialRepository.findBy({
        name: newScrew.material,
      }),
    ]);

    const entity: InsertScrew = {
      sizeId: DEFAULT_SIZE_ID,
      description: newScrew.category,
      name: newScrew.name,
      note: newScrew.note,
      price: newScrew.price.toString(),
      quantity: newScrew.quantity.toString(),
      componentTypeId: screwType ? screwType.id : DEFAULT_TYPE_ID,
      materialId: screwMaterial ? screwMaterial.id : DEFAULT_MATERIAL_ID,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      isDeleted: false,
    };

    const { data: result, error: insertError } = await tryCatch(
      screwRepository.create(entity),
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
    const screwRepository = c.get("screwRepository");
    const screwTypeRepository = c.get("screwTypeRepository");
    const screwMaterialRepository = c.get("screwMaterialRepository");
    const body = await c.req.json<ScrewDto>();

    const [screw, screwType, screwMaterial] = await Promise.all([
      screwRepository.findBy({ id: body.id }),
      screwTypeRepository.findBy({
        name: body.componentType,
      }),
      screwMaterialRepository.findBy({
        name: body.material,
      }),
    ]);

    if (!screw || !screwMaterial || !screwType) {
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
    screw.materialId = screwType.id;
    screw.componentTypeId = screwMaterial.id;

    const result = await db.transaction(async (tx) => {
      return await screwRepository.update(screw);
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
    const screwRepository = c.get("screwRepository");
    const req = await c.req.json<ScrewDto>();

    const screw = await screwRepository.findBy({ id: req.id });

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

    const result = await screwRepository.delete(screw.id!);

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
    const screwTypeRepository = c.get("screwTypeRepository");
    const response = await screwTypeRepository.findAll();
    return c.json(
      createSuccessResponse<ScrewTypeDto[]>(nullsToUndefined(response)),
      200,
    );
  })
  .get("/materials", async (c) => {
    const screwMaterialRepository = c.get("screwMaterialRepository");
    const response = await screwMaterialRepository.findAll();
    return c.json(
      createSuccessResponse<ScrewMaterialDto[]>(nullsToUndefined(response)),
      200,
    );
  });

export default screwRouterV1;
