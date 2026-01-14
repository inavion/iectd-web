import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { getFilesByFolder } from "@/lib/actions/file.actions";
import Breadcrumbs from "@/components/Breadcrumbs";
import FolderList from "@/components/ui/FolderList";
import FileList from "@/components/FileList";
import DragAndDrop from "@/components/DragAndDrop";
import DragDropOverlay from "@/components/DragDropOverlay";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { MAX_FILE_SIZE } from "@/constants";

const FolderPage = async ({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) => {
  const { folderId } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const parentFolderId = folderId || null; // safe for Appwrite

  const folders = await getFoldersByParent({ parentFolderId });
  const files = await getFilesByFolder({ folderId: parentFolderId });

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Subfolders */}
      {folders.total > 0 && (
        <section className="file-list mb-6">
          <FolderList folders={folders.documents} />
        </section>
      )}

      {/* FILE AREA */}
      <section className="relative mx-auto w-[1040px] min-h-[410px]">
        {/* Existing files */}
        {files.total > 0 && (
          <section className="file-list">
            <FileList files={files.documents} />
          </section>
        )}

        {/* Empty state dropzone */}
        {files.total === 0 && (
          <DragAndDrop
            ownerId={currentUser.$id}
            accountId={currentUser.accountId}
            mode="empty"
          />
        )}

        {/* Overlay dropzone (files exist) */}
        {files.total > 0 && (
          <DragDropOverlay
            ownerId={currentUser.$id}
            accountId={currentUser.accountId}
          />
        )}
      </section>
    </div>
  );
};

export default FolderPage;
