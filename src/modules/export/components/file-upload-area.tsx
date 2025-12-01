import { FileSpreadsheet, Upload, X } from "lucide-react";
import type React from "react";

interface FileUploadAreaProps {
	file: File | null;
	isDragging: boolean;
	onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	onClick: () => void;
	onRemove: () => void;
	type: "screw" | "customer";
}

export function FileUploadArea({
	file,
	isDragging,
	onDragOver,
	onDragLeave,
	onDrop,
	onClick,
	onRemove,
	type,
}: FileUploadAreaProps) {
	return (
		<div
			onClick={!file ? onClick : undefined}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			className={`
        border-2 border-dashed rounded-lg p-8
        transition-all duration-200 ease-in-out
        flex flex-col items-center justify-center
        cursor-pointer mb-4
        ${
					isDragging
						? "border-blue-500 bg-blue-50"
						: file
							? "border-green-400 bg-green-50"
							: "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
				}
      `}
		>
			{!file ? (
				<>
					<div className="mb-3">
						<Upload className="w-12 h-12 text-gray-400" />
					</div>
					<p className="text-sm font-medium text-gray-600 mb-1">
						{isDragging
							? "Drop your Excel file here"
							: "Drag & drop your Excel file here"}
					</p>
					<p className="text-xs text-gray-500">or click to browse</p>
					<p className="text-xs text-gray-400 mt-2">
						Supports .xlsx, .xls (max 10MB)
						{type === "customer"
							? " - Customer data format"
							: " - Screw data format"}
					</p>
				</>
			) : (
				<div className="w-full">
					<div className="flex items-center mb-3">
						<FileSpreadsheet className="w-8 h-8 text-green-500 mr-3" />
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-700 truncate">
								{file.name}
							</p>
							<p className="text-xs text-gray-500">
								{(file.size / 1024).toFixed(1)} KB
							</p>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
							className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
							aria-label="Remove file"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
