import { cookies } from "next/headers";
import { Props } from "@/components/ActionsModalContent";
import Sort from "@/components/Sort";
import { getFiles, getFilesByFolder } from "@/lib/actions/file.actions";
import { getFoldersByParent, getFolderById } from "@/lib/actions/folder.actions";
import { Models } from "node-appwrite";
import { MAX_FILE_SIZE } from "@/constants";
import DragAndDrop from "@/components/DragAndDrop";
import DragDropOverlay from "@/components/DragDropOverlay";
import { getCurrentUser } from "@/lib/actions/user.actions";
import ListLayout from "@/components/ListLayout";
import VersionToggle from "@/components/VersionToggle";
import GridLayout from "@/components/GridLayout";

const Page = async ({ searchParams }: SearchParamProps) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const params = await searchParams;
  const searchId = params?.search as string | undefined;
  const searchType = params?.type as "file" | "folder" | undefined;

  // Get view from URL or cookie
  const cookieStore = await cookies();
  const savedView = cookieStore.get("viewMode")?.value as "list" | "grid" | undefined;
  const view = (params?.view as "list" | "grid") || savedView || "list";

  let folders: any = { documents: [], total: 0 };
  let files: any = { documents: [], total: 0 };

  if (searchId && searchType) {
    // Filter to show only the searched item
    if (searchType === "folder") {
      const folder = await getFolderById(searchId);
      folders = folder ? { documents: [folder], total: 1 } : { documents: [], total: 0 };
    } else {
      const allFiles = await getFiles({ limit: 100 });
      const file = allFiles?.documents?.find((f: any) => f.$id === searchId);
      files = file ? { documents: [file], total: 1 } : { documents: [], total: 0 };
    }
  } else {
    // Normal load - get all root items
    files = await getFilesByFolder({ folderId: null });
    folders = await getFoldersByParent({ parentFolderId: null });
  }

  const formatBytesToMB = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? mb.toFixed(2) : +mb.toFixed(2);
  };

  const totalUploadedBytes = files.documents.reduce(
    (acc: number, file: Models.Document & Props) => acc + (file.size || 0),
    0
  );

  const totalUploadedMB = formatBytesToMB(totalUploadedBytes);
  const maxStorageMB = MAX_FILE_SIZE / (1024 * 1024);

  return (
    <div className="page-container">
      <section className="w-full">
      <h1 className="h1 capitalize">
          {searchId ? (
            <a href="/documents" className="text-black">
              ← Back to all
            </a>
          ) : (
            "Documents"
          )}
        </h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{totalUploadedMB} / {maxStorageMB} MB</span>
          </p>

          <div className="sort-container">
            <p className="subtitle-2 text-gray-500">Sort by:</p>
            <Sort />
            <div className="card-options">
              <VersionToggle />
            </div>
          </div>
        </div>
      </section>

      {view === "list" ? (
        <section className="relative w-full max-w-[1040px] mx-auto min-h-[410px] px-4 sm:px-0">
          <ListLayout folders={folders.documents} files={files.documents} />

          {files.total === 0 && folders.total === 0 && !searchId && (
            <DragAndDrop
              ownerId={currentUser.$id}
              accountId={currentUser.accountId}
              mode="empty"
            />
          )}

          <DragDropOverlay
            ownerId={currentUser.$id}
            accountId={currentUser.accountId}
          />
        </section>
      ) : (
        <section className="relative w-full max-w-[1040px] mx-auto min-h-[410px] px-4 sm:px-0">
          <GridLayout folders={folders.documents} files={files.documents} />

          {files.total === 0 && folders.total === 0 && !searchId && (
            <DragAndDrop
              ownerId={currentUser.$id}
              accountId={currentUser.accountId}
              mode="empty"
            />
          )}

          <DragDropOverlay
            ownerId={currentUser.$id}
            accountId={currentUser.accountId}
          />
        </section>
      )}
    </div>
  );
};

export default Page;