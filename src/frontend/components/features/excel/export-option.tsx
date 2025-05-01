"use client";

import type { ImportFileExtension } from "@/backend/services/interfaces/import-service.interface";
import { Button } from "@/frontend/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { FileText, Sheet } from "lucide-react";
import type { MouseEvent } from "react";

interface ExportOptionDropdownProps {
	downloadUrl: string;
}

export function ExportOptionDropdown({
	downloadUrl,
}: ExportOptionDropdownProps) {
	const downloadFile = (e: MouseEvent, fileType: ImportFileExtension) => {
		e.preventDefault();
		window.location.href = `${downloadUrl}?format=${encodeURIComponent(fileType)}`;
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Xuất dữ liệu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-32">
				<DropdownMenuItem onClick={(e) => downloadFile(e, "excel")}>
					<Sheet />
					<span>Excel</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={(e) => downloadFile(e, "csv")}>
					<FileText />
					<span>CSV</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
