"use client";

import FolderRowList from "@/components/list/FolderRowList";
import FileRowList from "@/components/list/FileRowList";
import { useState, useRef, useEffect } from "react";
import { useDrag } from "@/components/DragContext";

interface ListLayoutProps {
  folders: any[];
  files: any[];
}

const ListLayout = ({ folders, files }: ListLayoutProps) => {
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
    <div className="card w-full" ref={containerRef}>
      {/* HEADER */}
      <div className="grid grid-cols-12 font-medium mb-2">
        <p className="col-span-8 sm:col-span-5 ml-2">Name</p>
        <p className="hidden sm:block col-span-4">Last interaction</p>
        <p className="col-span-4 sm:col-span-2 text-right sm:text-left">Size</p>
      </div>

      <div className="header-divider" />

      {/* FOLDERS */}
      {folders.length > 0 && (
        <FolderRowList
          folders={folders}
          selectedId={selectedId}
          onSelect={setSelectedId}
          setPendingDragItem={setPendingDragItem}
          setMouseDownPos={setMouseDownPos}
          draggedItem={draggedItem}
          hoveredFolderId={hoveredFolderId}
          setHoveredFolderId={setHoveredFolderId}
        />
      )}

      {/* FILES */}
      {files.length > 0 && (
        <FileRowList
          files={files}
          selectedId={selectedId}
          onSelect={setSelectedId}
          setPendingDragItem={setPendingDragItem}
          setMouseDownPos={setMouseDownPos}
        />
      )}
    </div>
  );
};

export default ListLayout;