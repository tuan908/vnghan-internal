import { api } from "@/server/client";
import { queryOptions, useQuery } from "@tanstack/react-query";

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
		}),
	},
};

export const useScrewMaterialsQuery = () => {
	const { data } = useQuery(inventoryQueryOptions.screwMaterial.list);
	return { screwMaterials: data ?? [] };
};

export const useScrewTypesQuery = () => {
	const { data } = useQuery(inventoryQueryOptions.screwType.list);
	return { screwTypes: data ?? [] };
};

export const useScrewsQuery = () => {
	const { data } = useQuery(inventoryQueryOptions.screw.list);
	return { screws: data ?? [] };
};
