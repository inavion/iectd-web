import { Props } from "@/components/ActionsModalContent";
import Card from "@/components/Card";
import FolderCard from "@/components/FolderCard";
import Sort from "@/components/Sort";
import { getFiles, getFilesByFolder } from "@/lib/actions/file.actions";
import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { Models } from "node-appwrite";
import { MAX_FILE_SIZE } from "@/constants";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const files = await getFilesByFolder({ folderId: null });
  const folders = await getFoldersByParent({ parentFolderId: null });

  const formatBytesToMB = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? mb.toFixed(2) : +mb.toFixed(2); // show 0.01, 1.12, 2, etc.
  };

  const totalUploadedBytes = files.documents.reduce(
    (
      acc: number,
      file: Models.Document &
        Props & {
          owner: Models.Document & { fullName: string };
          users: string[];
        }
    ) => acc + file.size,
    0
  );

  const totalUploadedMB = formatBytesToMB(totalUploadedBytes);
  const maxStorageMB = MAX_FILE_SIZE / (1024 * 1024); // just 5

  return (
    <div className="page-container">
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
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>

      {/* folder creation section */}
      <section className="file-list">
        {folders.total > 0 &&
          folders.documents.map((folder: any) => (
            <FolderCard key={folder.$id} folder={folder} />
          ))}
      </section>

      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map(
            (
              file: Models.Document &
                Props & {
                  owner: Models.Document & { fullName: string };
                  users: string[];
                }
            ) => (
              <Card key={file.$id} file={file} />
            )
          )}
        </section>
      ) : (
        <p className="empty-list body-1">No files uploaded</p>
      )}
    </div>
  );
};

export default Page;
