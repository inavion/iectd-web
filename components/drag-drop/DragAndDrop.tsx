"use client";

import { useCallback, useState, useEffect } from "react";

import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/lib/actions/file.actions";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "sonner";
import { usePathname, useParams } from "next/navigation";
import { getFileType, convertFileToUrl } from "@/lib/utils";
import Thumbnail from "@/components/Thumbnail";
import Image from "next/image";

interface DragAndDropProps {
  ownerId: string;
  accountId: string;
  mode: "empty" | "overlay";
}

export default function DragAndDrop({
  ownerId,
  accountId,
  mode,
}: DragAndDropProps) {
  const [files, setFiles] = useState<File[]>([]);

  const path = usePathname();
  const params = useParams();
  const parentFolderId =
    typeof params?.folderId === "string" ? params.folderId : null;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prev) => prev.filter((f) => f.name !== file.name));
          return toast("File too large", {
            description: `${file.name} exceeds 5MB.`,
            className: "error-toast",
          });
        }

        return uploadFile({
          file,
          ownerId,
          accountId,
          folderId: parentFolderId,
          path,
        }).then((uploaded) => {
          if (uploaded) {
            setFiles((prev) => prev.filter((f) => f.name !== file.name));
            toast.success(`Uploaded ${file.name}`);
          }
        });
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, parentFolderId, path]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLSpanElement>,
    fileName: string
  ) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div
      {...getRootProps()}
      className={`
    absolute inset-0 z-40
    flex items-center justify-center
    rounded-[20px]
    transition-all duration-200
    ${
      mode === "empty"
        ? "border-2 border-dashed border-light-200 hover:bg-brand-100/10"
        : isDragActive
          ? "bg-blue-500/10 border-2 border-dashed border-blue-400"
          : "pointer-events-none"
    }
  `}
    >
      <input {...getInputProps()} />

      {mode === "empty" && (
        <div className="flex flex-col items-center justify-center animate-bounce m-5">
          <Image
            src="/assets/icons/upload2.png"
            alt="upload"
            width={60}
            height={50}
            className="mb-4"
          />

          <div className="flex flex-col items-center text-center select-none bg-brand primary-btn py-5 px-10">
            <p className="text-base font-medium text-white mb-1">
              Drop files here
            </p>

            <p className="text-sm text-brand-100/80">
              Or use the <span className="font-medium">New</span> button
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY STATE (FILES EXIST) */}
      {mode === "overlay" && isDragActive && (
        <p className="h4 text-center">Drop files here</p>
      )}

      {/* Pending uploads */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2 w-full max-w-xl mt-4">
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            const url = convertFileToUrl(file);

            return (
              <li
                key={index}
                className="flex justify-between items-center bg-white rounded-[20px] p-2 shadow-sm"
              >
                <div className="flex items-center gap-3 p-2">
                  <Thumbnail
                    type={
                      type as "document" | "image" | "video" | "audio" | "other"
                    }
                    extension={extension}
                    url={url}
                    imageClassName="w-10 h-10"
                  />
                  <span className="truncate">{file.name}</span>
                </div>

                <span
                  className="cursor-pointer text-red-500 font-bold mb-11 mr-1"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                >
                  ×
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
