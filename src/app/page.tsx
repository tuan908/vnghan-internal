import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet } from "lucide-react";
import Link from "next/link";
import { AddOptionDropdown } from "./_components/dialog/add-option";
import { ExportOptionDropdown } from "./_components/export-option";
import { getScrewMaterials, getScrewTypes } from "./actions/screw";
import HomeContent from "./home-content";

export default async function Home() {
  const [_screwTypes, _screwMaterials] = await Promise.all([
    getScrewTypes(),
    getScrewMaterials(),
  ]);

  const data = {
    screwTypes: Array.isArray(_screwTypes?.data) ? _screwTypes.data : [],
    screwMaterials: Array.isArray(_screwMaterials?.data)
      ? _screwMaterials.data
      : [],
  };

  return (
    <main className="flex max-h-screen max-w-[1536px] m-auto flex-col md:py-12">
      <h1 className="w-[90%] m-auto text-xl md:text-3xl font-bold">Danh sách phụ kiện</h1>
      <div className="w-[90%] m-auto flex justify-center md:justify-end gap-x-2 md:gap-x-4 py-4">
        <Link
          href="/import"
          className={cn("flex gap-x-2", buttonVariants({ variant: "outline" }))}
        >
          <span>Import Excel</span>
          <Sheet />
        </Link>
        <AddOptionDropdown {...data} />
        <ExportOptionDropdown />
      </div>

      <HomeContent {...data} />
    </main>
  );
}
