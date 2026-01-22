"use client";

import FolderRow from "@/components/list/FolderRow";

export default function FolderRowList({
  folders,
  selectedId,
  onSelect,
}: {
  folders: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {folders.map((folder) => (
        <FolderRow
          key={folder.$id}
          folder={folder}
          isSelected={selectedId === folder.$id}
          onSelect={() => onSelect(folder.$id)}
        />
      ))}
    </>
  );
}
