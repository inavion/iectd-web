import { Props } from "@/components/ActionsModalContent";
import Sort from "@/components/Sort";
import { getFilesByFolder } from "@/lib/actions/file.actions";
import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { Models } from "node-appwrite";
import { MAX_FILE_SIZE } from "@/constants";
import FolderList from "@/components/ui/FolderList";
import FileList from "@/components/FileList";
import DragAndDrop from "@/components/DragAndDrop";
import DragDropOverlay from "@/components/DragDropOverlay";
import { getCurrentUser } from "@/lib/actions/user.actions";

const Page = async ({ searchParams }: SearchParamProps) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const files = await getFilesByFolder({ folderId: null });
  const folders = await getFoldersByParent({ parentFolderId: null });

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
          <Sort />
        </div>
      </section>

      {/* FOLDERS */}
      <section className="file-list">
        <FolderList folders={folders.documents} />
      </section>

      {/* FILE AREA */}
      <section className="relative mx-auto w-[1040px] min-h-[410px]">
        {/* FILES */}
        {files.total > 0 && (
          <section className="file-list">
            <FileList files={files.documents} />
          </section>
        )}

        {/* EMPTY STATE DROPZONE */}
        {files.total === 0 && (
          <DragAndDrop
            ownerId={currentUser.$id}
            accountId={currentUser.accountId}
            mode="empty"
          />
        )}

        {/* OVERLAY DROPZONE (FILES EXIST) */}
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

export default Page;
