import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex min-screen justify-center items-center">
			<h1 className="text-3xl text-center">Về trang chủ</h1>
			<Link href="/">Về trang chủ</Link>
		</main>
	);
}
