"use client";

import Card from "@/components/documents/Card";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface FileCardListProps {
  files: (Models.Document &
    Props & {
      owner: Models.Document & { fullName: string };
      users: string[];
    })[];
  selectedIds: Set<string>;
  onItemMouseDown: (id: string, e: React.MouseEvent) => void;
  onItemMouseUp: (id: string, e: React.MouseEvent) => void;
}

export default function FileCardList({
  files,
  selectedIds,
  onItemMouseDown,
  onItemMouseUp,
}: FileCardListProps) {
  return (
    <>
      {files.map((file) => (
        <Card
          key={file.$id}
          file={file}
          isSelected={selectedIds.has(file.$id)}
          onMouseDown={(e) => onItemMouseDown(file.$id, e)}
          onMouseUp={(e) => onItemMouseUp(file.$id, e)}
        />
      ))}
    </>
  );
}