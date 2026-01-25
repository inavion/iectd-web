"use server";

import { getAccessToken, getUserEmail } from "./auth.actions";

export interface ChatAnnotation {
  type: string;
  file_id: string;
  filename: string;
  file_path: string | null;
  index: number;
}

export interface ChatResponse {
  status: string;
  response_id: string;
  response: string;
  annotations: ChatAnnotation[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  annotations?: ChatAnnotation[];
  timestamp: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_APPWRITE_API_BASE_URL;

export const sendChatMessage = async (
  message: string
): Promise<ChatResponse> => {
  try {
    // Get access token for Bearer authentication
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("User not authenticated. Please sign in again.");
    }

    // Get user email for vector store name
    const userEmail = await getUserEmail();

    if (!userEmail) {
      throw new Error("User email not found. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector_store_name: userEmail,
        message: message,
      }),
    });

    if (response.status === 401) {
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Chat API error: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
};
