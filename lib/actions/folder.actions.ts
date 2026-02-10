"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { getCurrentUser } from "./user.actions";
import { parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { FolderTemplateNode } from "@/templates/Guidance-for-Industry/fda-module2";
import { FDA_GUIDANCE_FOR_INDUSTRY_TEMPLATE } from "@/templates/Guidance-for-Industry/fda-guidance-for-industry";
import { IECTD_FOLDER_STRUCTURE } from "@/components/templates/iectd-folder-structure";

import {
  IECTD_PHASE1_STRUCTURE,
  IECTD_PHASE2_MODULES,
  FolderNode,
} from "@/components/templates/iectd-folder-structure";

const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

export const createFolder = async ({
  name,
  parentFolderId,
  path,
  isSystem,
}: {
  name: string;
  parentFolderId?: string | null;
  path: string;
  isSystem: boolean;
}) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const folder = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      ID.unique(),
      {
        name,
        owner: currentUser.$id,
        accountId: currentUser.accountId,
        parentFolderId,
        isSystem,
      },
    );

    console.log(folder.name, folder.isSystem);

    revalidatePath(path);

    return parseStringify(folder);
  } catch (error) {
    handleError(error, "Failed to create folder");
  }
};

export const getFoldersByParent = async ({
  parentFolderId = null,
}: {
  parentFolderId?: string | null;
}) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const queries = [
      parentFolderId === null
        ? Query.isNull("parentFolderId")
        : Query.equal("parentFolderId", parentFolderId),
      Query.or([
        Query.equal("owner", [currentUser.$id]),
        Query.contains("users", [currentUser.email]),
      ]),
      Query.orderDesc("$createdAt"),
    ];

    const folders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      queries,
    );

    // ✅ POPULATE OWNER HERE
    const ownerIds = [
      ...new Set(folders.documents.map((f) => f.owner).filter(Boolean)),
    ];

    // 2. Fetch all owners in ONE query
    let ownersMap: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const owners = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("$id", ownerIds)],
      );
      ownersMap = Object.fromEntries(owners.documents.map((o) => [o.$id, o]));
    }

    // 3. Map owners to folders (no extra queries!)
    const foldersWithOwners = folders.documents.map((folder) => ({
      ...folder,
      owner: folder.owner ? ownersMap[folder.owner] : null,
    }));

    return parseStringify({
      ...folders,
      documents: foldersWithOwners,
    });
  } catch (error) {
    handleError(error, "Failed to get folders");
  }
};

/* ============================
   RENAME FOLDER
============================ */
export const renameFolder = async ({
  folderId,
  name,
  path,
}: {
  folderId: string;
  name: string;
  path: string;
}) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFolder = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { name },
    );

    revalidatePath(path);
    return parseStringify(updatedFolder);
  } catch (error) {
    handleError(error, "Failed to rename folder");
  }
};

/* ============================
   UPDATE FOLDER USERS (SHARE)
============================ */
export const updateFolderUsers = async ({
  folderId,
  emails,
  path,
}: {
  folderId: string;
  emails: string[];
  path: string;
}) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFolder = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { users: emails },
    );

    revalidatePath(path);
    return parseStringify(updatedFolder);
  } catch (error) {
    handleError(error, "Failed to update folder users");
  }
};

/* ============================
   DELETE FOLDER
   (no storage deletion)
============================ */
export const deleteFolder = async ({
  folderId,
  path,
}: {
  folderId: string;
  path: string;
}) => {
  try {
    await deleteFolderRecursively(folderId);
    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete folder recursively");
  }
};

export const getFolderById = async (folderId: string) => {
  const { databases } = await createAdminClient();

  try {
    return await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
    );
  } catch {
    return null;
  }
};

const createFolderTree = async ({
  node,
  parentFolderId,
  path,
  isSystem,
}: {
  node: FolderTemplateNode;
  parentFolderId: string | null;
  path: string;
  isSystem: boolean;
}) => {
  // 1️⃣ Create THIS folder
  const folder = await createFolder({
    name: node.name,
    parentFolderId,
    path,
    isSystem,
  });

  // 2️⃣ Create children under it
  if (node.children?.length) {
    for (const child of node.children) {
      await createFolderTree({
        node: child,
        parentFolderId: folder.$id,
        path,
        isSystem,
      });
    }
  }
};

