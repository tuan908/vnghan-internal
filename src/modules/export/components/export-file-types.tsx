import { DropdownMenuItem } from "@/core/components/ui/dropdown-menu";
import type { ImportFileExtension } from "@/server/services/interfaces/import-service.interface";
import { FileText, Sheet } from "lucide-react";

interface ExportFileTypesProps {
	onDownload: (fileType: ImportFileExtension) => (e: React.MouseEvent) => void;
}

export function ExportFileTypes({ onDownload }: ExportFileTypesProps) {
	return (
		<>
			<DropdownMenuItem onClick={onDownload("excel")}>
				<Sheet />
				<span>Excel</span>
			</DropdownMenuItem>
			<DropdownMenuItem onClick={onDownload("csv")}>
				<FileText />
				<span>CSV</span>
			</DropdownMenuItem>
		</>
	);
}
