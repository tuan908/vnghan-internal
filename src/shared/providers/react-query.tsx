"use client";
import { getQueryClient } from "@/shared/utils/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
