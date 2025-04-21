import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types"
import type { InsertUser, SelectUser } from "../../models/user.model"

export interface UserRepository {
   findBy(filters: Record<string, any>): Promise<RecursivelyReplaceNullWithUndefined<SelectUser> | undefined>
   create(dto: InsertUser): Promise<SelectUser | undefined>
}