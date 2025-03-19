"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
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
import { CSS_TEXT_ELLIPSIS, PAGE_SIZE } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { ScrewDto, ScrewSchema } from "@/lib/validations";
import { ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ScrewForm } from "./_components/form/screw";

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [activeDialog, setActiveDialog] = useState<TDialogType>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    queryKey: ["get-screws", pagination.pageIndex],
    queryFn: async () => {
      const res = await client.screw.getAll.$get({
        pageNumber: pagination.pageIndex,
      });
      return await res.json();
    },
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
  const { mutate: editScrew, isPending: isEditingScrew } = useMutation({
    mutationFn: async (body: ScrewDto) => {
      const res = await client.screw.update.$post({ body });
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["get-screws", pagination.pageIndex],
      });
      handleCloseDialog();
      successToast();
    },
    onError: (error) => errorToast(error.message),
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Dialog state
  const [currentItem, setCurrentItem] = useState<ScrewDto | null>(null);

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
    const result = await client.screw.delete.$post({ body: currentItem! });
    if (!result.ok) {
      toast(json.error.operate);
      return;
    }

    setActiveDialog(null);

    // Refetch data if needed
    refetch();
  };

  const handleEditScrew = editScrewForm.handleSubmit((data) => {
    editScrew(data);
  });

  const columns: ColumnDef<ScrewDto>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.name}
          </div>
        ),
        sortUndefined: "last", //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
      {
        accessorKey: "quantity",
        header: "Số lượng",
        cell: ({ row }) => (
          <>{row.original.quantity}</>
        ),
      },
      {
        accessorKey: "componentType",
        header: "Loại phụ kiện",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.componentType}
          </div>
        ),
      },
      {
        accessorKey: "material",
        header: "Chất liệu",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.material}
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Giá tham khảo",
        cell: ({ row }) => (
          <div className={cn("w-32 text-right", CSS_TEXT_ELLIPSIS)}>
            {row.original.price} VND
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: "Lưu ý",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.note}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
          <div className={cn("w-24 flex gap-x-6 items-center")}>
            <button onMouseDown={() => handleEditClick(row.original)}>
              <Pencil className="h-5 w-5 text-blue-400 hover:text-blue-300" />
            </button>
            <button onMouseDown={() => handleDeleteClick(row.original)}>
              <Trash2 className="h-5 w-5 text-red-400 hover:text-red-300" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={rows?.data?.data ?? []}
        serverPagination={rows?.data?.pagination}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
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
                  onSubmit={handleEditScrew}
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
                  Bạn có chắc chắn muốn xóa sản phẩm "{currentItem?.name}"?
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
