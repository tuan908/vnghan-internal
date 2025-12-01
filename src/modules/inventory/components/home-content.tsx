"use client";

import { DataTable } from "@/core/components/ui/data-table";
import DebouncedInput from "@/core/components/ui/debounced-input";
import { LoadingSkeleton } from "@/core/components/ui/table-skeleton";
import { useTableState } from "@/core/lib/hooks/useTableState";
import { ScrewDto, ScrewSchema } from "@/core/validations";
import {
	useDeleteScrew,
	useUpdateScrew,
} from "@/modules/inventory/api/mutations";
import {
	useScrewMaterialsQuery,
	useScrewsInfinite,
	useScrewTypesQuery,
} from "@/modules/inventory/api/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ColumnDef,
	ColumnFiltersState,
	OnChangeFn,
	RowSelectionState,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { FormUIProvider, useFormUI } from "./form-ui-context";
import { ScrewDialogs } from "./screw-dialogs";
import { useScrewTableColumns } from "./screw-table-columns";

/**
 * FAANG-grade: Pure DataTable Wrapper with Proper Memoization
 * Memoizes the table instance creation to prevent cascade re-renders
 * Eliminates new table instance creation on every component re-render
 */
const PureDataTable = React.memo(function PureDataTable({
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

/**
 * FAANG-standard: Form UI State Isolation
 * Context-based approach prevents form state from affecting table rendering
 */
const HomeContentContent = React.memo(function HomeContentContent() {
	const formUI = useFormUI();
	const loadMoreRef = useRef<HTMLDivElement>(null);

	// Destructure stable values to avoid dependency issues
	const { activeDialog, setHasUnsavedChanges } = formUI;

	// Data fetching hooks
	const {
		screws: rows,
		isLoading: isInitialLoading,
		hasNextPage,
		loadMore,
		isLoadingMore,
	} = useScrewsInfinite();
	const { screwTypes } = useScrewTypesQuery();
	const { screwMaterials } = useScrewMaterialsQuery();

	// Table state using custom hook - completely isolated from form state
	const tableState = useTableState();

	// Memoize table state values to prevent unnecessary DataTable re-renders
	const memoizedTableState = React.useMemo(
		() => ({
			globalFilter: tableState.globalFilter,
			sorting: tableState.sorting,
			columnFilters: tableState.columnFilters,
			columnVisibility: tableState.columnVisibility,
			rowSelection: tableState.rowSelection,
			setGlobalFilter: tableState.setGlobalFilter,
			setSorting: tableState.setSorting,
			setColumnFilters: tableState.setColumnFilters,
			setColumnVisibility: tableState.setColumnVisibility,
			setRowSelection: tableState.setRowSelection,
		}),
		[
			tableState.globalFilter,
			tableState.sorting,
			tableState.columnFilters,
			tableState.columnVisibility,
			tableState.rowSelection,
			tableState.setGlobalFilter,
			tableState.setSorting,
			tableState.setColumnFilters,
			tableState.setColumnVisibility,
			tableState.setRowSelection,
		],
	);

	const {
		globalFilter,
		sorting,
		columnFilters,
		columnVisibility,
		rowSelection,
		setGlobalFilter,
		setSorting,
		setColumnFilters,
		setColumnVisibility,
		setRowSelection,
	} = memoizedTableState;

	// Form setup with optimized defaults
	const editScrewForm = useForm<ScrewDto>({
		resolver: zodResolver(ScrewSchema),
		defaultValues: {
			id: -1,
			category: "",
			name: "",
			note: "",
			price: "",
			quantity: "",
			size: "",
			componentType: "",
			material: "",
		},
		mode: "onBlur", // Changed from "onChange" to "onBlur" for better performance
	});

	const { reset, formState } = editScrewForm;
	const { isDirty } = formState;

	// API mutation hooks
	const { deleteScrew, isDeleting } = useDeleteScrew();
	const { updateScrew, isEditing } = useUpdateScrew();

	// Table event handlers - using context actions instead of local state
	const handleEditClick = React.useCallback(
		(item: ScrewDto) => {
			// Use context action - isolated from table rendering
			formUI.setCurrentItemId(item.id || -1);
			formUI.setActiveDialog("edit");
			formUI.setHasUnsavedChanges(false);

			// Defer form reset to next tick to prevent layout thrashing
			const formData: Partial<ScrewDto> = {
				id: item.id || -1,
				name: item.name || "",
				quantity: item.quantity || "",
				price: item.price || "",
				componentType: item.componentType || "",
				material: item.material || "",
				note: item.note || "",
				category: item.category || "",
				size: item.size || "",
			};

			// Single RAF is sufficient for form reset after dialog opens
			requestAnimationFrame(() => reset(formData));
		},
		[formUI, reset],
	);

	const handleDeleteClick = React.useCallback(
		(item: ScrewDto) => {
			formUI.setCurrentItemId(item.id || -1);
			formUI.setActiveDialog("delete");
		},
		[formUI],
	);

	const handleDoubleClickRow = React.useCallback(() => {
		// This would need the current item context to work properly
		formUI.setActiveDialog("edit");
	}, [formUI]);

	// Get current item for dialog with proper type safety
	const currentItem: ScrewDto | null =
		formUI.currentItemId !== null
			? ((rows?.find((item) => item.id === formUI.currentItemId) as ScrewDto) ??
				null)
			: null;

	// Memoize columns - now with stable callback references from context
	const columns = useScrewTableColumns({
		onUpdate: handleEditClick,
		onDelete: handleDeleteClick,
	});

	// Memoize data to prevent unnecessary re-renders of virtualized table
	const memoizedData = React.useMemo(
		() =>
			(rows ?? []).map((row) => ({
				...row,
				name: row.name ?? "",
				quantity: row.quantity ?? "",
				componentType: row.componentType ?? "",
				material: row.material ?? "",
				price: row.price ?? "",
			})),
		[rows],
	);
	const memoizedLoading = React.useMemo(
		() => isInitialLoading,
		[isInitialLoading],
	);

	// FAANG-grade: Pure Data Layer - Extract stable references from component logic
	const stableTableConfig = React.useMemo(
		() => ({
			data: memoizedData,
			columns,
			loading: memoizedLoading,
			tableState: memoizedTableState,
			currentItem,
			screwTypes,
			screwMaterials,
		}),
		[
			memoizedData,
			columns,
			memoizedLoading,
			memoizedTableState,
			currentItem,
			screwTypes,
			screwMaterials,
		],
	);

	// Update hasUnsavedChanges immediately when form state changes (in edit mode)
	// Using useEffectEvent to prevent unnecessary re-renders when isDirty changes
	const updateUnsavedChanges = React.useEffectEvent(() => {
		if (activeDialog === "edit") {
			setHasUnsavedChanges(isDirty);
		}
	});

	useEffect(() => {
		updateUnsavedChanges();
	}, [activeDialog, updateUnsavedChanges]);

	// Intersection Observer for infinite scroll
	useEffect(() => {
		if (!loadMoreRef.current || !hasNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries?.[0] &&
					entries[0].isIntersecting &&
					hasNextPage &&
					!isLoadingMore
				) {
					loadMore();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(loadMoreRef.current);

		return () => {
			if (loadMoreRef.current) {
				observer.unobserve(loadMoreRef.current);
			}
		};
	}, [hasNextPage, isLoadingMore, loadMore]);

	// Dialog and form handlers with performance instrumentation
	const handleCloseDialog = React.useCallback(() => {
		formUI.closeDialog();
		// Immediate form reset without delay for better UX
		reset();
	}, [formUI, reset]);

	const handleEditSubmit = React.useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const isValid = await editScrewForm.trigger();
			if (!isValid) return;

			const formData = editScrewForm.getValues();
			updateScrew(formData);
			handleCloseDialog();
		},
		[editScrewForm, updateScrew, handleCloseDialog],
	);

	const handleDeleteScrew = React.useCallback(async () => {
		if (formUI.currentItemId !== null) {
			await deleteScrew(formUI.currentItemId);
			handleCloseDialog();
		}
	}, [formUI.currentItemId, deleteScrew, handleCloseDialog]);

	return (
		<>
			{/* Global search input - isolated from form state */}
			<div className="w-full md:w-4/5 py-6 md:py-0 lg:w-1/5 relative flex items-center">
				<DebouncedInput
					className="w-full border rounded-md focus:border-blue-400 px-4 py-2"
					value={globalFilter ?? ""}
					onChange={(value) => {
						// Use startTransition to prioritize user input over table filtering
						React.startTransition(() => {
							setGlobalFilter(String(value));
						});
					}}
					placeholder="Tìm kiếm trong các cột"
				/>
				<div className="absolute right-3 text-gray-500 pointer-events-none">
					<Search />
				</div>
			</div>

			<div className="h-4"></div>

			{/* Table - now completely isolated from form state changes */}
			<div className="w-full flex justify-center items-center">
				{isInitialLoading ? (
					<LoadingSkeleton />
				) : (
					<PureDataTable
						columns={columns}
						data={memoizedData}
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
						onDoubleClickRow={handleDoubleClickRow}
						loading={false}
					/>
				)}
			</div>

			{/* Infinite scroll trigger with visual loading */}
			{hasNextPage && (
				<div
					ref={loadMoreRef}
					className="flex justify-center items-center py-4 h-12"
				>
					{isLoadingMore ? (
						<div className="flex items-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
							<span className="text-sm text-gray-500">
								Loading more screws...
							</span>
						</div>
					) : (
						<div className="text-sm text-gray-400">Scroll for more</div>
					)}
				</div>
			)}

			{/* Dialogs - still receive form data but don't affect table rendering */}
			<ScrewDialogs
				activeDialog={formUI.activeDialog}
				currentItem={currentItem}
				screwTypes={screwTypes}
				screwMaterials={screwMaterials}
				editScrewForm={editScrewForm}
				isEditing={isEditing}
				isDeleting={isDeleting}
				hasUnsavedChanges={formUI.hasUnsavedChanges}
				onCloseDialog={handleCloseDialog}
				onEditSubmit={handleEditSubmit}
				onDeleteScrew={handleDeleteScrew}
			/>
		</>
	);
});

HomeContentContent.displayName = "HomeContentContent";

/**
 * FAANG-standard form isolation: Context provider wrapper
 * Prevents form state from affecting table rendering tree
 */
const HomeContent = React.memo(function HomeContent() {
	return (
		<FormUIProvider>
			<HomeContentContent />
		</FormUIProvider>
	);
});

HomeContent.displayName = "HomeContent";

export default HomeContent;
