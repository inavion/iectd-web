"use client";

import FolderRowList from "@/components/list/FolderRowList";
import FileRowList from "@/components/list/FileRowList";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDrag, DraggedItem } from "@/components/DragContext";

interface ListLayoutProps {
  folders: any[];
  files: any[];
}

const ListLayout = ({ folders, files }: ListLayoutProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [pendingDeselect, setPendingDeselect] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    draggedItems,
    setPendingDragItems,
    setMouseDownPos,
    hoveredFolderId,
    setHoveredFolderId,
  } = useDrag();

  // Combine folders and files into a single ordered list for shift-select
  const allItems = useMemo(() => {
    const folderItems = folders.map((f) => ({
      id: f.$id,
      type: "folder" as const,
      name: f.name,
      data: f,
    }));
    const fileItems = files.map((f) => ({
      id: f.$id,
      type: "file" as const,
      name: f.name,
      url: f.url,
      extension: f.extension,
      fileType: f.type,
      data: f,
    }));
    return [...folderItems, ...fileItems];
  }, [folders, files]);

  // Compute new selection based on click and modifier keys
  const computeNewSelection = useCallback(
    (id: string, e: React.MouseEvent, currentSelection: Set<string>): Set<string> => {
      const isShift = e.shiftKey;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const newSelection = new Set(currentSelection);

      if (isShift && lastClickedId) {
        // Shift-click: select range
        const lastIndex = allItems.findIndex((item) => item.id === lastClickedId);
        const currentIndex = allItems.findIndex((item) => item.id === id);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);

          for (let i = start; i <= end; i++) {
            newSelection.add(allItems[i].id);
          }
        }
      } else if (isCtrlOrCmd) {
        // Ctrl/Cmd-click: toggle selection
        if (newSelection.has(id)) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
      } else {
        // Regular click: select only this item
        newSelection.clear();
        newSelection.add(id);
      }

      return newSelection;
    },
    [lastClickedId, allItems]
  );

  // Combined handler for selection and drag start
  const handleItemMouseDown = useCallback(
    (id: string, e: React.MouseEvent) => {
      const isShift = e.shiftKey;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Compute the new selection
      let newSelection: Set<string>;
      
      if (isShift || isCtrlOrCmd) {
        // Modifier key pressed - compute new selection
        newSelection = computeNewSelection(id, e, selectedIds);
        setPendingDeselect(null);
      } else if (selectedIds.has(id) && selectedIds.size > 1) {
        // Clicking on already selected item without modifier - keep selection for potential drag
        // But mark for potential deselect on mouseup if no drag occurs
        newSelection = selectedIds;
        setPendingDeselect(id);
      } else {
        // Regular click on unselected item - select only this item
        newSelection = new Set([id]);
        setPendingDeselect(null);
      }

      // Update state
      setSelectedIds(newSelection);
      if (!isShift) {
        setLastClickedId(id);
      }

      // Build dragged items array from the new selection
      const dragItems: DraggedItem[] = allItems
        .filter((item) => newSelection.has(item.id))
        .map((item) => ({
          id: item.id,
          type: item.type,
          name: item.name,
          url: item.type === "file" ? item.url : undefined,
          extension: item.type === "file" ? item.extension : undefined,
          fileType: item.type === "file" ? item.fileType : undefined,
        }));

      setPendingDragItems(dragItems);
      setMouseDownPos({ x: e.clientX, y: e.clientY });
    },
    [selectedIds, allItems, computeNewSelection, setPendingDragItems, setMouseDownPos]
  );

  // Handle mouse up - deselect to single item if no drag occurred
  const handleItemMouseUp = useCallback(
    (id: string, e: React.MouseEvent) => {
      // If we have a pending deselect and no drag occurred, select only that item
      if (pendingDeselect === id && draggedItems.length === 0) {
        setSelectedIds(new Set([id]));
        setLastClickedId(id);
      }
      setPendingDeselect(null);
    },
    [pendingDeselect, draggedItems]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedIds(new Set());
        setLastClickedId(null);
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
          selectedIds={selectedIds}
          onItemMouseDown={handleItemMouseDown}
          onItemMouseUp={handleItemMouseUp}
          draggedItems={draggedItems}
          hoveredFolderId={hoveredFolderId}
          setHoveredFolderId={setHoveredFolderId}
        />
      )}

      {/* FILES */}
      {files.length > 0 && (
        <FileRowList
          files={files}
          selectedIds={selectedIds}
          onItemMouseDown={handleItemMouseDown}
          onItemMouseUp={handleItemMouseUp}
        />
      )}
    </div>
  );
};

export default ListLayout;