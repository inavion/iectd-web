"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo } from "react";
import type { ChatAnnotation } from "@/lib/actions/chat.actions";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  annotations?: ChatAnnotation[];
  onFileClick?: (fileId: string, filename: string) => void;
}

interface ParsedContent {
  text: string;
  citations: Map<string, { fileId: string; filename: string; index: number }>;
}

const ChatMessage = ({
  role,
  content,
  annotations = [],
  onFileClick,
}: ChatMessageProps) => {
  const isUser = role === "user";

  // Parse content and extract unique citations
  const parsedContent = useMemo((): ParsedContent => {
    const uniqueCitations = new Map<
      string,
      { fileId: string; filename: string; index: number }
    >();

    // Create unique citations from annotations
    annotations.forEach((annotation, idx) => {
      if (annotation.type === "file_citation" && annotation.filename) {
        // Use filename as key to ensure uniqueness
        if (!uniqueCitations.has(annotation.filename)) {
          uniqueCitations.set(annotation.filename, {
            fileId: annotation.file_id,
            filename: annotation.filename,
            index: uniqueCitations.size + 1,
          });
        }
      }
    });

    return {
      text: content,
      citations: uniqueCitations,
    };
  }, [content, annotations]);

  // Convert markdown-like text to JSX
  const renderContent = (text: string) => {
    // Split by newlines first
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
      // Handle empty lines
      if (line.trim() === "") {
        return <br key={lineIndex} />;
      }

      // Parse bold text (**text**)
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const renderedParts = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIndex} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Check if it's a list item
      if (line.trim().startsWith("-")) {
        return (
          <li key={lineIndex} className="ml-4 list-disc">
            {renderedParts}
          </li>
        );
      }

      return (
        <p key={lineIndex} className="mb-1">
          {renderedParts}
        </p>
      );
    });
  };

  const handleCitationClick = (fileId: string, filename: string) => {
    if (onFileClick) {
      onFileClick(fileId, filename);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-brand" : "bg-light-300"
        )}
      >
        {isUser ? (
          <Image
            src="/assets/icons/user.svg"
            alt="User"
            width={16}
            height={16}
            className="invert"
          />
        ) : (
          <Image
            src="/assets/icons/ai-assistant.svg"
            alt="AI Assistant"
            width={18}
            height={18}
            className="opacity-80"
          />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3",
          isUser
            ? "bg-brand text-white rounded-tr-none"
            : "bg-white shadow-drop-1 rounded-tl-none"
        )}
      >
        <div className={cn("text-sm leading-relaxed", isUser && "text-white")}>
          {renderContent(parsedContent.text)}
        </div>

        {/* Citations */}
        {parsedContent.citations.size > 0 && !isUser && (
          <div className="mt-3 border-t border-light-200/30 pt-3">
            <p className="mb-2 text-xs font-semibold text-light-100">
              Sources:
            </p>
            <div className="flex flex-col gap-2">
              {Array.from(parsedContent.citations.entries()).map(
                ([filename, citation]) => (
                  <button
                    key={citation.fileId}
                    type="button"
                    onClick={() =>
                      handleCitationClick(citation.fileId, citation.filename)
                    }
                    className="group flex items-center gap-2 rounded-lg bg-light-300/50 px-3 py-2 text-left transition-all hover:bg-brand/10"
                    tabIndex={0}
                    aria-label={`View source: ${citation.filename}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleCitationClick(citation.fileId, citation.filename);
                      }
                    }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-medium text-brand">
                      {citation.index}
                    </span>
                    <Image
                      src="/assets/icons/file-pdf.svg"
                      alt="PDF"
                      width={16}
                      height={16}
                      className="shrink-0 opacity-60"
                    />
                    <span className="truncate text-xs text-light-100 group-hover:text-brand">
                      {citation.filename}
                    </span>
                    <Image
                      src="/assets/icons/external-link.svg"
                      alt="Open"
                      width={12}
                      height={12}
                      className="ml-auto shrink-0 opacity-40 group-hover:opacity-100"
                    />
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
