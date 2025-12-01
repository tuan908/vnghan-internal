export interface ServerEnvironment {
	DATABASE_URL: string;
	REDIS_URL: string;
	REDIS_TOKEN: string;
}

export interface QueryOptions {
	limit?: number;
	offset?: number;
	orderBy?: string;
	sortDirection?: "asc" | "desc";
	filter?: Record<string, any>;
}
