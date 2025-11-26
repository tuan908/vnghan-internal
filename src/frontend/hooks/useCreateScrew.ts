import { QUERY_KEY } from "@/shared/constants";
import { honoClientV1 } from "@/shared/utils/hono-client";
import { ScrewDto } from "@/shared/validations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "../components/ui/toast";

export const useCreateScrew = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: createScrew, isPending: isCreatingScrew } = useMutation({
		mutationKey: ["CREATE_SCREW"],
		mutationFn: async (req: ScrewDto) => {
			const res = await honoClientV1.screws.$post({
				json: req,
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
	return { createScrew, isCreatingScrew };
};
