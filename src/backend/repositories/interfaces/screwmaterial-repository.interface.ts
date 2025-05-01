import type { ScrewMaterialDto } from "@/shared/types";

export interface ScrewMaterialRepository {
	findAll(): Promise<ScrewMaterialDto[]>;
	findBy(filters: Record<string, any>): Promise<ScrewMaterialDto | undefined>;
}
