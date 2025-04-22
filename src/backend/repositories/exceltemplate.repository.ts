import { ExcelTemplate } from "@/backend/db/schema";
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
      eq(ExcelTemplate.isActive, true),
      eq(ExcelTemplate.isDeleted, false),
    ];

    const templates = await this.db
      .select({ id: ExcelTemplate.id, label: ExcelTemplate.name })
      .from(ExcelTemplate)
      .where(and(...defaultConditions));

    return nullsToUndefined(templates);
  }

  async findBy(filters: Record<string, any>) {
    const { id, name } = filters;
    const defaultConditions = [
      eq(ExcelTemplate.isDeleted, false),
      eq(ExcelTemplate.isActive, true),
    ];
    const conditions = [];

    if (id) {
      conditions.push(eq(ExcelTemplate.id, id));
    }

    if (name) {
      conditions.push(eq(ExcelTemplate.name, name));
    }

    const [template] = await this.db
      .select()
      .from(ExcelTemplate)
      .where(and(...conditions, ...defaultConditions));
    return nullsToUndefined(template);
  }
}
