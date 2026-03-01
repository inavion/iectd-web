"use client";

import FormattedDateTime from "@/components/FormattedDateTime";
import UserDropdown from "./UserDropdown";
import { getCurrentUser } from "@/lib/actions/user.actions";

interface Props {
  user: any;
  currentUserId: string;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
}

const UserRow =  ({
  user,
  isSelected,
  onMouseDown,
  onMouseUp,
  currentUserId
}: Props) => {

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className={`grid grid-cols-12 items-center pt-2 cursor-pointer
        transition-colors duration-150 ease-in-out text-sm
        ${isSelected ? "bg-brand-100/20" : "hover:bg-gray-100"}
      `}
    >
      <p className="col-span-4 ml-2 truncate" title={user.email}>
        {user.email}
      </p>
      <p className="col-span-3 truncate">{user.fullName}</p>
      <p className="col-span-2">{user.role || "user"}</p>

      <div className="col-span-3 flex justify-between items-center text-sm">
        <FormattedDateTime date={user.$updatedAt} className="text-light-100 " />
        <UserDropdown user={user} currentUserId={currentUserId}/>
      </div>

      <div className="divider col-span-12 mt-2" />
    </div>
  );
}

export default UserRow;
