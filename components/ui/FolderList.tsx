"use client";

import { useState } from "react";
import FolderCard from "@/components/FolderCard";

export default function FolderList({ folders }: { folders: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);

  const handleSelect = (
    folderId: string,
    index: number,
    shiftKey: boolean
  ) => {
    // 🔹 SHIFT + click
    if (shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, index);
      const end = Math.max(lastIndex, index);

      const rangeIds = folders
        .slice(start, end + 1)
        .map(folder => folder.$id);

      setSelectedIds(rangeIds);
    } else {
      // 🔹 Normal click
      setSelectedIds([folderId]);
      setLastIndex(index);
    }
  };

  return (
    <>
      {folders.map((folder, index) => (
        <FolderCard
          key={folder.$id}
          folder={folder}
          selected={selectedIds.includes(folder.$id)}
          onSelect={(e: React.MouseEvent<HTMLDivElement>) =>
            handleSelect(folder.$id, index, e.shiftKey)
          }
        />
      ))}
    </>
  );
}
