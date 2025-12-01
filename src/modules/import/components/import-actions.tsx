import { Button } from "@/core/components/ui/button";
import { AlertCircle, Check, Upload } from "lucide-react";

interface ImportActionsProps {
	file: File | null;
	isProcessing: boolean;
	uploadProgress: number;
	type: "screw" | "customer";
	onClear: () => void;
	onUpload: () => void;
}

export function ImportActions({
	file,
	isProcessing,
	uploadProgress,
	type,
	onClear,
	onUpload,
}: ImportActionsProps) {
	return (
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
						onClick={onClear}
						disabled={isProcessing || uploadProgress > 0}
						className="text-sm"
					>
						Clear
					</Button>
				)}

				<Button
					onClick={onUpload}
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
	);
}
