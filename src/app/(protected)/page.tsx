import { api } from "@/server/client";
import { AddOptionDropdown } from "./__components/add-option";
import { ExportOptionDropdown } from "./__components/export-option";
import HomeContent from "./__components/home-content";

export default function Home() {
	const downloadUrl = api.export.screws.$url().toString();

	return (
		<main className="flex w-24/25 m-auto flex-col">
			<h1 className="w-full m-auto text-xl md:text-3xl font-bold py-2">
				Danh sách phụ kiện
			</h1>
			<div className="w-full m-auto flex justify-center md:justify-end gap-x-2 md:gap-x-4 py-4">
				<AddOptionDropdown />
				<ExportOptionDropdown downloadUrl={downloadUrl} />
			</div>

			<HomeContent />
		</main>
	);
}
