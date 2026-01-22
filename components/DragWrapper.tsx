"use client";

import { DragProvider, useDrag } from "@/components/DragContext";
import Thumbnail from "@/components/Thumbnail";

function DragGhost() {
  const { draggedItem, cursorPos } = useDrag();

  if (!draggedItem) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 flex items-center gap-2 p-2 bg-white shadow-lg rounded-md"
      style={{
        top: `${cursorPos.y}px`,
        left: `${cursorPos.x}px`,
      }}
    >
      {draggedItem.type === "file" && (
        <Thumbnail
          type={draggedItem.fileType as any}
          extension={draggedItem.extension || ""}
          url={draggedItem.url || ""}
          className="w-5 h-5"
        />
      )}
      {draggedItem.type === "folder" && (
        <img src="/assets/icons/folder.png" className="w-5 h-5" alt="folder" />
      )}
      <span className="truncate max-w-xs">{draggedItem.name}</span>
    </div>
  );
}

export default function DragWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DragProvider>
      {children}
      <DragGhost />
    </DragProvider>
  );
}