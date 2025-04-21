import { Screw } from "../db/schema";

export type InsertScrew = typeof Screw.$inferInsert;
export type SelectScrew = typeof Screw.$inferInsert;

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
