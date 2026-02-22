import { NextResponse } from "next/server";
import { getAllFoldersForTree } from "@/lib/actions/folder.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";

export async function GET() {
  const currentUser = await getCurrentUser();

  const folders = await getAllFoldersForTree(currentUser);

  return NextResponse.json(folders);
}