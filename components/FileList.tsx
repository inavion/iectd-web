"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface FileListProps {
  files: (Models.Document & Props & { owner: Models.Document & { fullName: string }; users: string[] })[];
}

export default function FileList({ files }: FileListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);

  const handleSelect = (
    fileId: string,
    index: number,
    shiftKey: boolean
  ) => {
    if (shiftKey && lastIndex !== null) {
      const start = Math.min(lastIndex, index);
      const end = Math.max(lastIndex, index);
      const rangeIds = files.slice(start, end + 1).map(f => f.$id);
      setSelectedIds(rangeIds);
    } else {
      setSelectedIds([fileId]);
      setLastIndex(index);
    }
  };

  return (
    <>
      {files.map((file, index) => (
        <Card
          key={file.$id}
          file={file}
          selected={selectedIds.includes(file.$id)}
          onSelect={(e) => handleSelect(file.$id, index, e.shiftKey)}
        />
      ))}
    </>
  );
}
