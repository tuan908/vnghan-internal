import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { Platform } from "../db/schema";

export type SelectPlatform = RecursivelyReplaceNullWithUndefined<
  typeof Platform.$inferSelect
>;
export type PlatformCustomer = RecursivelyReplaceNullWithUndefined<
  typeof Platform.$inferInsert
>;

export interface PlatformDto {
  id: number;
  name?: string
}