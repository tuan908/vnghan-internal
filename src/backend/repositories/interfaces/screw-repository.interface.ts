import type { InsertScrew, ScrewModel, SelectScrew } from "@/backend/models/screw.model";
import type { QueryOptions } from "@/backend/types";
import { RecursivelyReplaceNullWithUndefined } from "@/shared/types";

export interface ScrewRepository {
  findAll(options: QueryOptions): Promise<RecursivelyReplaceNullWithUndefined<ScrewModel>[]>;
  findBy(filters: Record<string, any>): Promise<SelectScrew | undefined>;
  create(dto: InsertScrew): Promise<SelectScrew | undefined>;
  update(dto: InsertScrew): Promise<SelectScrew | undefined>;
  delete(id: number): Promise<SelectScrew | undefined>;
}
