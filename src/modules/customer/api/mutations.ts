import { errorToast, successToast } from "@/core/components/ui/toast";
import type { CustomerDto } from "@/core/validations";
import { api } from "@/server/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerQueryKeys } from "./queries";

export const useCreateCustomerMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (req: CustomerDto) => {
			const res = await api.customers.$post({
				json: req,
			});
			const resJson = await res.json();
			return resJson;
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: customerQueryKeys.list() });
		},
		onSuccess: () => {
			successToast();
		},
		onError: (error: any) => errorToast(error.message),
	});
};

export const useUpdateCustomerMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (req: CustomerDto) => {
			const res = await api.customers[":id"].$put(
				{
					param: { id: String(req.id!) },
				},
				{
					init: {
						body: JSON.stringify(req),
					},
				},
			);
			const resJson = await res.json();
			return resJson;
		},
		onSuccess: () => {
			successToast();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: customerQueryKeys.list() });
		},
		onError: (error: any) => errorToast(error.message),
	});
};

export const useDeleteCustomerMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const res = await api.customers[":id"].$delete({
				param: {
					id: id.toString(),
				},
			});
			const resJson = await res.json();
			return resJson?.data;
		},
		onSuccess: () => {
			successToast("Customer deleted successfully");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: customerQueryKeys.list() });
		},
		onError: (error: any) => errorToast(error.message),
	});
};
