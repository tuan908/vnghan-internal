import { honoClientV1 } from "@/shared/utils/hono-client";
import type { CustomerDto } from "@/shared/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

const mutationFn = async (req: CustomerDto) => {
	const res = await honoClientV1.customers.$post({
		json: req,
	});
	const resJson = await res.json();
	return resJson;
};

export const useCreateCustomer = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: createCustomer, isPending: isCreatingCustomer } =
		useMutation({
			mutationKey: ["CREATE_CUSTOMER"],
			mutationFn,
			onSuccess: async () => {
				successToast();
			},
			onError: (error) => errorToast(error.message),
			async onMutate() {
				await queryClient.cancelQueries({
					queryKey: ["CUSTOMERS"],
				});
			},
			async onSettled() {
				await queryClient.invalidateQueries({
					queryKey: ["CUSTOMERS"],
				});
			},
		});
	return { createCustomer, isCreatingCustomer };
};
