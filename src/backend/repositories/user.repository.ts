import { user } from "@/backend/db/schema";
import { nullsToUndefined } from "@/shared/utils";
import { getCurrentDate } from "@/shared/utils/date";
import { and, eq, isNull } from "drizzle-orm";
import type { NewUserRow } from "../models/user.model";
import type { Database } from "../types";
import type { UserRepository } from "./interfaces/user-repository.interface";

export class UserRepositoryImpl implements UserRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async findBy(filters: Record<string, any>) {
		const { id, username } = filters;
		const defaultConditions = [isNull(user.deletedAt)];
		const conditions = [];

		if (id) {
			conditions.push(eq(user.id, id));
		}

		if (username) {
			conditions.push(eq(user.username, username));
		}

		const [row] = await this.db
			.select()
			.from(user)
			.where(and(...conditions, ...defaultConditions));
		return nullsToUndefined(row);
	}

	async create(dto: NewUserRow) {
		const [newUser] = await this.db.transaction(async (tx) => {
			const insertValue = {
				...dto,
				createdAt: getCurrentDate(),
				updatedAt: getCurrentDate(),
			};
			return await tx.insert(user).values(insertValue).returning();
		});

		return newUser;
	}
}

export default UserRepositoryImpl;
