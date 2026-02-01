"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { avatarPlaceholderUrl, navItems } from "@/constants";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Separator } from "../ui/separator";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import FileUploader from "../FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";
import CreateNew from "../CreateNew";

declare interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}

const MobileNagivation = ({
  $id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
}: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const folderMatch = pathname.match(/^\/folders\/([^/]+)/);
  const parentFolderId = folderMatch ? folderMatch[1] : null;

  return (
    <header className="mobile-header">
      <Image
        src="/assets/images/logo-full-brand.png"
        alt="logo"
        width={160}
        height={52}
        className="h-auto"
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="menu"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user bg-brand/10 mr-10">
              <Image
                src={avatarPlaceholderUrl}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/40" />
          </SheetTitle>

          <nav className="mobile-nav h5">
            <CreateNew currentPath={pathname} parentFolderId={parentFolderId} />
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => {
                return (
                  <Link href={url} key={name} className="lg:w-full ">
                    <li
                      className={cn(
                        "mobile-nav-item h5",
                        pathname === url && "shad-active",
                      )}
                    >
                      <Image
                        src={icon}
                        alt={name}
                        width={24}
                        height={24}
                        className={cn(
                          "nav-icon",
                          pathname === url && "nav-icon-active",
                        )}
                      />
                      <p>{name}</p>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </nav>

          <Separator className="my-5 bg-light-200/40" />

          <div className="flex flex-col justify-between gap-5 pb-5">
            <FileUploader ownerId={ownerId} accountId={accountId} />
            <Button
              type="button"
              className="mobile-sign-out-button h5"
              onClick={async () => await signOutUser()}
            >
              <Image
                src="/assets/icons/logout.png"
                alt="logo"
                width={24}
                height={24}
              />
              <p>Sign out</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNagivation;
