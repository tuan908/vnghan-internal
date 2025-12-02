import { ScrewMaterialDto, ScrewTypeDto } from "@/core/types";
import type { ScrewDto } from "@/core/validations";
import React from "react";
import { ScrewDeleteDialog } from "./screw-delete-dialog";
import { ScrewEditDialog } from "./screw-edit-dialog";

type DialogType = "edit" | "delete" | null;

interface ScrewDialogsProps {
	activeDialog: DialogType;
	currentItem: ScrewDto | null;
	screwTypes: ScrewTypeDto[];
	screwMaterials: ScrewMaterialDto[];
	isEditing: boolean;
	isDeleting: boolean;
	onCloseDialog: () => void;
	onEditSubmit: (data: ScrewDto) => void;
	onDeleteScrew: () => Promise<void>;
}

export const ScrewDialogs = React.memo(function ScrewDialogs({
	activeDialog,
	currentItem,
	screwTypes,
	screwMaterials,
	isEditing,
	isDeleting,
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
				isEditing={isEditing}
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
