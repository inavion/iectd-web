"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { getCurrentUser } from "./user.actions";
import { parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { FolderTemplateNode } from "@/templates/Guidance-for-Industry/fda-module2";
import { FDA_GUIDANCE_FOR_INDUSTRY_TEMPLATE } from "@/templates/Guidance-for-Industry/fda-guidance-for-industry";

const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

export const createFolder = async ({
  name,
  parentFolderId,
  path,
}: {
  name: string;
  parentFolderId?: string | null;
  path: string;
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
      }
    );

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
      queries
    );

    // ✅ POPULATE OWNER HERE
    const foldersWithOwners = await Promise.all(
      folders.documents.map(async (folder) => {
        if (!folder.owner) return folder;

        const ownerDoc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          folder.owner
        );

        return {
          ...folder,
          owner: ownerDoc,
        };
      })
    );

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
      { name }
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
      { users: emails }
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
      folderId
    );
  } catch {
    return null;
  }
};

const createFolderTree = async ({
  node,
  parentFolderId,
  path,
}: {
  node: FolderTemplateNode;
  parentFolderId: string | null;
  path: string;
}) => {
  // 1️⃣ Create THIS folder
  const folder = await createFolder({
    name: node.name,
    parentFolderId,
    path,
  });

  // 2️⃣ Create children under it
  if (node.children?.length) {
    for (const child of node.children) {
      await createFolderTree({
        node: child,
        parentFolderId: folder.$id,
        path,
      });
    }
  }
};

export const createFDAGuidanceTemplate = async ({
  parentFolderId,
  path,
}: {
  parentFolderId: string | null;
  path: string;
}) => {
  await createFolderTree({
    node: FDA_GUIDANCE_FOR_INDUSTRY_TEMPLATE,
    parentFolderId,
    path,
  });
};

const getChildFolders = async (parentFolderId: string) => {
  const { databases } = await createAdminClient();

  return databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    [Query.equal("parentFolderId", parentFolderId)]
  );
};

const deleteFolderRecursively = async (folderId: string) => {
  const { databases, storage } = await createAdminClient();

  // 1. Delete all files in this folder
  const filesInFolder = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    [Query.equal("folderId", folderId)]
  );

  for (const file of filesInFolder.documents) {
    // Delete file from database
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      file.$id
    );
    // Delete file from storage
    if (file.bucketFile) {
      await storage.deleteFile(appwriteConfig.bucketId, file.bucketFile);
    }
  }

  // 2. Recursively delete all child folders
  const children = await getChildFolders(folderId);
  for (const child of children.documents) {
    await deleteFolderRecursively(child.$id);
  }

  // 3. Delete this folder
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.foldersCollectionId,
    folderId
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
    queries
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
      { parentFolderId: targetFolderId }
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
        { parentFolderId: targetFolderId }
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
  targetId: string
): Promise<boolean> => {
  const { databases } = await createAdminClient();

  let currentId: string | null = targetId;

  while (currentId) {
    if (currentId === ancestorId) return true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const folderDoc: any = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      currentId
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
    for (const folderId of folderIds) {
      await deleteFolderRecursively(folderId);
    }

    revalidatePath(path);
    return parseStringify({ success: true, count: folderIds.length });
  } catch (error) {
    handleError(error, "Failed to delete folders");
  }
};