export const createFDAGuidanceTemplate = async ({
  parentFolderId,
  path,
  isSystem,
}: {
  parentFolderId: string | null;
  path: string;
  isSystem: boolean;
}) => {
  await createFolderTree({
    node: FDA_GUIDANCE_FOR_INDUSTRY_TEMPLATE,
    parentFolderId,
    path,
    isSystem,
  });
};

const getChildFolders = async (parentFolderId: string) => {
  const { databases } = await createAdminClient();

  return databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [Query.equal("parentFolderId", parentFolderId)],
  );
};

const deleteFolderRecursively = async (folderId: string) => {
  const { databases, storage } = await createAdminClient();

  // 🔒 HARD GUARD (cannot be bypassed)
  const folder = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    folderId,
  );

  if (folder.isSystem === true) {
    throw new Error("System folders cannot be deleted");
  }

  // 1. Delete all files in this folder
  const filesInFolder = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    [Query.equal("folderId", folderId)],
  );

  for (const file of filesInFolder.documents) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      file.$id,
    );

    if (file.bucketFile) {
      await storage.deleteFile(appwriteConfig.bucketId, file.bucketFile);
    }
  }

  // 2. Recursively delete child folders
  const children = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [Query.equal("parentFolderId", folderId)],
  );

  for (const child of children.documents) {
    await deleteFolderRecursively(child.$id);
  }

  // 3. Delete this folder
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    folderId,
  );
};

/* ============================
   SEARCH FOLDERS
============================ */
export const searchFolders = async ({ searchText }: { searchText: string }) => {
  const { databases } = await createAdminClient();
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  const queries = [
    Query.equal("accountId", currentUser.accountId),
    Query.contains("name", searchText),
    Query.limit(10),
  ];

  const folders = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    queries,
  );

  return parseStringify(folders);
};

/* ============================
   MOVE FOLDER TO FOLDER
============================ */
export const moveFolderToFolder = async ({
  folderId,
  targetFolderId,
  path,
}: {
  folderId: string;
  targetFolderId: string | null;
  path: string;
}) => {
  const { databases } = await createAdminClient();

  try {
    // Prevent moving folder into itself
    if (folderId === targetFolderId) {
      throw new Error("Cannot move a folder into itself");
    }

    // Prevent circular reference: check if targetFolderId is a descendant of folderId
    if (targetFolderId) {
      const isDescendant = await isFolderDescendant(folderId, targetFolderId);
      if (isDescendant) {
        throw new Error("Cannot move a folder into its own subfolder");
      }
    }

    const updatedFolder = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId,
      { parentFolderId: targetFolderId },
    );

    revalidatePath(path);
    return parseStringify(updatedFolder);
  } catch (error) {
    handleError(error, "Failed to move folder");
  }
};

/* ============================
   BULK MOVE FOLDERS TO FOLDER
============================ */
export const moveFoldersToFolder = async ({
  folderIds,
  targetFolderId,
  path,
}: {
  folderIds: string[];
  targetFolderId: string | null;
  path: string;
}) => {
  const { databases } = await createAdminClient();

  try {
    const results = [];

    for (const folderId of folderIds) {
      // Prevent moving folder into itself
      if (folderId === targetFolderId) {
        continue; // Skip this folder
      }

      // Prevent circular reference
      if (targetFolderId) {
        const isDescendant = await isFolderDescendant(folderId, targetFolderId);
        if (isDescendant) {
          continue; // Skip this folder
        }
      }

      const updatedFolder = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.foldersCollectionId,
        folderId,
        { parentFolderId: targetFolderId },
      );

      results.push(updatedFolder);
    }

    revalidatePath(path);
    return parseStringify({ success: true, count: results.length });
  } catch (error) {
    handleError(error, "Failed to move folders");
  }
};

