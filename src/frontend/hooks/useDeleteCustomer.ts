import { honoClientV1 } from "@/shared/utils/hono-client";
import type { CustomerDto } from "@/shared/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

export const useDeleteCustomer = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: deleteCustomer, isPending: isDeletingCustomer } =
		useMutation({
			mutationKey: ["DELETE_CUSTOMER"],
			mutationFn: async (req: CustomerDto) => {
				const res = await honoClientV1.customers[":id"].$delete(
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
					queryKey: ["CUSTOMERS"],
				});
				successToast();
			},
			onError: (error) => errorToast(error.message),
		});
	return { deleteCustomer, isDeletingCustomer };
};
