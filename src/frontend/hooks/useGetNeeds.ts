import { clientApiV1 } from "@/shared/utils/hono-client";
import { useQuery } from "@tanstack/react-query";

const getNeeds = async () => {
  const response = await clientApiV1.customerCommon.needs.$get();
  const resJson = await response.json();
  return resJson?.data ?? [];
};

export const useGetNeeds = () => {
  const { data: needs, isLoading: isFetchingNeeds } = useQuery({
    queryKey: ["NEEDS"],
    queryFn: getNeeds,
  });
  return { needs, isFetchingNeeds };
};
