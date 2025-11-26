import { ScrewTypeDto } from "@/shared/types";
import { nullsToUndefined } from "@/shared/utils";
import { and, eq, isNull } from "drizzle-orm";
import { screwType } from "../db/schema";
import { Database } from "../types";
import type { ScrewTypeRepository } from "./interfaces/screwtype-repository.interface";

export class ScrewTypeRepositoryImpl implements ScrewTypeRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}
	async findAll(): Promise<ScrewTypeDto[]> {
		const defaultConditions = [isNull(screwType.deletedAt)];
		const result = await this.db
			.select({ id: screwType.id, name: screwType.name })
			.from(screwType)
			.where(and(...defaultConditions));
		return nullsToUndefined(result);
	}

	async findBy(
		filters: Record<string, any>,
	): Promise<ScrewTypeDto | undefined> {
		const defaultConditions = [isNull(screwType.deletedAt)];
		const conditions = [];

		const { id, name } = filters;

		if (id) {
			conditions.push(eq(screwType.id, id));
		}

		if (name) {
			conditions.push(eq(screwType.name, name));
		}

		const [material] = await this.db
			.select({ id: screwType.id, name: screwType.name })
			.from(screwType)
			.where(and(...defaultConditions, ...conditions));

		return nullsToUndefined(material);
	}
}
