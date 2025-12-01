import { Button } from "@/core/components/ui/button";
import { DateTimePicker } from "@/core/components/ui/datetime-picker";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/core/components/ui/select";
import { Textarea } from "@/core/components/ui/textarea";
import json from "@/core/i18n/locales/vi/vi.json";
import type { CustomerDto } from "@/core/validations";
import { PlatformDto } from "@/server/models/platform.model";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";

type DialogType = "edit" | "delete" | null;

interface CustomerDialogsProps {
	activeDialog: DialogType;
	currentItem: CustomerDto | null;
	platforms: PlatformDto[];
	updateCustomerForm: UseFormReturn<CustomerDto>;
	isUpdating: boolean;
	isDeleting: boolean;
	hasUnsavedChanges: boolean;
	onCloseDialog: () => void;
	onEditSubmit: (e: React.FormEvent) => Promise<void>;
	onDeleteCustomer: () => Promise<void>;
}

export function CustomerDialogs({
	activeDialog,
	currentItem,
	platforms,
	updateCustomerForm,
	isUpdating,
	isDeleting,
	hasUnsavedChanges,
	onCloseDialog,
	onEditSubmit,
	onDeleteCustomer,
}: CustomerDialogsProps) {
	return (
		<>
			{/* Edit Dialog */}
			{activeDialog === "edit" && (
				<Dialog
					open={activeDialog === "edit"}
					onOpenChange={(open) => {
						if (!open) onCloseDialog();
					}}
				>
					<DialogContent
						className="sm:max-w-3xl overflow-hidden"
						onEscapeKeyDown={(e) => {
							if (hasUnsavedChanges) {
								e.preventDefault();
								onCloseDialog();
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
						</DialogHeader>
						<Form {...updateCustomerForm}>
							<form
								onSubmit={onEditSubmit}
								className="grid grid-cols-1 md:grid-cols-2 gap-4"
							>
								{currentItem && (
									<input type="hidden" {...updateCustomerForm.register("id")} />
								)}

								<FormField
									control={updateCustomerForm.control}
									name="name"
									disabled={isUpdating}
									render={({ field }) => (
										<FormItem className="flex flex-col gap-y-2">
											<FormLabel>Tên KH</FormLabel>
											<FormControl>
												<Input placeholder="Nhập tên sản phẩm" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={updateCustomerForm.control}
									name="phone"
									disabled={isUpdating}
									render={({ field }) => (
										<FormItem className="flex flex-col gap-y-2">
											<FormLabel>SĐT</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={updateCustomerForm.control}
									name="address"
									disabled={isUpdating}
									render={({ field }) => (
										<FormItem className="flex flex-col gap-y-2">
											<FormLabel>Địa chỉ</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													className="resize-none h-12 overflow-y-auto"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={updateCustomerForm.control}
									name="money"
									disabled={isUpdating}
									render={({ field }) => (
										<FormItem className="flex flex-col gap-y-2">
											<FormLabel>Tiền (VND)</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={updateCustomerForm.control}
									name="platform"
									disabled={isUpdating}
									render={({ field }) => (
										<FormItem className="flex flex-col gap-y-2">
											<FormLabel>Nền tảng</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Chọn nền tảng" />
													</SelectTrigger>
												</FormControl>
												<FormMessage />
												<SelectContent>
													<SelectGroup>
														<SelectLabel>Nền tảng</SelectLabel>
														{(platforms ?? []).map((x, i) => (
															<SelectItem key={`${x}#${i}`} value={x?.name!}>
																{x?.name!}
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>

								<FormField
									control={updateCustomerForm.control}
									name="need"
									disabled={isUpdating}
									render={({ field }) => (
										<FormItem className="flex flex-col gap-y-2">
											<FormLabel>Nhu cầu</FormLabel>
											<Textarea
												{...field}
												className="resize-none h-12 overflow-y-auto"
											/>
										</FormItem>
									)}
								/>
								<FormField
									control={updateCustomerForm.control}
									name="nextMessageTime"
									disabled={isUpdating}
									render={() => (
										<FormItem className="flex flex-col">
											<FormLabel>
												{json.form.createCustomer.nextMessageTime}
											</FormLabel>
											<DateTimePicker
												name="nextMessageTime"
												control={updateCustomerForm.control}
												disabled={isUpdating}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="col-span-1 md:col-span-2 text-right">
									<Button type="submit">Lưu</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			)}

			{/* Delete Dialog */}
			{activeDialog === "delete" && (
				<Dialog
					open={activeDialog === "delete"}
					onOpenChange={(open) => {
						if (!open) onCloseDialog();
					}}
				>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Xác nhận xóa</DialogTitle>
							<DialogDescription>
								Bạn có chắc chắn muốn xóa khách hàng "{currentItem?.name}
								"?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onCloseDialog}
								disabled={isDeleting}
							>
								Hủy
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={onDeleteCustomer}
								disabled={isDeleting}
							>
								Xóa
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
