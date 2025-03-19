import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Providers } from "./_components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "VngHan's Tool",
  description: "Made with love for vnghan by tuanna",
};

export const runtime = 'edge';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
