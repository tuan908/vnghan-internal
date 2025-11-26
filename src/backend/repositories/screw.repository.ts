import { nullsToUndefined } from "@/shared/utils";
import { and, eq } from "drizzle-orm";
import { screw, screwMaterial, screwType } from "../db/schema";
import type { NewScrewRow, ScrewRow } from "../models/screw.model";
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
				id: screw.id,
				name: screw.name,
				quantity: screw.quantity,
				componentType: screwType.name,
				material: screwMaterial.name,
				category: screwType.name,
				price: screw.price,
				note: screw.note,
			})
			.from(screw)
			.innerJoin(screwMaterial, eq(screw.materialId, screwMaterial.id))
			.innerJoin(screwType, eq(screw.componentTypeId, screwType.id))
			.where(eq(screw.isDeleted, false))
			.orderBy(screw.id);

		return nullsToUndefined(screws);
	}

	async findBy(filters: Record<string, any>): Promise<ScrewRow | undefined> {
		const { id } = filters;
		const defaultConditions = [eq(screw.isDeleted, false)];
		const conditions = [];

		if (id) {
			conditions.push(eq(screw.id, id));
		}

		const [screw] = await this.db
			.select()
			.from(screw)
			.where(and(...conditions, ...defaultConditions))
			.limit(1);
		return nullsToUndefined(screw);
	}

	async create(entity: NewScrewRow) {
		const [newScrew] = await this.db.transaction(async (tx) => {
			const newScrew = await tx.insert(screw).values(entity).returning();
			return newScrew;
		});
		return nullsToUndefined(newScrew);
	}

	async update(dto: NewScrewRow) {
		const [result] = await this.db.transaction(async (tx) => {
			return await tx
				.update(screw)
				.set(dto)
				.where(eq(screw.id, dto.id!))
				.returning();
		});
		return nullsToUndefined(result);
	}

	async delete(id: number): Promise<ScrewRow | undefined> {
		const [result] = await this.db
			.update(screw)
			.set({ isDeleted: true })
			.where(eq(screw.id, id))
			.returning();
		return result;
	}
}
