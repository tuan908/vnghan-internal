import { QUERY_KEY } from "@/shared/constants";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetScrewTypes = () => {
  const { data: screwTypes } = useQuery({
    queryKey: [QUERY_KEY.SCREW_TYPE],
    queryFn: async () => {
      const res = await clientApiV1.screws.types.$get();
      const resJson = await res.json();

      if (!resJson?.data) {
        return [];
      }
      return resJson?.data;
    },
    placeholderData: keepPreviousData,
  });

  return { screwTypes: screwTypes ?? [] };
};
