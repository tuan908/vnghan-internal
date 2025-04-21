import type { PlatformDto } from "@/backend/models/platform.model";

export interface PlatformRepository {
  findAll(): Promise<PlatformDto[]>
  findBy(filters: Record<string, any>): Promise<PlatformDto | undefined>;
}
