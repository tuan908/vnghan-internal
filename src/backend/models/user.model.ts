import { User } from "../db/schema";

export type SelectUser = typeof User.$inferSelect;
export type InsertUser = typeof User.$inferInsert;
