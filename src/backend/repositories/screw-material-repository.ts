import { nullsToUndefined } from "@/shared/utils";
import { and, eq, isNull } from "drizzle-orm";
import { screwMaterial } from "../db/schema";
import { Database } from "../types";
import type { ScrewMaterialRepository } from "./interfaces/screwmaterial-repository.interface";

export class ScrewMaterialRepositoryImpl implements ScrewMaterialRepository {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}
	async findAll() {
		const defaultConditions = [isNull(screwMaterial.deletedAt)];

		const result = await this.db
			.select({ id: screwMaterial.id, name: screwMaterial.name })
			.from(screwMaterial)
			.where(and(...defaultConditions));

		return nullsToUndefined(result);
	}

	async findBy(filters: Record<string, any>) {
		const defaultConditions = [isNull(screwMaterial.deletedAt)];
		const conditions = [];

		const { id, name } = filters;

		if (id) {
			conditions.push(eq(screwMaterial.id, id));
		}

		if (name) {
			conditions.push(eq(screwMaterial.name, name));
		}

		const [material] = await this.db
			.select({ id: screwMaterial.id, name: screwMaterial.name })
			.from(screwMaterial)
			.where(and(...defaultConditions, ...conditions));

		return nullsToUndefined(material);
	}
}
