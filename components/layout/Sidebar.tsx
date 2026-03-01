"use client";

import { avatarPlaceholderUrl, navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import CreateNew from "@/components/templates/CreateNew";
import { useEffect } from "react";
// REMOVE: import FolderTree from "@/components/navigation/FolderTree";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
  type: string;
  ownerId: string;
  accountId: string;
  role: "admin" | "user";
}

const Sidebar = ({
  fullName,
  avatar,
  email,
  type,
  ownerId,
  accountId,
  role,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const folderMatch = pathname.match(/^\/folders\/([^/]+)/);
  const parentFolderId = folderMatch ? folderMatch[1] : null;
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoadingUrl(null);
  }, [pathname]);

  return (
    <aside className="sidebar remove-scrollbar">
      <Link href="/dashboard">
        <Image
          src="/assets/images/logo-full-brand.png"
          alt="logo"
          width={160}
          height={50}
          className="hidden h-auto lg:block"
        />

        <Image
          src="/assets/images/logo.gif"
          alt="logo"
          width={52}
          height={52}
          unoptimized
          className="lg:hidden"
        />
      </Link>

      <nav className="sidebar-nav h5">
        <CreateNew currentPath={pathname} parentFolderId={parentFolderId} />

        {/* REMOVE: <FolderTree currentFolderId={parentFolderId} /> */}

        <ul className="flex flex-col flex-1 gap-6 ">
          {navItems.map(({ url, name, icon }) => {
            return (
              <div
                key={name}
                className="lg:w-full cursor-pointer"
                onClick={() => {
                  if (pathname !== url) {
                    setLoadingUrl(url);
                    router.push(url);
                  }
                }}
              >
                <li
                  className={cn(
                    "sidebar-nav-item h5",
                    pathname === url && "shad-active",
                  )}
                >
                  <Image
                    src={loadingUrl === url ? "/assets/icons/loader.svg" : icon}
                    alt={name}
                    width={24}
                    height={24}
                    className={cn(
                      "nav-icon",
                      pathname === url && "nav-icon-active",
                      loadingUrl === url && "animate-spin",
                    )}
                  />
                  <p className="lg:block hidden">{name}</p>
                </li>
              </div>
            );
          })}
          {role === "admin" && (
            <div
              className="lg:w-full cursor-pointer"
              onClick={() => {
                if (pathname !== "/manage-users") {
                  setLoadingUrl("/manage-users");
                  router.push("/manage-users");
                }
              }}
            >
              <li
                className={cn(
                  "sidebar-nav-item h5",
                  pathname === "/manage-users" && "shad-active",
                )}
              >
                <Image
                  src={
                    loadingUrl === "/manage-users"
                      ? "/assets/icons/loader.svg"
                      : "/assets/icons/manage-users.png"
                  }
                  alt="Manage Users"
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon",
                    pathname === "/manage-users" && "nav-icon-active",
                    loadingUrl === "/manage-users" && "animate-spin",
                  )}
                />
                <p className="lg:block hidden">Manage Users</p>
              </li>
            </div>
          )}
        </ul>
      </nav>

      <div className="sidebar-user-info">
        <Image
          src={avatarPlaceholderUrl}
          alt="avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />

        <div className="hidden lg:block max-w-[140px]">
          <p className="subtitle-2 capitalize truncate">{fullName}</p>
          <p className="caption truncate">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
