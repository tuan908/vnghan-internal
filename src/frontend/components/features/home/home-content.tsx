"use client";

import { Button } from "@/frontend/components/ui/button";
import { DataTable, fuzzySort } from "@/frontend/components/ui/data-table";
import DebouncedInput from "@/frontend/components/ui/debounced-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Form } from "@/frontend/components/ui/form";
import { useDeleteScrew } from "@/frontend/hooks/useDeleteScrew";
import { useEditScrew } from "@/frontend/hooks/useEditScrew";
import { useGetScrewMaterials } from "@/frontend/hooks/useGetScrewMaterials";
import { useGetScrews } from "@/frontend/hooks/useGetScrews";
import { useGetScrewTypes } from "@/frontend/hooks/useGetScrewTypes";
import json from "@/shared/i18n/locales/vi/vi.json";
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
import { AnimatePresence } from "framer-motion";
import { Pencil, Search, Trash2 } from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrewForm } from "./form/screw";

declare module "@tanstack/react-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type DialogType = "edit" | "delete" | null;

export default function HomeContent() {
  const { screwTypes } = useGetScrewTypes();
  const { screwMaterials } = useGetScrewMaterials();
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // Dialog state
  const [currentItem, setCurrentItem] = useState<ScrewDto | null>(null);

  const editScrewForm = useForm<ScrewDto>({
    resolver: zodResolver(ScrewSchema),
    defaultValues: {
      category: "",
      name: "",
      note: "",
      price: "",
      quantity: "",
      size: "",
      componentType: "",
      material: "",
    },
  });

  // Track form changes
  useEffect(() => {
    const subscription = editScrewForm.watch(() => {
      if (activeDialog === "edit") {
        setHasUnsavedChanges(editScrewForm.formState.isDirty);
      }
    });
    return () => subscription.unsubscribe();
  }, [editScrewForm, activeDialog]);

  const { screws: rows } = useGetScrews();

  const handleCloseDialog = () => {
    if (hasUnsavedChanges) {
      setActiveDialog(null);
      setHasUnsavedChanges(false);
    } else {
      setActiveDialog(null);
    }
  };

  const { deleteScrew, isDeleting } = useDeleteScrew();
  const { editScrew, isEditing } = useEditScrew();

  // Handle edit dialog
  const handleEditClick = (item: ScrewDto) => {
    setCurrentItem(item);
    setActiveDialog("edit");
  };

  // Handle delete dialog
  const handleDeleteClick = (item: ScrewDto) => {
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

  // Handle edit submit
  const handleEditSubmit = editScrewForm.handleSubmit(async (data) => {
    await editScrew(data);
    reset();
  });

  const handleDeleteScrew = async () => {
    if (currentItem) {
      await deleteScrew(currentItem);
      reset();
    }
  };

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
            <span>{row.original.price}</span>
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
        sortUndefined: "last", //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order),
        filterFn: "fuzzy", //using our custom fuzzy filter function
        // filterFn: fuzzyFilter, //or just define with the function
        sortingFn: fuzzySort, //sort by fuzzy rank (falls back to alphanumeric)
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
            <button onMouseDown={() => handleEditClick(row.original)}>
              <Pencil className="h-5 w-5 text-blue-400 hover:text-blue-300" />
            </button>
            <button onMouseDown={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-5 w-5 text-red-400 hover:text-red-300" />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [],
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
              <Form {...editScrewForm}>
                <ScrewForm
                  mode="edit"
                  onSubmit={handleEditSubmit}
                  isSubmitting={isEditing}
                  screwTypes={screwTypes}
                  screwMaterials={screwMaterials}
                  screw={currentItem!}
                />
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
        ) : null}
      </AnimatePresence>
    </>
  );
}
