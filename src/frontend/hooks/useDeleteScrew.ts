import { QUERY_KEY } from "@/shared/constants";
import { clientApiV1 } from "@/shared/utils/hono-client";
import type { ScrewDto } from "@/shared/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

export const useDeleteScrew = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: deleteScrew, isPending: isDeleting } = useMutation({
		mutationKey: ["DELETE_SCREW"],
		mutationFn: async (req: ScrewDto) => {
			const res = await clientApiV1.screws[":id"].$delete(
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
