import { QUERY_KEY } from "@/shared/constants";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast } from "../components/ui/toast";

const mutationFn = async ({ file, type }: { file?: File; type: string }) => {
	const res = await clientApiV1.import.$post({
		form: {
			file,
			type,
		},
	});
	const resJson = await res.json();
	return resJson;
};

export const useImportExcel = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: importExcel, isPending: isProcessing } = useMutation({
		mutationKey: ["IMPORT_EXCEL"],
		mutationFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEY.SCREW],
			});
		},
		onError: (error) => errorToast(error.message),
	});
	return { importExcel, isProcessing };
};
