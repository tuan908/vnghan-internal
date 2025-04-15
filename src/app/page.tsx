import { buttonVariants } from "@/frontend/components/ui/button";
import { cn } from "@/shared/utils";
import { Sheet } from "lucide-react";
import Link from "next/link";
import { AddOptionDropdown } from "../frontend/components/features/dialog/add-option";
import { ExportOptionDropdown } from "../frontend/components/features/export-option";
import HomeContent from "../frontend/components/features/home-content";

export default function Home() {
  return (
    <main className="flex max-h-screen max-w-[1536px] m-auto flex-col md:py-12">
      <h1 className="w-[90%] m-auto text-xl md:text-3xl font-bold">
        Danh sách phụ kiện
      </h1>
      <div className="w-[90%] m-auto flex justify-center md:justify-end gap-x-2 md:gap-x-4 py-4">
        <Link
          href="/import"
          className={cn("flex gap-x-2", buttonVariants({ variant: "outline" }))}
        >
          <span>Import Excel</span>
          <Sheet />
        </Link>
        <AddOptionDropdown />
        <ExportOptionDropdown />
      </div>

      <HomeContent />
    </main>
  );
}
