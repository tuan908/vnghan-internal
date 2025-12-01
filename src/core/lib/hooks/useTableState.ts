import type {
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import type React from "react";
import { useState } from "react";

interface UseTableStateOptions {
	initialSorting?: SortingState;
	initialColumnFilters?: ColumnFiltersState;
	initialColumnVisibility?: VisibilityState;
	initialRowSelection?: Record<string, boolean>;
	initialGlobalFilter?: string;
}

interface UseTableStateReturn {
	// State values
	globalFilter: string;
	sorting: SortingState;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;
	rowSelection: Record<string, boolean>;

	// State setters (compatible with OnChangeFn)
	setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
	setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
	setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
	setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
	setRowSelection: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;

	// Utility methods
	resetTableState: () => void;
}

export function useTableState(
	options: UseTableStateOptions = {},
): UseTableStateReturn {
	const {
		initialSorting = [],
		initialColumnFilters = [],
		initialColumnVisibility = {},
		initialRowSelection = {},
		initialGlobalFilter = "",
	} = options;

	// Table state values and setters
	const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
	const [sorting, setSorting] = useState<SortingState>(initialSorting);
	const [columnFilters, setColumnFilters] =
		useState<ColumnFiltersState>(initialColumnFilters);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		initialColumnVisibility,
	);
	const [rowSelection, setRowSelection] = useState(initialRowSelection);

	// Reset function to restore initial values
	const resetTableState = () => {
		setGlobalFilter(initialGlobalFilter);
		setSorting(initialSorting);
		setColumnFilters(initialColumnFilters);
		setColumnVisibility(initialColumnVisibility);
		setRowSelection(initialRowSelection);
	};

	return {
		// State values
		globalFilter,
		sorting,
		columnFilters,
		columnVisibility,
		rowSelection,

		// State setters
		setGlobalFilter,
		setSorting,
		setColumnFilters,
		setColumnVisibility,
		setRowSelection,

		// Utility methods
		resetTableState,
	};
}