/* ============================
   HELPER: Check if targetId is a descendant of ancestorId
============================ */
const isFolderDescendant = async (
  ancestorId: string,
  targetId: string,
): Promise<boolean> => {
  const { databases } = await createAdminClient();

  let currentId: string | null = targetId;

  while (currentId) {
    if (currentId === ancestorId) return true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const folderDoc: any = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      currentId,
    );

    currentId = folderDoc.parentFolderId || null;
  }

  return false;
};

/* ============================
   BULK DELETE FOLDERS
============================ */
export const deleteFolders = async ({
  folderIds,
  path,
}: {
  folderIds: string[];
  path: string;
}) => {
  try {
    const { databases } = await createAdminClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated");

    const folders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("$id", folderIds),
        Query.equal("accountId", currentUser.accountId),
      ],
    );

    const protectedFolders = folders.documents.filter(
      (f) => f.isSystem === true,
    );

    if (protectedFolders.length > 0) {
      throw new Error("Default ieCTD/Drugs folders cannot be deleted");
    }

    for (const folderId of folderIds) {
      await deleteFolderRecursively(folderId);
    }

    revalidatePath(path);
    return parseStringify({ success: true, count: folderIds.length });
  } catch (error) {
    handleError(error, "Failed to delete folders");
  }
};

/* ============================
   CREATE IECTD FOLDER STRUCTURE FOR USER
============================ */
export const createEctdStructureForUser = async ({
  path,
}: {
  path: string;
}) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  // Check if user already has the ieCTD root folder
  const { databases } = await createAdminClient();
  const existingFolders = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [
      Query.equal("accountId", currentUser.accountId),
      Query.equal("name", "ieCTD/Drugs"),
      Query.isNull("parentFolderId"),
    ],
  );

  if (existingFolders.total > 0) {
    // Structure already exists
    return parseStringify({
      status: "exists",
      folderId: existingFolders.documents[0].$id,
    });
  }

  // Create the folder structure recursively
  const createFolderNodeRecursively = async (
    node: FolderNode,
    parentFolderId: string | null,
  ): Promise<string> => {
    const folder = await createFolder({
      name: node.name,
      parentFolderId,
      path,
      isSystem: true,
    });

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await createFolderNodeRecursively(child, folder.$id);
      }
    }

    return folder.$id;
  };

  const rootFolderId = await createFolderNodeRecursively(
    IECTD_FOLDER_STRUCTURE,
    null,
  );

  revalidatePath(path);
  return parseStringify({ status: "created", folderId: rootFolderId });
};

/* ============================
   GET ALL FOLDERS FOR TREE VIEW
============================ */
export const getAllFoldersForTree = async () => {
  const { databases } = await createAdminClient();
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  const folders = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [
      Query.equal("accountId", currentUser.accountId),
      Query.limit(1000), // Adjust as needed
      Query.orderAsc("name"),
    ],
  );

  return parseStringify(folders.documents);
};

/* ============================
   FIND OR CREATE FOLDER BY PATH
   Creates folders along the path if they don't exist
============================ */
export const findOrCreateFolderByPath = async ({
  path: folderPath,
  currentPath,
  isSystem,
}: {
  path: string[]; // e.g., ["m2", "22-intro"]
  currentPath: string;
  isSystem: boolean;
}): Promise<string> => {
  const { databases } = await createAdminClient();
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  let parentFolderId: string | null = null;

  for (const folderName of folderPath) {
    // Build query based on parent
    const parentQuery = parentFolderId
      ? Query.equal("parentFolderId", parentFolderId)
      : Query.isNull("parentFolderId");

    // Try to find existing folder with this name under the current parent
    const existingFolders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("accountId", currentUser.accountId),
        Query.equal("name", folderName),
        parentQuery,
      ],
    );

    if (existingFolders.total > 0) {
      // Folder exists, use it
      parentFolderId = existingFolders.documents[0].$id as string;
    } else {
      // Create the folder
      const newFolder = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.foldersCollectionId,
        ID.unique(),
        {
          name: folderName,
          parentFolderId: parentFolderId,
          owner: currentUser.$id,
          accountId: currentUser.accountId,
          isSystem: false,
        },
      );
      parentFolderId = newFolder.$id as string;
    }
  }

  revalidatePath(currentPath);
  return parentFolderId!;
};

