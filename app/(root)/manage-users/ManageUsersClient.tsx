"use client";

import { useState } from "react";
import UsersListLayout from "@/components/users/UsersListLayout";
import CreateUserModal from "@/components/users/CreateUserModal";
import { useRouter } from "next/navigation";

interface Props {
  users: any[];
  currentUserId: string;
}

export default function ManageUsersClient({ users, currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  


  return (
    <div className="page-container ">
      <div className="flex justify-between items-center mb-6 drop-shadow-xs">
        <h1 className="h1">Manage Users</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-white text-brand px-4 py-1 rounded-lg flex items-center justify-center
          hover:bg-brand hover:text-white transition duration-300"
        >
          <span className="text-2xl mr-3 ">+</span> Create new user
        </button>
      </div>

      <UsersListLayout users={users} currentUserId={currentUserId}/>

      {open && (
        <CreateUserModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh(); // better than window.location.reload()
          }}
        />
      )}
    </div>
  );
}