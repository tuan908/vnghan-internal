import { decrypt, Session } from "@/core/utils/session";
import { NextResponse, type NextRequest } from "next/server";
import { tryCatch } from "./core/utils";

export const config = {
	matcher: ["/", "/import", "/customers"],
};

export async function proxy(request: NextRequest) {
	const accessTokenCookie = request.cookies.get("access_token");
	const LOGIN_ROUTE = "/auth/signin";

	if (!accessTokenCookie) {
		return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
	}

	const currentPath = request.nextUrl.pathname;

	// Create login URL with redirect parameter
	const loginUrl = new URL(LOGIN_ROUTE, request.url);
	loginUrl.searchParams.set("from", currentPath);

	// Try to get valid token if session exists
	let tokenPayload: Session | undefined = undefined;

	if (accessTokenCookie) {
		const { data } = await tryCatch(decrypt(accessTokenCookie.value));
		if (data) {
			tokenPayload = data;
		}
	}

	// Redirect to login if no valid session
	if (!tokenPayload) {
		return NextResponse.redirect(loginUrl);
	}

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("Authorization", `Bearer ${accessTokenCookie.value}`);
	requestHeaders.set("Accept", "application/json");
	requestHeaders.set("Content-Type", "application/json");

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}
