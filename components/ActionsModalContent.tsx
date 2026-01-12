import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";

export declare interface Props {
  type: string;
  extension: string;
  url: string;
  name: string;
  size: number;
  bucketFile: string;
}

const ImageThumbnail = ({
  file,
}: {
  file: Models.Document &
    Props & { owner: Models.Document & { fullName: string } };
}) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type as "document" | "image" | "video" | "audio" | "other"} extension={file.extension} url={file.url} />
    <div className="flex flex-col ">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime
        date={file.$createdAt}
        className="caption text-light-100/50"
      />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label body-2 text-left">{label}</p>
    <p className="file-details-value subtitle-2 text-left">{value}</p>
  </div>
);

export const FileDetails = ({
  file,
}: {
  file: Models.Document &
    Props & { owner: Models.Document & { fullName: string } };
}) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow
          label="Last edited:"
          value={formatDateTime(file.$updatedAt)}
        />
        <DetailRow
          label="Created at:"
          value={formatDateTime(file.$createdAt)}
        />
      </div>
    </>
  );
};

export const FolderDetails = ({
  folder,
}: {
  folder: Models.Document & {
    name: string;
    owner: Models.Document & { fullName: string };
  };
}) => {
  return (
    <>
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Name:" value={folder.name} />
        <DetailRow label="Owner:" value={folder.owner.fullName} />
        <DetailRow
          label="Last edited:"
          value={formatDateTime(folder.$updatedAt)}
        />
        <DetailRow
          label="Created at:"
          value={formatDateTime(folder.$createdAt)}
        />
      </div>
    </>
  );
};

export const ShareInput = ({
  file,
  onInputChange,
  onRemove,
}: {
  file: Models.Document &
    Props & { owner: Models.Document & { fullName: string }; users: string[] };
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}) => {
  return (
    <>
      {file.bucketFile ? <ImageThumbnail file={file} /> : null}
      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">Share file with others</p>
        <Input
          type="email"
          placeholder="Enter email"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field body-2 shad-no-focus"
        />
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="remove"
                    width={24}
                    height={24}
                    className="remove-icon cursor-pointer"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
