import { Autocomplete, AutocompleteOption } from "@/core/components/ui/autocomplete";
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
import { Loader2 } from "lucide-react";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";

interface ScrewEditDialogProps {
	isOpen: boolean;
	currentItem: ScrewDto | null;
	screwTypes: ScrewTypeDto[];
	screwMaterials: ScrewMaterialDto[];
	editScrewForm: UseFormReturn<ScrewDto>;
	isEditing: boolean;
	hasUnsavedChanges: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ScrewEditDialog({
	isOpen,
	currentItem,
	screwTypes,
	screwMaterials,
	editScrewForm,
	isEditing,
	hasUnsavedChanges,
	onClose,
	onSubmit,
}: ScrewEditDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent
				className="sm:max-w-3xl overflow-hidden"
				onEscapeKeyDown={(e) => {
					if (hasUnsavedChanges) {
						e.preventDefault();
						onClose();
					}
				}}
				onInteractOutside={(e) => {
					if (hasUnsavedChanges) {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa</DialogTitle>
					<DialogDescription>Chỉnh sửa thông tin sản phẩm</DialogDescription>
				</DialogHeader>
				<Form {...editScrewForm}>
					<form onSubmit={onSubmit} className="flex flex-col gap-y-4">
						{currentItem && (
							<input type="hidden" {...editScrewForm.register("id")} />
						)}

						<FormField
							control={editScrewForm.control}
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
								control={editScrewForm.control}
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
								control={editScrewForm.control}
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
								control={editScrewForm.control}
								disabled={isEditing}
								name="componentType"
								render={({ field }) => {
									const typeOptions: AutocompleteOption[] = screwTypes.map((type) => ({
										value: type.name || "",
										label: type.name || "",
										data: type,
									}));
									const selectedType = typeOptions.find((opt) => opt.value === field.value);

									return (
										<FormItem>
											<FormLabel>Loại phụ kiện</FormLabel>
											<FormControl>
												<Autocomplete
													options={typeOptions}
													value={selectedType}
													onChange={(option) => field.onChange(option?.value)}
													placeholder="Tìm kiếm loại phụ kiện..."
													disabled={field.disabled}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>

							<FormField
								control={editScrewForm.control}
								name="material"
								disabled={isEditing}
								render={({ field }) => {
									const materialOptions: AutocompleteOption[] = screwMaterials.map((material) => ({
										value: material.name || "",
										label: material.name || "",
										data: material,
									}));
									const selectedMaterial = materialOptions.find((opt) => opt.value === field.value);

									return (
										<FormItem>
											<FormLabel>Chất liệu</FormLabel>
											<FormControl>
												<Autocomplete
													options={materialOptions}
													value={selectedMaterial}
													onChange={(option) => field.onChange(option?.value)}
													placeholder="Tìm kiếm chất liệu..."
													disabled={field.disabled}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						</div>

						<FormField
							control={editScrewForm.control}
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
								onClick={onClose}
							>
								Hủy
							</Button>
							<Button type="submit" disabled={isEditing}>
								{isEditing ? (
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
			</DialogContent>
		</Dialog>
	);
}
