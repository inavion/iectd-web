"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  isPhase2Complete,
  createEctdPhase1,
  createEctdPhase2,
} from "@/lib/actions/folder.actions";

const FolderSetupBanner = () => {
  const router = useRouter();
  // Start HIDDEN - only show if we need to create folders
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState("Setting up folder structure...");

  useEffect(() => {
    // Check if we already completed setup (stored in localStorage)
    const setupComplete = localStorage.getItem("folder_setup_complete");
    if (setupComplete === "true") {
      return; // Don't do anything, stay hidden
    }

    let isCancelled = false;

    const setupFolders = async () => {
      try {
        // Check if already complete on server
        const complete = await isPhase2Complete();

        if (isCancelled) return;

        if (complete) {
          // Mark as complete in localStorage so we never check again
          localStorage.setItem("folder_setup_complete", "true");
          return; // Stay hidden
        }

        // Folders don't exist - NOW show the banner
        setIsVisible(true);

        // Create folders
        setStatus("Creating base folder structure (MODULE 1, 2)...");
        await createEctdPhase1({ path: "/documents" });

        if (isCancelled) return;

        setStatus("Creating remaining folders (MODULE 3, 4, 5)...");
        await createEctdPhase2({ path: "/documents" });

        if (!isCancelled) {
          // Mark as complete
          localStorage.setItem("folder_setup_complete", "true");
          setIsVisible(false);
          router.refresh();
        }
      } catch (error) {
        console.error("Folder setup failed:", error);
        setIsVisible(false);
      }
    };

    setupFolders();

    // Safety timeout
    const timeout = setTimeout(() => {
      if (!isCancelled) {
        localStorage.setItem("folder_setup_complete", "true");
        setIsVisible(false);
      }
    }, 2 * 60 * 1000);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-3">
      <Image
        src="/assets/icons/loader.svg"
        alt="loading"
        width={20}
        height={20}
        className="animate-spin invert"
      />
      <span className="text-sm text-brand">{status}</span>
    </div>
  );
};

export default FolderSetupBanner;