"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteFiles } from "@/lib/actions/file.actions";
import { deleteFolders } from "@/lib/actions/folder.actions";
import { toast } from "sonner";

interface SelectedItem {
  id: string;
  type: "file" | "folder";
  name: string;
  bucketFileId?: string;
  isSystem?: boolean;
}

interface SelectionActionsProps {
  selectedItems: SelectedItem[];
  onClearSelection: () => void;
}

const SelectionActions = ({
  selectedItems,
  onClearSelection,
}: SelectionActionsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const path = usePathname();

  const hasSystemItem = selectedItems.some(
    (item) => item.isSystem === true
  );

  const showToolbar = selectedItems.length > 0;

  if (!showToolbar) return null;

  const fileCount = selectedItems.filter((item) => item.type === "file").length;
  const folderCount = selectedItems.filter(
    (item) => item.type === "folder"
  ).length;

  const getSelectionText = () => {
    const parts = [];
    if (fileCount > 0)
      parts.push(`${fileCount} file${fileCount > 1 ? "s" : ""}`);
    if (folderCount > 0)
      parts.push(`${folderCount} folder${folderCount > 1 ? "s" : ""}`);
    return parts.join(" and ");
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const filesToDelete = selectedItems
        .filter(
          (item) =>
            item.type === "file" &&
            item.bucketFileId &&
            item.isSystem !== true
        )
        .map((item) => ({
          fileId: item.id,
          bucketFileId: item.bucketFileId!,
        }));

      const folderIds = selectedItems
        .filter((item) => item.type === "folder" && item.isSystem !== true)
        .map((item) => item.id);

      if (filesToDelete.length > 0) {
        await deleteFiles({ files: filesToDelete, path });
      }

      if (folderIds.length > 0) {
        await deleteFolders({ folderIds, path });
      }

      toast.success(`Deleted ${getSelectionText()}`);
      onClearSelection();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete items");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Selection toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-4 border border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {selectedItems.length} selected
        </span>

        <div className="h-4 w-px bg-gray-300" />

        {/* Delete button only appears if NO system item is selected */}
        {!hasSystemItem && (
          <>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Image
                src="/assets/icons/delete.svg"
                alt="delete"
                width={16}
                height={16}
                className="opacity-70"
              />
              Delete
            </button>

            <div className="h-4 w-px bg-gray-300" />
          </>
        )}

        <button
          onClick={onClearSelection}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Image
            src="/assets/icons/close.svg"
            alt="clear"
            width={14}
            height={14}
            className="opacity-70 invert"
          />
          Clear
        </button>
      </div>

      {/* Delete confirmation modal */}
      <Dialog
        open={!hasSystemItem && isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setIsDeleteModalOpen(open);
        }}
      >
        <DialogContent
          className={`shad-dialog button ${
            isDeleting ? "[&>button]:hidden" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-light-100">
              Delete {getSelectionText()}?
            </DialogTitle>
          </DialogHeader>

          <p className="text-center text-light-200 text-sm py-2">
            Are you sure you want to delete {getSelectionText()}? This action
            cannot be undone.
          </p>

          <DialogFooter className="flex flex-col gap-3 md:flex-row text-white">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              className="modal-cancel-button"
              disabled={isDeleting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDelete}
              className="modal-cancel-button !bg-red-500 !text-white"
              disabled={isDeleting}
            >
              Delete
              {isDeleting && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectionActions;