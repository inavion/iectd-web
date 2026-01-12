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

        {/* Text-only vertical centering */}
        <div className="ml-3 flex items-center min-h-[34px]">
          <p
            className="
              font-medium
              text-sm
              leading-tight
              break-words
            "
          >
            {folder.name}
          </p>
        </div>
      </div>

      <FolderDropdown folder={folder} />
    </div>
  );
};

export default FolderCard;
