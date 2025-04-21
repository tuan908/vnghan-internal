import Navbar from "@/frontend/components/features/navbar";
import { getSession } from "@/shared/utils/session";
import { deleteCookie } from "cookies-next";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout(props: PropsWithChildren) {
  const sessionPromise = getSession();

  const session = await sessionPromise;

  if (!session) {
    deleteCookie("access_token");
    redirect("/auth/signin");
  }
  return (
    <>
      <Navbar sessionPromise={sessionPromise} />
      {props.children}
    </>
  );
}
