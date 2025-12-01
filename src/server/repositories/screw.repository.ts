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
