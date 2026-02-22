"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import FolderCardList from "@/components/documents/FolderCardList";
import FileCardList from "@/components/documents/FileCardList";
import { useDrag, DraggedItem } from "@/components/drag-drop/DragContext";
import SelectionActions from "@/components/documents/SelectionActions";

interface GridLayoutProps {
  folders: any[];
  files: any[];
}

const GridLayout = ({ folders, files }: GridLayoutProps) => {
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
      isSystem: f.isSystem,
    }));
    const fileItems = files.map((f) => ({
      id: f.$id,
      type: "file" as const,
      name: f.name,
      url: f.url,
      extension: f.extension,
      fileType: f.type,
      bucketFileId: f.bucketFile,
      data: f,
      isSystem: f.isSystemResource,
    }));
    return [...folderItems, ...fileItems];
  }, [folders, files]);

  // Get selected items for SelectionActions
  const selectedItemsForActions = useMemo(() => {
    return allItems
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        bucketFileId: item.type === "file" ? item.bucketFileId : undefined,
        isSystem: item.isSystem === true, // ✅ FIX
      }));
  }, [allItems, selectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastClickedId(null);
  }, []);

  // Compute new selection based on click and modifier keys
  const computeNewSelection = useCallback(
    (
      id: string,
      e: React.MouseEvent,
      currentSelection: Set<string>,
    ): Set<string> => {
      const isShift = e.shiftKey;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const newSelection = new Set(currentSelection);

      if (isShift && lastClickedId) {
        // Shift-click: select range
        const lastIndex = allItems.findIndex(
          (item) => item.id === lastClickedId,
        );
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
    [lastClickedId, allItems],
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
        .filter((item) => newSelection.has(item.id) && item.isSystem !== true)
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
    [
      selectedIds,
      allItems,
      computeNewSelection,
      setPendingDragItems,
      setMouseDownPos,
    ],
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
    [pendingDeselect, draggedItems],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelectedIds(new Set());
        setLastClickedId(null);
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
            selectedIds={selectedIds}
            onItemMouseDown={handleItemMouseDown}
            onItemMouseUp={handleItemMouseUp}
            draggedItems={draggedItems}
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
            selectedIds={selectedIds}
            onItemMouseDown={handleItemMouseDown}
            onItemMouseUp={handleItemMouseUp}
          />
        </section>
      )}

      {/* Selection Actions Toolbar */}
      <SelectionActions
        selectedItems={selectedItemsForActions}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
};

export default GridLayout;
