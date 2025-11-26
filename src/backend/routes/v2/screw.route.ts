import { screw, screwMaterial, screwType } from "@/backend/db/schema";
import { NewScrewRow } from "@/backend/models/screw.model";
import { ServerEnvironment } from "@/backend/types";
import {
	DEFAULT_MATERIAL_ID,
	DEFAULT_SIZE_ID,
	DEFAULT_TYPE_ID,
	ErrorCodes,
	PAGE_SIZE,
} from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { ScrewMaterialDto, ScrewTypeDto } from "@/shared/types";
import { nullsToUndefined } from "@/shared/utils";
import { ScrewDto } from "@/shared/validations";
import { eq, isNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "hono/adapter";
import {
	createErrorResponse,
	createSuccessResponse,
} from "../../lib/api-response";

const screwRouterV2 = new Hono<{ Bindings: ServerEnvironment }>()
	.get("/", async (c) => {
		const db = c.get("db");
		const { page = "0" } = c.req.query();
		const pageNumber = parseInt(page, 10) || 0;

		const totalCountResult = await db
			.select({ count: sql`count(*)`.mapWith(Number) })
			.from(screw)
			.where(isNull(screw.deletedAt));

		const totalCount = totalCountResult[0]?.count || 0;
		const totalPages = Math.ceil(totalCount / PAGE_SIZE);

		const screws = await db
			.select({
				id: screw.id,
				name: screw.name,
				quantity: screw.quantity,
				componentType: screwType.name,
				material: screwMaterial.name,
				category: screwType.name,
				price: screw.price,
				note: screw.note,
			})
			.from(screw)
			.innerJoin(
				screwMaterial,
				eq(screw.materialId, screwMaterial.id),
			)
			.innerJoin(
				screwType,
				eq(screw.componentTypeId, screwType.id),
			)
			.where(isNull(screw.deletedAt))
			.orderBy(screw.id)
			.limit(PAGE_SIZE)
			.offset(pageNumber * PAGE_SIZE);

		return c.json(
			createSuccessResponse(screws, {
				pagination: {
					page: pageNumber,
					totalPages,
					totalItems: totalCount,
					pageSize: PAGE_SIZE,
					hasNextPage: pageNumber < totalPages - 1,
					hasPreviousPage: pageNumber > 0,
				},
			}),
			200,
		);
	})
	.post("/", async (c) => {
		const { REDIS_TOKEN, REDIS_URL } = env(c);
		const db = c.get("db");
		const newScrew = await c.req.json<ScrewDto>();

		const [screwTypeRow, screwMaterialRow] = await Promise.all([
			db
				.select({ id: screwType.id })
				.from(screwType)
				.where(eq(screwType.name, newScrew.name))
				.then((res) => res[0] || { id: DEFAULT_TYPE_ID }),

			db
				.select({ id: screwMaterial.id })
				.from(screwMaterial)
				.where(eq(screwMaterial.name, newScrew.material))
				.then((res) => res[0] || { id: DEFAULT_MATERIAL_ID }),
		]);

		const entity: NewScrewRow = {
			sizeId: DEFAULT_SIZE_ID,
			description: newScrew.category,
			name: newScrew.name,
			note: newScrew.note,
			price: newScrew.price.toString(),
			quantity: newScrew.quantity.toString(),
			componentTypeId: screwTypeRow.id,
			materialId: screwMaterialRow.id,
		};

		const result = await db.insert(screw).values(entity).execute();
		return c.json(createSuccessResponse({ data: result }), 200);
	})
	.patch("/:id", async (c) => {
		const { REDIS_TOKEN, REDIS_URL } = env(c);
		const db = c.get("db");
		const body = await c.req.json<ScrewDto>();

		const [row] = await db
			.select()
			.from(screw)
			.where(eq(screw.id, body.id!))
			.limit(1);

		if (!row) {
			return c.json(
				createErrorResponse({
					code: ErrorCodes.NOT_FOUND,
					message: json.error.notFound,
					statusCode: 404,
				}),
				404,
			);
		}

		row.name = body.name!;
		row.note = body.note!;
		row.price = body.price!;
		row.quantity = body.quantity!;

		const [material] = await db
			.select()
			.from(screwMaterial)
			.where(eq(screwMaterial.name, body.material!))
			.limit(1);

		if (!material) {
			return;
		}
		row.materialId = material.id;

		const [result] = await db
			.update(screw)
			.set(screw)
			.where(eq(screw.id, screw.id))
			.returning();

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
	.delete("/:id", async (c) => {
		const { REDIS_TOKEN, REDIS_URL } = env(c);
		const db = c.get("db");
		const body = await c.req.json();

		const [row] = await db
			.select()
			.from(screw)
			.where(eq(screw.name, body.name!))
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

		const result = await db
			.update(screw)
			.set({ deletedAt: new Date() })
			.where(eq(screw.id, screw.id));

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
			.select({ id: screwType.id, name: screwType.name })
			.from(screwType);
		return c.json(
			createSuccessResponse<ScrewTypeDto[]>(nullsToUndefined(response)),
			200,
		);
	})
	.get("/materials", async (c) => {
		const db = c.get("db");
		const response = await db
			.select({
				id: screwMaterial.id,
				name: screwMaterial.name,
			})
			.from(screwMaterial);
		return c.json(
			createSuccessResponse<ScrewMaterialDto[]>(nullsToUndefined(response)),
			200,
		);
	});

export default screwRouterV2;
