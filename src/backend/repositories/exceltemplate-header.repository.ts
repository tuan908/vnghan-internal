import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { ExcelTemplateHeader } from "../db/schema";
import type { Database, QueryOptions } from "../types";
import { ExcelTemplateHeaderRepository } from "./interfaces/exceltemplate-header-repository.interface";

export class ExcelTemplateHeaderRepositoryImpl
  implements ExcelTemplateHeaderRepository
{
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findBy(filters: Record<string, any>) {
    const {id, label, templateId} = filters;
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

    const [templateHeader] = await this.db
      .select({id: ExcelTemplateHeader.id, label: ExcelTemplateHeader.label})
      .from(ExcelTemplateHeader)
      .where(and(...conditions, ...defaultConditions));
    return nullsToUndefined(templateHeader);
  }

  async findAll(options: QueryOptions) {
    const defaultConditions = [eq(ExcelTemplateHeader.isDeleted, false)];
    const conditions = [];

    if (options.filter) {
      const {id, templateId} = options.filter;

      if (id) {
        conditions.push(eq(ExcelTemplateHeader.id, id));
      }

      if (templateId) {
        conditions.push(eq(ExcelTemplateHeader.templateId, templateId));
      }
    }

    const templateHeaders = await this.db
      .select({id: ExcelTemplateHeader.id, label: ExcelTemplateHeader.label})
      .from(ExcelTemplateHeader)
      .where(and(...defaultConditions, ...conditions));

    return nullsToUndefined(templateHeaders);
  }
}
