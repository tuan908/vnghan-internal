import type { ScrewTypeDto } from "@/shared/types";

export interface ScrewTypeRepository {
	findAll(): Promise<ScrewTypeDto[]>;
	findBy(filters: Record<string, any>): Promise<ScrewTypeDto | undefined>;
}
