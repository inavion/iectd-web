"use client";

import { avatarPlaceholderUrl, navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();

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
        className="w-full"
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
