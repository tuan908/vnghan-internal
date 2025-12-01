import {
	DEFAULT_MATERIAL_ID,
	DEFAULT_SIZE_ID,
	DEFAULT_TYPE_ID,
	ErrorCodes,
} from "@/core/constants";
import json from "@/core/i18n/locales/en/en.json";
import { nullsToUndefined, tryCatch } from "@/core/utils";
import { getCurrentDate } from "@/core/utils/date";
import { ScrewDto } from "@/core/validations";
import {
	createErrorResponse,
	createSuccessResponse,
} from "@/server/lib/api-response";
import { Hono } from "hono";
import { NewScrewRow } from "../models/screw.model";
import { screwMaterialRepository } from "../repositories/screw-material-repository";
import { screwTypeRepository } from "../repositories/screw-type.repository";
import { screwRepository } from "../repositories/screw.repository";

const inventoryRouter = new Hono()
	.get("/screw/list", async (c) => {
		const screws = await screwRepository.list();
		return c.json(createSuccessResponse(screws), 200);
	})
	.post("/screw", async (c) => {
		const newScrew = await c.req.json<ScrewDto>();

		const [screwType, screwMaterial] = await Promise.all([
			screwTypeRepository.findByName(newScrew.componentType),
			screwMaterialRepository.findByName(newScrew.material),
		]);

		const newRow: NewScrewRow = {
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
		};

		const { data: result, error: insertError } = await tryCatch(
			screwRepository.create(newRow),
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
	.patch("/screw/:id", async (c) => {
		const body = await c.req.json<ScrewDto>();

		const [screw, screwType, screwMaterial] = await Promise.all([
			screwRepository.findById(body.id!),
			screwTypeRepository.findByName(body.componentType),
			screwMaterialRepository.findByName(body.material),
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
		screw.materialId = screwMaterial.id;
		screw.componentTypeId = screwType.id;

		const result = await screwRepository.update(screw);

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
	.delete("/screw/:id", async (c) => {
		const id = parseInt(c.req.param("id"));

		const screw = await screwRepository.findById(id);

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

		const result = await screwRepository.softDelete(screw.id!);

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
	.get("/screwType/list", async (c) => {
		const response = await screwTypeRepository.list();
		return c.json(createSuccessResponse(nullsToUndefined(response)), 200);
	})
	.get("/screwMaterial/list", async (c) => {
		const response = await screwMaterialRepository.list();
		return c.json(createSuccessResponse(nullsToUndefined(response)), 200);
	});

export default inventoryRouter;
