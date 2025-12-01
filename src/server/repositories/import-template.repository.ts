import { nullsToUndefined } from "@/core/utils";
import { importTemplate } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";

export const importTemplateRepository = {
	async list() {
		const conditions = [
			isNull(importTemplate.deletedAt),
			eq(importTemplate.isActive, true),
		];
		const result = await db
			.select({ id: importTemplate.id, name: importTemplate.name })
			.from(importTemplate)
			.where(and(...conditions));
		return nullsToUndefined(result);
	},

	async findById(id: number) {
		const conditions = [
			isNull(importTemplate.deletedAt),
			eq(importTemplate.isActive, true),
			eq(importTemplate.id, id),
		];
		const [result] = await db
			.select({ id: importTemplate.id, name: importTemplate.name })
			.from(importTemplate)
			.where(and(...conditions));
		return nullsToUndefined(result);
	},

	async findByName(name: string) {
		const conditions = [
			isNull(importTemplate.deletedAt),
			eq(importTemplate.isActive, true),
			eq(importTemplate.name, name),
		];
		const [result] = await db
			.select({ id: importTemplate.id, name: importTemplate.name })
			.from(importTemplate)
			.where(and(...conditions));
		return nullsToUndefined(result);
	},
};
