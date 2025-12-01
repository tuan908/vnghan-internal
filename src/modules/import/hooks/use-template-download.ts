export function useTemplateDownload() {
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
		const url = `/api/templates?type=screw`;
		downloadFile(url, "screw-template.xlsx");
	};

	// Call this for Customer template
	const downloadCustomerTemplate = () => {
		const url = `/api/templates?type=customer`;
		downloadFile(url, "customer-template.xlsx");
	};

	return {
		downloadScrewTemplate,
		downloadCustomerTemplate,
	};
}
