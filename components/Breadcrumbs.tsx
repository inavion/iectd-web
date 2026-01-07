"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getFolderById } from "@/lib/actions/folder.actions";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Image from "next/image";

interface Crumb {
  id: string;
  name: string;
}

const Breadcrumbs = () => {
  const pathname = usePathname();
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  useEffect(() => {
    const buildCrumbs = async () => {
      const match = pathname.match(/^\/folders\/([^/]+)/);

      // Root (Documents)
      if (!match) {
        setCrumbs([]);
        return;
      }

      let currentFolderId = match[1];
      const stack: Crumb[] = [];

      while (currentFolderId) {
        const folder = await getFolderById(currentFolderId);
        if (!folder) break;

        stack.unshift({
          id: folder.$id,
          name: folder.name,
        });

        currentFolderId = folder.parentFolderId;
      }

      setCrumbs(stack);
    };

    buildCrumbs();
  }, [pathname]);

  return (
    <Breadcrumb className="w-full">
      <BreadcrumbList>
        {/* Root */}
        <BreadcrumbItem className="h1 capitalize">
          <BreadcrumbLink asChild>
            <Link href="/documents">Documents</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <span key={crumb.id} className="flex items-centers subtitle-2">
              <Image
                src="/assets/icons/right.png"
                alt="chevron-right"
                width={16}
                height={16}
                className="mr-2"
              />
              {isLast ? (
                <BreadcrumbItem className="font-bold">
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/folders/${crumb.id}`}>{crumb.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
