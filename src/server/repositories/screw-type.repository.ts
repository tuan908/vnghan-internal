import { nullsToUndefined } from "@/core/utils";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { screwType } from "../db/schema";

export const screwTypeRepository = {
	async list() {
		const defaultConditions = [isNull(screwType.deletedAt)];
		const result = await db
			.select({ id: screwType.id, name: screwType.name })
			.from(screwType)
			.where(and(...defaultConditions));
		return nullsToUndefined(result);
	},

	async findById(id: number) {
		const conditions = [isNull(screwType.deletedAt), eq(screwType.id, id)];

		const [result] = await db
			.select({ id: screwType.id, name: screwType.name })
			.from(screwType)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},
	async findByName(name: string) {
		const conditions = [isNull(screwType.deletedAt), eq(screwType.name, name)];

		const [result] = await db
			.select({ id: screwType.id, name: screwType.name })
			.from(screwType)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},
};
