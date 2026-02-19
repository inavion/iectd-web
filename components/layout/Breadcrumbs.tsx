"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getFolderById,
  moveFolderToFolder,
  moveFoldersToFolder,
} from "@/lib/actions/folder.actions";
import {
  moveFileToFolder,
  moveFilesToFolder,
} from "@/lib/actions/file.actions";
import { useDrag } from "@/components/drag-drop/DragContext";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Image from "next/image";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Crumb {
  id: string;
  name: string;
}

const Breadcrumbs = () => {
  const pathname = usePathname();
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [hoveredCrumbId, setHoveredCrumbId] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { draggedItems, setHoveredFolderId } = useDrag();

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

  const handleDrop = async (
    targetFolderId: string | null,
    targetName: string,
  ) => {
    if (draggedItems.length === 0) return;

    // Filter out items that can't be dropped (the target folder itself)
    const validItems = draggedItems.filter(
      (item) => item.id !== targetFolderId,
    );
    if (validItems.length === 0) return;

    try {
      const fileIds = validItems
        .filter((item) => item.type === "file")
        .map((item) => item.id);
      const folderIds = validItems
        .filter((item) => item.type === "folder")
        .map((item) => item.id);

      // Move files
      if (fileIds.length > 0) {
        if (fileIds.length === 1) {
          await moveFileToFolder({
            fileId: fileIds[0],
            targetFolderId,
            path: pathname,
          });
        } else {
          await moveFilesToFolder({
            fileIds,
            targetFolderId,
            path: pathname,
          });
        }
      }

      // Move folders
      if (folderIds.length > 0) {
        if (folderIds.length === 1) {
          await moveFolderToFolder({
            folderId: folderIds[0],
            targetFolderId,
            path: pathname,
          });
        } else {
          await moveFoldersToFolder({
            folderIds,
            targetFolderId,
            path: pathname,
          });
        }
      }

      const totalMoved = fileIds.length + folderIds.length;
      if (totalMoved === 1) {
        toast.success(`Moved "${validItems[0].name}" to "${targetName}"`);
      } else {
        toast.success(`Moved ${totalMoved} items to "${targetName}"`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to move items");
    }
  };

  const canDrop = (targetId: string | null) => {
    if (draggedItems.length === 0) return false;
    // Can drop if at least one item is not the target
    return draggedItems.some((item) => item.id !== targetId);
  };

  return (
    <Breadcrumb className="w-full">
      <BreadcrumbList>
        {/* Root - Documents */}
        <BreadcrumbItem
          className={`h1 capitalize transition-colors duration-150 rounded px-2 py-1 ${
            draggedItems.length > 0 && hoveredCrumbId === "root"
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
                    draggedItems.length > 0 && isHovered
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
