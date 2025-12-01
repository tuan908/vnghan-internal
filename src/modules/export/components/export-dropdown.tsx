import { Button } from "@/core/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useFileExport } from "../hooks/use-file-export";
import { ExportFileTypes } from "./export-file-types";

interface ExportDropdownProps {
	downloadUrl: string;
}

export function ExportDropdown({ downloadUrl }: ExportDropdownProps) {
	const { handleDownload } = useFileExport(downloadUrl);

	// Create curried function for the dropdown items
	const onDownload =
		(
			fileType: import("@/server/services/interfaces/import-service.interface").ImportFileExtension,
		) =>
		(e: React.MouseEvent) =>
			handleDownload(e, fileType);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Xuất dữ liệu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-32">
				<ExportFileTypes onDownload={onDownload} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
