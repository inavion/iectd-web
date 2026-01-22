import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { getFilesByFolder } from "@/lib/actions/file.actions";
import Breadcrumbs from "@/components/Breadcrumbs";
import FolderList from "@/components/ui/FolderList";
import FileList from "@/components/FileList";
import DragAndDrop from "@/components/DragAndDrop";
import DragDropOverlay from "@/components/DragDropOverlay";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { MAX_FILE_SIZE } from "@/constants";
import ListLayout from "@/components/ListLayout";
import VersionToggle from "@/components/VersionToggle";

const FolderPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ folderId: string }>;
  searchParams: Promise<{ view: "list" | "grid" }>;
}) => {
  const { folderId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const parentFolderId = folderId || null; // safe for Appwrite

  const folders = await getFoldersByParent({ parentFolderId });
  const files = await getFilesByFolder({ folderId: parentFolderId });

  const view = ((await searchParams)?.view as "list" | "grid") || "list";

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between w-full">
        <Breadcrumbs />
        <VersionToggle />
      </div>

      {view === "list" ? (
        <>
          <section className="relative mx-auto w-[1040px] min-h-[410px]">
            <ListLayout folders={folders.documents} files={files.documents} />



            {files.total === 0 && folders.total === 0 && (
              <DragAndDrop
                ownerId={currentUser.$id}
                accountId={currentUser.accountId}
                mode="empty"
              />
            )}

            {/* Always render overlay — it will only appear on drag */}
            <DragDropOverlay
              ownerId={currentUser.$id}
              accountId={currentUser.accountId}
            />
          </section>
        </>
      ) : (
        <>
          {folders.total > 0 && (
            <section className="file-list mb-6">
              <FolderList folders={folders.documents} />
            </section>
          )}

          <section className="relative mx-auto w-[1040px] min-h-[410px]">
            {files.total > 0 && (
              <section className="file-list">
                <FileList files={files.documents} />
              </section>
            )}

            {files.total === 0 && (
              <DragAndDrop
                ownerId={currentUser.$id}
                accountId={currentUser.accountId}
                mode="empty"
              />
            )}

            {files.total > 0 && (
              <DragDropOverlay
                ownerId={currentUser.$id}
                accountId={currentUser.accountId}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default FolderPage;
