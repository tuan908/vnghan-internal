import type { ImportFileExtension } from "@/server/services/interfaces/import-service.interface";
import type { MouseEvent } from "react";

interface UseFileExportReturn {
	handleDownload: (e: MouseEvent, fileType: ImportFileExtension) => void;
}

export function useFileExport(downloadUrl: string): UseFileExportReturn {
	const handleDownload = (e: MouseEvent, fileType: ImportFileExtension) => {
		e.preventDefault();
		window.location.href = `${downloadUrl}?format=${encodeURIComponent(fileType)}`;
	};

	return {
		handleDownload,
	};
}
