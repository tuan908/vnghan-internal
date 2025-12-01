import { Button } from "@/core/components/ui/button";
import { DataTable, fuzzySort } from "@/core/components/ui/data-table";
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
import { DATETIME_FORMAT_DD_MM_YYYY_HH_MM_SS_WITH_SLASH } from "@/core/constants";
import json from "@/core/i18n/locales/vi/vi.json";
import { cn } from "@/core/utils";
import { formatCurrency } from "@/core/utils/currency";
import { formatPhone } from "@/core/utils/phone-number";
import { type CustomerDto, CustomerSchema } from "@/core/validations";
import { AdminConfig } from "@/modules/admin/lib/providers/AdminConfigProvider";
import { PlatformDto } from "@/server/models/platform.model";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
    ColumnDef,
    ColumnFiltersState,
    Row,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { startTransition, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDeleteCustomerMutation, useUpdateCustomerMutation } from "../api";

type DialogType = "edit" | "delete" | null;

export function CustomerTable({
	customers,
	platforms,
	config,
	isAdmin,
	// needs,
}: {
	customers: CustomerDto[];
	platforms: PlatformDto[];
	config: AdminConfig;
	isAdmin: boolean;
	// needs: NeedDto[];
}) {
	const updateCustomerForm = useForm({
		resolver: zodResolver(CustomerSchema),
		defaultValues: {
			name: "",
			phone: "",
			address: "",
			money: "",
			platform: "",
			need: "",
			nextMessageTime: new Date().toISOString(),
		},
		mode: "onChange"
	});
	const { mutate: updateCustomer, isPending: isUpdating } =
		useUpdateCustomerMutation();
	const { mutate: deleteCustomer, isPending: isDeleting } =
		useDeleteCustomerMutation();

	// Dialog state
	const [currentItem, setCurrentItem] = useState<CustomerDto | null>(null);
	const [activeDialog, setActiveDialog] = useState<DialogType>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});

	// Handle edit dialog
	const handleEditClick = (item: CustomerDto) => {
		setCurrentItem(item);
		updateCustomerForm.reset({
			id: item.id,
			name: item.name ?? "",
			phone: item.phone,
			address: item.address,
			money: item.money,
			platform: item.platform,
			need: item.need,
			nextMessageTime: item.nextMessageTime, // ensure ISO string for z.string() if needed
		});
		setActiveDialog("edit");
	};

	// Handle delete dialog
	const handleDeleteClick = (item: CustomerDto) => {
		setCurrentItem(item);
		setActiveDialog("delete");
	};

	const reset = () => {
		startTransition(() => {
			if (currentItem) {
				setCurrentItem(null);
			}

			if (activeDialog) {
				setActiveDialog(null);
			}
		});
	};

	const handleDeleteScrew = async () => {
		if (currentItem) {
			deleteCustomer(currentItem?.id!);
			reset();
		}
	};

	console.log(updateCustomerForm.getValues())

	const columns: ColumnDef<CustomerDto>[] = useMemo(
		() => [
			{
				header: "Tên KH",
				accessorKey: "name",
				cell: ({ row }) => <>{row.getValue("name")} </>,
				filterFn: "fuzzy",
				sortingFn: fuzzySort,
			},
			{
				header: "SĐT",
				accessorKey: "phone",
				cell: ({ row }) => (
					<div className="text-center">
						{formatPhone(row.getValue("phone"))}
					</div>
				),
				filterFn: "includesString",
			},
			{
				header: "Địa chỉ",
				accessorKey: "address",
				cell: ({ row }) => <>{row.getValue("address")} </>,
				filterFn: "includesString",
			},
			{
				header: "Nền tảng",
				accessorKey: "platform",
				cell: ({ row }) => <>{row.getValue("platform")}</>,
				filterFn: "includesString",
			},
			{
				header: "Nhu cầu",
				accessorKey: "need",
				cell: ({ row }) => <>{row.original.need}</>,
				filterFn: "includesString",
			},
			{
				header: "Tiền",
				accessorKey: "money",
				cell: ({ row }) => (
					<div className={cn("text-right flex gap-x-2 justify-end")}>
						<span>{formatCurrency(row.getValue("money"))}</span>
						<span className="text-gray-500 pointer-events-none">VND</span>
					</div>
				),
				filterFn: "includesString",
			},
			{
				header: "Thời gian nhắn lại",
				accessorKey: "nextMessageTime",
				cell: ({ row }) => {
					const formattedNextMessageTime = dayjs(
						new Date(row.getValue("nextMessageTime")),
					).format(DATETIME_FORMAT_DD_MM_YYYY_HH_MM_SS_WITH_SLASH);
					return <div className="text-center">{formattedNextMessageTime}</div>;
				},
				sortDescFirst: false,
				sortUndefined: "last",
			},
			{
				id: "actions",
				header: json.table.action,
				cell: ({ row }) => (
					<div className={cn("flex gap-x-6 justify-center items-center")}>
						<button onClick={() => handleEditClick(row.original)}>
							<Pencil className="h-5 w-5 text-blue-400 hover:text-blue-300" />
						</button>
						<button onClick={() => handleDeleteClick(row.original)}>
							<Trash2 className="h-5 w-5 text-red-400 hover:text-red-300" />
						</button>
					</div>
				),
				size: 100,
				enableColumnFilter: false,
			},
		],
		[config.todayHighlightColor],
	);

	const handleCloseDialog = () => {
		if (hasUnsavedChanges) {
			setActiveDialog(null);
			setHasUnsavedChanges(false);
		} else {
			setActiveDialog(null);
		}
	};

	const handleEditSubmit = updateCustomerForm.handleSubmit(async (data) => {
		updateCustomer(data);
		reset();
	});

	const getRowStyles = useCallback(
		(row: Row<CustomerDto>): string => {
			const nextMessageTime = row.original.nextMessageTime;
			if (!dayjs().isSame(nextMessageTime, "date") || !isAdmin) {
				return "";
			}
			return config.todayHighlightColor;
		},
		[config.todayHighlightColor],
	);

	return (
		<>
			<DataTable
				columns={columns}
				data={customers}
				sorting={sorting}
				setSorting={setSorting}
				columnFilters={columnFilters}
				setColumnFilters={setColumnFilters}
				columnVisibility={columnVisibility}
				setColumnVisibility={setColumnVisibility}
				rowSelection={rowSelection}
				setRowSelection={setRowSelection}
				getRowClassName={getRowStyles}
			/>

			<AnimatePresence>
				{activeDialog === "edit" ? (
					<Dialog
						open={!!activeDialog}
						onOpenChange={(open) => {
							if (!open) handleCloseDialog();
						}}
					>
						<DialogContent
							className="sm:max-w-3xl overflow-hidden"
							onEscapeKeyDown={(e) => {
								if (hasUnsavedChanges) {
									e.preventDefault();
									handleCloseDialog();
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
									onSubmit={handleEditSubmit}
									className="grid grid-cols-1 md:grid-cols-2 gap-4"
								>
									<FormField
										control={updateCustomerForm.control}
										name="name"
										disabled={isUpdating}
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
				) : activeDialog === "delete" ? (
					<Dialog
						open={!!activeDialog}
						onOpenChange={(open) => {
							if (!open) handleCloseDialog();
						}}
					>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>Xác nhận xóa</DialogTitle>
								<DialogDescription>
									Bạn có chắc chắn muốn xóa khách hàng &quot;{currentItem?.name}
									&quot;?
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleCloseDialog}
									disabled={isDeleting}
								>
									Hủy
								</Button>
								<Button
									type="button"
									variant="destructive"
									onClick={handleDeleteScrew}
									disabled={isDeleting}
								>
									Xóa
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				) : null}
			</AnimatePresence>
		</>
	);
}
