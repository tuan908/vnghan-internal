import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { platform } from "../db/schema";

export type PlatformRow = RecursivelyReplaceNullWithUndefined<
	typeof platform.$inferSelect
>;
export type PlatformCustomerRow = RecursivelyReplaceNullWithUndefined<
	typeof platform.$inferInsert
>;

export interface PlatformDto {
	id: number;
	name?: string;
}
