import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNagivation";
import Sidebar from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import DragWrapper from "@/components/drag-drop/DragWrapper";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} />
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <DragWrapper>
          <div className="main-content">{children}</div>
        </DragWrapper>
      </section>

      <Toaster />
    </main>
  );
};

export default Layout;
