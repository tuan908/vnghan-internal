import React from "react";

/**
 * Table Loading Skeleton - Matches DataTable component structure
 * Shows animated placeholder rows during initial loading
 */
const LoadingSkeleton = React.memo(() => {
	return (
		<div className="w-full">
			<div className="h-96 md:h-156 overflow-y-auto">
				<table className="w-full border-none border-collapse relative z-10">
					<thead className="relative">
						<tr>
							{/* Header cells */}
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${75 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
								</div>
							</th>
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${150 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
								</div>
							</th>
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${150 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
								</div>
							</th>
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${150 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
								</div>
							</th>
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${150 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
								</div>
							</th>
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${200 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
								</div>
							</th>
							<th
								scope="col"
								colSpan={1}
								className="sticky top-0 z-9999 bg-slate-100 border-none p-2 text-center border-r"
								style={{ width: `${100 / 16}rem` }}
							>
								<div className="flex gap-y-2 justify-center items-center">
									<div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{/* Skeleton Rows - matching DataTable structure */}
						{Array.from({ length: 8 }).map((_, rowIndex) => (
							<tr key={`skeleton-${rowIndex}`} className="border-b">
								{/* ID column */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
								</td>
								{/* Component Type */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
								</td>
								{/* Price */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="h-8 bg-gray-200 rounded animate-pulse"></div>
								</td>
								{/* Quantity */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
								</td>
								{/* Name */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
								</td>
								{/* Note */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
								</td>
								{/* Actions */}
								<td className="z-0 px-2 min-w-0 md:max-w-16 text-sm border-r">
									<div className="flex gap-x-6 justify-center items-center h-full">
										<div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
});

LoadingSkeleton.displayName = "LoadingSkeleton";

export { LoadingSkeleton };

