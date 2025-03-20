"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationInfo } from "@/types";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "./button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

type DataTableProps<TData> = {
  columns: any;
  data: TData[];
  onRowClick?: (row: TData) => void;
  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  serverPagination?: PaginationInfo;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  columnVisibility: VisibilityState;
  setColumnVisibility: OnChangeFn<VisibilityState>;
  rowSelection: RowSelectionState;
  setRowSelection: OnChangeFn<RowSelectionState>;
};

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  pagination,
  setPagination,
  serverPagination,
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  rowSelection,
  setRowSelection,
  sorting,
  setSorting,
}: DataTableProps<TData>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    rowCount: serverPagination ? serverPagination.totalItems : 0,
    manualPagination: true,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    debugTable: process.env.NODE_ENV !== "production",
  });

  const renderPaginationButtons = () => {
    const currentPage = pagination.pageIndex;
    const totalPages = table.getPageCount();
    const maxVisiblePages = 2; // Number of page buttons to show at once

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    const pages = [];

    // First page
    if (startPage > 0) {
      pages.push(
        <PaginationItem key="page-first">
          <Button
            onClick={() => setPagination({ ...pagination, pageIndex: 0 })}
            variant={currentPage === 0 ? "default" : "outline"}
          >
            1
          </Button>
        </PaginationItem>
      );

      // Add ellipsis if not directly after first page
      if (startPage > 1) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis
              onClick={() => {
                const newPage = Math.max(0, currentPage - maxVisiblePages);
                setPagination({ ...pagination, pageIndex: newPage });
              }}
              className="cursor-pointer"
            />
          </PaginationItem>
        );
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={`page-${i}`}>
          <Button
            onClick={() => setPagination({ ...pagination, pageIndex: i })}
            variant={currentPage === i ? "default" : "outline"}
          >
            {i + 1}
          </Button>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < totalPages - 1) {
      // Add ellipsis if not directly before last page
      if (endPage < totalPages - 2) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis
              onClick={() => {
                const newPage = Math.min(
                  totalPages - 1,
                  currentPage + maxVisiblePages
                );
                setPagination({ ...pagination, pageIndex: newPage });
              }}
              className="cursor-pointer"
            />
          </PaginationItem>
        );
      }

      pages.push(
        <PaginationItem key="page-last">
          <Button
            onClick={() =>
              setPagination({ ...pagination, pageIndex: totalPages - 1 })
            }
            variant={currentPage === totalPages - 1 ? "default" : "outline"}
          >
            {totalPages}
          </Button>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="h-[800px] w-full rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                            ? "Sort descending"
                            : "Clear sort"
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onMouseDown={() => onRowClick?.(row.original)}
                className="cursor-pointer hover:bg-slate-100"
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="w-full flex justify-end p-4">
        <div className="lg:w-1/3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  isActive={!table.getCanPreviousPage()}
                />
              </PaginationItem>
              {renderPaginationButtons()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  isActive={!table.getCanNextPage()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
