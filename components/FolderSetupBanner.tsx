"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  isPhase2Complete,
  createEctdPhase1,
  createEctdPhase2,
} from "@/lib/actions/folder.actions";

const FolderSetupBanner = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [status, setStatus] = useState("Checking folder structure...");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let isCancelled = false;

    const setupFolders = async () => {
      // Check localStorage lock first
      const isCreating = localStorage.getItem("folders_creating");
      if (isCreating === "true") {
        // Another tab is already creating, poll for completion
        const pollInterval = setInterval(async () => {
          const complete = await isPhase2Complete();
          if (complete && !isCancelled) {
            setIsComplete(true);
            setIsLoading(false);
            clearInterval(pollInterval);
            router.refresh();
          }
        }, 3000);
        return;
      }

      try {
        // Check if already complete
        const complete = await isPhase2Complete();
        if (isCancelled) return;

        if (complete) {
          setIsComplete(true);
          setIsLoading(false);
          return;
        }

        // Set lock
        localStorage.setItem("folders_creating", "true");

        // Phase 1: Create root + m1 + m2
        setStatus("Creating base folder structure (MODULE 1, 2)...");
        await createEctdPhase1({ path: "/documents" });

        if (isCancelled) return;

        // Phase 2: Create m3 + m4 + m5
        setStatus("Creating remaining folders (MODULE 3, 4, 5)...");
        await createEctdPhase2({ path: "/documents" });

        if (!isCancelled) {
          setIsComplete(true);
          router.refresh();
        }
      } catch (error) {
        console.error("Folder setup failed:", error);
      } finally {
        localStorage.removeItem("folders_creating");
        if (!isCancelled) setIsLoading(false);
      }
    };

    setupFolders();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  if (isComplete || !isLoading) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-3">
      <Image
        src="/assets/icons/loader.svg"
        alt="loading"
        width={20}
        height={20}
        className="animate-spin invert"
      />
      <span className="text-sm text-blue-700">{status}</span>
    </div>
  );
};

export default FolderSetupBanner;