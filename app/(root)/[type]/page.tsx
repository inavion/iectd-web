import { cookies } from "next/headers";
import { Props } from "@/components/ActionsModalContent";
import Sort from "@/components/Sort";
import { getFiles, getFilesByFolder } from "@/lib/actions/file.actions";
import {
  getFoldersByParent,
  getFolderById,
} from "@/lib/actions/folder.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Models } from "node-appwrite";
import { MAX_FILE_SIZE } from "@/constants";
import DragAndDrop from "@/components/drag-drop/DragAndDrop";
import DragDropOverlay from "@/components/drag-drop/DragDropOverlay";
import ListLayout from "@/components/documents/ListLayout";
import GridLayout from "@/components/documents/GridLayout";
import VersionToggle from "@/components/VersionToggle";
import Link from "next/link";
import Image from "next/image";
import Phase2LoadingBanner from "@/components/FolderSetupBanner";

async function buildBreadcrumbPath(
  folderId: string | null,
): Promise<Array<{ id: string; name: string }>> {
  const path: Array<{ id: string; name: string }> = [];
  let currentFolderId = folderId;

  while (currentFolderId) {
    const folder = await getFolderById(currentFolderId);
    if (!folder) break;

    path.unshift({
      id: folder.$id,
      name: folder.name,
    });

    currentFolderId = folder.parentFolderId;
  }

  return path;
}

const Page = async ({ searchParams }: SearchParamProps) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const params = await searchParams;
  const searchId = params?.search as string | undefined;
  const searchType = params?.type as "file" | "folder" | undefined;

  // Get view from URL or cookie
  const cookieStore = await cookies();
  const savedView = cookieStore.get("viewMode")?.value as
    | "list"
    | "grid"
    | undefined;
  const view = (params?.view as "list" | "grid") || savedView || "list";

  let folders: any = { documents: [], total: 0 };
  let files: any = { documents: [], total: 0 };
  let locationPath: Array<{ id: string; name: string }> = [];

  if (searchId && searchType) {
    // Filter to show only the searched item
    if (searchType === "folder") {
      const folder = await getFolderById(searchId);
      folders = folder
        ? { documents: [folder], total: 1 }
        : { documents: [], total: 0 };
      // Build path from parent folder
      if (folder?.parentFolderId) {
        locationPath = await buildBreadcrumbPath(folder.parentFolderId);
      }
    } else {
      const allFiles = await getFiles({ limit: 100 });
      const file = allFiles?.documents?.find((f: any) => f.$id === searchId);
      files = file
        ? { documents: [file], total: 1 }
        : { documents: [], total: 0 };
      // Build path from file's folder
      if (file?.folderId) {
        locationPath = await buildBreadcrumbPath(file.folderId);
      }
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
    0,
  );

  const totalUploadedMB = formatBytesToMB(totalUploadedBytes);
  const maxStorageMB = MAX_FILE_SIZE / (1024 * 1024);

  return (
    <div className="page-container">
      <Phase2LoadingBanner />
      <section className="w-full">
        <div className="h1 capitalize flex items-center gap-2 flex-wrap">
          {searchId ? (
            <>
              <Link href="/documents" className="hover:underline ">
                Documents
              </Link>
              {locationPath.map((crumb) => (
                <span key={crumb.id} className="flex items-center gap-2 ">
                  <Image
                    src="/assets/icons/right.png"
                    alt="chevron-right"
                    width={20}
                    height={20}
                  />
                  <Link
                    href={`/folders/${crumb.id}`}
                    className="hover:underline subtitle-1"
                  >
                    {crumb.name}
                  </Link>
                </span>
              ))}
              <Image
                src="/assets/icons/right.png"
                alt="chevron-right"
                width={20}
                height={20}
              />
              <span className="text-gray-500 subtitle-1">
                {searchType === "folder"
                  ? folders.documents[0]?.name
                  : files.documents[0]?.name}
              </span>
            </>
          ) : (
            "Documents"
          )}
        </div>

        <div className="total-size-section">
          <p className="body-1">
            Total:{" "}
            <span className="h5">
              {totalUploadedMB} / {maxStorageMB} MB
            </span>
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
        <section className="relative w-full min-h-[410px]">
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
        <section className="relative w-full min-h-[410px]">
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
