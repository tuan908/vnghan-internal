import { QUERY_KEY } from "@/shared/constants";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

const mutationFn = async ({file}: {file?: File}) => {
  const res = await clientApiV1.import.$post({
    form: {
      file,
    },
  });
  const resJson = await res.json();
  return resJson?.data;
};

export const useImportExcel = () => {
  const queryClient = useQueryClient();
  const {mutateAsync: importExcel, isPending: isProcessing} = useMutation({
    mutationKey: ["IMPORT_EXCEL"],
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.SCREW],
      });
      successToast();
    },
    onError: error => errorToast(error.message),
  });
  return {importExcel, isProcessing};
};
