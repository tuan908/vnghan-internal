"use client";

import { CSS_TEXT_ELLIPSIS } from "@/shared/constants";
import { cn } from "@/shared/utils";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import {
  ColumnFiltersState,
  FilterFn,
  OnChangeFn,
  RowSelectionState,
  SortingFn,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import Filter from "./filter";

/** Your existing DataTable props, plus some columns, data, etc. */
type DataTableProps<TData> = {
  columns: any;
  data: TData[];
  onRowClick?: (row: TData) => void;
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
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  rowSelection,
  setRowSelection,
  globalFilter,
  setGlobalFilter,
}: DataTableProps<TData>) {
  const table = useReactTable({
    columns,
    data,
    rowCount: data.length,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: "fuzzy",
    debugTable: process.env.NODE_ENV !== "production",
  });

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20, // approximate row height
    overscan: 150, // number of extra rows to render outside viewport
  });

  return (
    <div ref={parentRef} className="w-[90%]">
      <div className="h-[384px] md:h-156 overflow-y-auto">
        <table className="w-full border-none border-collapse relative z-10">
          <thead className="relative">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      scope="col"
                      key={header.id}
                      colSpan={header.colSpan}
                      className="sticky top-0 z-[9999] bg-slate-100 border-none p-2 text-center"
                      style={{
                        width: `${header.getSize() / 16}rem`,
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            {...{
                              className: cn(
                                "flex gap-y-2 justify-center items-center",
                                header.column.getCanSort() &&
                                  "cursor-pointer select-none",
                              ),
                              onClick: header.column.getToggleSortingHandler(),
                              style: {
                                zIndex: 9999,
                              },
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>

                          {header.column.getCanFilter() ? (
                            <div className="z-9999">
                              <Filter column={header.column} />
                            </div>
                          ) : null}
                        </>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().map((virtualRow, index) => {
              const row = rows[virtualRow.index]!;
              return (
                <tr
                  className="border-b"
                  key={row.id}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${
                      virtualRow.start - index * virtualRow.size
                    }px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "z-0 px-2 min-w-0 md:max-w-16",
                          CSS_TEXT_ELLIPSIS,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Custom fuzzy filter
export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

// Custom fuzzy sort
export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!,
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};
