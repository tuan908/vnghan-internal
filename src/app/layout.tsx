import { Toaster } from "@/core/components/ui/sonner";
import { ReactQueryProvider } from "@/core/providers";
import { AdminConfigProvider } from "@/modules/admin/lib/providers/AdminConfigProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "VngHan's Tool",
	description: "Made with love for vnghan by tuanna",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
				<ReactQueryProvider>
					<AdminConfigProvider>{children}</AdminConfigProvider>
				</ReactQueryProvider>
				<Toaster position="top-right" />
			</body>
		</html>
	);
}
