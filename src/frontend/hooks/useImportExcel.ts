import { QUERY_KEY } from "@/shared/constants";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

export const useImportExcel = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: importExcel, isPending: isProcessing } = useMutation({
    mutationKey: ["IMPORT_EXCEL"],
    mutationFn: async (file?: File) => {
      const res = await clientApiV1.files.importExcel.$post({
        form: {
          file,
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
  });
  return { importExcel, isProcessing };
};
