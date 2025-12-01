"use client";

import { PageNavigation } from "@/modules/import/components/page-navigation";
import { PageTabs } from "@/modules/import/components/page-tabs";
import { useTemplateDownload } from "@/modules/import/hooks/use-template-download";
import { useState } from "react";

export default function ImportPage() {
	const [importType, setImportType] = useState<"screw" | "customer">("screw");

	// Use the template download hook
	const { downloadScrewTemplate, downloadCustomerTemplate } =
		useTemplateDownload();

	return (
		<main className="container mx-auto py-8 px-4">
			{/* Navigation */}
			<PageNavigation />

			{/* Page Title */}
			{/* <h1 className="text-3xl font-bold mb-8 text-gray-800">Excel Data Import</h1> */}

			{/* Tabs Interface */}
			<PageTabs
				importType={importType}
				onTabChange={setImportType}
				onDownloadScrewTemplate={downloadScrewTemplate}
				onDownloadCustomerTemplate={downloadCustomerTemplate}
			/>
		</main>
	);
}
