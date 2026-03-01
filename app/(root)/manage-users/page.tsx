export const dynamic = "force-dynamic";

import { getCurrentUser, getAllUsers } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ManageUsersClient from "./ManageUsersClient";

export default async function ManageUsersPage() {
  const currentUser = await getCurrentUser();
  const users = await getAllUsers();

  if (!currentUser) redirect("/sign-in");
  if (currentUser.role !== "admin") redirect("/dashboard");


  return (
    <ManageUsersClient users={users.documents ?? []} currentUserId={currentUser.accountId}/>
  );
}