import { screw } from "../db/schema";

export type NewScrewRow = typeof screw.$inferInsert;
export type ScrewRow = typeof screw.$inferInsert;

export interface ScrewModel {
	id: number;
	name: string | null;
	quantity: string | null;
	componentType: string | null;
	material: string | null;
	category: string | null;
	price: string | null;
	note: string | null;
}
