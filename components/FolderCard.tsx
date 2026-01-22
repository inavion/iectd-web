"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import FolderDropdown from "./FolderDropdown";
import { moveFileToFolder } from "@/lib/actions/file.actions";
import { moveFolderToFolder } from "@/lib/actions/folder.actions";
import { toast } from "sonner";

interface DraggedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  url?: string;
  extension?: string;
  fileType?: string;
}

interface FolderCardProps {
  folder: any;
  isSelected: boolean;
  onSelect: () => void;
  setPendingDragItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
  setMouseDownPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  draggedItem: DraggedItem | null;
  isDropTarget: boolean;
  setHoveredFolderId: React.Dispatch<React.SetStateAction<string | null>>;
}

const FolderCard = ({
  folder,
  isSelected,
  onSelect,
  setPendingDragItem,
  setMouseDownPos,
  draggedItem,
  isDropTarget,
  setHoveredFolderId,
}: FolderCardProps) => {
  const router = useRouter();
  const path = usePathname();

  const canDrop = draggedItem && draggedItem.id !== folder.$id;

  const handleMouseUp = async () => {
    if (!draggedItem || draggedItem.id === folder.$id) return;

    try {
      if (draggedItem.type === "file") {
        await moveFileToFolder({
          fileId: draggedItem.id,
          targetFolderId: folder.$id,
          path,
        });
        toast.success(`Moved "${draggedItem.name}" to "${folder.name}"`);
      } else if (draggedItem.type === "folder") {
        await moveFolderToFolder({
          folderId: draggedItem.id,
          targetFolderId: folder.$id,
          path,
        });
        toast.success(`Moved "${draggedItem.name}" to "${folder.name}"`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to move item");
    }

    setHoveredFolderId(null);
  };

  return (
    <div
      className={`
        folder-card
        cursor-pointer
        flex items-start justify-between
        px-4 py-3
        transition-colors duration-150 ease-in-out
        ${isDropTarget && canDrop ? "bg-blue-100 ring-2 ring-blue-400" : ""}
        ${isSelected && !isDropTarget ? "bg-brand-100/20" : ""}
        ${!isSelected && !isDropTarget ? "bg-white hover:bg-gray-100" : ""}
      `}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (!isSelected) onSelect();
        setPendingDragItem({
          id: folder.$id,
          type: "folder",
          name: folder.name,
        });
        setMouseDownPos({ x: e.clientX, y: e.clientY });
      }}
      onMouseEnter={() => {
        if (canDrop) setHoveredFolderId(folder.$id);
      }}
      onMouseLeave={() => {
        if (canDrop) setHoveredFolderId(null);
      }}
      onMouseUp={handleMouseUp}
      onDoubleClick={() => router.push(`/folders/${folder.$id}`)}
    >
      <div className="flex items-start min-w-0">
        <Image
          src="/assets/icons/folder.png"
          alt="folder"
          width={34}
          height={34}
          className="shrink-0"
        />

        <div className="ml-3 flex items-center min-h-[34px]">
          <p className="font-medium text-sm leading-tight break-words">
            {folder.name}
          </p>
        </div>
      </div>
      <FolderDropdown folder={folder} />
    </div>
  );
};

export default FolderCard;