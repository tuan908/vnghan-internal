import { nullsToUndefined } from "@/core/utils";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { platform } from "../db/schema";

export const platformRepository = {
	async list() {
		const conditions = [isNull(platform.deletedAt)];
		const result = await db
			.select({ id: platform.id, name: platform.name })
			.from(platform)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},

	async findById(id: number) {
		const conditions = [isNull(platform.deletedAt), eq(platform.id, id)];
		const [result] = await db
			.select({ id: platform.id, name: platform.name })
			.from(platform)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},

	async findByName(name: string) {
		const conditions = [isNull(platform.deletedAt), eq(platform.name, name)];
		const [result] = await db
			.select({ id: platform.id, name: platform.name })
			.from(platform)
			.where(and(...conditions));

		return nullsToUndefined(result);
	},
};
