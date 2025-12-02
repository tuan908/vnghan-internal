import { DataTable } from "@/core/components/ui/data-table";
import type { ScrewDto } from "@/core/validations";
import type {
	ColumnDef,
	ColumnFiltersState,
	OnChangeFn,
	RowSelectionState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

/**
 * Pure DataTable Wrapper with Proper Memoization
 */
export const PureDataTable = React.memo(function PureDataTable({
	data,
	columns,
	sorting,
	columnFilters,
	globalFilter,
	columnVisibility,
	rowSelection,
	setSorting,
	setColumnFilters,
	setGlobalFilter,
	setColumnVisibility,
	setRowSelection,
	loading,
	onDoubleClickRow,
}: {
	data: ScrewDto[];
	columns: ColumnDef<ScrewDto>[];
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	globalFilter: string;
	columnVisibility: VisibilityState;
	rowSelection: RowSelectionState;
	setSorting: OnChangeFn<SortingState>;
	setColumnFilters: OnChangeFn<ColumnFiltersState>;
	setGlobalFilter: OnChangeFn<string>;
	setColumnVisibility: OnChangeFn<VisibilityState>;
	setRowSelection: OnChangeFn<RowSelectionState>;
	loading: boolean;
	onDoubleClickRow?: () => void;
}) {
	return (
		<DataTable<ScrewDto>
			columns={columns}
			data={data}
			sorting={sorting}
			setSorting={setSorting}
			columnFilters={columnFilters}
			setColumnFilters={setColumnFilters}
			columnVisibility={columnVisibility}
			setColumnVisibility={setColumnVisibility}
			rowSelection={rowSelection}
			setRowSelection={setRowSelection}
			globalFilter={globalFilter}
			setGlobalFilter={setGlobalFilter}
			loading={loading}
			onDoubleClickRow={onDoubleClickRow}
		/>
	);
});

PureDataTable.displayName = "PureDataTable";
