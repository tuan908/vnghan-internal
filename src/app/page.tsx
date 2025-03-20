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
    <main className="flex max-h-screen max-w-7xl m-auto flex-col py-12">
      <h1 className="text-3xl font-bold">Danh sách phụ kiện</h1>
      <div className="w-full flex justify-end gap-x-4 py-4">
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
