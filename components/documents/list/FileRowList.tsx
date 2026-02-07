"use client";

import FileRow from "@/components/documents/list/FileRow";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface FileRowListProps {
  files: (Models.Document &
    Props & {
      owner: Models.Document & { fullName: string };
      users: string[];
    })[];
  selectedIds: Set<string>;
  onItemMouseDown: (id: string, e: React.MouseEvent) => void;
  onItemMouseUp: (id: string, e: React.MouseEvent) => void;
}

export default function FileRowList({
  files,
  selectedIds,
  onItemMouseDown,
  onItemMouseUp,
}: FileRowListProps) {
  return (
    <>
      {files.map((file) => (
        <FileRow
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
