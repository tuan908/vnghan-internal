"use client";

import { Button } from "@/components/ui/button";
import { DataTable, fuzzySort } from "@/components/ui/data-table";
import DebouncedInput from "@/components/ui/debounced-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { errorToast, successToast } from "@/components/ui/toast";
import { QUERY_KEY } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { cn } from "@/lib/utils";
import { ScrewDto, ScrewSchema } from "@/lib/validations";
import { ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { RankingInfo } from "@tanstack/match-sorter-utils";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence } from "framer-motion";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ScrewForm } from "./_components/form/screw";
import { deleteScrew, editScrew, getAllScrews } from "./actions/screw";

declare module "@tanstack/react-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type HomeContentProps = {
  screwTypes: ScrewTypeDto[];
  screwMaterials: ScrewMaterialDto[];
};

type TDialogType = "edit" | "delete" | null;

export default function HomeContent({
  screwMaterials,
  screwTypes,
}: HomeContentProps) {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeDialog, setActiveDialog] = useState<TDialogType>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // Dialog state
  const [currentItem, setCurrentItem] = useState<ScrewDto | null>(null);

  const editScrewForm = useForm<ScrewDto>({
    resolver: zodResolver(ScrewSchema),
    mode: "onChange",
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

  const { data: rows, refetch } = useQuery({
    queryKey: [QUERY_KEY.SCREW],
    queryFn: () => getAllScrews(),
    placeholderData: keepPreviousData,
  });

  const handleCloseDialog = () => {
    if (hasUnsavedChanges) {
      setActiveDialog(null);
      setHasUnsavedChanges(false);
    } else {
      setActiveDialog(null);
    }
  };

  // Mutation for editing a screw info:
  const { mutate: handleEditScrewInfo, isPending: isEditingScrew } =
    useMutation({
      mutationFn: async (body: ScrewDto) => {
        return await editScrew(body);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.SCREW],
        });
        handleCloseDialog();
        successToast();
      },
      onError: (error) => errorToast(error.message),
    });

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

  // Handle delete submit
  const handleDeleteSubmit = async () => {
    const result = await deleteScrew(currentItem!);
    if (!result) {
      toast(json.error.operate);
      return;
    }

    setActiveDialog(null);

    // Refetch data if needed
    refetch();
  };

  const handleEditSubmit = editScrewForm.handleSubmit((data) => {
    handleEditScrewInfo(data);
  });

  const columns = useMemo<ColumnDef<ScrewDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => <>{row.original.name}</>,
        sortUndefined: "last", //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order),
        filterFn: "fuzzy", //using our custom fuzzy filter function
        // filterFn: fuzzyFilter, //or just define with the function
        sortingFn: fuzzySort, //sort by fuzzy rank (falls back to alphanumeric)
        size: 150,
      },
      {
        accessorKey: "price",
        header: "Giá tham khảo",
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
        header: "Số lượng",
        cell: ({ row }) => <>{row.original.quantity}</>,
        filterFn: "includesString",
        size: 150,
      },
      {
        accessorKey: "componentType",
        header: "Loại phụ kiện",
        cell: ({ row }) => <> {row.original.componentType}</>,
        filterFn: "includesString",
        size: 150,
      },
      {
        accessorKey: "material",
        header: "Chất liệu",
        cell: ({ row }) => <>{row.original.material}</>,
        filterFn: "includesString",
        size: 200,
      },

      {
        id: "actions",
        header: "Hành động",
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
    []
  );

  return (
    <>
      <div className="sm:w-1/5 relative flex items-center">
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

      <div className="h-8"></div>

      <DataTable
        columns={columns}
        data={rows?.data ?? []}
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
                  isSubmitting={isEditingScrew}
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
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteSubmit}
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
