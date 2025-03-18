// components/ExcelImporter.tsx
"use client";

import { Button } from "@/components/ui/button";
import json from "@/i18n/locales/vi.json";
import { client } from "@/lib/client";
import { ApiResponse } from "@/types";
import { Check, CircleX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExcelRow {
  id: string;
  [key: string]: any;
}

export default function ExcelImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

    const formData = new FormData();
    formData.append("file", file);
    let msg;
    try {
      const response = await fetch(client.file.importExcel.$url(), {
        method: "POST",
        body: formData,
      });

      const data = await response.json<ApiResponse>();

      if (!data.success) {
        msg =
          data.error instanceof Object
            ? data.error.message
            : json.error.unknownError;
        toast(msg, {
          action: <CircleX className="text-red-500" />,
        });
        return;
      }

      toast("Dữ liệu đã nhập thành công", {
        action: <Check className="text-green-500" />,
      });
    } catch (err) {
      msg = err instanceof Error ? err.message : json.error.unknownError;
      toast(msg, {
        action: <CircleX className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
      msg = "";
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

        <Button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? "Đang thực hiện..." : "Import"}
        </Button>
      </div>
    </div>
  );
}
