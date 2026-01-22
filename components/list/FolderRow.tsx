"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import FolderDropdown from "@/components/FolderDropdown";
import FormattedDateTime from "@/components/FormattedDateTime";

const FolderRow = ({
  folder,
  isSelected,
  onSelect,
}: {
  folder: any;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const router = useRouter();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={() => router.push(`/folders/${folder.$id}`)}
      className={`relative grid grid-cols-12 items-center pt-2 cursor-pointer
        ${
          isSelected
            ? "bg-brand-100/20 hover:bg-brand-100/20"
            : "hover:bg-gray-100"
        }
      `}
    >
      <div className="col-span-5 ml-2 flex items-center gap-2 min-w-0 !mx-5">
        <Image
          src="/assets/icons/folder.png"
          alt="folder"
          width={20}
          height={20}
          className="w-8 h-8"
        />
        <p className="truncate !ml-2">{folder.name}</p>
      </div>

      <FormattedDateTime
        date={folder.$createdAt}
        className="col-span-4 body-2 text-light-100"
      />

      <p className="col-span-2 text-light-200">—</p>

      <div className="ml-auto mr-2">
        <FolderDropdown folder={folder} />
      </div>

      <div className="divider col-span-12 mt-2" />
    </div>
  );
};

export default FolderRow;
