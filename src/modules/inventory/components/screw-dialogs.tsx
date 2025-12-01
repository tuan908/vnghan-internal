import { ScrewMaterialDto, ScrewTypeDto } from "@/core/types";
import type { ScrewDto } from "@/core/validations";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { ScrewDeleteDialog } from "./screw-delete-dialog";
import { ScrewEditDialog } from "./screw-edit-dialog";

type DialogType = "edit" | "delete" | null;

interface ScrewDialogsProps {
	activeDialog: DialogType;
	currentItem: ScrewDto | null;
	screwTypes: ScrewTypeDto[];
	screwMaterials: ScrewMaterialDto[];
	editScrewForm: UseFormReturn<ScrewDto>;
	isEditing: boolean;
	isDeleting: boolean;
	hasUnsavedChanges: boolean;
	onCloseDialog: () => void;
	onEditSubmit: (e: React.FormEvent) => Promise<void>;
	onDeleteScrew: () => Promise<void>;
}

export const ScrewDialogs = React.memo(function ScrewDialogs({
	activeDialog,
	currentItem,
	screwTypes,
	screwMaterials,
	editScrewForm,
	isEditing,
	isDeleting,
	hasUnsavedChanges,
	onCloseDialog,
	onEditSubmit,
	onDeleteScrew,
}: ScrewDialogsProps) {
	return (
		<>
			<ScrewEditDialog
				isOpen={activeDialog === "edit"}
				currentItem={currentItem}
				screwTypes={screwTypes}
				screwMaterials={screwMaterials}
				editScrewForm={editScrewForm}
				isEditing={isEditing}
				hasUnsavedChanges={hasUnsavedChanges}
				onClose={onCloseDialog}
				onSubmit={onEditSubmit}
			/>

			<ScrewDeleteDialog
				isOpen={activeDialog === "delete"}
				currentItem={currentItem}
				isDeleting={isDeleting}
				onClose={onCloseDialog}
				onDelete={onDeleteScrew}
			/>
		</>
	);
});
