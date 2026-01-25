"use server";

import { cookies } from "next/headers";
import { parseStringify } from "../utils";

const API_BASE_URL =
  "http://production-iectd-alb-1715627367.us-east-1.elb.amazonaws.com";

export interface AuthUser {
  uid: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterParams {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

const handleError = (error: unknown, message: string) => {
  console.error(error, message);
  throw error;
};

// Register a new user
export const registerUser = async ({
  email,
  password,
  fullName,
}: RegisterParams): Promise<AuthUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Registration failed: ${response.status}`);
    }

    const data: AuthUser = await response.json();
    return parseStringify(data);
  } catch (error) {
    handleError(error, "Failed to register user");
    throw error;
  }
};

// Login user and store tokens
export const loginUser = async ({
  email,
  password,
}: LoginParams): Promise<{ success: boolean; user: AuthUser | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Login failed: ${response.status}`);
    }

    const tokens: AuthTokens = await response.json();

    // Store tokens in cookies
    const cookieStore = await cookies();

    cookieStore.set("iectd-access-token", tokens.access_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: tokens.expires_in, // Token expiry in seconds
    });

    cookieStore.set("iectd-refresh-token", tokens.refresh_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Store user email for vector store name
    cookieStore.set("iectd-user-email", email, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return parseStringify({
      success: true,
      user: {
        uid: "",
        email,
        full_name: "",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    handleError(error, "Failed to login user");
    throw error;
  }
};

// Get access token from cookies
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("iectd-access-token");
    return token?.value || null;
  } catch (error) {
    return null;
  }
};

// Get user email from cookies
export const getUserEmail = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("iectd-user-email");
    return email?.value || null;
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAccessToken();
  return !!token;
};

// Get current user info from cookies
export const getCurrentAuthUser = async (): Promise<{
  email: string;
  fullName: string;
} | null> => {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("iectd-user-email");
    const fullName = cookieStore.get("iectd-user-fullname");

    if (!email?.value) return null;

    return {
      email: email.value,
      fullName: fullName?.value || email.value.split("@")[0],
    };
  } catch (error) {
    return null;
  }
};

// Get current user (compatible with existing layout)
// Returns user object with properties expected by Sidebar, Header, etc.
export const getCurrentUser = async (): Promise<{
  $id: string;
  accountId: string;
  fullName: string;
  email: string;
  avatar: string;
  type: string;
  ownerId: string;
} | null> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("iectd-access-token");
    const email = cookieStore.get("iectd-user-email");
    const fullName = cookieStore.get("iectd-user-fullname");

    if (!accessToken?.value || !email?.value) return null;

    // Return user object compatible with existing components
    return {
      $id: email.value, // Use email as ID
      accountId: email.value,
      fullName: fullName?.value || email.value.split("@")[0],
      email: email.value,
      avatar: "/assets/images/avatar.avif",
      type: "user",
      ownerId: email.value,
    };
  } catch (error) {
    return null;
  }
};

// Sign out user from AI backend (does not redirect)
export const signOutAuthUser = async (): Promise<{ success: boolean }> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("iectd-access-token");
    cookieStore.delete("iectd-refresh-token");
    cookieStore.delete("iectd-user-email");
    cookieStore.delete("iectd-user-fullname");
    return { success: true };
  } catch (error) {
    handleError(error, "Failed to sign out user");
    return { success: false };
  }
};

// Create account (register + auto login)
export const createAuthAccount = async ({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean }> => {
  try {
    // First register
    await registerUser({ email, password, fullName });

    // Then login
    await loginUser({ email, password });

    // Store full name
    const cookieStore = await cookies();
    cookieStore.set("iectd-user-fullname", fullName, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });

    return parseStringify({ success: true });
  } catch (error) {
    handleError(error, "Failed to create account");
    throw error;
  }
};

// Sign in existing user
export const signInAuthUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ success: boolean }> => {
  try {
    await loginUser({ email, password });
    return parseStringify({ success: true });
  } catch (error) {
    handleError(error, "Failed to sign in user");
    throw error;
  }
};

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

// Change user password
export const changePassword = async ({
  currentPassword,
  newPassword,
}: ChangePasswordParams): Promise<{ success: boolean; message: string }> => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Not authenticated. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Failed to change password: ${response.status}`
      );
    }

    return parseStringify({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    handleError(error, "Failed to change password");
    throw error;
  }
};
