import { cookies } from "next/headers";
import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { getFilesByFolder } from "@/lib/actions/file.actions";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import DragAndDrop from "@/components/drag-drop/DragAndDrop";
import DragDropOverlay from "@/components/drag-drop/DragDropOverlay";
import { getCurrentUser } from "@/lib/actions/user.actions";
import ListLayout from "@/components/documents/ListLayout";
import GridLayout from "@/components/documents/GridLayout";
import VersionToggle from "@/components/VersionToggle";
import Phase2LoadingBanner from "@/components/Phase2LoadingBanner";

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

  const parentFolderId = folderId || null;

  const folders = await getFoldersByParent({ parentFolderId });
  const files = await getFilesByFolder({ folderId: parentFolderId });

  // Get view from URL params first, then cookie, then default to "list"
  const cookieStore = await cookies();
  const savedView = cookieStore.get("viewMode")?.value as
    | "list"
    | "grid"
    | undefined;
  const urlView = (await searchParams)?.view as "list" | "grid" | undefined;
  const view = urlView || savedView || "list";

  return (
    <div className="page-container">
      <Phase2LoadingBanner />
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between w-full">
        <Breadcrumbs />
        <VersionToggle />
      </div>

      {view === "list" ? (
        <section className="relative w-full min-h-[410px]">
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
        <section className="relative w-full min-h-[410px]">
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

export default FolderPage;
