"use client";

import FolderRow from "@/components/documents/list/FolderRow";
import { DraggedItem } from "@/components/drag-drop/DragContext";

interface FolderRowListProps {
  folders: any[];
  selectedIds: Set<string>;
  onItemMouseDown: (id: string, e: React.MouseEvent) => void;
  onItemMouseUp: (id: string, e: React.MouseEvent) => void;
  draggedItems: DraggedItem[];
  hoveredFolderId: string | null;
  setHoveredFolderId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FolderRowList({
  folders,
  selectedIds,
  onItemMouseDown,
  onItemMouseUp,
  draggedItems,
  hoveredFolderId,
  setHoveredFolderId,
}: FolderRowListProps) {
  return (
    <>
      {folders.map((folder) => (
        <FolderRow
          key={folder.$id}
          folder={folder}
          isSelected={selectedIds.has(folder.$id)}
          onMouseDown={(e) => onItemMouseDown(folder.$id, e)}
          onMouseUp={(e) => onItemMouseUp(folder.$id, e)}
          draggedItems={draggedItems}
          isDropTarget={hoveredFolderId === folder.$id}
          setHoveredFolderId={setHoveredFolderId}
        />
      ))}
    </>
  );
}
