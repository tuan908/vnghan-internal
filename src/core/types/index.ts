import { RankingInfo } from "@tanstack/match-sorter-utils";
import { FilterFn } from "@tanstack/react-table";

export interface ApiResponse<T = unknown> {
	success: boolean;
	status: {
		code: number;
		message: string;
	};
	requestId: string;
	timestamp: string;
	data?: T;
	error?: ApiError;
	pagination?: PaginationInfo;
	rateLimit?: RateLimitInfo;
}

export interface ApiError {
	code: string;
	message: string;
	details?: unknown;
	path?: string;
	stack?: string;
	errors?: ValidationError[];
}

export interface ValidationError {
	field: string;
	message: string;
	code: string;
	value?: unknown;
}

export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	nextPageUrl?: string;
	previousPageUrl?: string;
}

export interface RateLimitInfo {
	limit: number;
	remaining: number;
	reset: number;
}

export interface ScrewData {
	name: string;
	description: string;
	videos: VideoData[];
	type: number;
	material: number;
	stock: string;
	others: OthersData[];
	price: string;
	images: ImageData[];
	note: string;
	size: number;
	data?: ScrewJsonData;
}

export type ScrewJsonData = Pick<ScrewData, "videos" | "images" | "others">;

export interface ImageData {
	id: string;
	url: string;
}

export interface VideoData {
	id: string;
	url: string;
}

export interface CategoryDto {
	id: string;
	name: string;
	description: string;
}

export interface MaterialDto {
	id: string;
	name: string;
	description: string;
}

export interface OthersData {
	id: string;
	name: string;
	description: string;
}

export type RecursivelyReplaceNullWithUndefined<T> = T extends null
	? undefined
	: T extends Date
		? T
		: {
				[K in keyof T]: T[K] extends (infer U)[]
					? RecursivelyReplaceNullWithUndefined<U>[]
					: RecursivelyReplaceNullWithUndefined<T[K]>;
			};

export type SelectOptions = {
	screwTypesPromise: Promise<ApiResponse<ScrewTypeDto[]>>;
	screwMaterialsPromise: Promise<ApiResponse<ScrewMaterialDto[]>>;
};

export interface ScrewMaterialDto {
	id: number;
	name?: string;
}

export interface ScrewTypeDto {
	id: number;
	name?: string;
}

export interface ImportResult {
	rowsCount: number;
}

declare module "@tanstack/react-table" {
	interface FilterFns {
		fuzzy: FilterFn<unknown>;
	}
	interface FilterMeta {
		itemRank: RankingInfo;
	}
}
