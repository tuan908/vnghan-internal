// app/import/page.tsx
import ExcelImporter from '../components/excel-importer';

export default function ImportPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Excel Data Import</h1>
      <ExcelImporter />
    </main>
  );
}