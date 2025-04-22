import type {
  ExcelTemplateModel,
  SelectExcelTemplate,
} from "@/backend/models/exceltemplate.model";
import type { QueryOptions } from "@/backend/types";
import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";

export interface ExcelTemplateRepository {
  findAll(
    options: QueryOptions,
  ): Promise<RecursivelyReplaceNullWithUndefined<ExcelTemplateModel>[]>;
  findBy(
    filters: Record<string, any>,
  ): Promise<
    RecursivelyReplaceNullWithUndefined<SelectExcelTemplate> | undefined
  >;
}