export const createEctdPhase1 = async ({ path }: { path: string }) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  const { databases } = await createAdminClient();

  // Check if root already exists
  const existing = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [
      Query.equal("accountId", currentUser.accountId),
      Query.equal("name", "ieCTD/Drugs"),
      Query.isNull("parentFolderId"),
    ],
  );

  if (existing.total > 0) {
    return parseStringify({
      status: "exists",
      folderId: existing.documents[0].$id,
    });
  }

  // Create Phase 1 structure
  const createNodeRecursively = async (
    node: FolderNode,
    parentFolderId: string | null,
  ): Promise<string> => {
    const folder = await createFolder({
      name: node.name,
      parentFolderId,
      path,
      isSystem: true,
    });

    if (node.children) {
      for (const child of node.children) {
        await createNodeRecursively(child, folder.$id);
      }
    }

    return folder.$id;
  };

  const rootFolderId = await createNodeRecursively(
    IECTD_PHASE1_STRUCTURE,
    null,
  );

  revalidatePath(path);
  return parseStringify({ status: "created", folderId: rootFolderId });
};

// Create Phase 2: m3, m4, m5 (background, after sign-in)
// Create Phase 2: m3, m4, m5 (background, after sign-in)
export const createEctdPhase2 = async ({ path }: { path: string }) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("User not authenticated");

  const { databases } = await createAdminClient();

  // Find the root folder
  const rootFolders = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [
      Query.equal("accountId", currentUser.accountId),
      Query.equal("name", "ieCTD/Drugs"),
      Query.isNull("parentFolderId"),
    ],
  );

  if (rootFolders.total === 0) {
    throw new Error("Root folder not found");
  }

  const rootFolderId = rootFolders.documents[0].$id;

  // Check which modules already exist under root - SKIP them entirely
  const existingModules = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [
      Query.equal("accountId", currentUser.accountId),
      Query.equal("parentFolderId", rootFolderId),
    ],
  );

  const existingModuleNames = new Set(
    existingModules.documents.map((doc) => doc.name),
  );

  // Filter to only modules that don't exist yet
  const modulesToCreate = IECTD_PHASE2_MODULES.filter(
    (name) => !existingModuleNames.has(name),
  );

  // If all modules exist, skip
  if (modulesToCreate.length === 0) {
    return parseStringify({ status: "already_complete" });
  }

  // Get full structure for modules to create
  const fullStructure = IECTD_FOLDER_STRUCTURE;
  const phase2Modules =
    fullStructure.children?.filter((child) =>
      modulesToCreate.includes(child.name),
    ) || [];

  // Create Phase 2 modules (only ones that don't exist)
  const createNodeRecursively = async (
    node: FolderNode,
    parentFolderId: string | null,
  ): Promise<string> => {
    // Check if folder already exists
    const parentQuery = parentFolderId
      ? Query.equal("parentFolderId", parentFolderId)
      : Query.isNull("parentFolderId");

    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("accountId", currentUser.accountId),
        Query.equal("name", node.name),
        parentQuery,
      ],
    );

    let folderId: string;

    if (existing.total > 0) {
      // Folder exists, use it (don't create duplicate)
      folderId = existing.documents[0].$id;
    } else {
      // Create the folder
      const folder = await createFolder({
        name: node.name,
        parentFolderId,
        path,
        isSystem: true,
      });
      folderId = folder.$id;
    }

    // Create children
    if (node.children) {
      for (const child of node.children) {
        await createNodeRecursively(child, folderId);
      }
    }

    return folderId;
  };

  // Create each module under root
  for (const module of phase2Modules) {
    await createNodeRecursively(module, rootFolderId);
  }

  revalidatePath(path);
  return parseStringify({ status: "completed" });
};

// Check if Phase 2 is complete
export const isPhase2Complete = async (): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    const { databases } = await createAdminClient();

    // Just check if root folder exists
    const rootFolders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("accountId", currentUser.accountId),
        Query.equal("name", "ieCTD/Drugs"),
        Query.isNull("parentFolderId"),
      ],
    );

    return rootFolders.total > 0;
  } catch (error) {
    console.error("isPhase2Complete error:", error);
    return false;
  }
};
