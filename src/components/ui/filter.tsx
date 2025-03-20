import { Column } from "@tanstack/react-table";
import DebouncedInput from "./debounced-input";

export default function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <div className="py-2">
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Tìm kiếm trong cột"
        className="w-40 border shadow rounded px-2 py-1"
      />
    </div>
  );
}
