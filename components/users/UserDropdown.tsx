"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteUserByAdmin, updateUserRole } from "@/lib/actions/user.actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CORE_ADMIN_EMAILS } from "@/lib/constants/admin";

interface Props {
  user: any;
  currentUserId: string;
}

export default function UserDropdown({ user, currentUserId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isCurrentUser = user.accountId === currentUserId;

  const isCoreAdmin = CORE_ADMIN_EMAILS.includes(user.email);

  const handleMakeAdmin = async () => {
    const newRole = user.role === "admin" ? "user" : "admin";

    const result = await updateUserRole({
      userDocId: user.$id,
      newRole,
      currentUserId,
    });

    if (result.success) {
      toast.success(
        `${user.fullName} is now ${newRole === "admin" ? "Admin" : "User"}`,
      );
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return; // prevent double click

    setIsDeleting(true);

    try {
      const result = await deleteUserByAdmin({
        userDocId: user.$id,
        accountId: user.accountId,
        currentUserId,
      });

      if (result.success) {
        toast.success("User deleted");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isCoreAdmin) {
    return null; // 🔒 hide action menu completely
  }

  if (isCurrentUser) {
    return null; // hide action menu completely
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1 hover:bg-gray-200 rounded flex items-center justify-center"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Image
              src="/assets/icons/loader.svg"
              alt="loading"
              width={16}
              height={16}
              className="animate-spin invert"
            />
          ) : (
            <Image
              src="/assets/icons/dots.svg"
              alt="actions"
              width={16}
              height={16}
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMakeAdmin}>
          {user.role === "admin" ? "Make User" : "Make Admin"}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-500 flex items-center justify-between"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              Deleting...
              <Image
                src="/assets/icons/loader.svg"
                alt="loading"
                width={16}
                height={16}
                className="ml-2 animate-spin"
              />
            </>
          ) : (
            "Remove User"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
