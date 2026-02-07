"use client";

import { DragProvider, useDrag } from "@/components/drag-drop/DragContext";
import Thumbnail from "@/components/Thumbnail";

function DragGhost() {
  const { draggedItems, cursorPos } = useDrag();

  if (draggedItems.length === 0) return null;

  const firstItem = draggedItems[0];
  const count = draggedItems.length;

  return (
    <div
      className="pointer-events-none fixed z-50 flex items-center gap-2 p-2 bg-white shadow-lg rounded-md"
      style={{
        top: `${cursorPos.y}px`,
        left: `${cursorPos.x}px`,
      }}
    >
      {firstItem.type === "file" && (
        <Thumbnail
          type={firstItem.fileType as any}
          extension={firstItem.extension || ""}
          url={firstItem.url || ""}
          className="w-5 h-5"
        />
      )}
      {firstItem.type === "folder" && (
        <img src="/assets/icons/folder.png" className="w-5 h-5" alt="folder" />
      )}
      {count === 1 ? (
        <span className="truncate max-w-xs">{firstItem.name}</span>
      ) : (
        <span className="truncate max-w-xs">
          {firstItem.name}{" "}
          <span className="text-gray-500">+{count - 1} more</span>
        </span>
      )}
      {count > 1 && (
        <span className="ml-1 bg-brand text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default function DragWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DragProvider>
      {children}
      <DragGhost />
    </DragProvider>
  );
}
