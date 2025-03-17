"use client";

import { DataTable } from "@/components/ui/data-table";
import { CSS_TEXT_ELLIPSIS, PAGE_SIZE } from "@/constants";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type ScrewDto = Partial<{
  name: string;
  quantity: string;
  category: string;
  material: string;
  features: string;
  price: string;
  notes: string;
}>;

export default function HomeContent() {
  const router = useRouter();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data: rows, isPending: isLoadingScrews } = useQuery({
    queryKey: ["get-screws", pagination],
    queryFn: async () => {
      const res = await client.screw.getAll.$get({
        pageNumber: pagination.pageIndex,
      });
      return await res.json();
    },
    placeholderData: keepPreviousData,
  });

  const [columnFilters, setColumnFilters] = useState();
  const [columnOrder, setColumnOrder] = useState();

  const columns: ColumnDef<ScrewDto>[] = useMemo(
    () => [
      {
        ancessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.name}
          </div>
        ),
      },
      {
        ancessorKey: "quantity",
        header: "Số lượng",
        cell: ({ row }) => (
          <div className="text-right">{row.original.quantity}</div>
        ),
      },
      {
        ancessorKey: "category",
        header: "Loại xe",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.category}
          </div>
        ),
      },
      {
        ancessorKey: "material",
        header: "Chất liệu",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.material}
          </div>
        ),
      },
      {
        ancessorKey: "features",
        header: "Tính năng",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.features}
          </div>
        ),
      },
      {
        ancessorKey: "price",
        header: "Giá tiền",
        cell: ({ row }) => (
          <div className={cn("w-32", CSS_TEXT_ELLIPSIS)}>
            {row.original.price} VND
          </div>
        ),
      },
      {
        ancessorKey: "notes",
        header: "Lưu ý",
        cell: ({ row }) => (
          <div className={cn("w-44", CSS_TEXT_ELLIPSIS)}>
            {row.original.notes}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={rows?.data?.data ?? []}
      serverPagination={rows?.data?.pagination}
      pagination={pagination}
      setPagination={setPagination}
      onRowClick={(row) => router.push(`/screws/${row.name}`)}
    />
  );
}
