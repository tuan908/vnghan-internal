// components/ExcelImporter.tsx
"use client";

import { client } from "@/lib/client";
import { ApiResponse } from "@/types";
import { useState } from "react";

interface ExcelRow {
  id: string;
  [key: string]: any;
}

interface ImportResult {
  headers: string[];
  rows: ExcelRow[];
  totalRows: number;
}

export default function ExcelImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(client.file.importExcel.$url(), {
        method: "POST",
        body: formData,
      });

      const data = await response.json<ApiResponse>();

      if (!data.success) {
        throw new Error(data.error instanceof Object ? data.error.message : "");
      }

      setResult(data.data as ImportResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Excel Importer</h2>

      <div className="mb-4">
        <label className="block mb-2">
          Select Excel File (.xlsx, .xls)
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm mt-1 p-2 border border-gray-300 rounded"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? "Importing..." : "Import Excel"}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {result && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Import Results</h3>
          <p className="mb-4">Successfully imported {result.totalRows} rows</p>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  {result.headers.map((header) => (
                    <th key={header} className="py-2 px-3 border-b text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 10).map((row) => (
                  <tr key={row.id}>
                    {result.headers.map((header) => (
                      <td
                        key={`${row.id}-${header}`}
                        className="py-2 px-3 border-b"
                      >
                        {row[header]?.toString() || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.rows.length > 10 && (
            <p className="mt-2 text-gray-500">
              Showing 10 of {result.rows.length} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
}
