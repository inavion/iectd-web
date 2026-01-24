"use client";

import Card from "@/components/Card";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface DraggedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  url?: string;
  extension?: string;
  fileType?: string;
}

interface FileCardListProps {
  files: (Models.Document &
    Props & {
      owner: Models.Document & { fullName: string };
      users: string[];
    })[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  setPendingDragItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
  setMouseDownPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

export default function FileCardList({
  files,
  selectedId,
  onSelect,
  setPendingDragItem,
  setMouseDownPos,
}: FileCardListProps) {
  return (
    <>
      {files.map((file) => (
        <Card
          key={file.$id}
          file={file}
          isSelected={selectedId === file.$id}
          onSelect={() => onSelect(file.$id)}
          setPendingDragItem={setPendingDragItem}
          setMouseDownPos={setMouseDownPos}
        />
      ))}
    </>
  );
}