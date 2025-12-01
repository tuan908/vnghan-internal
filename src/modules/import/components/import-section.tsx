import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/core/components/ui/card";
import Importer from "@/modules/import/components/importer";
import { TemplateInstructions } from "./template-instructions";

interface ImportSectionProps {
	type: "screw" | "customer";
	onDownloadTemplate: () => void;
}

export function ImportSection({
	type,
	onDownloadTemplate,
}: ImportSectionProps) {
	const content =
		type === "screw"
			? {
					title: "Screw Data Import",
					description:
						"Import your screw inventory data from an Excel spreadsheet",
				}
			: {
					title: "Customer Data Import",
					description:
						"Import your customer information from an Excel spreadsheet",
				};

	return (
		<>
			<Card className="mb-6 border-gray-100 shadow-sm">
				<CardHeader className="pb-2">
					<h2 className="text-xl font-semibold">{content.title}</h2>
					<CardDescription>{content.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<TemplateInstructions
						type={type}
						onDownloadTemplate={onDownloadTemplate}
					/>
				</CardContent>
			</Card>

			{/* Excel Importer */}
			<Importer type={type} />
		</>
	);
}
