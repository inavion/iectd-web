"use client";

import FileRow from "@/components/list/FileRow";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface FileRowListProps {
  files: (Models.Document &
    Props & {
      owner: Models.Document & { fullName: string };
      users: string[];
    })[];
}

export default function FileRowList({ files }: FileRowListProps) {
  return (
    <>
      {files.map((file) => (
        <FileRow key={file.$id} file={file} />
      ))}
    </>
  );
}
