import type { ExcelTemplateHeaderModel } from "@/backend/models/exceltemplate-header.model";
import type { QueryOptions } from "@/backend/types";
import { RecursivelyReplaceNullWithUndefined } from "@/shared/types";

export interface ExcelTemplateHeaderRepository {
  findAll(
    options: QueryOptions,
  ): Promise<RecursivelyReplaceNullWithUndefined<ExcelTemplateHeaderModel>[]>;
  findBy(
    filters: Record<string, any>,
  ): Promise<RecursivelyReplaceNullWithUndefined<ExcelTemplateHeaderModel>[]>;
}
