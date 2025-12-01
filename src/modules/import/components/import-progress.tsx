interface ImportProgressProps {
	uploadProgress: number;
}

export function ImportProgress({ uploadProgress }: ImportProgressProps) {
	if (uploadProgress <= 0) return null;

	return (
		<div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
			<div
				className={`h-1.5 rounded-full ${
					uploadProgress === 100 ? "bg-green-500" : "bg-blue-500"
				}`}
				style={{ width: `${uploadProgress}%` }}
			></div>
		</div>
	);
}
