import { clientApiV1 } from "@/shared/utils/hono-client";
import type { CustomerDto } from "@/shared/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

export const useEditCustomer = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: editCustomer, isPending: isEditingCustomer } =
    useMutation({
      mutationKey: ["EDIT_SCREW"],
      mutationFn: async (req: CustomerDto) => {
        const res = await clientApiV1.customers[":id"].$put(
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
  return { editCustomer, isEditingCustomer };
};
