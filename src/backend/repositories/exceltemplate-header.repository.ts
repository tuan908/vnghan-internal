import { nullsToUndefined } from "@/shared/utils";
import { and, asc, eq } from "drizzle-orm";
import { ExcelTemplate, ExcelTemplateHeader } from "../db/schema";
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
    const defaultConditions = [eq(ExcelTemplateHeader.isDeleted, false)];
    const conditions = [];

    if (id) {
      conditions.push(eq(ExcelTemplateHeader.id, id));
    }

    if (templateId) {
      conditions.push(eq(ExcelTemplateHeader.templateId, templateId));
    }

    if (label) {
      conditions.push(eq(ExcelTemplateHeader.label, label));
    }

    if (templateName) {
      conditions.push(eq(ExcelTemplate.name, templateName));
    }

    const templateHeaders = await this.db
      .select({
        id: ExcelTemplateHeader.id,
        label: ExcelTemplateHeader.label,
        key: ExcelTemplateHeader.key,
      })
      .from(ExcelTemplateHeader)
      .innerJoin(
        ExcelTemplate,
        eq(ExcelTemplateHeader.templateId, ExcelTemplate.id),
      )
      .where(and(...conditions, ...defaultConditions));
    return nullsToUndefined(templateHeaders);
  }

  async findAll(options: QueryOptions) {
    const defaultConditions = [eq(ExcelTemplateHeader.isDeleted, false)];
    const conditions = [];

    if (options.filter) {
      const { id, templateId } = options.filter;

      if (id) {
        conditions.push(eq(ExcelTemplateHeader.id, id));
      }

      if (templateId) {
        conditions.push(eq(ExcelTemplateHeader.templateId, templateId));
      }
    }

    const templateHeaders = await this.db
      .select({
        id: ExcelTemplateHeader.id,
        label: ExcelTemplateHeader.label,
        key: ExcelTemplateHeader.key,
      })
      .from(ExcelTemplateHeader)
      .where(and(...defaultConditions, ...conditions))
      .orderBy(asc(ExcelTemplateHeader.id));

    return nullsToUndefined(templateHeaders);
  }
}
