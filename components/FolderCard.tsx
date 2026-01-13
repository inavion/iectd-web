"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import FolderDropdown from "./FolderDropdown";

interface FolderCardProps {
  folder: any;
  selected: boolean;
  onSelect: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const FolderCard = ({ folder, selected, onSelect }: FolderCardProps) => {
  const router = useRouter();

  console.log(folder.name, selected);
  return (
    <div
      className={`
        folder-card
        cursor-pointer
        flex items-start justify-between
        px-4 py-3
        ${selected ? "bg-brand-100/20" : "bg-white hover:bg-gray-100"}
      `}
      onDoubleClick={() => router.push(`/folders/${folder.$id}`)}
      onClick={(e) => onSelect(e)}
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
