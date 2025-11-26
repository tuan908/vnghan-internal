import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import type { NewUserRow, User } from "../../models/user.model";

export interface UserRepository {
	findBy(
		filters: Record<string, any>,
	): Promise<RecursivelyReplaceNullWithUndefined<User> | undefined>;
	create(dto: NewUserRow): Promise<User | undefined>;
}
