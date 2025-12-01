"use client";

import { DataTable } from "@/core/components/ui/data-table";
import DebouncedInput from "@/core/components/ui/debounced-input";
import { useTableState } from "@/core/lib/hooks/useTableState";
import { ScrewDto, ScrewSchema } from "@/core/validations";
import {
	useDeleteScrew,
	useUpdateScrew,
} from "@/modules/inventory/api/mutations";
import {
	useScrewMaterialsQuery,
	useScrewsQuery,
	useScrewTypesQuery,
} from "@/modules/inventory/api/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrewDialogs } from "./screw-dialogs";
import { useScrewTableColumns } from "./screw-table-columns";

type DialogType = "edit" | "delete" | null;

export default function HomeContent() {
	// Data fetching hooks
	const { screws: rows, isLoading: isLoadingScrews } = useScrewsQuery();
	const { screwTypes } = useScrewTypesQuery();
	const { screwMaterials } = useScrewMaterialsQuery();

	// Table state using custom hook
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
	} = useTableState();

	// Dialog state
	const [activeDialog, setActiveDialog] = useState<DialogType>(null);
	const [currentItem, setCurrentItem] = useState<ScrewDto | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
		mode: "onChange",
	});

	const { reset, formState } = editScrewForm;
	const { isDirty } = formState;

	// API mutation hooks
	const { deleteScrew, isDeleting } = useDeleteScrew();
	const { editScrew, isEditing } = useUpdateScrew();

	// Effect to track form changes
	useEffect(() => {
		setHasUnsavedChanges(isDirty);
	}, [isDirty]);

	// Reset form when currentItem changes
	useEffect(() => {
		if (currentItem && activeDialog === "edit") {
			console.log("Resetting form with item:", currentItem);

			// Convert any undefined values to empty strings to avoid uncontrolled input warnings
			const formData = {
				id: currentItem.id || -1,
				name: currentItem.name || "",
				quantity: currentItem.quantity || "",
				price: currentItem.price || "",
				componentType: currentItem.componentType || "",
				material: currentItem.material || "",
				note: currentItem.note || "",
				category: currentItem.category || "",
				size: currentItem.size || "",
			};

			// Reset with a timeout to ensure the form is mounted
			setTimeout(() => {
				reset(formData);
			}, 0);
		}
	}, [currentItem, activeDialog, reset]);

	// Dialog handlers with proper cleanup
	const handleCloseDialog = useCallback(() => {
		setActiveDialog(null);
		setHasUnsavedChanges(false);

		// Allow animation to complete before resetting state
		setTimeout(() => {
			setCurrentItem(null);
			reset();
		}, 300);
	}, [reset]);

	const handleEditClick = useCallback(
		(item: ScrewDto) => {
			// Reset form first to clear previous state
			reset(item);
			setCurrentItem(item);
			setActiveDialog("edit");
		},
		[reset],
	);

	const handleDeleteClick = useCallback((item: ScrewDto) => {
		setCurrentItem(item);
		setActiveDialog("delete");
	}, []);

	// Form submission handlers
	const handleEditSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const isValid = await editScrewForm.trigger();
			if (!isValid) return;

			const formData = editScrewForm.getValues();
			console.log("Submitting data:", formData);

			await editScrew(formData);
			handleCloseDialog();
		},
		[editScrewForm, editScrew, handleCloseDialog],
	);

	const handleDeleteScrew = useCallback(async () => {
		if (currentItem) {
			await deleteScrew(currentItem);
			handleCloseDialog();
		}
	}, [currentItem, deleteScrew, handleCloseDialog]);

	// Use the separated table columns hook
	const columns = useScrewTableColumns({
		onUpdate: handleEditClick,
		onDelete: handleDeleteClick,
	});

	return (
		<>
			<div className="w-full md:w-4/5 py-6 md:py-0 lg:w-1/5 relative flex items-center">
				<DebouncedInput
					className="w-full border rounded-md focus:border-blue-400 px-4 py-2"
					value={globalFilter ?? ""}
					onChange={(value) => setGlobalFilter(String(value))}
					placeholder="Tìm kiếm trong các cột"
				/>
				<div className="absolute right-3 text-gray-500 pointer-events-none">
					<Search />
				</div>
			</div>

			<div className="h-4"></div>

			<div className="w-full flex justify-center items-center">
				<DataTable
					columns={columns}
					data={rows ?? []}
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
					onDoubleClickRow={() => setActiveDialog("edit")}
					loading={isLoadingScrews}
				/>
			</div>

			<ScrewDialogs
				activeDialog={activeDialog}
				currentItem={currentItem}
				screwTypes={screwTypes}
				screwMaterials={screwMaterials}
				editScrewForm={editScrewForm}
				isEditing={isEditing}
				isDeleting={isDeleting}
				hasUnsavedChanges={hasUnsavedChanges}
				onCloseDialog={handleCloseDialog}
				onEditSubmit={handleEditSubmit}
				onDeleteScrew={handleDeleteScrew}
			/>
		</>
	);
}
