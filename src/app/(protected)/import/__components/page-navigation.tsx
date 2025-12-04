import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function PageNavigation() {
	return (
		<Link
			href="/"
			className="flex gap-x-2 items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
		>
			<ChevronLeft size={20} />
			<span>Về trang chủ</span>
		</Link>
	);
}
