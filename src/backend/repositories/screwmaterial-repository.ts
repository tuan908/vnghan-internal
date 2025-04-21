import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { ScrewMaterial } from "../db/schema";
import { Database } from "../types";
import type { ScrewMaterialRepository } from "./interfaces/screwmaterial-repository.interface";

export class ScrewMaterialRepositoryImpl implements ScrewMaterialRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }
  async findAll() {
    const defaultConditions = [eq(ScrewMaterial.isDeleted, false)];

    const result = await this.db
      .select({id: ScrewMaterial.id, name: ScrewMaterial.name})
      .from(ScrewMaterial)
      .where(and(...defaultConditions));

    return nullsToUndefined(result);
  }

  async findBy(filters: Record<string, any>) {
    const defaultConditions = [eq(ScrewMaterial.isDeleted, false)];
    const conditions = [];

    const {id, name} = filters;

    if (id) {
      conditions.push(eq(ScrewMaterial.id, id));
    }

    if (name) {
      conditions.push(eq(ScrewMaterial.name, name));
    }

    const [material] = await this.db
      .select({id: ScrewMaterial.id, name: ScrewMaterial.name})
      .from(ScrewMaterial)
      .where(and(...defaultConditions, ...conditions));

    return nullsToUndefined(material);
  }
}
