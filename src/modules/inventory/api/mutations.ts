import { errorToast, successToast } from "@/core/components/ui/toast";
import { QUERY_KEY } from "@/core/constants";
import { ScrewDto } from "@/core/validations";
import { api } from "@/server/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateScrew = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: createScrew, isPending: isCreatingScrew } = useMutation({
		mutationKey: ["CREATE_SCREW"],
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
	});
	return { createScrew, isCreatingScrew };
};

export const useDeleteScrew = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: deleteScrew, isPending: isDeleting } = useMutation({
		mutationKey: ["DELETE_SCREW"],
		mutationFn: async (req: ScrewDto) => {
			const res = await api.inventory.screw[":id"].$delete(
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
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEY.SCREW],
			});
			successToast();
		},
		onError: (error) => errorToast(error.message),
	});
	return { deleteScrew, isDeleting };
};

export const useUpdateScrew = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: editScrew, isPending: isEditing } = useMutation({
		mutationKey: ["EDIT_SCREW"],
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
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEY.SCREW],
			});
			successToast();
		},
		onError: (error) => errorToast(error.message),
	});
	return { editScrew, isEditing };
};
