"use client";

import { UserRoles } from "@/shared/constants";
import { cn, convertRole } from "@/shared/utils";
import { Session } from "@/shared/utils/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { deleteCookie } from "cookies-next";
import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { DropdownMenuItemWithIcon } from "../../ui/dropdown-menu";

export default function Navbar({
  sessionPromise,
}: {
  sessionPromise: Promise<Session | undefined>;
}) {
  const session = use(sessionPromise);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      redirect("/auth/signin");
    }
  }, [session]);

  const signOut = async () => {
    await deleteCookie("access_token");
    router.push("/auth/signin");
  };

  return (
    <nav className="sticky top-0 flex flex-row gap-x-4 px-8 py-2 shadow-md justify-around">
      <div className="flex-1 flex flex-row gap-x-8 items-center">
        <Link href="/">Trang chủ</Link>
        <Link href="/customers">Nhập thông tin khách hàng</Link>
      </div>

      <div className="flex items-center gap-x-4 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border-none outline-none">
              <UserCircle className="text-blue-400" size="3rem" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white">
            <DropdownMenuItemWithIcon
              icon={LogOut}
              label="Đăng xuất"
              onClick={signOut}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <div
          className={cn(
            "flex flex-col",
            session?.role === UserRoles.Administrator
              ? "text-red-400"
              : "text-blue-400",
          )}
        >
          <span>Xin chào, {session?.username}</span>
          <span>{convertRole(session?.role)}</span>
        </div>
      </div>
    </nav>
  );
}
