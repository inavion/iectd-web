"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import FolderDropdown from "@/components/FolderDropdown";
import FormattedDateTime from "@/components/FormattedDateTime";
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

interface FolderRowProps {
  folder: any;
  isSelected: boolean;
  onSelect: () => void;
  setPendingDragItem: (item: DraggedItem | null) => void;
  setMouseDownPos: (pos: { x: number; y: number } | null) => void;
  draggedItem: DraggedItem | null;
  isDropTarget: boolean;
  setHoveredFolderId: (id: string | null) => void;
}

const FolderRow = ({
  folder,
  isSelected,
  onSelect,
  setPendingDragItem,
  setMouseDownPos,
  draggedItem,
  isDropTarget,
  setHoveredFolderId,
}: FolderRowProps) => {
  const router = useRouter();
  const path = usePathname();

  // Check if this folder is a valid drop target
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