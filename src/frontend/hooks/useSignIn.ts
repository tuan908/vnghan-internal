import type { ApiError, ApiResponse } from "@/backend/lib/api-response";
import { honoClientV1 } from "@/shared/utils/hono-client";
import type { SignInFormValues } from "@/shared/validations";
import { useMutation } from "@tanstack/react-query";

export type LoginSuccessResponse = ApiResponse<{ token: string }>;
export type LoginErrorResponse = ApiResponse<ApiError>;

const mutationFn = async (
	req: SignInFormValues,
): Promise<LoginSuccessResponse | LoginErrorResponse> => {
	const response = await honoClientV1.auth.login.$post({
		json: req,
	});
	const resJson = await response.json();
	return resJson as LoginSuccessResponse | LoginErrorResponse;
};

export const useSignIn = () => {
	const {
		mutateAsync: signIn,
		data,
		isPending: isPendingSignIn,
	} = useMutation<
		LoginSuccessResponse | LoginErrorResponse,
		Error,
		SignInFormValues
	>({
		mutationKey: ["auth"],
		mutationFn,
	});
	return { signIn, isPendingSignIn, data };
};
