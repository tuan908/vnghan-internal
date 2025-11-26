import type {
	NewScrewRow,
	ScrewModel,
	ScrewRow,
} from "@/backend/models/screw.model";
import type { QueryOptions } from "@/backend/types";
import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";

export interface ScrewRepository {
	findAll(
		options?: QueryOptions,
	): Promise<RecursivelyReplaceNullWithUndefined<ScrewModel>[]>;
	findBy(filters: Record<string, any>): Promise<ScrewRow | undefined>;
	create(dto: NewScrewRow): Promise<ScrewRow | undefined>;
	update(dto: NewScrewRow): Promise<ScrewRow | undefined>;
	delete(id: number): Promise<ScrewRow | undefined>;
}
