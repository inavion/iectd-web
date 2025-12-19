import Link from "next/link";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";
import { Props } from "./ActionsModalContent";

const Card = ({
  file,
}: {
  file: Models.Document &
    Props & {
      owner: Models.Document & { fullName: string };
      users: string[];
    };
}) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} />
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <div className="flex justify-between items-enden items-end">
          <p className="caption line-clamp-1 text-light-200">
            By: {file.owner.fullName}
          </p>
          <p className="caption line-clamp-1 text-light-200">
            {convertFileSize(file.size)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Card;
