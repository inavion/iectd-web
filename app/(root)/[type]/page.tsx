import { cookies } from "next/headers";
import Sort from "@/components/Sort";
import { getFilesByFolder } from "@/lib/actions/file.actions";
import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { MAX_FILE_SIZE } from "@/constants";
import DragAndDrop from "@/components/DragAndDrop";
import DragDropOverlay from "@/components/DragDropOverlay";
import ListLayout from "@/components/ListLayout";
import GridLayout from "@/components/GridLayout";
import VersionToggle from "@/components/VersionToggle";
import { Models } from "node-appwrite";
import { Props } from "@/components/ActionsModalContent";

const Page = async ({ searchParams }: SearchParamProps) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const files = await getFilesByFolder({ folderId: null });
  const folders = await getFoldersByParent({ parentFolderId: null });

  // Get view from URL params first, then cookie, then default to "list"
  const cookieStore = await cookies();
  const savedView = cookieStore.get("viewMode")?.value as "list" | "grid" | undefined;
  const urlView = (await searchParams)?.view as "list" | "grid" | undefined;
  const view = urlView || savedView || "list";

  const formatBytesToMB = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? mb.toFixed(2) : +mb.toFixed(2);
  };

  const totalUploadedBytes = files.documents.reduce(
    (acc: number, file: Models.Document & Props) => acc + file.size,
    0
  );

  const totalUploadedMB = formatBytesToMB(totalUploadedBytes);
  const maxStorageMB = MAX_FILE_SIZE / (1024 * 1024);

  return (
    <div className="page-container">
      {/* HEADER */}
      <section className="w-full">
        <h1 className="h1 capitalize">Documents</h1>

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

      {/* CONTENT */}
      {view === "list" ? (
        <section className="relative mx-auto w-[1040px] min-h-[410px]">
          <ListLayout folders={folders.documents} files={files.documents} />

          {files.total === 0 && folders.total === 0 && (
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
        <section className="relative mx-auto w-[1040px] min-h-[410px]">
          <GridLayout folders={folders.documents} files={files.documents} />

          {files.total === 0 && folders.total === 0 && (
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