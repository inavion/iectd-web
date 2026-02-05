"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Models } from "node-appwrite";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { getAllTemplateFolderNames } from "@/components/templates/iectd-folder-structure";

import {
  renameFolder,
  deleteFolder,
  updateFolderUsers,
} from "@/lib/actions/folder.actions";
import { FolderDetails, ShareInput } from "@/components/ActionsModalContent";
import { folderDropdownItems } from "@/constants";

type Folder = Models.Document & {
  name: string;
  users: string[];
};

const FolderDropdown = ({ folder }: { folder: Folder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);

  const [name, setName] = useState(folder.name);
  const [emails, setEmails] = useState<string[]>(folder.users || []);
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is a protected template folder
  const templateFolderNames = getAllTemplateFolderNames();
  const isProtectedFolder = templateFolderNames.includes(folder.name);

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(folder.name);
    setEmails(folder.users || []);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFolder({
          folderId: folder.$id,
          name,
          path,
        }),
      share: () =>
        updateFolderUsers({
          folderId: folder.$id,
          emails,
          path,
        }),
      delete: () =>
        deleteFolder({
          folderId: folder.$id,
          path,
        }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) {
      closeAllModals();
    }
    setIsLoading(false);
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { label, value } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>

          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {value === "details" && <FolderDetails folder={folder as any} />}

          {value === "share" && (
            <ShareInput
              file={folder as any}
              onInputChange={setEmails}
              onRemove={(email) =>
                setEmails((prev) => prev.filter((e) => e !== email))
              }
            />
          )}
        </DialogHeader>

        {value === "delete" && (
          <p className="delete-confirmation-text text-center">
            Are you sure you want to delete{" "}
            <span className="delete-file-name">{folder.name}</span>?
          </p>
        )}

        {["rename", "share", "delete"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row text-white">
            <Button
              onClick={closeAllModals}
              className="modal-cancel-button"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={!isLoading ? handleAction : undefined}
              className="modal-submit-button primary-btn"
              disabled={isLoading}
            >
              <p className="capitalize">{label}</p>
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
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (isLoading) return;
        setIsModalOpen(open);
      }}
    >
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
            className="rotate-90 cursor-pointer"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel className="truncate max-w-[200px]">
            {folder.name}
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-light-200/20 my-2" />

          {folderDropdownItems
            .filter((item) => !(isProtectedFolder && item.value === "delete"))
            .map((item) => (
              <DropdownMenuItem
                key={item.value}
                className="active-option"
                onClick={() => {
                  setAction(item as ActionType);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                  />
                  {item.label}
                </div>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default FolderDropdown;
