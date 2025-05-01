"use client";

import { ValidationErrorDetail } from "@/backend/services/interfaces/import-service.interface";
import { useImportExcel } from "@/frontend/hooks/useImport";
import { QUERY_KEY } from "@/shared/constants";
import json from "@/shared/i18n/locales/vi/vi.json";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Check, FileSpreadsheet, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { CardContent } from "../../ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../ui/table";
import { errorToast, successToast } from "../../ui/toast";

type ExcelImporterProps = {
	type: "screw" | "customer";
	apiEndpoint?: string;
	queryKey: string[];
};

export default function ExcelImporter({
	type,
	queryKey = [QUERY_KEY.SCREW],
}: ExcelImporterProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const { importExcel, isProcessing } = useImportExcel();
	const [showErrorsOrWarnings, setShowErrorsOrWarnings] = useState(false);
	const [importErrors, setImportErrors] = useState<ValidationErrorDetail[]>(
		() => [],
	);

	// Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			validateAndSetFile(e.target.files[0]);
		}
	};

	// Validate file before setting
	const validateAndSetFile = (file: File) => {
		const validTypes = [
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		];

		if (!validTypes.includes(file.type)) {
			errorToast(
				"Invalid file type. Please select an Excel file (.xlsx, .xls)",
			);
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			// 10MB limit
			errorToast("File is too large. Maximum file size is 10MB.");
			return;
		}

		setFile(file);
	};

	// Handle drag events
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			validateAndSetFile(e.dataTransfer.files[0]);
		}
	};

	// Trigger file input click
	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	// Handle file removal
	const removeFile = () => {
		setFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Handle upload with progress
	const handleUpload = async () => {
		if (!file) {
			errorToast("Please select a file first");
			return;
		}

		try {
			setUploadProgress(0);
			// Simulate upload progress
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					const newProgress = prev + 10;
					return newProgress > 90 ? 90 : newProgress;
				});
			}, 300);

			// Use the provided API endpoint if available
			const result = await importExcel({ file, type });

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (!result.success) {
				console.log(result);
				setImportErrors(result?.error?.errors! as ValidationErrorDetail[]);
				setShowErrorsOrWarnings(true);
				setTimeout(() => setUploadProgress(0), 1000);
				return;
			}

			// Invalidate the appropriate query
			queryClient.invalidateQueries({ queryKey });

			// Show success message with type information
			successToast(
				`${type === "customer" ? "Customer" : "Screw"} data imported successfully`,
			);

			// Reset after successful upload
			setTimeout(() => {
				setUploadProgress(0);
				removeFile();
			}, 1500);
		} catch (error) {
			errorToast("Import failed. Please try again.");
			setUploadProgress(0);
		}
	};

	function handleOpenChange(open: boolean) {
		if (open) return;
		setShowErrorsOrWarnings(false);
	}

	const columns = useMemo(
		(): ColumnDef<{
			row: number;
			column: string;
			message: string;
			value?: any;
		}>[] => [
			{
				accessorKey: "row",
				header: json.common.row,
				cell: ({ row }) => row.original.row,
			},
			{
				accessorKey: "column",
				header: json.common.column,
				cell: ({ row }) => row.original.column,
			},
			{
				accessorKey: "message",
				header: json.common.message,
				cell: ({ row }) => row.original.message,
			},
			{
				accessorKey: "value",
				header: json.common.value,
				cell: ({ row }) => row.original.value,
			},
		],
		[],
	);

	return (
		<>
			<Dialog open={showErrorsOrWarnings} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Lỗi</DialogTitle>
					</DialogHeader>

					<CardContent>
						<Table className="w-full text-red-500 border border-collapse">
							<TableHeader>
								<TableRow>
									{[
										json.common.row,
										json.common.column,
										json.common.message,
										json.common.value,
									].map((x, id) => (
										<TableHead key={id} className="border">
											{x}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>

							<TableBody>
								{importErrors.map((row, id) => (
									<TableRow key={id}>
										<TableCell className="border">{row.row}</TableCell>
										<TableCell className="border">{row.column}</TableCell>
										<TableCell className="border">{row.message}</TableCell>
										<TableCell className="border">{row.value}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</DialogContent>
			</Dialog>

			<div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
				<h3 className="text-lg font-medium mb-4 text-gray-700">
					{type === "customer" ? "Customer" : "Screw"} Data Importer
				</h3>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept=".xlsx,.xls"
					onChange={handleFileChange}
					className="hidden"
				/>

				{/* Drag & drop area */}
				<div
					onClick={triggerFileInput}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
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
										removeFile();
									}}
									className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
									aria-label="Remove file"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{uploadProgress > 0 && (
								<div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
									<div
										className={`h-1.5 rounded-full ${
											uploadProgress === 100 ? "bg-green-500" : "bg-blue-500"
										}`}
										style={{ width: `${uploadProgress}%` }}
									></div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Action buttons */}
				<div className="flex items-center justify-between">
					<div className="text-xs text-gray-500 flex items-center">
						<AlertCircle className="w-3 h-3 mr-1" />
						Ensure your Excel file follows the required{" "}
						{type === "customer" ? "customer" : "screw"} data format
					</div>

					<div className="flex space-x-3">
						{file && (
							<Button
								variant="outline"
								onClick={removeFile}
								disabled={isProcessing || uploadProgress > 0}
								className="text-sm"
							>
								Clear
							</Button>
						)}

						<Button
							onClick={handleUpload}
							disabled={!file || isProcessing || uploadProgress > 0}
							className={`text-sm ${uploadProgress === 100 ? "bg-green-600 hover:bg-green-700" : ""}`}
						>
							{uploadProgress === 100 ? (
								<Check className="w-4 h-4 mr-1" />
							) : isProcessing || uploadProgress > 0 ? (
								<div className="w-4 h-4 mr-1 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
							) : (
								<Upload className="w-4 h-4 mr-1" />
							)}
							{uploadProgress === 100
								? "Imported"
								: isProcessing || uploadProgress > 0
									? "Processing..."
									: `Import ${type === "customer" ? "Customer" : "Screw"} Data`}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
