import { Button } from "@/core/components/ui/button";
import { Download } from "lucide-react";

interface TemplateInstructionsProps {
	type: "screw" | "customer";
	onDownloadTemplate: () => void;
}

export function TemplateInstructions({
	type,
	onDownloadTemplate,
}: TemplateInstructionsProps) {
	const instructions =
		type === "screw"
			? {
					title: "Template Format",
					columns: [
						"Column A: Product",
						"Column B: Description",
						"Column C: Size (mm)",
						"Column D: Material",
						"Column E: Quantity",
						"Column F: Price",
					],
				}
			: {
					title: "Template Format",
					columns: [
						"Column A: Tên khách hàng",
						"Column B: SĐT",
						"Column C: Địa chỉ",
						"Column D: Nền tàng",
						"Column E: Nhu cầu",
						"Column F: Tiền",
						"Column G: Thời gian nhắn lại",
					],
				};

	return (
		<div className="mb-6 flex items-center justify-between">
			<div className="space-y-2">
				<h3 className="text-sm font-medium">{instructions.title}</h3>
				<ul className="text-xs text-gray-500 space-y-1">
					{instructions.columns.map((column, index) => (
						<li key={index}>• {column}</li>
					))}
				</ul>
			</div>
			<Button variant="outline" onClick={onDownloadTemplate} className="h-9">
				<Download size={16} className="mr-2" />
				Download Template
			</Button>
		</div>
	);
}
