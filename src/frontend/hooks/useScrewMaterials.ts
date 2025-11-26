import { QUERY_KEY } from "@/shared/constants";
import { honoClientV1 } from "@/shared/utils/hono-client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useScrewMaterials = () => {
	const { data: screwMaterials } = useQuery({
		queryKey: [QUERY_KEY.SCREW_MATERIAL],
		queryFn: async () => {
			const res = await honoClientV1.screws.materials.$get();
			const resJson = await res.json();

			if (!resJson?.data) {
				return [];
			}
			return resJson?.data;
		},
		placeholderData: keepPreviousData,
	});

	return { screwMaterials: screwMaterials ?? [] };
};
