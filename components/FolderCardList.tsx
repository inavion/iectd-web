"use client";

import FolderCard from "@/components/FolderCard";

interface DraggedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  url?: string;
  extension?: string;
  fileType?: string;
}

interface FolderCardListProps {
  folders: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  setPendingDragItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
  setMouseDownPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  draggedItem: DraggedItem | null;
  hoveredFolderId: string | null;
  setHoveredFolderId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function FolderCardList({
  folders,
  selectedId,
  onSelect,
  setPendingDragItem,
  setMouseDownPos,
  draggedItem,
  hoveredFolderId,
  setHoveredFolderId,
}: FolderCardListProps) {
  return (
    <>
      {folders.map((folder) => (
        <FolderCard
          key={folder.$id}
          folder={folder}
          isSelected={selectedId === folder.$id}
          onSelect={() => onSelect(folder.$id)}
          setPendingDragItem={setPendingDragItem}
          setMouseDownPos={setMouseDownPos}
          draggedItem={draggedItem}
          isDropTarget={hoveredFolderId === folder.$id}
          setHoveredFolderId={setHoveredFolderId}
        />
      ))}
    </>
  );
}