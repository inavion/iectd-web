"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { getCurrentUser } from "./user.actions";
import { parseStringify } from "../utils";
import { revalidatePath } from "next/cache";

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
      "folders",
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
      Query.equal("accountId", currentUser.accountId),
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
      "folders",
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
      "folders",
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
      "folders",
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
  const { databases } = await createAdminClient();

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      "folders",
      folderId
    );

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete folder");
  }
};


export const getFolderById = async (folderId: string) => {
  const { databases } = await createAdminClient();

  try {
    return await databases.getDocument(
      appwriteConfig.databaseId,
      "folders",
      folderId
    );
  } catch {
    return null;
  }
};
