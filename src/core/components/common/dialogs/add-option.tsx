"use client";

import { ScrewDto, ScrewSchema } from "@/core/validations";
import { useCreateScrew } from "@/modules/inventory/api/mutations";
import {
    useScrewMaterialsQuery,
    useScrewTypesQuery,
} from "@/modules/inventory/api/queries";
import { InstructionForm } from "@/modules/inventory/components/instruction";
import { QuestionForm } from "@/modules/inventory/components/question";
import { ScrewForm } from "@/modules/inventory/components/screw";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { FileText, HelpCircle, Plus, Settings } from "lucide-react";
import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import { DropdownMenuItemWithIcon } from "../../ui/dropdown-menu";
import { ManagedDialog } from "./managed-dialog";
type DialogType = "screw" | "instruction" | "question" | null;

export function AddOptionDropdown() {
	const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);
	const { screwTypes } = useScrewTypesQuery();
	const { screwMaterials } = useScrewMaterialsQuery();
	const { createScrew, isCreatingScrew } = useCreateScrew();

	const screwForm = useForm<ScrewDto>({
		resolver: zodResolver(ScrewSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			quantity: "",
			price: "",
			componentType: "",
			material: "",
			note: "",
		},
	});

	const dialogMeta: Record<DialogType & string, { title: string }> = {
		screw: { title: "Thêm mới linh kiện" },
		instruction: { title: "Thêm mới hướng dẫn lắp đặt" },
		question: { title: "Thêm mới câu hỏi thường gặp" },
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="gap-2">
						<Plus className="h-4 w-4" />
						Thêm mới
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuItemWithIcon
						icon={Settings}
						label="Linh kiện"
						onClick={() => setActiveDialog("screw")}
					/>
					<DropdownMenuItemWithIcon
						icon={FileText}
						label="Các bước lắp đặt"
						onClick={() => setActiveDialog("instruction")}
					/>
					<DropdownMenuItemWithIcon
						icon={HelpCircle}
						label="Câu hỏi thường gặp"
						onClick={() => setActiveDialog("question")}
					/>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Screw Dialog - Children as Render Value */}
			<ManagedDialog
				open={activeDialog === "screw"}
				onOpenChange={(open) => !open && setActiveDialog(null)}
				title={dialogMeta.screw.title}
				isDirty={screwForm.formState.isDirty}
				preventCloseOnDirty
			>
				{({ close }) => (
					<FormProvider {...screwForm}>
						<ScrewForm
							mode="create"
							onSubmit={screwForm.handleSubmit(async (data) => {
								await createScrew(data);
								close();
							})}
							isSubmitting={isCreatingScrew}
							screwTypes={screwTypes}
							screwMaterials={screwMaterials}
						/>
					</FormProvider>
				)}
			</ManagedDialog>

			{/* Instruction Dialog */}
			<ManagedDialog
				open={activeDialog === "instruction"}
				onOpenChange={(open) => !open && setActiveDialog(null)}
				title={dialogMeta.instruction.title}
			>
				{({ close }) => (
					<FormProvider {...screwForm}>
						<InstructionForm
							onSubmit={screwForm.handleSubmit(async (data) => {
								await createScrew(data);
								close();
							})}
							isSubmitting={isCreatingScrew}
							screwTypes={screwTypes}
						/>
					</FormProvider>
				)}
			</ManagedDialog>

			{/* Question Dialog */}
			<ManagedDialog
				open={activeDialog === "question"}
				onOpenChange={(open) => !open && setActiveDialog(null)}
				title={dialogMeta.question.title}
			>
				{({ close }) => (
					<FormProvider {...screwForm}>
						<QuestionForm
							onSubmit={screwForm.handleSubmit(async (data) => {
								await createScrew(data);
								close();
							})}
							isSubmitting={isCreatingScrew}
							screwTypes={screwTypes}
						/>
					</FormProvider>
				)}
			</ManagedDialog>
		</>
	);
}
