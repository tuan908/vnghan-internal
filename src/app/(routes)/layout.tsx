import Navbar from "@/frontend/components/features/navbar";
import { getSession } from "@/shared/utils/session";
import { PropsWithChildren } from "react";

export default async function Layout(props: PropsWithChildren) {
  const sessionPromise = getSession();
  return (
    <>
      <Navbar sessionPromise={sessionPromise} />
      {props.children}
    </>
  );
}
