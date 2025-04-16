import { clientApiV1 } from "@/shared/utils/hono-client";
import type { CustomerDto } from "@/shared/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

const mutationFn = async (req: CustomerDto) => {
  const res = await clientApiV1.customers.$post({
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
        await queryClient.invalidateQueries({
          queryKey: ["CUSTOMERS"],
        });
        successToast();
      },
      onError: (error) => errorToast(error.message),
    });
  return { createCustomer, isCreatingCustomer };
};
