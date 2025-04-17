import type { NeedDto, PlatformDto } from "@/backend/schema";
import { useDeleteCustomer } from "@/frontend/hooks/useDeleteCustomer";
import { useEditCustomer } from "@/frontend/hooks/useEditCustomer";
import json from "@/shared/i18n/locales/vi/vi.json";
import { cn } from "@/shared/utils";
import { CustomerDto, CustomerSchema } from "@/shared/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import { DataTable } from "../../ui/data-table";
import { DatePicker } from "../../ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

type DialogType = "edit" | "delete" | null;

export function CustomerTable({
  customers,
  platforms,
  needs,
}: {
  customers: CustomerDto[];
  platforms: PlatformDto[];
  needs: NeedDto[];
}) {
  const editCustomerForm = useForm({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      money: "",
      platform: "",
      need: "",
      nextMessageTime: new Date(),
    },
  });
  const { editCustomer, isEditingCustomer } = useEditCustomer();
  const { deleteCustomer, isDeletingCustomer } = useDeleteCustomer();

  // Dialog state
  const [currentItem, setCurrentItem] = useState<CustomerDto | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle edit dialog
  const handleEditClick = (item: CustomerDto) => {
    setCurrentItem(item);
    editCustomerForm.reset({
      id: item.id,
      name: item.name ?? "",
      phone: item.phone,
      address: item.address,
      money: item.money,
      platform: item.platform,
      need: item.need,
      nextMessageTime: new Date(item.nextMessageTime), // ensure ISO string for z.string() if needed
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
      await deleteCustomer(currentItem);
      reset();
    }
  };

  const columns: ColumnDef<CustomerDto>[] = useMemo(
    () => [
      {
        header: "Tên KH",
        accessorKey: "name",
        cell: ({ row }) => <>{row.getValue("name")} </>,
      },
      {
        header: "SĐT",
        accessorKey: "phone",
        cell: ({ row }) => <>{row.getValue("phone")} </>,
      },
      {
        header: "Địa chỉ",
        accessorKey: "address",
        cell: ({ row }) => <>{row.getValue("address")} </>,
      },
      {
        header: "Nền tảng",
        accessorKey: "platform",
        cell: ({ row }) => <>{row.getValue("platform")}</>,
      },
      {
        header: "Nhu cầu",
        accessorKey: "need",
        cell: ({ row }) => <>{row.original.need}</>,
      },
      {
        header: "Tiền",
        accessorKey: "money",
        cell: ({ row }) => <>{row.getValue("money")} </>,
      },
      {
        header: "Thời gian nhắn lại",
        accessorKey: "nextMessageTime",
        cell: ({ row }) => {
          const formattedNextMessageTime = format(
            new Date(row.getValue("nextMessageTime")),
            "yyyy-MM-dd hh:mm:ss",
          );
          return <>{formattedNextMessageTime}</>;
        },
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
      },
    ],
    [],
  );

  const handleCloseDialog = () => {
    if (hasUnsavedChanges) {
      setActiveDialog(null);
      setHasUnsavedChanges(false);
    } else {
      setActiveDialog(null);
    }
  };

  const handleEditSubmit = editCustomerForm.handleSubmit(async (data) => {
    await editCustomer(data);
    reset();
  });

  return (
    <>
      <DataTable columns={columns} data={customers} />
      <AnimatePresence>
        {activeDialog === "edit" ? (
          <Dialog
            open={!!activeDialog}
            onOpenChange={(open) => {
              if (!open) handleCloseDialog();
            }}
          >
            <DialogContent
              className="sm:max-w-[48rem] overflow-hidden"
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
              <Form {...editCustomerForm}>
                <form
                  onSubmit={handleEditSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <FormField
                    control={editCustomerForm.control}
                    name="name"
                    disabled={isEditingCustomer}
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
                    control={editCustomerForm.control}
                    name="phone"
                    disabled={isEditingCustomer}
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
                    control={editCustomerForm.control}
                    name="address"
                    disabled={isEditingCustomer}
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
                    control={editCustomerForm.control}
                    name="money"
                    disabled={isEditingCustomer}
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
                    control={editCustomerForm.control}
                    name="platform"
                    disabled={isEditingCustomer}
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
                                  key={`${x}#${i}`}
                                  value={x?.description!}
                                >
                                  {x?.description!}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editCustomerForm.control}
                    name="need"
                    disabled={isEditingCustomer}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-y-2">
                        <FormLabel>Nhu cầu</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn nhu cầu" />
                            </SelectTrigger>
                          </FormControl>
                          <FormMessage />
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Nhu cầu</SelectLabel>
                              {(needs ?? []).map((x, i) => (
                                <SelectItem
                                  key={`${x}#${i}`}
                                  value={x?.description!}
                                >
                                  {x?.description}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editCustomerForm.control}
                    name="nextMessageTime"
                    disabled={isEditingCustomer}
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2 flex flex-col gap-y-2">
                        <FormLabel>Thời gian nhắn lại</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            onChange={(date) => field.onChange(date)}
                          />
                        </FormControl>
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
                  disabled={isDeletingCustomer}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteScrew}
                  disabled={isDeletingCustomer}
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
