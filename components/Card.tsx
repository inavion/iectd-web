"use client";

import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";
import { Props } from "./ActionsModalContent";

interface DraggedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  url?: string;
  extension?: string;
  fileType?: string;
}

interface CardProps {
  file: Models.Document &
    Props & { owner: Models.Document & { fullName: string }; users: string[] };
  isSelected: boolean;
  onSelect: () => void;
  setPendingDragItem: React.Dispatch<React.SetStateAction<DraggedItem | null>>;
  setMouseDownPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

const Card = ({
  file,
  isSelected,
  onSelect,
  setPendingDragItem,
  setMouseDownPos,
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
        if (!isSelected) onSelect();
        setPendingDragItem({
          id: file.$id,
          type: "file",
          name: file.name,
          url: file.url,
          extension: file.extension,
          fileType: file.type,
        });
        setMouseDownPos({ x: e.clientX, y: e.clientY });
      }}
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