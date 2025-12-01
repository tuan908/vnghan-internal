import { errorToast } from "@/core/components/ui/toast";
import { api } from "@/server/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryQueryKeys } from "../../inventory/api/queries";

const mutationFn = async ({ file, type }: { file?: File; type: string }) => {
	const res = await api.import.$post({
		form: {
			file,
			type,
		},
	});
	const resJson = await res.json();
	return resJson;
};

export const useImportMutation = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: importExcel, isPending: isProcessing } = useMutation({
		mutationFn,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: inventoryQueryKeys.screwList(),
			});
		},
		onError: (error) => errorToast(error.message),
	});
	return { importExcel, isProcessing };
};
