import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_APPWRITE_API_BASE_URL;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!API_BASE_URL) {
      return Response.json(
        { detail: "API base URL is not configured." },
        { status: 500 }
      );
    }

    if (!message || typeof message !== "string") {
      return Response.json(
        { detail: "Message is required." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("iectd-access-token")?.value;
    const userEmail = cookieStore.get("iectd-user-email")?.value;

    if (!accessToken || !userEmail) {
      return Response.json(
        { detail: "User not authenticated. Please sign in again." },
        { status: 401 }
      );
    }

    const upstreamResponse = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector_store_name: userEmail,
        message,
      }),
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorData = await upstreamResponse.json().catch(() => ({}));
      return Response.json(
        {
          detail:
            errorData.detail ||
            `Chat API error: ${upstreamResponse.status}`,
        },
        { status: upstreamResponse.status }
      );
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat stream proxy error:", error);
    return Response.json(
      { detail: "Unexpected error while streaming chat response." },
      { status: 500 }
    );
  }
}
