"use client";

import { avatarPlaceholderUrl, navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CreateNew from "./CreateNew";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
  type: string;
  ownerId: string;
  accountId: string;
}

const Sidebar = ({
  fullName,
  avatar,
  email,
  type,
  ownerId,
  accountId,
}: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const folderMatch = pathname.match(/^\/folders\/([^/]+)/);
  const parentFolderId = folderMatch ? folderMatch[1] : null;

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
        {/* ✅ ONE GLOBAL CREATE BUTTON */}
        <CreateNew currentPath={pathname} parentFolderId={parentFolderId}/>

        <ul className="flex flex-col flex-1 gap-6 ">
          {navItems.map(({ url, name, icon }) => {
            return (
              <Link href={url} key={name} className="lg:w-full ">
                <li
                  className={cn(
                    "sidebar-nav-item h5",
                    pathname === url && "shad-active"
                  )}
                >
                  <Image
                    src={icon}
                    alt={name}
                    width={24}
                    height={24}
                    className={cn(
                      "nav-icon",
                      pathname === url && "nav-icon-active"
                    )}
                  />
                  <p className="lg:block hidden">{name}</p>
                </li>
              </Link>
            );
          })}
        </ul>
      </nav>

      <Image
        src="/assets/images/files-2.png"
        alt="files"
        width={506}
        height={418}
        className="w-full hidden lg:block"
        unoptimized
      />

      <div className="sidebar-user-info">
        <Image
          src={avatarPlaceholderUrl}
          alt="avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />

        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
