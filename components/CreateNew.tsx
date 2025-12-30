"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createFolder } from "@/lib/actions/folder.actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const CreateNew = ({
  currentPath,
  parentFolderId,
}: {
  currentPath: string;
  parentFolderId: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("Untitled folder");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setIsLoading(true);

    await createFolder({
      name: folderName,
      parentFolderId,
      path: currentPath,
    });

    setIsLoading(false);
    setFolderName("");
    setOpen(false);
  };

  return (
    <>
      {/* ===== Step C-2: + New Dropdown ===== */}
      <DropdownMenu>
        <div>
          <DropdownMenuTrigger className="create-new-button h5 border-brand/20 border-1 shad-active-option lg:rounded-full">
            <div className="flex items-center justify-center ml-5">
              <span className="text-4xl mr-3 lg:items-center">+</span>
              <p className="lg:block hidden">New</p>
            </div>
          </DropdownMenuTrigger>
        </div>

        <div className="w-200">
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="create-dropdown-menu"
          >
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="active-option"
            >
              <Image
                src="/assets/icons/close.svg"
                alt="folder"
                width={18}
                height={18}
                className="invert rotate-45"
              />
              New folder
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-brand-100/50" />

            <DropdownMenuItem className="active-option">
              <Image
                src="/assets/icons/upload.svg"
                alt="upload"
                width={18}
                height={18}
                className="invert"
              />
              File upload
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>

      {/* ===== Step C-3: Folder Modal ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="shad-dialog button">
          <DialogHeader>
            <DialogTitle className="text-center text-light-100">
              New folder
            </DialogTitle>
          </DialogHeader>

          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />

          <DialogFooter className="flex flex-col gap-3 md:flex-row text-white">
            <Button
              onClick={() => setOpen(false)}
              className="modal-cancel-button"
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateFolder}
              className="modal-submit-button primary-btn text-white"
            >
              Create
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateNew;
