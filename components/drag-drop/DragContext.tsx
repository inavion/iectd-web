"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface DraggedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  url?: string;
  extension?: string;
  fileType?: string;
  isSystem?: boolean;
}

interface DragContextType {
  // Multiple dragged items support
  draggedItems: DraggedItem[];
  setDraggedItems: React.Dispatch<React.SetStateAction<DraggedItem[]>>;
  pendingDragItems: DraggedItem[];
  setPendingDragItems: React.Dispatch<React.SetStateAction<DraggedItem[]>>;
  // Legacy single item (computed from first item for backwards compat)
  draggedItem: DraggedItem | null;
  mouseDownPos: { x: number; y: number } | null;
  setMouseDownPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  cursorPos: { x: number; y: number };
  hoveredFolderId: string | null;
  setHoveredFolderId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DragContext = createContext<DragContextType | null>(null);

const DRAG_THRESHOLD = 5;

export function DragProvider({ children }: { children: ReactNode }) {
  const [draggedItems, setDraggedItems] = useState<DraggedItem[]>([]);
  const [pendingDragItems, setPendingDragItems] = useState<DraggedItem[]>([]);
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  // Computed property for backwards compatibility
  const draggedItem = draggedItems.length > 0 ? draggedItems[0] : null;

  const handleMouseMove = (e: MouseEvent) => {
    if (pendingDragItems.length > 0 && mouseDownPos) {
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);

      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        setCursorPos({ x: e.clientX + 10, y: e.clientY + 10 });
        setDraggedItems(pendingDragItems);
        setPendingDragItems([]);
      }
    }

    if (draggedItems.length > 0) {
      setCursorPos({ x: e.clientX + 10, y: e.clientY + 10 });
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setDraggedItems([]);
      setPendingDragItems([]);
      setMouseDownPos(null);
      setHoveredFolderId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedItems, pendingDragItems, mouseDownPos]);

  return (
    <DragContext.Provider
      value={{
        draggedItems,
        setDraggedItems,
        pendingDragItems,
        setPendingDragItems,
        draggedItem,
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
