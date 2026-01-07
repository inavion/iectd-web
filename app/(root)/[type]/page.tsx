import { Props } from "@/components/ActionsModalContent";
import Breadcrumbs from "@/components/Breadcrumbs";
import Card from "@/components/Card";
import FolderCard from "@/components/FolderCard";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { getFoldersByParent } from "@/lib/actions/folder.actions";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";
import { Models } from "node-appwrite";

const Page = async ({ searchParams, params }: SearchParamProps) => {
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const files = await getFiles({ searchText, sort });
  const folders = await getFoldersByParent({ parentFolderId: null });

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">Documents</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total:{" "}
            <span className="h4">
              <span className="subtitle-2 !text-[17px] text-light-100/80">0 MB</span>
            </span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-200">Sort by:</p>

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
