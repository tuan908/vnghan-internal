import { getCurrentDate } from "@/core/utils/date";
import { user } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import type { NewUserRow } from "../models/user.model";

export const userRepository = {
	async findById(id: number) {
		const conditions = [isNull(user.deletedAt), eq(user.id, id)];
		const [result] = await db
			.select()
			.from(user)
			.where(and(...conditions));
		return result;
	},
	async findByUsername(username: string) {
		const conditions = [isNull(user.deletedAt), eq(user.username, username)];
		const [result] = await db
			.select()
			.from(user)
			.where(and(...conditions));
		return result;
	},
	async create(dto: NewUserRow) {
		const [newUser] = await db.transaction(async (tx) => {
			const insertValue = {
				...dto,
				createdAt: getCurrentDate(),
				updatedAt: getCurrentDate(),
			};
			return await tx.insert(user).values(insertValue).returning();
		});

		return newUser;
	},
};
