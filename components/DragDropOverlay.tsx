"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/lib/actions/file.actions";
import { MAX_FILE_SIZE } from "@/constants";
import { toast } from "sonner";
import { usePathname, useParams } from "next/navigation";
import { getFileType, convertFileToUrl } from "@/lib/utils";
import Thumbnail from "@/components/Thumbnail";
import Image from "next/image";

interface DragOverlayProps {
  ownerId: string;
  accountId: string;
}

export default function DragOverlay({ ownerId, accountId }: DragOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const path = usePathname();
  const params = useParams();
  const parentFolderId =
    typeof params?.folderId === "string" ? params.folderId : null;

  /* ──────────────────────────────────────
     1️⃣ GLOBAL WINDOW DRAG LISTENER (KEY)
  ────────────────────────────────────── */
  useEffect(() => {
    let dragCounter = 0;

    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      dragCounter++;
      setIsVisible(true);
    };

    const onDragLeave = () => {
      dragCounter--;
      if (dragCounter === 0) setIsVisible(false);
    };

    const onDrop = () => {
      dragCounter = 0;
      setIsVisible(false);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  /* ──────────────────────────────────────
     2️⃣ ACTUAL DROP HANDLER
  ────────────────────────────────────── */
  const onDropFiles = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prev) => prev.filter((f) => f.name !== file.name));

          toast("File too large", {
            description: `${file.name} exceeds 5MB.`,
            className: "error-toast",
          });
          return;
        }

        await uploadFile({
          file,
          ownerId,
          accountId,
          folderId: parentFolderId,
          path,
        });

        setFiles((prev) => prev.filter((f) => f.name !== file.name));
        toast.success(`Uploaded ${file.name}`);
      });

      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, parentFolderId, path]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropFiles,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  /* ──────────────────────────────────────
     3️⃣ RENDER ONLY WHEN DRAGGING
  ────────────────────────────────────── */
  if (!isVisible) return null;

  return (
    <div
      {...getRootProps()}
      className="
    absolute inset-0 z-50
    flex flex-col items-center justify-center
    rounded-[20px]
    border-2 border-dashed border-light-200 bg-brand-100/10
    pointer-events-auto
    p-6
  "
    >
      <input {...getInputProps()} />

      <div className=" animate-bounce m-5">
        <Image
          src="/assets/icons/upload2.png"
          alt="upload"
          width={60}
          height={60}
        />
      </div>

      <div className="flex flex-col select-none bg-brand text-center primary-btn py-5 px-10">
        <p className="text-base font-medium text-white mb-1">Drop files here</p>

        <p className="text-sm text-brand-100/80">
          Or use the <span className="font-medium">New</span> button
        </p>
      </div>

      {files.length > 0 && (
        <ul className="uploader-preview-list w-full max-w-xl">
          <h4 className="h4 text-light-100">Uploading...</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li key={index} className="uploader-preview-item">
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={
                      type as "document" | "image" | "video" | "audio" | "other"
                    }
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />
                  <div className="preview-item-name subtitle-2">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      alt="loader"
                      width={80}
                      height={26}
                      unoptimized={false}
                    />
                  </div>

                  <Image
                    src="/assets/icons/remove.svg"
                    alt="remove"
                    width={24}
                    height={24}
                    className="cursor-pointer text-red-500 font-bold mb-11 mr-1"
                    onClick={(e) =>
                      setFiles((prev) =>
                        prev.filter((f) => f.name !== file.name)
                      )
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
