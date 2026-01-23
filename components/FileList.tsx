"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface FileListProps {
  files: (Models.Document & Props & { owner: Models.Document & { fullName: string }; users: string[] })[];
}

export default function FileList({ files }: FileListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      {files.map((file) => (
        <Card
          key={file.$id}
          file={file}
          selected={selectedId === file.$id}
          onSelect={() => setSelectedId(file.$id)}
        />
      ))}
    </>
  );
}