import { nullsToUndefined } from "@/core/utils";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { screw, screwMaterial, screwType } from "../db/schema";
import type { NewScrewRow, ScrewRow } from "../models/screw.model";

export const screwRepository = {
	async list() {
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
			.innerJoin(screwMaterial, eq(screw.materialId, screwMaterial.id))
			.innerJoin(screwType, eq(screw.componentTypeId, screwType.id))
			.where(isNull(screw.deletedAt))
			.orderBy(screw.id);
		return nullsToUndefined(screws);
	},

	async listPaginated(limit: number = 50, offset: number = 0) {
		const [rows, countResult] = await Promise.all([
			db
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
				.innerJoin(screwMaterial, eq(screw.materialId, screwMaterial.id))
				.innerJoin(screwType, eq(screw.componentTypeId, screwType.id))
				.where(isNull(screw.deletedAt))
				.orderBy(screw.id)
				.limit(limit)
				.offset(offset),
			db.$count(screw, isNull(screw.deletedAt)),
		]);

		return {
			data: nullsToUndefined(rows),
			total: countResult,
			limit,
			offset,
		};
	},

	async listInfinite(limit: number = 50, cursor?: string) {
		let whereCondition: any = isNull(screw.deletedAt);

		// For simplicity with current data, we'll use offset-based infinite query
		// In production, you'd want proper cursor-based pagination
		let offset = 0;

		if (cursor) {
			// Parse cursor as offset number for simplicity
			const parsedOffset = parseInt(cursor);
			if (!isNaN(parsedOffset)) {
				offset = parsedOffset;
			}
		}

		const rows = await db
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
			.innerJoin(screwMaterial, eq(screw.materialId, screwMaterial.id))
			.innerJoin(screwType, eq(screw.componentTypeId, screwType.id))
			.where(whereCondition)
			.orderBy(screw.id)
			.limit(limit + 1) // +1 to check if there are more pages
			.offset(offset);

		const data = nullsToUndefined(rows);

		// Check if there are more pages by seeing if we got limit + 1 rows
		const hasNextPage = data.length > limit;
		const actualData = data.slice(0, limit); // Return only the requested limit
		const nextCursor = hasNextPage ? (offset + limit).toString() : null;

		return {
			data: actualData,
			nextCursor,
			hasNextPage,
		};
	},

	async findById(id: number) {
		const conditions = [isNull(screw.deletedAt), eq(screw.id, id)];
		const [result] = await db
			.select()
			.from(screw)
			.where(and(...conditions))
			.limit(1);
		return nullsToUndefined(result);
	},

	async create(entity: NewScrewRow) {
		const [newScrew] = await db.transaction(async (tx) => {
			const newScrew = await tx.insert(screw).values(entity).returning();
			return newScrew;
		});
		return nullsToUndefined(newScrew);
	},

	async update(dto: NewScrewRow) {
		const [result] = await db.transaction(async (tx) => {
			return await tx
				.update(screw)
				.set(dto)
				.where(eq(screw.id, dto.id!))
				.returning();
		});
		return nullsToUndefined(result);
	},

	async softDelete(id: number): Promise<ScrewRow | undefined> {
		const [result] = await db
			.update(screw)
			.set({ deletedAt: new Date() })
			.where(eq(screw.id, id))
			.returning();
		return result;
	},
};
