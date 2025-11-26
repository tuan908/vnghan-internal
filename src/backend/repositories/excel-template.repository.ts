import { excelTemplate } from "@/backend/db/schema";
import { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { ExcelTemplateModel } from "../models/exceltemplate.model";
import { Database, QueryOptions } from "../types";
import { ExcelTemplateRepository } from "./interfaces/exceltemplate-repository.interface";

export class ExcelTemplateRepositoryImpl implements ExcelTemplateRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}
	async findAll(
		options: QueryOptions,
	): Promise<RecursivelyReplaceNullWithUndefined<ExcelTemplateModel>[]> {
		const defaultConditions = [
			eq(excelTemplate.isActive, true),
			eq(excelTemplate.isDeleted, false),
		];

		const templates = await this.db
			.select({ id: excelTemplate.id, label: excelTemplate.name })
			.from(excelTemplate)
			.where(and(...defaultConditions));

		return nullsToUndefined(templates);
	}

	async findBy(filters: Record<string, any>) {
		const { id, name } = filters;
		const defaultConditions = [
			eq(excelTemplate.isDeleted, false),
			eq(excelTemplate.isActive, true),
		];
		const conditions = [];

		if (id) {
			conditions.push(eq(excelTemplate.id, id));
		}

		if (name) {
			conditions.push(eq(excelTemplate.name, name));
		}

		const [template] = await this.db
			.select()
			.from(excelTemplate)
			.where(and(...conditions, ...defaultConditions));
		return nullsToUndefined(template);
	}
}
