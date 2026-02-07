"use client";

import Thumbnail from "@/components/Thumbnail";
import ActionDropdown from "@/components/documents/ActionDropdown";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

interface FileRowProps {
  file: Models.Document &
    Props & {
      owner: Models.Document & { fullName: string };
      users: string[];
    };
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}

const FileRow = ({
  file,
  isSelected,
  onMouseDown,
  onMouseUp,
}: FileRowProps) => {
  return (
    <div
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      onMouseUp={onMouseUp}
      onDoubleClick={() => window.open(file.url, "_blank")}
      className={`relative grid grid-cols-12 items-center pt-2 cursor-pointer
        transition-colors duration-150 ease-in-out
        ${isSelected ? "bg-brand-100/20" : "hover:bg-gray-100"}
      `}
    > 
      <div className="col-span-5 ml-2 flex items-center gap-2 min-w-0">
        <Thumbnail
          type={file.type as any}
          extension={file.extension}
          url={file.url}
          className="w-5 h-5"
        />
        <p className="truncate">{file.name}</p>
      </div>

      <FormattedDateTime
        date={file.$createdAt}
        className="col-span-4 body-2 text-light-100"
      />

      <p className="col-span-2 text-light-200">{convertFileSize(file.size)}</p>

      <div className="ml-auto mr-2">
        <ActionDropdown file={file} />
      </div>

      <div className="divider col-span-12 mt-2" />
    </div>
  );
};

export default FileRow;
