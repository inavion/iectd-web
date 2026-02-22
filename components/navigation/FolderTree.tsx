// components/navigation/FolderTree.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/user.actions";

interface TreeFolder {
  $id: string;
  name: string;
  parentFolderId: string | null;
  children?: TreeFolder[];
}

interface FolderTreeNodeProps {
  folder: TreeFolder;
  level: number;
  currentFolderId?: string | null;
}

const FolderTreeNode = async ({
  folder,
  level,
  currentFolderId,
}: FolderTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;
  const isActive = currentFolderId === folder.$id;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    ("User unathenticated");
  }

  // Style for items with children (like MODULE 2, MODULE 3)
  const isModule = hasChildren && level === 1;
  // Style for leaf items (like 22-intro, 23-qos)
  const isLeaf = !hasChildren;

  return (
    <div>
      <div
        className={`
          flex items-center justify-between py-2 px-3 cursor-pointer
          transition-colors duration-150
          ${isActive ? "bg-[#E8F4FD] text-[#0EA5E9]" : "hover:bg-gray-50"}
          ${isModule ? "font-medium text-gray-700" : "text-gray-600"}
          ${level === 0 ? "text-base" : "text-sm"}
        `}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <Link
          href={`/folders/${folder.$id}`}
          className="flex-1 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {folder.name}
        </Link>

        {hasChildren && (
          <span className="text-gray-400 ml-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
      </div>

      {/* Expanded children */}
      {isExpanded && hasChildren && (
        <div className="bg-white">
          {folder.children!.map((child) => (
            <div
              key={child.$id}
              style={{ paddingLeft: `${(level + 1) * 12}px` }}
            >
              <FolderTreeNode
                folder={child}
                level={level + 1}
                currentFolderId={currentFolderId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface FolderTreeProps {
  currentFolderId?: string | null;
}

const FolderTree = ({ currentFolderId }: FolderTreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState<TreeFolder[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch folders when opened
  useEffect(() => {
    if (isOpen && folders.length === 0) {
      setLoading(true);
      fetch("/api/folders/tree")
        .then((res) => res.json())
        .then((data) => setFolders(data || []));
    }
  }, [isOpen, folders.length]);

  // Build tree structure from flat folder list
  const buildTree = (folders: TreeFolder[]): TreeFolder[] => {
    const folderMap = new Map<string, TreeFolder>();
    const rootFolders: TreeFolder[] = [];

    folders.forEach((folder) => {
      folderMap.set(folder.$id, { ...folder, children: [] });
    });

    folders.forEach((folder) => {
      const folderWithChildren = folderMap.get(folder.$id)!;
      if (folder.parentFolderId && folderMap.has(folder.parentFolderId)) {
        const parent = folderMap.get(folder.parentFolderId)!;
        parent.children = parent.children || [];
        parent.children.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    // Sort children alphabetically
    const sortChildren = (nodes: TreeFolder[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach((node) => {
        if (node.children) sortChildren(node.children);
      });
    };
    sortChildren(rootFolders);

    return rootFolders;
  };

  const treeData = buildTree(folders);

  return (
    <div className="relative">
      {/* Templates trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`
          flex items-center justify-between w-full px-3 py-2.5
          text-gray-700 hover:bg-gray-50 rounded-lg transition-colors
          ${isOpen ? "bg-gray-50" : ""}
        `}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/assets/icons/folder.svg"
            alt="templates"
            width={24}
            height={24}
            className="opacity-70"
          />
          <span className="font-medium hidden lg:block">Templates</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 hidden lg:block" />
      </button>

      {/* Flyout panel */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Flyout menu */}
          <div
            className="
              absolute left-full top-0 ml-2 z-50
              bg-white rounded-xl shadow-lg border border-gray-100
              min-w-[220px] max-w-[280px] max-h-[70vh] overflow-y-auto
              py-2
            "
            onMouseLeave={() => setIsOpen(false)}
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loading"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              </div>
            ) : treeData.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-3">No folders yet</p>
            ) : (
              treeData.map((folder) => (
                <FolderTreeNode
                  key={folder.$id}
                  folder={folder}
                  level={0}
                  currentFolderId={currentFolderId}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FolderTree;
