export const dynamic = "force-dynamic";

import { getFiles } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import ListLayout from "@/components/documents/ListLayout";


const ResourcesPage = async () => {
  
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const files = await getFiles({
    systemOnly: true,
  });

  return (
    <div className="page-container">
      <h1 className="h1 mb-6">Resources</h1>
      <ListLayout folders={[]} files={files.documents} />
    </div>
  );
};

export default ResourcesPage;
