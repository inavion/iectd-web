import FolderRowList from "@/components/list/FolderRowList";
import FileRowList from "@/components/list/FileRowList";

interface ListLayoutProps {
  folders: any[];
  files: any[];
}

const ListLayout = ({ folders, files }: ListLayoutProps) => {
  return (
    <div className="card w-full">
      {/* HEADER */}
      <div className="grid grid-cols-12 font-medium mb-2">
        <p className="col-span-5 ml-2">Name</p>
        <p className="col-span-4">Last interaction</p>
        <p className="col-span-2">Size</p>
      </div>

      <div className="header-divider" />

      {/* FOLDERS */}
      {folders.length > 0 && (
        <FolderRowList folders={folders} />
      )}

      {/* FILES */}
      {files.length > 0 && (
        <FileRowList files={files} />
      )}
    </div>
  );
};

export default ListLayout;
