import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Providers } from "./_components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promo",
  description: "Made with love by tuanna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
