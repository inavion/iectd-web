"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import FolderDropdown from "@/components/FolderDropdown";
import FormattedDateTime from "@/components/FormattedDateTime";
import { moveFileToFolder, moveFilesToFolder } from "@/lib/actions/file.actions";
import { moveFolderToFolder, moveFoldersToFolder } from "@/lib/actions/folder.actions";
import { toast } from "sonner";
import { DraggedItem } from "@/components/DragContext";

interface FolderRowProps {
  folder: any;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  draggedItems: DraggedItem[];
  isDropTarget: boolean;
  setHoveredFolderId: (id: string | null) => void;
}

const FolderRow = ({
  folder,
  isSelected,
  onMouseDown,
  onMouseUp,
  draggedItems,
  isDropTarget,
  setHoveredFolderId,
}: FolderRowProps) => {
  const router = useRouter();
  const path = usePathname();

  // Check if this folder is a valid drop target (not dropping onto self)
  const canDrop = draggedItems.length > 0 && !draggedItems.some((item) => item.id === folder.$id);

  const handleMouseUp = async (e: React.MouseEvent) => {
    // Handle drop if items are being dragged
    if (draggedItems.length > 0) {
      // Filter out items that can't be dropped (the folder itself)
      const validItems = draggedItems.filter((item) => item.id !== folder.$id);
      if (validItems.length > 0) {
        try {
          const fileIds = validItems.filter((item) => item.type === "file").map((item) => item.id);
          const folderIds = validItems.filter((item) => item.type === "folder").map((item) => item.id);

          // Move files
          if (fileIds.length > 0) {
            if (fileIds.length === 1) {
              await moveFileToFolder({
                fileId: fileIds[0],
                targetFolderId: folder.$id,
                path,
              });
            } else {
              await moveFilesToFolder({
                fileIds,
                targetFolderId: folder.$id,
                path,
              });
            }
          }

          // Move folders
          if (folderIds.length > 0) {
            if (folderIds.length === 1) {
              await moveFolderToFolder({
                folderId: folderIds[0],
                targetFolderId: folder.$id,
                path,
              });
            } else {
              await moveFoldersToFolder({
                folderIds,
                targetFolderId: folder.$id,
                path,
              });
            }
          }

          const totalMoved = fileIds.length + folderIds.length;
          if (totalMoved === 1) {
            toast.success(`Moved "${validItems[0].name}" to "${folder.name}"`);
          } else {
            toast.success(`Moved ${totalMoved} items to "${folder.name}"`);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to move items");
        }

        setHoveredFolderId(null);
        return;
      }
    }
    
    // No drag - handle selection deselect
    onMouseUp(e);
  };

  return (
    <div
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      onMouseEnter={() => {
        if (canDrop) setHoveredFolderId(folder.$id);
      }}
      onMouseLeave={() => {
        if (canDrop) setHoveredFolderId(null);
      }}
      onMouseUp={handleMouseUp}
      onDoubleClick={() => router.push(`/folders/${folder.$id}`)}
      className={`relative grid grid-cols-12 items-center pt-2 cursor-pointer
        transition-colors duration-150 ease-in-out
        ${isDropTarget && canDrop ? "bg-blue-100 ring-2 ring-blue-400" : ""}
        ${isSelected && !isDropTarget ? "bg-brand-100/20" : ""}
        ${!isSelected && !isDropTarget ? "hover:bg-gray-100" : ""}
      `}
    >
      <div className="col-span-5 ml-2 flex items-center gap-2 min-w-0 !mx-5">
        <Image
          src="/assets/icons/folder.png"
          alt="folder"
          width={20}
          height={20}
          className="w-8 h-8"
        />
        <p className="truncate !ml-2">{folder.name}</p>
      </div>

      <FormattedDateTime
        date={folder.$createdAt}
        className="col-span-4 body-2 text-light-100"
      />

      <p className="col-span-2 text-light-200">—</p>

      <div className="ml-auto mr-2">
        <FolderDropdown folder={folder} />
      </div>

      <div className="divider col-span-12 mt-2" />
    </div>
  );
};

export default FolderRow;