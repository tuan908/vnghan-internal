"use client";

import DebouncedInput from "@/core/components/ui/debounced-input";
import { LoadingSkeleton } from "@/core/components/ui/table-skeleton";
import { useTableState } from "@/core/lib/hooks/useTableState";
import { ScrewDto } from "@/core/validations";
import {
	useDeleteScrew,
	useUpdateScrew,
} from "@/modules/inventory/api/mutations";
import {
	useScrewMaterialsQuery,
	useScrewsInfinite,
	useScrewTypesQuery,
} from "@/modules/inventory/api/queries";
import { Search } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { PureDataTable } from "./inventory-datatable";
import { ScrewDialogs } from "./screw-dialogs";
import { useScrewTableColumns } from "./screw-table-columns";

const HomeContent = React.memo(function HomeContent() {
	const [activeDialog, setActiveDialog] = React.useState<
		"edit" | "delete" | null
	>(null);
	const [currentItemId, setCurrentItemId] = React.useState<number | null>(null);

	const loadMoreRef = useRef<HTMLDivElement>(null);

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

	// Table state
	const tableState = useTableState();
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
	} = tableState;

	// API mutation hooks
	const { deleteScrew, isDeleting } = useDeleteScrew();
	const { updateScrew, isEditing } = useUpdateScrew();

	// ✅ Fix 1: Memoize currentItem
	const currentItem = useMemo<ScrewDto | null>(() => {
		if (currentItemId === null || !rows) return null;
		return (rows.find((item) => item.id === currentItemId) as ScrewDto) ?? null;
	}, [currentItemId, rows]);

	// ✅ Fix 2: Memoize all handlers
	const closeDialog = useCallback(() => {
		setActiveDialog(null);
		setCurrentItemId(null);
	}, []);

	const handleEditClick = useCallback((item: ScrewDto) => {
		setCurrentItemId(item.id ?? -1);
		setActiveDialog("edit");
	}, []);

	const handleDeleteClick = useCallback((item: ScrewDto) => {
		setCurrentItemId(item.id ?? -1);
		setActiveDialog("delete");
	}, []);

	// ✅ Fix 3: Memoize double-click handler
	const handleDoubleClickRow = useCallback(() => {
		setActiveDialog("edit");
	}, []);

	// Memoize columns
	const columns = useScrewTableColumns({
		onUpdate: handleEditClick,
		onDelete: handleDeleteClick,
	});

	// Memoize data
	const memoizedData = useMemo(
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

	const handleEditSubmit = useCallback(
		(data: ScrewDto) => {
			updateScrew(data);
			closeDialog();
		},
		[updateScrew, closeDialog],
	);

	const handleDeleteScrew = useCallback(async () => {
		if (currentItemId !== null) {
			deleteScrew(currentItemId);
			closeDialog();
		}
	}, [currentItemId, deleteScrew, closeDialog]);

	// ✅ Fix 4: Memoize globalFilter handler
	const handleGlobalFilterChange = useCallback(
		(value: string | number) => {
			React.startTransition(() => {
				setGlobalFilter(String(value));
			});
		},
		[setGlobalFilter],
	);

	// Intersection Observer
	useEffect(() => {
		const currentRef = loadMoreRef.current;
		if (!currentRef || !hasNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isLoadingMore) {
					loadMore();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(currentRef);

		return () => {
			observer.unobserve(currentRef);
		};
	}, [hasNextPage, isLoadingMore, loadMore]);

	return (
		<>
			{/* Global search input */}
			<div className="w-full md:w-4/5 py-6 md:py-0 lg:w-1/5 relative flex items-center">
				<DebouncedInput
					className="w-full border rounded-md focus:border-blue-400 px-4 py-2"
					value={globalFilter ?? ""}
					onChange={handleGlobalFilterChange}
					placeholder="Tìm kiếm trong các cột"
				/>
				<div className="absolute right-3 text-gray-500 pointer-events-none">
					<Search />
				</div>
			</div>

			<div className="h-4" />

			{/* Table */}
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

			{/* Infinite scroll trigger */}
			{hasNextPage && (
				<div
					ref={loadMoreRef}
					className="flex justify-center items-center py-4 h-12"
				>
					{isLoadingMore ? (
						<div className="flex items-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
							<span className="text-sm text-gray-500">
								Loading more screws...
							</span>
						</div>
					) : (
						<div className="text-sm text-gray-400">Scroll for more</div>
					)}
				</div>
			)}

			{/* Dialogs */}
			<ScrewDialogs
				activeDialog={activeDialog}
				currentItem={currentItem}
				screwTypes={screwTypes}
				screwMaterials={screwMaterials}
				isEditing={isEditing}
				isDeleting={isDeleting}
				onCloseDialog={closeDialog}
				onEditSubmit={handleEditSubmit}
				onDeleteScrew={handleDeleteScrew}
			/>
		</>
	);
});

HomeContent.displayName = "HomeContent";

export default HomeContent;
