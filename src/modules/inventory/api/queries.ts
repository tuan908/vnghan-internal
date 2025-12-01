import { api } from "@/server/client";
import {
	infiniteQueryOptions,
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";

export const inventoryQueryKeys = {
	all: ["inventory"] as const,
	list: ["list"] as const,
	screw: ["screw"] as const,
	screwMaterial: ["screw-material"] as const,
	screwType: ["screw-type"] as const,
	screwList: () =>
		[
			...inventoryQueryKeys.all,
			...inventoryQueryKeys.list,
			...inventoryQueryKeys.screw,
		] as const,
	screwListInfinite: () =>
		[
			...inventoryQueryKeys.all,
			...inventoryQueryKeys.list,
			...inventoryQueryKeys.screw,
			"infinite",
		] as const,
	screwDetail: (id: number) =>
		[...inventoryQueryKeys.all, inventoryQueryKeys.screw, id] as const,
	screwMaterialList: () => [
		...inventoryQueryKeys.all,
		...inventoryQueryKeys.list,
		...inventoryQueryKeys.screwMaterial,
	],
	screwTypeList: () => [
		...inventoryQueryKeys.all,
		...inventoryQueryKeys.list,
		...inventoryQueryKeys.screwType,
	],
};

export const inventoryQueryOptions = {
	screw: {
		list: queryOptions({
			queryKey: inventoryQueryKeys.screwList(),
			queryFn: async () => {
				const res = await api.inventory.screw.list.$get();
				const resJson = await res.json();

				if (!resJson?.data) {
					return [];
				}
				return resJson?.data;
			},
		}),
	},
	screwMaterial: {
		list: queryOptions({
			queryKey: inventoryQueryKeys.screwMaterialList(),
			queryFn: async () => {
				const res = await api.inventory.screwMaterial.list.$get();
				const resJson = await res.json();

				if (!resJson?.data) {
					return [];
				}
				return resJson?.data;
			},
			// Reference data changes rarely - cache for 5 minutes
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
		}),
	},
	screwType: {
		list: queryOptions({
			queryKey: inventoryQueryKeys.screwTypeList(),
			queryFn: async () => {
				const res = await api.inventory.screwType.list.$get();
				const resJson = await res.json();

				if (!resJson?.data) {
					return [];
				}
				return resJson?.data;
			},
			// Reference data changes rarely - cache for 5 minutes
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
		}),
	},
};

export const screwInfiniteQueryOptions = infiniteQueryOptions({
	queryKey: inventoryQueryKeys.screwListInfinite(),
	queryFn: async ({ pageParam = null }: { pageParam: string | null }) => {
		const res = await api.inventory.screw.listInfinite.$get({
			query: {
				limit: "20", // Optimal page size for infinite scroll
				...(pageParam && { cursor: pageParam }),
			},
		});
		const resJson = await res.json();

		if (!resJson?.data) {
			throw new Error("No data returned from server");
		}

		return resJson.data as {
			data: Array<{
				id: number;
				name: string;
				quantity: string;
				componentType: string;
				material: string;
				category: string;
				price: string;
				note: string;
			}>;
			nextCursor: string | null;
			hasNextPage: boolean;
		};
	},
	initialPageParam: null,
	getNextPageParam: (lastPage) => lastPage.nextCursor,
	staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for dynamic data
	gcTime: 10 * 60 * 1000, // Keep pages in cache for 10 minutes
});

export const useScrewMaterialsQuery = () => {
	const { data } = useQuery(inventoryQueryOptions.screwMaterial.list);
	return { screwMaterials: data ?? [] };
};

export const useScrewTypesQuery = () => {
	const { data } = useQuery(inventoryQueryOptions.screwType.list);
	return { screwTypes: data ?? [] };
};

export const useScrewsQuery = () => {
	const { data, isLoading } = useQuery(inventoryQueryOptions.screw.list);
	return { screws: data ?? [], isLoading };
};

// Infinite query hook for large screw datasets
export const useScrewsInfinite = () => {
	const query = useInfiniteQuery(screwInfiniteQueryOptions);

	return {
		...query,
		// Flatten all pages for easier consumption
		screws: query.data?.pages.flatMap((page) => page.data) ?? [],
		// Load more function
		loadMore: query.fetchNextPage,
		hasNextPage: query.hasNextPage,
		isLoadingMore: query.isFetchingNextPage,
	};
};
