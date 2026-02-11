"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

export const sendEmailOTP = async ({
  email,
}: {
  email: string;
}): Promise<string | null> => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    console.error("[sendEmailOTP] ❌ Failed to send OTP:", error);
    // Return null instead of throwing to prevent 500 errors
    return null;
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}): Promise<{ accountId: string; isNewUser: boolean } | { error: string }> => {
  try {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email });

    if (!accountId) {
      console.error("[createAccount] ❌ Failed to send OTP");
      return { error: "Failed to send verification email. Please try again." };
    }

    if (!existingUser) {
      const { databases } = await createAdminClient();

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId,
        },
      );

      return parseStringify({ accountId, isNewUser: true });
    }

    return parseStringify({ accountId, isNewUser: false });
  } catch (error) {
    console.error("[createAccount] ❌ Error:", error);
    return { error: "Failed to create account. Please try again." };
  }
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}): Promise<{ sessionId: string } | null> => {
  console.log("[verifySecret] 🔐 Starting verification...");
  console.log("[verifySecret] accountId:", accountId);
  console.log("[verifySecret] password length:", password?.length);

  try {
    console.log("[verifySecret] Creating admin client...");
    const { account } = await createAdminClient();
    console.log("[verifySecret] ✅ Admin client created");

    console.log("[verifySecret] Creating session with Appwrite...");
    const session = await account.createSession(accountId, password);
    console.log("[verifySecret] ✅ Session created:", session.$id);

    console.log("[verifySecret] Setting cookie...");
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    console.log("[verifySecret] ✅ Cookie set");

    console.log("[verifySecret] 🎉 Verification complete!");
    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    console.error("[verifySecret] ❌ ERROR:", error);

    // Log Appwrite-specific error details
    if (error && typeof error === "object" && "code" in error) {
      const appwriteError = error as {
        code: number;
        type: string;
        message: string;
      };
      console.error("[verifySecret] Appwrite error code:", appwriteError.code);
      console.error("[verifySecret] Appwrite error type:", appwriteError.type);

      // Return null instead of throwing - let the client handle the error
      // Common errors:
      // - user_invalid_token: OTP is wrong, expired, or already used
      // - user_unauthorized: Account doesn't exist
    }

    // Return null to indicate failure instead of throwing a 500
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("[getCurrentUser] Starting...");
    const { databases, account } = await createSessionClient();
    console.log("[getCurrentUser] Session client created");

    const result = await account.get();
    console.log("[getCurrentUser] Account retrieved:", result.$id);

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );
    console.log("[getCurrentUser] Query result - total:", user.total);
    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("[getCurrentUser] ❌ Error:", error);
    return null;
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();
  try {
    // Sign out from Appwrite
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");

    // Also clear backend auth tokens
    const cookieStore = await cookies();
    cookieStore.delete("iectd-access-token");
    cookieStore.delete("iectd-refresh-token");
    cookieStore.delete("iectd-user-email");
    cookieStore.delete("iectd-user-fullname");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({
  email,
}: {
  email: string;
}): Promise<{ accountId: string | null; error?: string }> => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      const otpSent = await sendEmailOTP({ email });
      if (!otpSent) {
        return { accountId: null, error: "Failed to send verification email" };
      }

      // Sync the accountId if it changed
      if (otpSent !== existingUser.accountId) {
        const { databases } = await createAdminClient();
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          existingUser.$id,
          { accountId: otpSent },
        );
      }

      return { accountId: otpSent };
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    console.error("[signInUser] ❌ Error:", error);
    return parseStringify({
      accountId: null,
      error: "Sign in failed. Please try again.",
    });
  }
};
