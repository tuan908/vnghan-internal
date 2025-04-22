import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { Platform } from "../db/schema";
import { PlatformDto } from "../models/platform.model";
import type { Database } from "../types";
import type { PlatformRepository } from "./interfaces/platform-repository.interface";

export class PlatformRepositoryImpl implements PlatformRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findAll(): Promise<PlatformDto[]> {
    const defaultConditions = [eq(Platform.isDeleted, false)];
    const result = await this.db
      .select({ id: Platform.id, name: Platform.name })
      .from(Platform)
      .where(and(...defaultConditions));
    return nullsToUndefined(result);
  }

  async findBy(filters: Record<string, any>) {
    const { id, name } = filters;
    const defaultConditions = [eq(Platform.isDeleted, false)];
    const conditions = [];

    if (id) {
      conditions.push(eq(Platform.id, id));
    }

    if (name) {
      conditions.push(eq(Platform.name, name));
    }

    const [platform] = await this.db
      .select()
      .from(Platform)
      .where(and(...defaultConditions, ...conditions));
    return nullsToUndefined(platform);
  }
}
