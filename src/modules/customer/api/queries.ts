import { api } from "@/server/client";
import {
	infiniteQueryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";

export const customerQueryKeys = {
	all: ["customer"] as const,
	list: () => [...customerQueryKeys.all, "list"] as const,
	infinite: () => [...customerQueryKeys.all, "infinite"] as const,
} as const;

// Regular query for simple cases (backwards compatibility)
export const useCustomersQuery = () => {
	const result = useQuery({
		queryKey: customerQueryKeys.list(),
		queryFn: async () => {
			const response = await api.customers.$get();
			const resJson = await response.json();
			return resJson;
		},
	});

	return { customers: result.data?.data ?? [], isLoading: result.isLoading };
};

// Infinite query for large datasets with lazy loading
export const customerInfiniteQueryOptions = infiniteQueryOptions({
	queryKey: customerQueryKeys.infinite(),
	queryFn: async ({ pageParam = null }: { pageParam: string | null }) => {
		const response = await api.customers.listInfinite.$get({
			query: {
				limit: "15", // Optimal page size for customer infinite scroll
				...(pageParam && { cursor: pageParam }),
			},
		});
		const resJson = await response.json();

		if (!resJson?.data) {
			throw new Error("No data returned from server");
		}

		return resJson.data as {
			data: Array<{
				id: number;
				name: string;
				phone: string;
				address: string;
				money: string;
				need: string;
				platform: string;
				nextMessageTime: string;
				note: string;
			}>;
			nextCursor: string | null;
			hasNextPage: boolean;
		};
	},
	initialPageParam: null,
	getNextPageParam: (lastPage) => lastPage.nextCursor,
	staleTime: 3 * 60 * 1000, // 3 minutes - customers change more frequently
	gcTime: 15 * 60 * 1000, // Keep pages in cache for 15 minutes
});

export const useCustomersInfinite = () => {
	return useInfiniteQuery(customerInfiniteQueryOptions);
};
