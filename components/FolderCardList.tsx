"use client";

import FolderCard from "@/components/FolderCard";
import { DraggedItem } from "@/components/DragContext";

interface FolderCardListProps {
  folders: any[];
  selectedIds: Set<string>;
  onItemMouseDown: (id: string, e: React.MouseEvent) => void;
  onItemMouseUp: (id: string, e: React.MouseEvent) => void;
  draggedItems: DraggedItem[];
  hoveredFolderId: string | null;
  setHoveredFolderId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FolderCardList({
  folders,
  selectedIds,
  onItemMouseDown,
  onItemMouseUp,
  draggedItems,
  hoveredFolderId,
  setHoveredFolderId,
}: FolderCardListProps) {
  return (
    <>
      {folders.map((folder) => (
        <FolderCard
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