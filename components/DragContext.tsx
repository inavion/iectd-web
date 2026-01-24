"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface DraggedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  url?: string;
  extension?: string;
  fileType?: string;
}

interface DragContextType {
  draggedItem: DraggedItem | null;
  setDraggedItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
  pendingDragItem: DraggedItem | null;
  setPendingDragItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
  mouseDownPos: { x: number; y: number } | null;
  setMouseDownPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  cursorPos: { x: number; y: number };
  hoveredFolderId: string | null;
  setHoveredFolderId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DragContext = createContext<DragContextType | null>(null);

const DRAG_THRESHOLD = 5;

export function DragProvider({ children }: { children: ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [pendingDragItem, setPendingDragItem] = useState<DraggedItem | null>(null);
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (pendingDragItem && mouseDownPos) {
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);

      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setCursorPos({ x: e.clientX + 10, y: e.clientY + 10 });
        setDraggedItem(pendingDragItem);
        setPendingDragItem(null);
      }
    }

    if (draggedItem) {
      setCursorPos({ x: e.clientX + 10, y: e.clientY + 10 });
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setDraggedItem(null);
      setPendingDragItem(null);
      setMouseDownPos(null);
      setHoveredFolderId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedItem, pendingDragItem, mouseDownPos]);

  return (
    <DragContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        pendingDragItem,
        setPendingDragItem,
        mouseDownPos,
        setMouseDownPos,
        cursorPos,
        hoveredFolderId,
        setHoveredFolderId,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDrag must be used within a DragProvider");
  }
  return context;
}