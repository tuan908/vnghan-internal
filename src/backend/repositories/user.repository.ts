import { User } from "@/backend/db/schema";
import { nullsToUndefined } from "@/shared/utils";
import { getCurrentDate } from "@/shared/utils/date";
import { and, eq } from "drizzle-orm";
import type { InsertUser } from "../models/user.model";
import type { Database } from "../types";
import type { UserRepository } from "./interfaces/user-repository.interface";

export class UserRepositoryImpl implements UserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findBy(filters: Record<string, any>) {
    const {id, username} = filters;
    const defaultConditions = [eq(User.isDeleted, false)];
    const conditions = [];

    if (id) {
      conditions.push(eq(User.id, id));
    }

    if (username) {
      conditions.push(eq(User.username, username));
    }

    const [user] = await this.db
      .select()
      .from(User)
      .where(and(...conditions, ...defaultConditions));
    return nullsToUndefined(user);
  }

  async create(dto: InsertUser) {
    const user = await this.findBy({
      username: dto.username,
    });

    if (!user) return undefined;

    const [newUser] = await this.db.transaction(async tx => {
      const insertValue = {
        ...dto,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };
      return await tx.insert(User).values(insertValue).returning();
    });

    return newUser;
  }
}

export default UserRepositoryImpl;
