import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";

const SettingsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 text-light-100">Settings</h1>

        <div className="mt-8">
          <div className="rounded-[20px] bg-white p-8 shadow-drop-1">
            <h2 className="h3 text-light-100 mb-6">Account Information</h2>
            <div className="flex flex-col gap-2 mb-8 pb-8 border-b border-light-200">
              <p className="body-1 text-light-100">
                <span className="font-medium">Name:</span>{" "}
                {currentUser.fullName}
              </p>
              <p className="body-1 text-light-100">
                <span className="font-medium">Email:</span> {currentUser.email}
              </p>
            </div>

            <h2 className="h3 text-light-100 mb-6">Change Password</h2>
            <ChangePasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
