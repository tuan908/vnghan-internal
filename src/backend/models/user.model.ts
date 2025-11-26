import { user } from "../db/schema";

export type UserRow = typeof user.$inferSelect;
export type NewUserRow = typeof user.$inferInsert;
