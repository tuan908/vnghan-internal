import { errorToast } from "@/core/components/ui/toast";
import { useRef, useState } from "react";

interface UseFileUploadReturn {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	file: File | null;
	isDragging: boolean;
	setIsDragging: (isDragging: boolean) => void;
	validateAndSetFile: (file: File) => void;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	triggerFileInput: () => void;
	removeFile: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);

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

	// Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			validateAndSetFile(e.target.files[0]);
		}
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

	return {
		fileInputRef,
		file,
		isDragging,
		setIsDragging,
		validateAndSetFile,
		handleFileChange,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		triggerFileInput,
		removeFile,
	};
}
