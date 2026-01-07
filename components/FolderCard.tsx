"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import FolderDropdown from "./FolderDropdown";

const FolderCard = ({ folder }: { folder: any }) => {
  const router = useRouter();

  return (
    <div
      className="
        folder-card
        cursor-pointer
        flex items-start justify-between
        px-4 py-3
      "
      onDoubleClick={() => router.push(`/folders/${folder.$id}`)}
    >
      <div className="flex items-start min-w-0">
        <Image
          src="/assets/icons/folder.png"
          alt="folder"
          width={34}
          height={34}
          className="shrink-0"
        />

        <p
          className="
            ml-3
            font-medium
            text-sm
            leading-relaxed
            break-words
            max-w-[220px]
          "
        >
          {folder.name}
        </p>
      </div>

      <FolderDropdown folder={folder} />
    </div>
  );
};

export default FolderCard;
