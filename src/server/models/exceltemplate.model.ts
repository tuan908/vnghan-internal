import { importTemplate } from "../db/schema";

export type ExcelTemplateRow = typeof importTemplate.$inferSelect;
export type NewExcelTemplateRow = typeof importTemplate.$inferInsert;

export interface ExcelTemplateModel {
	id: number;
	label: string;
}
