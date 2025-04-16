import { clientApiV1 } from "@/shared/utils/hono-client";
import { useQuery } from "@tanstack/react-query";

const getPlatforms = async () => {
  const response = await clientApiV1.customerCommon.platforms.$get();
  const resJson = await response.json();
  return resJson?.data ?? [];
};

export const useGetPlatforms = () => {
  const { data: platforms, isLoading: isFetchingPlatforms } = useQuery({
    queryKey: ["PLATFORMS"],
    queryFn: getPlatforms,
  });
  return { platforms, isFetchingPlatforms };
};
