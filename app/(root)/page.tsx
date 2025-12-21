// app/(root)/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";

export default async function RootPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  redirect("/dashboard"); // or "/files", "/dashboard", etc.
}
