"use client";

import FolderRow from "@/components/list/FolderRow";

export default function FolderRowList({ folders }: { folders: any[] }) {
  return (
    <>
      {folders.map((folder) => (
        <FolderRow key={folder.$id} folder={folder} />
      ))}
    </>
  );
}
