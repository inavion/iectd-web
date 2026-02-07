"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
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
import {
  createFolder,
  findOrCreateFolderByPath,
} from "@/lib/actions/folder.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IECTD_FOLDER_STRUCTURE,
  FolderNode,
} from "@/components/templates/iectd-folder-structure";
import { toast } from "sonner";

// Format module name: "m2" -> "MODULE 2", "m3" -> "MODULE 3"
const formatModuleName = (name: string): string => {
  const match = name.match(/^m(\d+)$/i);
  if (match) {
    return `MODULE ${match[1]}`;
  }
  return name;
};

// Check if name is a module (m2, m3, etc.)
const isModule = (name: string): boolean => {
  return /^m\d+$/i.test(name);
};

// Recursive tree node component
const FolderTreeNode = ({
  node,
  level,
  path,
  onNavigate,
}: {
  node: FolderNode;
  level: number;
  path: string[]; // Path from root to this node
  onNavigate: (folderPath: string[]) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChildren = node.children && node.children.length > 0;
  const isModuleLevel = isModule(node.name);
  const displayName = isModuleLevel ? formatModuleName(node.name) : node.name;
  const currentPath = [...path, node.name];

  // Only auto-expand on hover for MODULE level items
  const handleMouseEnter = () => {
    if (hasChildren && isModuleLevel) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsExpanded(true);
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (isModuleLevel) {
      setTimeout(() => {
        setIsExpanded(false);
      }, 150);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasChildren) {
      // Toggle expand for items with children
      setIsExpanded(!isExpanded);
    } else {
      // Navigate to folder for leaf items
      onNavigate(currentPath);
    }
  };

  // For non-module items with children, click on name navigates, chevron toggles
  const handleNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isModuleLevel) {
      // Non-module items: clicking name navigates to folder
      onNavigate(currentPath);
    } else if (hasChildren) {
      // Module items with children: clicking toggles expand
      setIsExpanded(!isExpanded);
    } else {
      // Module items without children: navigate to folder
      onNavigate(currentPath);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div
        className={`
          flex items-center justify-between py-2.5 px-4 cursor-pointer
          transition-colors duration-150
          ${isExpanded && isModuleLevel ? "bg-[#E8F4FD]" : "hover:bg-gray-50"}
          ${isModuleLevel ? "font-medium text-gray-700" : "text-gray-600"}
        `}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
      >
        <span
          className="flex-1 truncate text-sm hover:text-brand"
          onClick={handleNameClick}
        >
          {displayName}
        </span>

        {hasChildren && (
          <span
            className="text-gray-400 ml-2 hover:text-gray-600"
            onClick={handleChevronClick}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
      </div>

      {/* Expanded children */}
      <div
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        {hasChildren &&
          node.children!.map((child, index) => (
            <FolderTreeNode
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              path={currentPath}
              onNavigate={onNavigate}
            />
          ))}
      </div>
    </div>
  );
};

const CreateNew = ({
  currentPath,
  parentFolderId,
}: {
  currentPath: string;
  parentFolderId: string | null;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("Untitled folder");
  const [isLoading, setIsLoading] = useState(false);
  const [guidanceExpanded, setGuidanceExpanded] = useState(false);
  const guidanceHoverRef = useRef<NodeJS.Timeout | null>(null);

  // Get the modules from the static structure (m2, m3, m4, m5)
  const modules = IECTD_FOLDER_STRUCTURE.children || [];

  const handleGuidanceMouseEnter = () => {
    guidanceHoverRef.current = setTimeout(() => {
      setGuidanceExpanded(true);
    }, 200);
  };

  const handleGuidanceMouseLeave = () => {
    if (guidanceHoverRef.current) {
      clearTimeout(guidanceHoverRef.current);
      guidanceHoverRef.current = null;
    }
  };

  // Navigate to folder - creates the path if it doesn't exist
  const handleNavigateToFolder = async (folderPath: string[]) => {
    try {
      // Add "Guidance for Industry" as the root folder
      const fullPath = ["Guidance for Industry", ...folderPath];

      const folderId = await findOrCreateFolderByPath({
        path: fullPath,
        currentPath,
        isSystem: false,
      });

      router.push(`/folders/${folderId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to open folder");
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setIsLoading(true);

    await createFolder({
      name: folderName,
      parentFolderId,
      path: currentPath,
      isSystem: false,
    });

    setIsLoading(false);
    setFolderName("");
    setOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <div>
          <DropdownMenuTrigger className="create-new-button h5 shad-active-option lg:rounded-full">
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

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="active-option text-gray-400 cursor-not-allowed pointer-events-none line-through">
                <Image
                  src="/assets/icons/templates.png"
                  alt="templates"
                  width={18}
                  height={18}
                />
                Templates
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="create-dropdown-menu !w-[220px] !p-0 max-h-[70vh] overflow-y-auto">
                {/* Guidance for Industry - expands below on hover */}
                <div
                  onMouseEnter={handleGuidanceMouseEnter}
                  onMouseLeave={handleGuidanceMouseLeave}
                >
                  <div
                    className={`
                      flex items-center justify-between py-2.5 px-4 cursor-pointer
                      transition-colors duration-150
                      ${guidanceExpanded ? "bg-[#E8F4FD]" : "hover:bg-gray-50"}
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setGuidanceExpanded(!guidanceExpanded);
                    }}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Guidance for Industry
                    </span>
                    <span className="text-gray-400">
                      {guidanceExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  </div>

                  {/* Tree content below Guidance for Industry */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-200 ease-in-out
                      ${guidanceExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    {modules.map((module, index) => (
                      <FolderTreeNode
                        key={`${module.name}-${index}`}
                        node={module}
                        level={1}
                        path={[]}
                        onNavigate={handleNavigateToFolder}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>

      {/* Folder Modal */}
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
