"use server";

import { InputFile } from "node-appwrite/file";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";
import { getAccessToken, getUserEmail } from "./auth.actions";

const API_BASE_URL = process.env.NEXT_PUBLIC_APPWRITE_API_BASE_URL;

const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

// Upload file to vector store for RAG
const uploadToVectorStore = async ({
  file,
  vectorStoreName,
  filePath,
  appwriteBucketFileId,
}: {
  file: File;
  vectorStoreName: string;
  filePath: string;
  appwriteBucketFileId: string;
}): Promise<{ success: boolean }> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.error("No access token available for vector store upload");
      return { success: false };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("vector_store_name", vectorStoreName);
    formData.append("file_path", filePath);
    formData.append("appwrite_bucket_file_id", appwriteBucketFileId);

    const response = await fetch(`${API_BASE_URL}/upload-to-vector-store`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "Vector store upload failed:",
        errorData.detail || response.status,
      );
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error uploading to vector store:", error);
    return { success: false };
  }
};

// Delete file from vector store
const deleteFromVectorStore = async ({
  vectorStoreName,
  appwriteBucketFileId,
}: {
  vectorStoreName: string;
  appwriteBucketFileId: string;
}): Promise<{ success: boolean }> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      console.error("No access token available for vector store deletion");
      return { success: false };
    }

    const response = await fetch(
      `${API_BASE_URL}/vector-stores/${vectorStoreName}/appwritebucketfiles/${appwriteBucketFileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "Vector store deletion failed:",
        errorData.detail || response.status
      );
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting from vector store:", error);
    return { success: false };
  }
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  folderId,
  path,
}: UploadFileProps & { folderId: string | null; path: string }) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFile: bucketFile.$id,
      folderId,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )

      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    // Upload to vector store for RAG (non-blocking)
    const userEmail = await getUserEmail();
    if (userEmail && newFile) {
      // Build file path based on folder structure
      let filePath = `/${bucketFile.name}`;
      if (folderId) {
        try {
          // Get folder path
          const folderPath = await getFolderPath(databases, folderId);
          filePath = `${folderPath}/${bucketFile.name}`;
        } catch (error) {
          console.error("Error getting folder path:", error);
        }
      }

      // Upload to vector store (don't await to not block the response)
      uploadToVectorStore({
        file,
        vectorStoreName: userEmail,
        filePath,
        appwriteBucketFileId: bucketFile.$id,
      }).catch((error) => {
        console.error("Vector store upload failed:", error);
      });
    }

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

// Helper function to get folder path
const getFolderPath = async (
  databases: ReturnType<
    Awaited<ReturnType<typeof createAdminClient>>["databases"]["getDocument"]
  > extends Promise<infer T>
    ? {
        getDocument: (
          ...args: Parameters<
            Awaited<
              ReturnType<typeof createAdminClient>
            >["databases"]["getDocument"]
          >
        ) => Promise<T>;
      }
    : never,
  folderId: string,
): Promise<string> => {
  const pathParts: string[] = [];
  let currentFolderId: string | null = folderId;

  while (currentFolderId) {
    const folder = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      currentFolderId,
    )) as Models.Document & { name: string; parentId?: string | null };

    pathParts.unshift(folder.name);
    currentFolderId = folder.parentId || null;
  }

  return "/" + pathParts.join("/");
};

const createQueries = (
  currentUser: Models.Document & { email: string },
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, [], searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    // Populate owner data and fix URLs for each file
    const filesWithOwners = await Promise.all(
      files.documents.map(async (file) => {
        // Regenerate the correct URL from bucketFile ID
        const correctUrl = constructFileUrl(file.bucketFile);

        if (file.owner) {
          const ownerDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            file.owner,
          );
          return {
            ...file,
            url: correctUrl,
            owner: ownerDoc,
          } as Models.Document;
        }
        return { ...file, url: correctUrl } as Models.Document;
      }),
    );

    return parseStringify({ ...files, documents: filesWithOwners });
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFileUsers = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

      // Delete from vector store (non-blocking)
      const userEmail = await getUserEmail();
      if (userEmail) {
        deleteFromVectorStore({
          vectorStoreName: userEmail,
          appwriteBucketFileId: bucketFileId,
        }).catch((error) => {
          console.error("Vector store deletion failed:", error);
        });
      }
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as
        | "image"
        | "document"
        | "video"
        | "audio"
        | "other";
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}

export const getFilesByFolder = async ({
  folderId,
}: {
  folderId: string | null;
}) => {
  const { databases } = await createAdminClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) throw new Error("Not authenticated");

  // Build base queries (owner/shared check + sorting)
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
    folderId === null
      ? Query.isNull("folderId")
      : Query.equal("folderId", folderId),
    Query.orderDesc("$createdAt"),
  ];

  const files = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    queries,
  );

  return parseStringify(files);
};

/* ============================
   MOVE FILE TO FOLDER
============================ */
export const moveFileToFolder = async ({
  fileId,
  targetFolderId,
  path,
}: {
  fileId: string;
  targetFolderId: string | null;
  path: string;
}) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { folderId: targetFolderId },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to move file");
  }
};

/* ============================
   BULK MOVE FILES TO FOLDER
============================ */
export const moveFilesToFolder = async ({
  fileIds,
  targetFolderId,
  path,
}: {
  fileIds: string[];
  targetFolderId: string | null;
  path: string;
}) => {
  const { databases } = await createAdminClient();

  try {
    const results = await Promise.all(
      fileIds.map((fileId) =>
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          fileId,
          { folderId: targetFolderId },
        ),
      ),
    );

    revalidatePath(path);
    return parseStringify({ success: true, count: results.length });
  } catch (error) {
    handleError(error, "Failed to move files");
  }
};

/* ============================
   BULK DELETE FILES
============================ */
export const deleteFiles = async ({
  files,
  path,
}: {
  files: { fileId: string; bucketFileId: string }[];
  path: string;
}) => {
  const { databases, storage } = await createAdminClient();

  try {
    const results = await Promise.all(
      files.map(async ({ fileId, bucketFileId }) => {
        const deletedFile = await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          fileId,
        );

        if (deletedFile) {
          await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

          // Delete from vector store (non-blocking)
          const userEmail = await getUserEmail();
          if (userEmail) {
            deleteFromVectorStore({
              vectorStoreName: userEmail,
              appwriteBucketFileId: bucketFileId,
            }).catch((error) => {
              console.error(
                `Vector store deletion failed for ${bucketFileId}:`,
                error
              );
            });
          }
        }

        return deletedFile;
      }),
    );

    revalidatePath(path);
    return parseStringify({ success: true, count: results.length });
  } catch (error) {
    handleError(error, "Failed to delete files");
  }
};
