"use client";

import { useRouter } from "next/navigation";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";
import { Props } from "./ActionsModalContent";

interface CardProps {
  file: Models.Document &
    Props & { owner: Models.Document & { fullName: string }; users: string[] };
  selected?: boolean;
  onSelect?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card = ({ file, selected, onSelect }: CardProps) => {
  const router = useRouter();

  const handleDoubleClick = () => {
    window.open(file.url, "_blank"); // external file URL
  };

  return (
    <div

      className={`file-card ${
        selected ? "bg-brand-100/20" : "bg-white hover:bg-gray-100"
      }`}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => onSelect?.(e)}
    >
      <div className="flex justify-between">
        <Thumbnail
          type={file.type as "document" | "image" | "video" | "audio" | "other"}
          extension={file.extension}
          url={file.url}
          className="!size-20"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} />
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>

        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />

        <div className="flex justify-between items-end">
          <p className="caption line-clamp-1 text-light-200">
            By: {file.owner.fullName}
          </p>
          <p className="caption line-clamp-1 text-light-200">
            {convertFileSize(file.size)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
