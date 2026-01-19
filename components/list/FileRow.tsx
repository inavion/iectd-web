"use client";

import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import ActionDropdown from "@/components/ActionDropdown";
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
}

const FileRow = ({ file }: FileRowProps) => {
  return (

    <>
    <div
      className="grid grid-cols-12 items-center pt-2  hover:bg-gray-100 cursor-pointer"
      onDoubleClick={() => window.open(file.url, "_blank")}
    >
      {/* NAME */}
      <div className="col-span-5 ml-2 flex items-center gap-2 min-w-0">
        <Thumbnail
          type={file.type as "document" | "image" | "video" | "audio" | "other"}
          extension={file.extension}
          url={file.url}
          className="w-5 h-5"
        />
        <p className="truncate">{file.name}</p>
      </div>

      {/* DATE */}
      <FormattedDateTime
        date={file.$createdAt}
        className="col-span-4 body-2 text-light-100"
      />

      {/* SIZE */}
      <p className="col-span-2 text-light-200">
        {convertFileSize(file.size)}
      </p>

      {/* ACTIONS */}
      <div className="ml-auto mr-2">
        <ActionDropdown file={file} />
      </div>

      <div className="divider col-span-12 mt-2" />
    </div>
    </>
  );
};

export default FileRow;
