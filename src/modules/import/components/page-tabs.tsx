import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/core/components/ui/tabs";
import { Settings, Users } from "lucide-react";
import { ImportSection } from "./import-section";

interface PageTabsProps {
	importType: "screw" | "customer";
	onTabChange: (value: "screw" | "customer") => void;
	onDownloadScrewTemplate: () => void;
	onDownloadCustomerTemplate: () => void;
}

export function PageTabs({
	importType,
	onTabChange,
	onDownloadScrewTemplate,
	onDownloadCustomerTemplate,
}: PageTabsProps) {
	return (
		<Tabs
			defaultValue="screw"
			value={importType}
			onValueChange={(value) => onTabChange(value as "screw" | "customer")}
			className="max-w-4xl"
		>
			<TabsList className="grid grid-cols-2 mb-8">
				<TabsTrigger value="screw" className="flex items-center gap-2">
					<Settings size={16} />
					<span>Import Screws</span>
				</TabsTrigger>
				<TabsTrigger value="customer" className="flex items-center gap-2">
					<Users size={16} />
					<span>Import Customers</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="screw">
				<ImportSection
					type="screw"
					onDownloadTemplate={onDownloadScrewTemplate}
				/>
			</TabsContent>

			<TabsContent value="customer">
				<ImportSection
					type="customer"
					onDownloadTemplate={onDownloadCustomerTemplate}
				/>
			</TabsContent>
		</Tabs>
	);
}
