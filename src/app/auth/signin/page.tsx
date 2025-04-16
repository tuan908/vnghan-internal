"use client";

import { Button } from "@/frontend/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/frontend/components/ui/form";
import { Input } from "@/frontend/components/ui/input";
import { useSignIn } from "@/frontend/hooks/useSignIn";
import json from "@/shared/i18n/locales/vi/vi.json";
import { format } from "@/shared/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const SignInSchema = z.object({
  username: z
    .string({
      message: format(json.error.fieldRequired, json.form.login.username),
    })
    .min(1, {
      message: format(json.error.fieldRequired, json.form.login.username),
    }),
  password: z
    .string({
      message: format(json.error.fieldRequired, json.form.login.password),
    })
    .min(6, {
      message: format(json.error.fieldRequired, json.form.login.password),
    }),
});

export type SignInFormValues = z.infer<typeof SignInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { signIn, isPendingSignIn } = useSignIn();

  const onSubmit = async (data: SignInFormValues) => {
    const result = await signIn(data);
    if (!result?.success) {
      form.setError("root", { message: result?.error?.message });
      return;
    }
    await setCookie("access_token", result?.data);
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Đăng nhập</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <FormField
              name="username"
              control={form.control}
              disabled={isPendingSignIn}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên đăng nhập" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              disabled={isPendingSignIn}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mật khẩu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPendingSignIn}>
              {isPendingSignIn ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Đang đăng nhập</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </Button>
          </form>
          {form.formState.errors.root && (
            <div className="py-2 text-center">
              <span className="text-sm text-red-500 ">
                {form.formState.errors.root.message}
              </span>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
