"use client";

import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/documents/ActionDropdown";
import { Props } from "@/components/ActionsModalContent";

interface CardProps {
  file: Models.Document &
    Props & { owner: Models.Document & { fullName: string }; users: string[] };
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}

const Card = ({
  file,
  isSelected,
  onMouseDown,
  onMouseUp,
}: CardProps) => {
  const handleDoubleClick = () => {
    window.open(file.url, "_blank");
  };

  return (
    <div
      className={`file-card cursor-pointer transition-colors duration-150 ${
        isSelected ? "bg-brand-100/20" : "bg-white hover:bg-gray-100"
      }`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      onMouseUp={onMouseUp}
      onDoubleClick={handleDoubleClick}
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
        <FormattedDateTime date={file.$createdAt} className="body-2 text-light-100" />
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
