import { ExcelTemplateModel } from "@/backend/models/exceltemplate.model";
import type { QueryOptions } from "@/backend/types";
import { RecursivelyReplaceNullWithUndefined } from "@/shared/types";

export interface ExcelTemplateHeaderRepository {
    findAll(options: QueryOptions): Promise<RecursivelyReplaceNullWithUndefined<ExcelTemplateModel>[]>
}