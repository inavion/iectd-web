"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getFolderById } from "@/lib/actions/folder.actions";
import { moveFileToFolder } from "@/lib/actions/file.actions";
import { moveFolderToFolder } from "@/lib/actions/folder.actions";
import { useDrag } from "@/components/DragContext";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
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
  const [hoveredCrumbId, setHoveredCrumbId] = useState<string | null>(null);

  const { draggedItem, setHoveredFolderId } = useDrag();

  useEffect(() => {
    const buildCrumbs = async () => {
      const match = pathname.match(/^\/folders\/([^/]+)/);

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

  const handleDrop = async (targetFolderId: string | null, targetName: string) => {
    if (!draggedItem) return;
    
    // Prevent dropping onto itself
    if (draggedItem.id === targetFolderId) return;

    try {
      if (draggedItem.type === "file") {
        await moveFileToFolder({
          fileId: draggedItem.id,
          targetFolderId,
          path: pathname,
        });
        toast.success(`Moved "${draggedItem.name}" to "${targetName}"`);
      } else if (draggedItem.type === "folder") {
        await moveFolderToFolder({
          folderId: draggedItem.id,
          targetFolderId,
          path: pathname,
        });
        toast.success(`Moved "${draggedItem.name}" to "${targetName}"`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to move item");
    }
  };

  const canDrop = (targetId: string | null) => {
    if (!draggedItem) return false;
    if (draggedItem.id === targetId) return false;
    return true;
  };

  return (
    <Breadcrumb className="w-full">
      <BreadcrumbList>
        {/* Root - Documents */}
        <BreadcrumbItem
          className={`h1 capitalize transition-colors duration-150 rounded px-2 py-1 ${
            draggedItem && hoveredCrumbId === "root"
              ? "bg-blue-100 ring-2 ring-blue-400"
              : ""
          }`}
          onMouseEnter={() => {
            if (canDrop(null)) setHoveredCrumbId("root");
          }}
          onMouseLeave={() => setHoveredCrumbId(null)}
          onMouseUp={() => {
            if (canDrop(null)) {
              handleDrop(null, "Documents");
              setHoveredCrumbId(null);
            }
          }}
        >
          <BreadcrumbLink asChild>
            <Link href="/documents">Documents</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isHovered = hoveredCrumbId === crumb.id;

          return (
            <span key={crumb.id} className="flex items-center">
              <Image
                src="/assets/icons/right.png"
                alt="chevron-right"
                width={24}
                height={24}
                className="mr-2"
              />
              {isLast ? (
                <BreadcrumbItem>
                  <BreadcrumbPage className="subtitle-1 !font-bold">
                    {crumb.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem
                  className={`transition-colors duration-150 rounded px-2 py-1 ${
                    draggedItem && isHovered
                      ? "bg-blue-100 ring-2 ring-blue-400"
                      : ""
                  }`}
                  onMouseEnter={() => {
                    if (canDrop(crumb.id)) setHoveredCrumbId(crumb.id);
                  }}
                  onMouseLeave={() => setHoveredCrumbId(null)}
                  onMouseUp={() => {
                    if (canDrop(crumb.id)) {
                      handleDrop(crumb.id, crumb.name);
                      setHoveredCrumbId(null);
                    }
                  }}
                >
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