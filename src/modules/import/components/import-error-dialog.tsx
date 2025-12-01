import { CardContent } from "@/core/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/core/components/ui/table";
import json from "@/core/i18n/locales/vi/vi.json";
import type { ValidationErrorDetail } from "@/server/services/interfaces/import-service.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface ImportErrorDialogProps {
	isOpen: boolean;
	importErrors: ValidationErrorDetail[];
	onOpenChange: (open: boolean) => void;
}

export function ImportErrorDialog({
	isOpen,
	importErrors,
	onOpenChange,
}: ImportErrorDialogProps) {
	const columns = useMemo(
		(): ColumnDef<{
			row: number;
			column: string;
			message: string;
			value?: any;
		}>[] => [
			{
				accessorKey: "row",
				header: json.common.row,
				cell: ({ row }) => row.original.row,
			},
			{
				accessorKey: "column",
				header: json.common.column,
				cell: ({ row }) => row.original.column,
			},
			{
				accessorKey: "message",
				header: json.common.message,
				cell: ({ row }) => row.original.message,
			},
			{
				accessorKey: "value",
				header: json.common.value,
				cell: ({ row }) => row.original.value,
			},
		],
		[],
	);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Lỗi</DialogTitle>
				</DialogHeader>

				<CardContent>
					<Table className="w-full text-red-500 border border-collapse">
						<TableHeader>
							<TableRow>
								{[
									json.common.row,
									json.common.column,
									json.common.message,
									json.common.value,
								].map((x, id) => (
									<TableHead key={id} className="border">
										{x}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>

						<TableBody>
							{importErrors.map((row, id) => (
								<TableRow key={id}>
									<TableCell className="border">{row.row}</TableCell>
									<TableCell className="border">{row.column}</TableCell>
									<TableCell className="border">{row.message}</TableCell>
									<TableCell className="border">{row.value}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</DialogContent>
		</Dialog>
	);
}
