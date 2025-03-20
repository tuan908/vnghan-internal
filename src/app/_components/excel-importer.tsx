// components/ExcelImporter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/components/ui/toast";
import { QUERY_KEY } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { tryCatch } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { importExcel } from "../actions/file";

export default function ExcelImporter() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      errorToast("Please select a file first");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    let msg;

    const result = await tryCatch(importExcel(formData));

    if (!result.data) {
      msg =
        result.error instanceof Object
          ? result.error.message
          : json.error.unknownError;
      errorToast(msg);
      return;
    }

    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SCREW] });
    successToast();
    setIsLoading(false);
    msg = "";
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
