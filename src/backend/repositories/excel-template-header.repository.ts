import { nullsToUndefined } from "@/shared/utils";
import { and, asc, eq, isNull } from "drizzle-orm";
import { excelTemplate, excelTemplateHeader } from "../db/schema";
import type { Database, QueryOptions } from "../types";
import type { ExcelTemplateHeaderRepository } from "./interfaces/exceltemplate-header-repository.interface";

export class ExcelTemplateHeaderRepositoryImpl
	implements ExcelTemplateHeaderRepository
{
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async findBy(filters: Record<string, any>) {
		const { id, label, templateId, templateName } = filters;
		const defaultConditions = [isNull(excelTemplateHeader.deletedAt)];
		const conditions = [];

		if (id) {
			conditions.push(eq(excelTemplateHeader.id, id));
		}

		if (templateId) {
			conditions.push(eq(excelTemplateHeader.templateId, templateId));
		}

		if (label) {
			conditions.push(eq(excelTemplateHeader.label, label));
		}

		if (templateName) {
			conditions.push(eq(excelTemplate.name, templateName));
		}

		const templateHeaders = await this.db
			.select({
				id: excelTemplateHeader.id,
				label: excelTemplateHeader.label,
				key: excelTemplateHeader.key,
			})
			.from(excelTemplateHeader)
			.innerJoin(
				excelTemplate,
				eq(excelTemplateHeader.templateId, excelTemplate.id),
			)
			.where(and(...conditions, ...defaultConditions))
			.orderBy(asc(excelTemplateHeader.id));
		return nullsToUndefined(templateHeaders);
	}

	async findAll(options: QueryOptions) {
		const defaultConditions = [isNull(excelTemplateHeader.deletedAt)];
		const conditions = [];

		if (options.filter) {
			const { id, templateId } = options.filter;

			if (id) {
				conditions.push(eq(excelTemplateHeader.id, id));
			}

			if (templateId) {
				conditions.push(eq(excelTemplateHeader.templateId, templateId));
			}
		}

		const templateHeaders = await this.db
			.select({
				id: excelTemplateHeader.id,
				label: excelTemplateHeader.label,
				key: excelTemplateHeader.key,
			})
			.from(excelTemplateHeader)
			.where(and(...defaultConditions, ...conditions))
			.orderBy(asc(excelTemplateHeader.id));

		return nullsToUndefined(templateHeaders);
	}
}
