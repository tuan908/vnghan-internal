"use client";

import { UserRoles } from "@/shared/constants";
import { cn, convertRole, RoleUtils } from "@/shared/utils";
import type { Session } from "@/shared/utils/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { deleteCookie } from "cookies-next";
import { LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import {
  DropdownMenuItemWithIcon,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { AdminConfigPanel } from "../admin/admin-config-panel";

const ROUTES = [
  { pathname: "/", name: "Trang chủ" },
  { pathname: "/customers", name: "Thông tin khách hàng" },
  { pathname: "/import", name: "Nhập liệu từ file" },
];

export default function Navbar({
  sessionPromise,
}: {
  sessionPromise: Promise<Session | undefined>;
}) {
  const session = use(sessionPromise);
  const router = useRouter();
  const pathname = usePathname();
  const [adminConfigOpen, setAdminConfigOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!session) {
      redirect("/auth/signin");
    }
  }, [session]);

  const isAdmin = useMemo(() => RoleUtils.isAdmin(session?.role), []);

  const signOut = async () => {
    await deleteCookie("access_token");
    router.push("/auth/signin");
  };

  return (
    <nav className="sticky top-0 flex flex-row gap-x-4 px-8 py-2 shadow-md justify-around">
      <div className="flex-1 flex flex-row gap-x-8 items-center">
        {ROUTES.map((x, index) => (
          <Link
            key={`${x}-${index}`}
            href={x.pathname}
            className={cn(pathname === x.pathname && "text-red-400")}
          >
            {x.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-x-4 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border-none outline-none">
              <UserCircle className="text-blue-400" size="3rem" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white">
            {!isAdmin ? null : (
              <DropdownMenuItemWithIcon
                icon={Settings}
                label="Cài đặt"
                onClick={() => setAdminConfigOpen(true)}
              />
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItemWithIcon
              icon={LogOut}
              label="Đăng xuất"
              onClick={signOut}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        {isAdmin && (
          <AdminConfigPanel
            open={adminConfigOpen}
            onOpenChange={setAdminConfigOpen}
          />
        )}

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
