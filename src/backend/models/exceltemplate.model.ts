import { excelTemplate } from "../db/schema";

export type ExcelTemplateRow = typeof excelTemplate.$inferSelect;
export type NewExcelTemplateRow = typeof excelTemplate.$inferInsert;

export interface ExcelTemplateModel {
	id: number;
	label: string;
}
