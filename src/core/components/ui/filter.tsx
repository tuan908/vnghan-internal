import { Column } from "@tanstack/react-table";
import React from "react";
import DebouncedInput from "./debounced-input";

// FAANG-standard memoized filter with comprehensive debugging
const MemoizedFilter = React.memo(
	function Filter({ column }: { column: Column<any, unknown> }) {
		const columnFilterValue = column.getFilterValue();

		// FAANG debugging: Detail component re-renders
		console.log(`🎯 Filter rendered for column: ${column.id}`);
		console.log(`   Filter value: '${columnFilterValue}'`);
		console.log(
			`   Component instance: ${(column as any)._filterComponentId || "new"}`,
		);

		// Track render causes in stack trace
		if (process.env.NODE_ENV === "development") {
			const stack = new Error().stack?.split("\n")[2];
			console.log(`   Called from: ${stack?.substring(0, 100)}`);
		}

		return (
			<>
				<DebouncedInput
					type="text"
					value={(columnFilterValue ?? "") as string}
					onChange={(value) => {
						console.log(
							`🔄 Setting filter for column ${column.id}: '${value}'`,
						);
						const startTime = performance.now();
						column.setFilterValue(value);
						const endTime = performance.now();
						console.log(
							`⏱️ Filter value change took ${(endTime - startTime).toFixed(3)}ms`,
						);
					}}
					placeholder="Tìm kiếm trong cột"
					className="w-40 border shadow rounded px-2 py-1 bg-white text-xs"
				/>
			</>
		);
	},
	// Custom comparison function since column references are unstable
	(prevProps, nextProps) => {
		// Cache comparison result for debugging
		const sameId = prevProps.column.id === nextProps.column.id;
		const sameValue =
			prevProps.column.getFilterValue() === nextProps.column.getFilterValue();

		const shouldSkip = sameId && sameValue;

		// Debug why memo is failing
		if (!shouldSkip && process.env.NODE_ENV === "development") {
			console.log(
				`⚠️ Filter memo check failed for column ${nextProps.column.id}:`,
			);
			console.log(`   ID same: ${sameId}, Value same: ${sameValue}`);
			console.log(`   Prev value: '${prevProps.column.getFilterValue()}'`);
			console.log(`   Next value: '${nextProps.column.getFilterValue()}'`);
		}

		return shouldSkip;
	},
);

MemoizedFilter.displayName = "MemoizedFilter";

// Export stable reference to prevent parent re-renders
export default MemoizedFilter;
