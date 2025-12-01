"use client";

import { procesingLogin } from "@/app/actions";
import { Button } from "@/core/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { SignInFormValues, SignInSchema } from "@/core/validations";
import {
    LoginErrorResponse,
    LoginSuccessResponse,
    useSignIn,
} from "@/modules/auth/hooks/useSignIn";
import { isSuccessResponse } from "@/server/lib/api-response"; // Ensure this is at the top
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function SignInPage() {
	const router = useRouter();
	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const { signIn, isPendingSignIn } = useSignIn();

	const onSubmit = async (data: SignInFormValues) => {
		const result: LoginSuccessResponse | LoginErrorResponse =
			await signIn(data);

		if (isSuccessResponse<any>(result)) {
			if (!result.data.token) {
				form.setError("root", { message: "Login failed: No token received." });
				return;
			}
			await procesingLogin(result.data.token);
		} else {
			form.setError("root", {
				message:
					result.error?.message || "Login failed: An unknown error occurred.",
			});
			return;
		}
	};
	console.log(form.formState.errors);

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
