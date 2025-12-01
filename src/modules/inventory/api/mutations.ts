import { errorToast, successToast } from "@/core/components/ui/toast";
import { QUERY_KEY } from "@/core/constants";
import { ScrewDto } from "@/core/validations";
import { api } from "@/server/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryQueryKeys } from "./queries";

export const useCreateScrew = () => {
	const queryClient = useQueryClient();
	const { mutate: createScrew, isPending: isCreatingScrew } = useMutation({
		mutationFn: async (req: ScrewDto) => {
			const res = await api.inventory.screw.$post({
				json: req,
			});
			const resJson = await res.json();
			return resJson?.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEY.SCREW],
			});
			successToast();
		},
		onError: (error) => errorToast(error.message),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: inventoryQueryKeys.screwListInfinite(),
			});
		},
	});
	return { createScrew, isCreatingScrew };
};

export const useDeleteScrew = () => {
	const queryClient = useQueryClient();
	const { mutate: deleteScrew, isPending: isDeleting } = useMutation({
		mutationFn: async (id: number) => {
			const res = await api.inventory.screw[":id"].$delete({
				param: {
					id: id.toString(),
				},
			});
			const resJson = await res.json();
			return resJson?.data;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEY.SCREW],
			});
			successToast();
		},
		onError: (error) => errorToast(error.message),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: inventoryQueryKeys.screwListInfinite(),
			});
		},
	});
	return { deleteScrew, isDeleting };
};

export const useUpdateScrew = () => {
	const queryClient = useQueryClient();
	const { mutate: updateScrew, isPending: isEditing } = useMutation({
		mutationFn: async (req: ScrewDto) => {
			const res = await api.inventory.screw[":id"].$patch(
				{
					param: {
						id: req.id!?.toString(),
					},
				},
				{
					init: {
						body: JSON.stringify(req),
					},
				},
			);
			const resJson = await res.json();
			return resJson?.data;
		},
		onSuccess: async () => {
			successToast();
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: inventoryQueryKeys.screwListInfinite(),
			});
		},
		onError: (error) => errorToast(error.message),
	});
	return { updateScrew, isEditing };
};
