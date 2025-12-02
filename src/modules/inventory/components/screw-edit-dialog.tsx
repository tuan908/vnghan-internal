import { Autocomplete } from "@/core/components/ui/autocomplete";
import { Button } from "@/core/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import json from "@/core/i18n/locales/vi/vi.json";
import { ScrewMaterialDto, ScrewTypeDto } from "@/core/types";
import type { ScrewDto } from "@/core/validations";
import { ScrewSchema } from "@/core/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

interface ScrewEditDialogProps {
	isOpen: boolean;
	currentItem: ScrewDto | null;
	screwTypes: ScrewTypeDto[];
	screwMaterials: ScrewMaterialDto[];
	isEditing: boolean;
	onClose: () => void;
	onSubmit: (data: ScrewDto) => void;
}

export const ScrewEditDialog = React.memo(function ScrewEditDialog({
	isOpen,
	currentItem,
	screwTypes,
	screwMaterials,
	isEditing,
	onClose,
	onSubmit,
}: ScrewEditDialogProps) {
	// Form now lives entirely within this dialog component
	const form = useForm<ScrewDto>({
		resolver: zodResolver(ScrewSchema),
		defaultValues: {
			id: -1,
			name: "",
			quantity: "",
			price: "",
			componentType: "",
			material: "",
			note: "",
			category: "",
			size: "",
		},
		mode: "onBlur",
	});

	const { reset, formState, handleSubmit, register, control } = form;
	const { isDirty, isSubmitting, errors } = formState;

	// Reset form when dialog opens with new item
	useEffect(() => {
		if (isOpen && currentItem) {
			reset({
				id: currentItem.id ?? -1,
				name: currentItem.name ?? "",
				quantity: currentItem.quantity ?? "",
				price: currentItem.price ?? "",
				componentType: currentItem.componentType ?? "",
				material: currentItem.material ?? "",
				note: currentItem.note ?? "",
				category: currentItem.category ?? "",
				size: currentItem.size ?? "",
			});
		}
	}, [isOpen, currentItem, reset]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!isOpen) {
			reset();
		}
	}, [isOpen, reset]);

	const handleFormSubmit = handleSubmit((data) => {
		onSubmit(data);
	});

	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		>
			<DialogContent className="sm:max-w-3xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>Chỉnh sửa</DialogTitle>
					<DialogDescription>Chỉnh sửa thông tin sản phẩm</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={handleFormSubmit} className="flex flex-col gap-y-4">
						{currentItem && <input type="hidden" {...register("id")} />}

						<FormField
							control={form.control}
							name="name"
							disabled={isEditing}
							render={({ field }) => (
								<FormItem className="flex flex-col gap-y-2">
									<FormLabel>Tên sản phẩm</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tên sản phẩm" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="quantity"
								disabled={isEditing}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Số lượng</FormLabel>
										<FormControl>
											<Input placeholder="Nhập số lượng" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="price"
								disabled={isEditing}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Giá tham khảo</FormLabel>
										<FormControl>
											<div className="relative flex items-center">
												<Input
													placeholder="Nhập giá tiền tham khảo"
													{...field}
												/>
												<div className="absolute right-3 text-gray-500 pointer-events-none">
													VND
												</div>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								disabled={isEditing}
								name="componentType"
								render={({ field }) => {
									const typeOptions = screwTypes.map((type) => ({
										value: type.name || "",
										label: type.name || "",
									}));
									const selectedType = typeOptions.find(
										(opt) => opt.value === field.value,
									);
									return (
										<FormItem>
											<FormLabel>Loại phụ kiện</FormLabel>
											<FormControl>
												<Autocomplete
													options={typeOptions}
													value={selectedType}
													onChange={(option) =>
														field.onChange(option?.value ?? "")
													}
													placeholder="Tìm kiếm loại phụ kiện..."
													disabled={field.disabled}
													clearable={false}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>

							<FormField
								control={form.control}
								name="material"
								disabled={isEditing}
								render={({ field }) => {
									const materialOptions = screwMaterials.map((material) => ({
										value: material.name || "",
										label: material.name || "",
									}));
									const selectedMaterial = materialOptions.find(
										(opt) => opt.value === field.value,
									);

									return (
										<FormItem>
											<FormLabel>Chất liệu</FormLabel>
											<FormControl>
												<Autocomplete
													options={materialOptions}
													value={selectedMaterial}
													onChange={(option) =>
														field.onChange(option?.value ?? "")
													}
													placeholder="Tìm kiếm chất liệu..."
													disabled={field.disabled}
													clearable={false}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						<FormField
							control={form.control}
							name="note"
							disabled={isEditing}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Lưu ý</FormLabel>
									<FormControl>
										<Textarea
											className="resize-none min-h-24"
											placeholder="Nhập lưu ý (nếu có)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="mt-4">
							<Button
								type="button"
								variant="outline"
								disabled={isEditing}
								onClick={handleClose}
							>
								Hủy
							</Button>
							<Button type="submit" disabled={isEditing}>
								{isEditing || isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										<span>{json.common.saving}</span>
									</>
								) : (
									<span>{json.common.edit}</span>
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>

				{/* Unsaved changes indicator */}
				{isDirty && (
					<div className="text-amber-600 text-sm mt-2">
						You have unsaved changes
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
});

ScrewEditDialog.displayName = "ScrewEditDialog";
