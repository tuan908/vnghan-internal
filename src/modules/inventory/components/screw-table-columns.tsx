import { fuzzySort } from "@/core/components/ui/data-table";
import json from "@/core/i18n/locales/vi/vi.json";
import { cn } from "@/core/utils";
import { formatCurrency } from "@/core/utils/currency";
import { ScrewDto } from "@/core/validations";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface ScrewTableColumnsProps {
	// Dependencies needed for the columns
	onUpdate: (item: ScrewDto) => void;
	onDelete: (item: ScrewDto) => void;
}

export function useScrewTableColumns({
	onUpdate,
	onDelete,
}: ScrewTableColumnsProps): ColumnDef<ScrewDto>[] {
	return [
		{
			accessorKey: "id",
			header: "ID",
			cell: ({ row }) => <>{row.original.id}</>,
			enableColumnFilter: false,
			size: 75,
		},
		{
			accessorKey: "componentType",
			header: json.table.componentType,
			cell: ({ row }) => <> {row.original.componentType}</>,
			filterFn: "includesString",
			size: 150,
		},
		{
			accessorKey: "price",
			header: json.table.price,
			cell: ({ row }) => (
				<div className={cn("text-right flex gap-x-2 justify-end")}>
					<span>{formatCurrency(row.original.price)}</span>
					<span className="text-gray-500 pointer-events-none">VND</span>
				</div>
			),
			filterFn: "includesString",
			size: 150,
		},
		{
			accessorKey: "quantity",
			header: json.table.quantity,
			cell: ({ row }) => <>{row.original.quantity}</>,
			filterFn: "includesString",
			size: 150,
		},
		{
			accessorKey: "name",
			header: json.table.name,
			cell: ({ row }) => <>{row.original.name}</>,
			sortUndefined: "last",
			sortDescFirst: false,
			filterFn: "fuzzy",
			sortingFn: fuzzySort,
			size: 150,
		},
		{
			accessorKey: "note",
			header: json.table.note,
			cell: ({ row }) => <>{row.original.note}</>,
			filterFn: "includesString",
			size: 200,
		},
		{
			id: "actions",
			header: json.table.action,
			cell: ({ row }) => (
				<div className={cn("flex gap-x-6 justify-center items-center")}>
					<button onClick={() => onUpdate(row.original)}>
						<Pencil className="h-5 w-5 text-blue-400 hover:text-blue-300" />
					</button>
					<button onClick={() => onDelete(row.original)}>
						<Trash2 className="h-5 w-5 text-red-400 hover:text-red-300" />
					</button>
				</div>
			),
			size: 100,
		},
	];
}
