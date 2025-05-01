"use client";

import ExcelImporter from "@/frontend/components/features/excel/excel-importer";
import { Button } from "@/frontend/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/frontend/components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/frontend/components/ui/tabs";
import { ChevronLeft, Download, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ImportPage() {
	const [importType, setImportType] = useState<"screw" | "customer">("screw");

	// Trigger browser download using a hidden <a> element
	const downloadFile = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Call this for Screw template
	const downloadScrewTemplate = () => {
		const url = `/api/v1/templates?type=screw`;
		downloadFile(url, "screw-template.xlsx");
	};

	// Call this for Customer template
	const downloadCustomerTemplate = () => {
		const url = `/api/v1/templates?type=customer`;
		downloadFile(url, "customer-template.xlsx");
	};

	return (
		<main className="container mx-auto py-8 px-4">
			{/* Navigation */}
			<Link
				href="/"
				className="flex gap-x-2 items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
			>
				<ChevronLeft size={20} />
				<span>Về trang chủ</span>
			</Link>

			{/* Page Title */}
			{/* <h1 className="text-3xl font-bold mb-8 text-gray-800">Excel Data Import</h1> */}

			{/* Tabs Interface */}
			<Tabs
				defaultValue="screw"
				value={importType}
				onValueChange={(value) => setImportType(value as "screw" | "customer")}
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
					<Card className="mb-6 border-gray-100 shadow-sm">
						<CardHeader className="pb-2">
							<h2 className="text-xl font-semibold">Screw Data Import</h2>
							<CardDescription>
								Import your screw inventory data from an Excel spreadsheet
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="mb-6 flex items-center justify-between">
								<div className="space-y-2">
									<h3 className="text-sm font-medium">Template Format</h3>
									<ul className="text-xs text-gray-500 space-y-1">
										<li>• Column A: Product </li>
										<li>• Column B: Description</li>
										<li>• Column C: Size (mm)</li>
										<li>• Column D: Material</li>
										<li>• Column E: Quantity</li>
										<li>• Column F: Price</li>
									</ul>
								</div>
								<Button
									variant="outline"
									onClick={downloadScrewTemplate}
									className="h-9"
								>
									<Download size={16} className="mr-2" />
									Download Template
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Excel Importer for Screws */}
					<ExcelImporter
						type="screw"
						apiEndpoint="/api/import/screws"
						queryKey={["SCREW"]}
					/>
				</TabsContent>

				<TabsContent value="customer">
					<Card className="mb-6 border-gray-100 shadow-sm">
						<CardHeader className="pb-2">
							<h2 className="text-xl font-semibold">Customer Data Import</h2>
							<CardDescription>
								Import your customer information from an Excel spreadsheet
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="mb-6 flex items-center justify-between">
								<div className="space-y-2">
									<h3 className="text-sm font-medium">Template Format</h3>
									<ul className="text-xs text-gray-500 space-y-1">
										<li>• Column A: Tên khách hàng</li>
										<li>• Column B: SĐT</li>
										<li>• Column C: Địa chỉ</li>
										<li>• Column D: Nền tàng</li>
										<li>• Column E: Nhu cầu</li>
										<li>• Column F: Tiền</li>
										<li>• Column G: Thời gian nhắn lại</li>
									</ul>
								</div>
								<Button
									variant="outline"
									onClick={downloadCustomerTemplate}
									className="h-9"
								>
									<Download size={16} className="mr-2" />
									Download Template
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Excel Importer for Customers */}
					<ExcelImporter
						type="customer"
						apiEndpoint="/api/import/customers"
						queryKey={["CUSTOMER"]}
					/>
				</TabsContent>
			</Tabs>
		</main>
	);
}
