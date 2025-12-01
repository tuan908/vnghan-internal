import { nullsToUndefined } from "@/core/utils";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { screwMaterial } from "../db/schema";

export const screwMaterialRepository = {
	async list() {
		const conditions = [isNull(screwMaterial.deletedAt)];

		const result = await db
			.select({ id: screwMaterial.id, name: screwMaterial.name })
			.from(screwMaterial)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},

	async findById(id: number) {
		const conditions = [
			isNull(screwMaterial.deletedAt),
			eq(screwMaterial.id, id),
		];

		const [result] = await db
			.select({ id: screwMaterial.id, name: screwMaterial.name })
			.from(screwMaterial)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},
	async findByName(name: string) {
		const conditions = [
			isNull(screwMaterial.deletedAt),
			eq(screwMaterial.name, name),
		];

		const [result] = await db
			.select({ id: screwMaterial.id, name: screwMaterial.name })
			.from(screwMaterial)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},
};
