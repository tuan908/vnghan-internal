import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { Screw, ScrewMaterial, ScrewType } from "../db/schema";
import type { InsertScrew, SelectScrew } from "../models/screw.model";
import type { Database, QueryOptions } from "../types";
import type { ScrewRepository } from "./interfaces/screw-repository.interface";

export default class ScrewRepositoryImpl implements ScrewRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findAll(options: QueryOptions) {
    const screws = await this.db
      .select({
        id: Screw.id,
        name: Screw.name,
        quantity: Screw.quantity,
        componentType: ScrewType.name,
        material: ScrewMaterial.name,
        category: ScrewType.name,
        price: Screw.price,
        note: Screw.note,
      })
      .from(Screw)
      .innerJoin(ScrewMaterial, eq(Screw.materialId, ScrewMaterial.id))
      .innerJoin(ScrewType, eq(Screw.componentTypeId, ScrewType.id))
      .where(eq(Screw.isDeleted, false))
      .orderBy(Screw.id);

    return nullsToUndefined(screws);
  }

  async findBy(filters: Record<string, any>): Promise<SelectScrew | undefined> {
    const {id} = filters;
    const defaultConditions = [eq(Screw.isDeleted, false)];
    const conditions = [];

    if (id) {
      conditions.push(eq(Screw.id, id));
    }

    const [screw] = await this.db
      .select()
      .from(Screw)
      .where(and(...conditions, ...defaultConditions))
      .limit(1);
    return nullsToUndefined(screw);
  }

  async create(entity: InsertScrew) {
    const [newScrew] = await this.db.transaction(async tx => {
      const newScrew = await tx.insert(Screw).values(entity).returning();
      return newScrew;
    });
    return nullsToUndefined(newScrew);
  }

  async update(dto: InsertScrew) {
    const screw = await this.findBy({id: dto.id!})
    if (!screw) return undefined;
    const [result] = await this.db.transaction(async tx => {
      return await tx
        .update(Screw)
        .set(screw)
        .where(eq(Screw.id, screw.id!))
        .returning();
    });
    return nullsToUndefined(result);
  }

  async delete(id: number): Promise<SelectScrew | undefined> {
    const [result] = await this.db
      .update(Screw)
      .set({isDeleted: true})
      .where(eq(Screw.id, id))
      .returning();
    return result;
  }
}
