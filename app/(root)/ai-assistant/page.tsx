import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getAccessToken, getUserEmail } from "@/lib/actions/auth.actions";
import AIAssistant from "@/components/AIAssistant";

const AIAssistantPage = async () => {
  // Check Appwrite authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  // Get the user email for the chat (prefer backend token email, fallback to Appwrite)
  const backendEmail = await getUserEmail();
  const accessToken = await getAccessToken();
  const userEmail = backendEmail || currentUser.email;

  // Check if user has backend auth tokens
  const hasBackendAuth = !!accessToken;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[30px] bg-white">
      {hasBackendAuth ? (
        <AIAssistant userEmail={userEmail} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-6xl">🔐</div>
          <h2 className="h3 mb-2 text-dark-100">AI Assistant Not Available</h2>
          <p className="body-2 max-w-md text-light-200">
            Please sign out and sign in again to enable the AI Assistant feature.
            This is required to set up your AI authentication tokens.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
