import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Sheet } from "lucide-react";
import Link from "next/link";
import { AddOptionDropdown } from "./_components/dialog/add-option";
import { ExportOptionDropdown } from "./_components/export-option";
import { getScrewMaterials, getScrewTypes } from "./actions/screw";
import HomeContent from "./home-content";

export default async function Home() {
  const [screwTypes, screwMaterials] = await Promise.all([
    getScrewTypes(),
    getScrewMaterials(),
  ]);

  return (
    <main className="flex min-h-screen max-w-7xl m-auto flex-col py-12">
      <Label className="text-3xl font-bold">Danh sách phụ kiện</Label>
      <div className="w-full flex justify-end gap-x-4 py-4">
        <Link
          href="/import"
          className={cn("flex gap-x-2", buttonVariants({ variant: "outline" }))}
        >
          <span>Import Excel</span>
          <Sheet />
        </Link>
        <AddOptionDropdown
          screwTypes={screwTypes?.data ?? []}
          screwMaterials={screwMaterials?.data ?? []}
        />
        <ExportOptionDropdown />
      </div>
      <HomeContent
        screwTypes={screwTypes?.data ?? []}
        screwMaterials={screwMaterials?.data ?? []}
      />
    </main>
  );
}
