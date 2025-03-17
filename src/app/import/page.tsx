// app/import/page.tsx
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ExcelImporter from "../_components/excel-importer";

export default function ImportPage() {
  return (
    <main className="container mx-auto py-8">
      <Link href="/" className="flex gap-x-2 items-center">
        <ChevronLeft size={24} />
        <span>Về trang chủ</span>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Excel Data Import</h1>
      <ExcelImporter />
    </main>
  );
}
