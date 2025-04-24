"use client";

import { Button } from "@/frontend/components/ui/button";
import { DataTable, fuzzySort } from "@/frontend/components/ui/data-table";
import DebouncedInput from "@/frontend/components/ui/debounced-input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/frontend/components/ui/form";
import { useDeleteScrew } from "@/frontend/hooks/useDeleteScrew";
import { useEditScrew } from "@/frontend/hooks/useEditScrew";
import { useGetScrewMaterials } from "@/frontend/hooks/useGetScrewMaterials";
import { useGetScrews } from "@/frontend/hooks/useGetScrews";
import { useGetScrewTypes } from "@/frontend/hooks/useGetScrewTypes";
import { useIntlFormatter } from "@/frontend/hooks/useIntlFormatter";
import json from "@/shared/i18n/locales/vi/vi.json";
import { ScrewMaterialDto, ScrewTypeDto } from "@/shared/types";
import { cn } from "@/shared/utils";
import { ScrewDto, ScrewSchema } from "@/shared/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { RankingInfo } from "@tanstack/match-sorter-utils";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type DialogType = "edit" | "delete" | null;

export default function HomeContent() {
  // Data fetching hooks
  const { screwTypes } = useGetScrewTypes();
  const { screwMaterials } = useGetScrewMaterials();
  const { screws: rows } = useGetScrews();
  const { formatCurrency } = useIntlFormatter();

  // Table state
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
  const { editScrew, isEditing } = useEditScrew();

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

  // Memoized table columns definition
  const columns = useMemo<ColumnDef<ScrewDto>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <>{row.original.id}</>,
        enableColumnFilter: false,
        size: 75,
      },
      {
        accessorKey: "componentType",
        header: json.table.componentType,
        cell: ({ row }) => <> {row.original.componentType}</>,
        filterFn: "includesString",
        size: 150,
      },
      {
        accessorKey: "price",
        header: json.table.price,
        cell: ({ row }) => (
          <div className={cn("text-right flex gap-x-2 justify-end")}>
            <span>{formatCurrency(row.original.price)}</span>
            <span className="text-gray-500 pointer-events-none">VND</span>
          </div>
        ),
        filterFn: "includesString",
        size: 150,
      },
      {
        accessorKey: "quantity",
        header: json.table.quantity,
        cell: ({ row }) => <>{row.original.quantity}</>,
        filterFn: "includesString",
        size: 150,
      },
      {
        accessorKey: "name",
        header: json.table.name,
        cell: ({ row }) => <>{row.original.name}</>,
        sortUndefined: "last",
        sortDescFirst: false,
        filterFn: "fuzzy",
        sortingFn: fuzzySort,
        size: 150,
      },
      {
        accessorKey: "note",
        header: json.table.note,
        cell: ({ row }) => <>{row.original.note}</>,
        filterFn: "includesString",
        size: 200,
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
    [formatCurrency, handleDeleteClick, handleEditClick],
  );

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
        />
      </div>

      {/* Edit Dialog */}
      {activeDialog === "edit" && (
        <Dialog
          open={activeDialog === "edit"}
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
            <Form {...editScrewForm}>
              <form
                onSubmit={handleEditSubmit}
                className="flex flex-col gap-y-4"
              >
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại phụ kiện</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={field.disabled}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn loại phụ kiện" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {screwTypes.map((type) => (
                              <TypeSelectItem key={type.id} type={type} />
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editScrewForm.control}
                    name="material"
                    disabled={isEditing}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chất liệu</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={field.disabled}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn chất liệu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {screwMaterials.map((material) => (
                              <MaterialSelectItem
                                key={material.id}
                                material={material}
                              />
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
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
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isEditing}
                    >
                      Hủy
                    </Button>
                  </DialogClose>
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
      )}

      {/* Delete Dialog */}
      {activeDialog === "delete" && (
        <Dialog
          open={activeDialog === "delete"}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa sản phẩm &quot;{currentItem?.name}
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
      )}
    </>
  );
}

// Memoized SelectItem components to prevent re-renders
const TypeSelectItem = memo(({ type }: { type: ScrewTypeDto }) => (
  <SelectItem key={type.id} value={type.name || ""}>
    {type.name}
  </SelectItem>
));
TypeSelectItem.displayName = "TypeSelectItem";

const MaterialSelectItem = memo(
  ({ material }: { material: ScrewMaterialDto }) => (
    <SelectItem key={material.id} value={material.name || ""}>
      {material.name}
    </SelectItem>
  ),
);
MaterialSelectItem.displayName = "MaterialSelectItem";
