import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { platform } from "../db/schema";
import { PlatformDto } from "../models/platform.model";
import type { Database } from "../types";
import type { PlatformRepository } from "./interfaces/platform-repository.interface";

export class PlatformRepositoryImpl implements PlatformRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async findAll(): Promise<PlatformDto[]> {
		const defaultConditions = [eq(platform.isDeleted, false)];
		const result = await this.db
			.select({ id: platform.id, name: platform.name })
			.from(platform)
			.where(and(...defaultConditions));
		return nullsToUndefined(result);
	}

	async findBy(filters: Record<string, any>) {
		const { id, name } = filters;
		const defaultConditions = [eq(platform.isDeleted, false)];
		const conditions = [];

		if (id) {
			conditions.push(eq(platform.id, id));
		}

		if (name) {
			conditions.push(eq(platform.name, name));
		}

		const [platform] = await this.db
			.select()
			.from(platform)
			.where(and(...defaultConditions, ...conditions));
		return nullsToUndefined(platform);
	}
}
