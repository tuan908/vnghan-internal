import { ExcelTemplate } from "../db/schema";

export type SelectExcelTemplate = typeof ExcelTemplate.$inferSelect;
export type InsertExcelTemplate = typeof ExcelTemplate.$inferInsert;

export interface ExcelTemplateModel {
	id: number;
	label: string;
}
