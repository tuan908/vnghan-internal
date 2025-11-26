import { honoClientV1 } from "@/shared/utils/hono-client";
import { useQuery } from "@tanstack/react-query";

const getPlatforms = async () => {
	const response = await honoClientV1.platforms.$get();
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
