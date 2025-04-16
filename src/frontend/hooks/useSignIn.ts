import type { SignInFormValues } from "@/app/auth/signin/page";
import { clientApiV1 } from "@/shared/utils/hono-client";
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
