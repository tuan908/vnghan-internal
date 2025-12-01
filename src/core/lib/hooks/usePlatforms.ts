import { api } from "@/server/client";
import { useQuery } from "@tanstack/react-query";

const getPlatforms = async () => {
	const response = await api.customer.platform.list.$get();
	const resJson = await response.json();
	return resJson?.data ?? [];
};

export const usePlatforms = () => {
	const { data: platforms, isLoading: isFetchingPlatforms } = useQuery({
		queryKey: ["PLATFORMS"],
		queryFn: getPlatforms,
	});
	return { platforms, isFetchingPlatforms };
};
