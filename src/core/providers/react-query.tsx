"use client";
import { getQueryClient } from "@/core/utils/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
