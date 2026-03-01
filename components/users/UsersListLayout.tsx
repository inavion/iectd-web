"use client";

import BaseListLayout from "../documents/BaseListLayout";
import UserRow from "./UserRow";

interface User {
  $id: string;
  email: string;
  fullName: string;
  role: string;
  $updatedAt: string;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export default function UsersListLayout({ users, currentUserId }: Props) {
  return (
    <BaseListLayout
      items={users}
      getId={(user) => user.$id}
      header={
        <div className="grid grid-cols-12 font-medium mb-2">
          <p className="col-span-4 ml-2">Email</p>
          <p className="col-span-3">Full Name</p>
          <p className="col-span-2">Role</p>
          <p className="col-span-3">Last Update</p>
        </div>
      }
      renderRow={(user, isSelected, onMouseDown, onMouseUp) => (
        <UserRow
          key={user.$id}
          user={user}
          currentUserId={currentUserId}
          isSelected={isSelected}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
      )}
    />
  );
}
