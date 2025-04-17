"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function procesingLogin(access_token: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", access_token);
  redirect("/");
}
