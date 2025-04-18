import { QUERY_KEY } from "@/shared/constants";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetScrews = () => {
  const { data: screws } = useQuery({
    queryKey: [QUERY_KEY.SCREW],
    queryFn: async () => {
      const res = await clientApiV1.screws.$get();
      const resJson = await res.json();

      if (!resJson?.data) {
        return [];
      }
      return resJson?.data;
    },
    placeholderData: keepPreviousData,
  });

  return { screws: screws ?? [] };
};
