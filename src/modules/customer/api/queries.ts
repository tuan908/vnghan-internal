import { api } from "@/server/client";
import { useQuery } from "@tanstack/react-query";

export const customerQueryKeys = {
	all: ["customer"] as const,
	list: () => [...customerQueryKeys.all, "list"] as const,
} as const;

export const useCustomersQuery = () => {
	const result = useQuery({
		queryKey: customerQueryKeys.list(),
		queryFn: async () => {
			const response = await api.customer.list.$get();
			const resJson = await response.json();
			return resJson;
		},
	});

	return { customers: result.data?.data ?? [], isLoading: result.isLoading };
};
