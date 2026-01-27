"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { createFDAGuidanceTemplate } from "@/lib/actions/folder.actions";
import { toast } from "sonner";

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
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  
  // Control dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCreateFDATemplate = async () => {
    if (isCreatingTemplate) return;

    setIsCreatingTemplate(true);

    try {
      await createFDAGuidanceTemplate({
        parentFolderId,
        path: currentPath,
      });
      toast.success("Template created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create template");
    } finally {
      setIsCreatingTemplate(false);
      // Close dropdown when done
      setDropdownOpen(false);
    }
  };

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
      <DropdownMenu 
        open={dropdownOpen} 
        onOpenChange={(open) => {
          // Prevent closing if template is being created
          if (isCreatingTemplate && !open) return;
          setDropdownOpen(open);
        }}
        modal={false}
      >
        <div>
          <DropdownMenuTrigger className="create-new-button h5 shad-active-option lg:rounded-full">
            <div className="flex items-center justify-center ml-5">
              <span className="text-4xl mr-3 lg:items-center">+</span>
              <p className="lg:block hidden">New</p>
            </div>
          </DropdownMenuTrigger>
        </div>

        <div className="w-200 ">
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="create-dropdown-menu"
            onInteractOutside={(e) => {
              // Prevent closing when clicking outside while creating template
              if (isCreatingTemplate) {
                e.preventDefault();
              }
            }}
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

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="active-option">
                <Image
                  src="/assets/icons/templates.png"
                  alt="upload"
                  width={18}
                  height={18}
                />
                Templates
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="create-dropdown-menu !w-67">
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()} // 👈 keeps dropdown open
                  onClick={
                    !isCreatingTemplate ? handleCreateFDATemplate : undefined
                  }
                  className="active-option flex items-center justify-between"
                >
                  <p className="!mr-0">Guidance for Industry M4Q</p>

                  {isCreatingTemplate && (
                    <Image
                      src="/assets/icons/loader.svg"
                      alt="loader"
                      width={16}
                      height={16}
                      className="animate-spin ml-2 invert"
                    />
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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
