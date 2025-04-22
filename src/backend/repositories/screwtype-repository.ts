import { ScrewTypeDto } from "@/shared/types";
import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { ScrewType } from "../db/schema";
import { Database } from "../types";
import type { ScrewTypeRepository } from "./interfaces/screwtype-repository.interface";

export class ScrewTypeRepositoryImpl implements ScrewTypeRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }
  async findAll(): Promise<ScrewTypeDto[]> {
    const defaultConditions = [eq(ScrewType.isDeleted, false)];
    const result = await this.db
      .select({ id: ScrewType.id, name: ScrewType.name })
      .from(ScrewType)
      .where(and(...defaultConditions));
    return nullsToUndefined(result);
  }

  async findBy(
    filters: Record<string, any>,
  ): Promise<ScrewTypeDto | undefined> {
    const defaultConditions = [eq(ScrewType.isDeleted, false)];
    const conditions = [];

    const { id, name } = filters;

    if (id) {
      conditions.push(eq(ScrewType.id, id));
    }

    if (name) {
      conditions.push(eq(ScrewType.name, name));
    }

    const [material] = await this.db
      .select({ id: ScrewType.id, name: ScrewType.name })
      .from(ScrewType)
      .where(and(...defaultConditions, ...conditions));

    return nullsToUndefined(material);
  }
}
