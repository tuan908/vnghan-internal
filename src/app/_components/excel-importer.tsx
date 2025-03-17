// components/ExcelImporter.tsx
"use client";

import { Button } from "@/components/ui/button";
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
      <div className="mb-4">
        <label className="block mb-2">
          Chọn file Excel (.xlsx, .xls)
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm mt-1 p-2 border border-gray-300 rounded"
          />
        </label>

        <Button
          onClick={handleUpload}
          disabled={!file || isLoading}
        >
          {isLoading ? "Đang thực hiện..." : "Import"}
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}


    </div>
  );
}
