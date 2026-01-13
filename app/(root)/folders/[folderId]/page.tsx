import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { getFilesByFolder } from "@/lib/actions/file.actions";
import FolderCard from "@/components/FolderCard";
import Card from "@/components/Card";
import Breadcrumbs from "@/components/Breadcrumbs";

const FolderPage = async ({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) => {
  const { folderId } = await params;

  const folders = await getFoldersByParent({
    parentFolderId: folderId,
  });

  const files = await getFilesByFolder({
    folderId,
  });

  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* SUBFOLDERS */}
      {folders.total > 0 && (
        <section className="file-list">
          {folders.documents.map((folder: any) => (
            <FolderCard key={folder.$id} folder={folder} />
          ))}
        </section>
      )}

      {/* FILES */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: any) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <p className="h4 text-center">Drop files here</p>
          <p className="body-2 text-light-200 text-center">
            or use the “New” button
          </p>
        </section>
      )}
    </div>
  );
};

export default FolderPage;
