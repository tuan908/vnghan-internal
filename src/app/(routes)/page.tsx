import HomeContent from "@/frontend/components/features/home/home-content";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { AddOptionDropdown } from "../../frontend/components/features/dialog/add-option";
import { ExportOptionDropdown } from "../../frontend/components/features/excel/export-option";

export default function Home() {
  const downloadUrl = clientApiV1.export.screws.$url().toString()

  return (
    <main className="flex w-24/25 m-auto flex-col">
      <h1 className="w-full m-auto text-xl md:text-3xl font-bold py-2">
        Danh sách phụ kiện
      </h1>
      <div className="w-full m-auto flex justify-center md:justify-end gap-x-2 md:gap-x-4 py-4">
        <AddOptionDropdown />
        <ExportOptionDropdown  downloadUrl={downloadUrl}/>
      </div>

      <HomeContent />
    </main>
  );
}
