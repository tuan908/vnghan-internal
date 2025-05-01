import { clientApiV1 } from "@/shared/utils/hono-client";
import type { SignInFormValues } from "@/shared/validations";
import { useMutation } from "@tanstack/react-query";

const mutationFn = async (req: SignInFormValues) => {
	const response = await clientApiV1.auth.login.$post({
		json: req,
	});
	const resJson = await response.json();
	return resJson;
};

export const useSignIn = () => {
	const {
		mutateAsync: signIn,
		data,
		isPending: isPendingSignIn,
	} = useMutation({
		mutationKey: ["auth"],
		mutationFn,
	});
	return { signIn, isPendingSignIn };
};
