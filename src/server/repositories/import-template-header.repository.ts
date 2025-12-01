import { nullsToUndefined } from "@/core/utils";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { importTemplate, importTemplateHeader } from "../db/schema";

export const importTemplateHeaderRepository = {
	async search(filters: Record<string, any>) {
		const { id, label, templateId, templateName } = filters;
		const defaultConditions = [isNull(importTemplateHeader.deletedAt)];
		const conditions = [];

		if (id) {
			conditions.push(eq(importTemplateHeader.id, id));
		}

		if (templateId) {
			conditions.push(eq(importTemplateHeader.templateId, templateId));
		}

		if (label) {
			conditions.push(eq(importTemplateHeader.label, label));
		}

		if (templateName) {
			conditions.push(eq(importTemplate.name, templateName));
		}

		const templateHeaders = await db
			.select({
				id: importTemplateHeader.id,
				label: importTemplateHeader.label,
				key: importTemplateHeader.key,
			})
			.from(importTemplateHeader)
			.innerJoin(
				importTemplate,
				eq(importTemplateHeader.templateId, importTemplate.id),
			)
			.where(and(...conditions, ...defaultConditions))
			.orderBy(asc(importTemplateHeader.id));
		return nullsToUndefined(templateHeaders);
	},

	async findByTemplateName(templateName: string) {
		const conditions = [
			isNull(importTemplateHeader.deletedAt),
			eq(importTemplate.name, templateName),
		];
		const templateHeaders = await db
			.select({
				id: importTemplateHeader.id,
				label: importTemplateHeader.label,
				key: importTemplateHeader.key,
			})
			.from(importTemplateHeader)
			.innerJoin(
				importTemplate,
				eq(importTemplate.id, importTemplateHeader.templateId),
			)
			.where(and(...conditions))
			.orderBy(asc(importTemplateHeader.id));

		return nullsToUndefined(templateHeaders);
	},

	async list() {
		const conditions = [isNull(importTemplateHeader.deletedAt)];
		const templateHeaders = await db
			.select({
				id: importTemplateHeader.id,
				label: importTemplateHeader.label,
				key: importTemplateHeader.key,
			})
			.from(importTemplateHeader)
			.where(and(...conditions))
			.orderBy(asc(importTemplateHeader.id));

		return nullsToUndefined(templateHeaders);
	},
};
