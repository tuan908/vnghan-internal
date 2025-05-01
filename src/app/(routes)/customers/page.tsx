"use client";

import { CustomerTable } from "@/frontend/components/features/customer/customer-table";
import { ExportOptionDropdown } from "@/frontend/components/features/excel/export-option";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { DateTimePicker } from "@/frontend/components/ui/datetime-picker";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/frontend/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItemWithIcon,
	DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/frontend/components/ui/form";
import { Input } from "@/frontend/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";
import { useCreateCustomer } from "@/frontend/hooks/useCreateCustomer";
import { useGetCustomers } from "@/frontend/hooks/useGetCustomers";
import { useGetPlatforms } from "@/frontend/hooks/useGetPlatforms";
import { useSession } from "@/frontend/hooks/useSession";
import { useAdminConfig } from "@/frontend/providers/AdminConfigProvider";
import json from "@/shared/i18n/locales/vi/vi.json";
import { RoleUtils } from "@/shared/utils";
import { clientApiV1 } from "@/shared/utils/hono-client";
import { type CustomerDto, CustomerSchema } from "@/shared/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { Plus, User } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

type DialogType = "user" | "instruction" | "question" | null;

export default function CustomerForm() {
	const createCustomerForm = useForm({
		defaultValues: {
			name: "",
			phone: "",
			address: "",
			money: "",
			platform: "",
			need: "",
			nextMessageTime: new Date(),
		},
		resolver: zodResolver(CustomerSchema),
	});
	const [activeDialog, setActiveDialog] = useState<DialogType>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const { platforms } = useGetPlatforms();
	// const { needs } = useGetNeeds();
	const { customers } = useGetCustomers();
	const { createCustomer, isCreatingCustomer } = useCreateCustomer();
	const { user } = useSession();
	const downloadUrl = clientApiV1.export.customers.$url().toString();

	const { config } = useAdminConfig();
	const onSubmit = async (data: CustomerDto) => {
		const result = await createCustomer(data);
		if (result) {
			createCustomerForm.reset();
			setActiveDialog(null);
		}
	};

	const handleOpenDialog = (type: DialogType) => {
		setActiveDialog(type);

		// Reset the appropriate form
		if (type === "user") {
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			if (hasUnsavedChanges) {
				setHasUnsavedChanges(false);
			}
			setActiveDialog(null);
		}
	};

	const MemoizedTable = useCallback(() => {
		const transformedCustomers = customers ?? [];
		const transformedPlatforms = platforms ?? [];
		const isAdmin = RoleUtils.isAdmin(user?.role!);

		return (
			<CustomerTable
				customers={transformedCustomers}
				// needs={needs ?? []}
				platforms={transformedPlatforms}
				config={config}
				isAdmin={isAdmin}
			/>
		);
	}, [customers, platforms, user, config]);

	return (
		<>
			<div className="w-24/25 py-4 m-auto flex justify-end items-center gap-x-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2 py-2">
							<Plus className="h-4 w-4" />
							Thêm mới
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItemWithIcon
							icon={User}
							label="Người dùng"
							onClick={() => handleOpenDialog("user")}
						/>
					</DropdownMenuContent>
				</DropdownMenu>

				<ExportOptionDropdown downloadUrl={downloadUrl} />
			</div>

			<AnimatePresence>
				{activeDialog && (
					<Dialog open={!!activeDialog} onOpenChange={handleOpenChange}>
						<DialogContent
							className="sm:max-w-[48rem] overflow-hidden"
							onEscapeKeyDown={(e) => {
								if (hasUnsavedChanges) {
									e.preventDefault();
									setActiveDialog(null);
								}
							}}
							onInteractOutside={(e) => {
								if (hasUnsavedChanges) {
									e.preventDefault();
								}
							}}
						>
							<DialogHeader>
								<DialogTitle>Thêm mới người dùng</DialogTitle>
							</DialogHeader>
							<Card className="p-4 w-full max-w-4xl mx-auto mt-4">
								<CardContent>
									<Form {...createCustomerForm}>
										<form
											onSubmit={createCustomerForm.handleSubmit(onSubmit)}
											className="grid grid-cols-1 md:grid-cols-2 gap-4"
										>
											<FormField
												control={createCustomerForm.control}
												name="name"
												disabled={isCreatingCustomer}
												render={({ field }) => (
													<FormItem className="flex flex-col gap-y-2">
														<FormLabel>Tên KH</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={createCustomerForm.control}
												name="phone"
												disabled={isCreatingCustomer}
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
												control={createCustomerForm.control}
												name="address"
												disabled={isCreatingCustomer}
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
												control={createCustomerForm.control}
												name="money"
												disabled={isCreatingCustomer}
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
												control={createCustomerForm.control}
												name="platform"
												disabled={isCreatingCustomer}
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
																		<SelectItem
																			key={`${x.id}#${i}`}
																			value={x?.name!}
																		>
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
												control={createCustomerForm.control}
												name="need"
												disabled={isCreatingCustomer}
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
											<DateTimePicker
												control={createCustomerForm.control}
												name="nextMessageTime"
												label={json.form.createCustomer.nextMessageTime}
												disabled={isCreatingCustomer}
											/>

											<div className="col-span-1 md:col-span-2 text-right">
												<Button type="submit">Lưu</Button>
											</div>
										</form>
									</Form>
								</CardContent>
							</Card>
						</DialogContent>
					</Dialog>
				)}
			</AnimatePresence>

			<div className="m-auto w-24/25">
				<MemoizedTable />
			</div>
		</>
	);
}
