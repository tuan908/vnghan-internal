"use client";

import { errorToast, successToast } from "@/core/components/ui/toast";
import { customerQueryKeys } from "@/modules/customer/api";
import { useImportMutation } from "@/modules/import/api/mutations";
import { inventoryQueryKeys } from "@/modules/inventory/api/queries";
import { ValidationErrorDetail } from "@/server/services/interfaces/import-service.interface";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFileUpload } from "../hooks/use-file-upload";
import { FileUploadArea } from "./file-upload-area";
import { ImportActions } from "./import-actions";
import { ImportErrorDialog } from "./import-error-dialog";
import { ImportProgress } from "./import-progress";

type ImporterProps = {
	type: "screw" | "customer";
	apiEndpoint?: string;
};

export default function Importer({ type }: ImporterProps) {
	const queryClient = useQueryClient();
	const [uploadProgress, setUploadProgress] = useState(0);
	const { importExcel, isProcessing } = useImportMutation();
	const [showErrorsOrWarnings, setShowErrorsOrWarnings] = useState(false);
	const [importErrors, setImportErrors] = useState<ValidationErrorDetail[]>(
		() => [],
	);

	// Use the custom file upload hook
	const {
		fileInputRef,
		file,
		isDragging,
		handleFileChange,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		triggerFileInput,
		removeFile,
	} = useFileUpload();

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
			const queryKey =
				type === "customer"
					? customerQueryKeys.list()
					: inventoryQueryKeys.screwList();

			// Invalidate the appropriate query
			queryClient.invalidateQueries({
				queryKey,
			});

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

	return (
		<>
			<ImportErrorDialog
				isOpen={showErrorsOrWarnings}
				importErrors={importErrors}
				onOpenChange={handleOpenChange}
			/>

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

				{/* File Upload Area */}
				<FileUploadArea
					file={file}
					isDragging={isDragging}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={triggerFileInput}
					onRemove={removeFile}
					type={type}
				/>

				{/* Upload Progress */}
				<ImportProgress uploadProgress={uploadProgress} />

				{/* Action buttons */}
				<ImportActions
					file={file}
					isProcessing={isProcessing}
					uploadProgress={uploadProgress}
					type={type}
					onClear={removeFile}
					onUpload={handleUpload}
				/>
			</div>
		</>
	);
}
