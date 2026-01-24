"use client";

import { useState, useRef, useEffect } from "react";
import FolderCardList from "@/components/FolderCardList";
import FileCardList from "@/components/FileCardList";
import { useDrag } from "@/components/DragContext";

interface GridLayoutProps {
  folders: any[];
  files: any[];
}

const GridLayout = ({ folders, files }: GridLayoutProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    draggedItem,
    setPendingDragItem,
    setMouseDownPos,
    hoveredFolderId,
    setHoveredFolderId,
  } = useDrag();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedId(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef}>
      {/* FOLDERS */}
      {folders.length > 0 && (
        <section className="file-list mb-4 sm:mb-6 gap-3 sm:gap-6">
          <FolderCardList
            folders={folders}
            selectedId={selectedId}
            onSelect={setSelectedId}
            setPendingDragItem={setPendingDragItem}
            setMouseDownPos={setMouseDownPos}
            draggedItem={draggedItem}
            hoveredFolderId={hoveredFolderId}
            setHoveredFolderId={setHoveredFolderId}
          />
        </section>
      )}

      {/* FILES */}
      {files.length > 0 && (
        <section className="file-list gap-3 sm:gap-6">
          <FileCardList
            files={files}
            selectedId={selectedId}
            onSelect={setSelectedId}
            setPendingDragItem={setPendingDragItem}
            setMouseDownPos={setMouseDownPos}
          />
        </section>
      )}
    </div>
  );
};

export default GridLayout;
