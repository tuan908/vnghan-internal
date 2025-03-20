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
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingFn,
  sortingFns,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "./button";
import Filter from "./filter";
import { Input } from "./input";
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
  globalFilter: string;
  setGlobalFilter: OnChangeFn<string>;
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
  globalFilter,
  setGlobalFilter,
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
      globalFilter,
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
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    onGlobalFilterChange: setGlobalFilter,
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
                <TableHead key={header.id} className="w-8 text">
                  {header.isPlaceholder ? null : (
                    <>
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
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter column={header.column} />
                        </div>
                      ) : null}
                    </>
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
      <div className="w-full flex items-center justify-end p-4 gap-x-6">
        <span className="flex items-center gap-x-3">
          <span>Chuyển tới trang:</span>
          <Input
            className="w-12"
            type="text"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
          />
        </span>

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

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};
