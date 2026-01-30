"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/ChatMessage";
import { type ChatMessage as ChatMessageType } from "@/lib/actions/chat.actions";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  userEmail: string;
}

const AIAssistant = ({ userEmail }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleFileClick = (fileId: string, filename: string) => {
    // Navigate to the documents page with search for the filename
    const searchQuery = filename.replace(/\.[^/.]+$/, ""); // Remove extension
    window.location.href = `/documents?search=${encodeURIComponent(searchQuery)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    setError(null);

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (response.status === 401) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Chat API error");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming response not available.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      const appendDelta = (delta: string) => {
        if (!delta) return;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: message.content + delta }
              : message
          )
        );
      };

      const finalizeMessage = (
        finalText: string | undefined,
        annotations: ChatMessageType["annotations"]
      ) => {
        if (!finalText && !annotations) return;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: finalText ?? message.content,
                  annotations: annotations ?? message.annotations,
                }
              : message
          )
        );
      };

      const mergeAnnotations = (
        incoming: ChatMessageType["annotations"]
      ): ChatMessageType["annotations"] => {
        if (!incoming || incoming.length === 0) return [];
        const unique = new Map<string, (typeof incoming)[number]>();
        incoming.forEach((annotation) => {
          const key = `${annotation.file_id}-${annotation.index}`;
          if (!unique.has(key)) unique.set(key, annotation);
        });
        return Array.from(unique.values());
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        chunks.forEach((chunk) => {
          const lines = chunk.split("\n");
          lines.forEach((line) => {
            if (!line.startsWith("data:")) return;
            const data = line.replace(/^data:\s*/, "");
            if (!data) return;

            let payload: {
              event?: string;
              delta?: string;
              response?: string;
              annotations?: ChatMessageType["annotations"];
            };

            try {
              payload = JSON.parse(data);
            } catch {
              return;
            }

            if (payload.event === "text_delta") {
              appendDelta(payload.delta ?? "");
            }

            if (payload.annotations && payload.annotations.length > 0) {
              const merged = mergeAnnotations(payload.annotations);
              if (merged.length > 0) {
                finalizeMessage(undefined, merged);
              }
            }

            if (payload.event === "done") {
              finalizeMessage(payload.response, payload.annotations);
            }
          });
        });
      }
    } catch (err) {
      setMessages((prev) =>
        prev.filter((message) => message.id !== assistantMessageId)
      );
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-light-200/30 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
            <Image
              src="/assets/icons/ai-assistant.svg"
              alt="AI Assistant"
              width={24}
              height={24}
            />
          </div>
          <div>
            <h1 className="h5 text-dark-100">AI Assistant</h1>
            <p className="caption text-light-200">{userEmail}</p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-light-100 hover:text-brand"
            aria-label="Clear chat history"
          >
            <Image
              src="/assets/icons/delete.svg"
              alt="Clear"
              width={16}
              height={16}
              className="mr-2 opacity-60"
            />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-light-400/50 px-4 py-6 md:px-8">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
              <Image
                src="/assets/icons/ai-assistant.svg"
                alt="AI Assistant"
                width={40}
                height={40}
              />
            </div>
            <h2 className="h3 mb-2 text-dark-100">How can I help you today?</h2>
            <p className="body-2 mb-8 max-w-md text-light-200">
              Ask me anything about your documents. I can help you find
              information, summarize content, and answer questions.
            </p>

            {/* Example prompts */}
            <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
              {[
                "What documents do I have about vehicles?",
                "Find information about registration expiry",
                "Summarize the PPSR certificate",
                "What is the VIN for my car?",
              ].map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setInputValue(prompt)}
                  className="rounded-xl border border-light-200/40 bg-white px-4 py-3 text-left text-sm text-light-100 transition-all hover:border-brand/30 hover:bg-brand/5"
                  tabIndex={0}
                  aria-label={`Use example prompt: ${prompt}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              return (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  annotations={message.annotations}
                  isThinking={isLoading && message.role === "assistant" && isLastMessage}
                  onFileClick={handleFileClick}
                />
              );
            })}

            {/* Error message */}
            {error && (
              <div className="mx-auto my-4 max-w-md rounded-xl bg-red/10 px-4 py-3 text-center text-sm text-red">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-light-200/30 bg-white px-4 py-4 md:px-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3"
        >
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className={cn(
                "h-12 rounded-full border-light-200/40 bg-light-400/50 px-5 pr-12 text-sm shadow-none",
                "focus-visible:border-brand focus-visible:ring-brand/20",
                "placeholder:text-light-200"
              )}
              aria-label="Chat message input"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "h-12 w-12 shrink-0 rounded-full p-0",
              "bg-brand hover:bg-brand-100 disabled:bg-light-200"
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Image
                src="/assets/icons/send.svg"
                alt="Send"
                width={20}
                height={20}
                className="invert"
              />
            )}
          </Button>
        </form>

        <p className="mt-3 text-center text-xs text-light-200">
          AI Assistant can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
