"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  isPhase2Complete,
  createEctdPhase1,
  createEctdPhase2,
} from "@/lib/actions/folder.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";

const currentUser = await getCurrentUser();
if (!currentUser) throw new Error("Not authenticated");

const FolderSetupBanner = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState("Checking folder structure...");

  useEffect(() => {
    let isCancelled = false;

    const setupFolders = async () => {
      // Check if setup is already complete
      const setupComplete = localStorage.getItem("folder_setup_complete");
      if (setupComplete === "true") {
        // Double-check with server
        const serverComplete = await isPhase2Complete(currentUser);
        if (serverComplete) {
          console.log("[FolderSetup] ✅ All folders already exist");
          return;
        } else {
          // Server says not complete, clear localStorage and continue
          localStorage.removeItem("folder_setup_complete");
        }
      }

      // Check if currently in progress (from another navigation)
      const inProgress = localStorage.getItem("folder_setup_in_progress");

      try {
        // Check server status
        console.log("[FolderSetup] Checking if folders exist...");
        const complete = await isPhase2Complete(currentUser);

        if (isCancelled) return;

        if (complete) {
          console.log("[FolderSetup] ✅ All folders already exist on server");
          localStorage.setItem("folder_setup_complete", "true");
          localStorage.removeItem("folder_setup_in_progress");
          return;
        }

        // Not complete - show banner and create folders
        setIsVisible(true);
        localStorage.setItem("folder_setup_in_progress", "true");

        // Phase 1
        console.log("[FolderSetup] 🚀 Starting Phase 1 (root + m1 + m2)...");
        setStatus("Creating MODULE 1 & 2... (just a moment)");
        await createEctdPhase1({ path: "/documents", currentUser });
        console.log("[FolderSetup] ✅ Phase 1 complete");
        router.refresh();

        if (isCancelled) {
          console.log(
            "[FolderSetup] ⚠️ Cancelled during Phase 1, will resume on next mount",
          );
          return;
        }

        // Phase 2
        console.log(
          "[FolderSetup] 🚀 Starting Phase 2 (m3 + m4 + m5)... (Refresh after 2 minutes)",
        );
        setStatus("Creating MODULE 3, 4, 5... (please wait atleast 2 minutes)");
        await createEctdPhase2({ path: "/documents" , currentUser});
        console.log("[FolderSetup] ✅ Phase 2 complete");
        router.refresh();

        if (!isCancelled) {
          console.log("[FolderSetup] 🎉 All folders created successfully!");
          localStorage.setItem("folder_setup_complete", "true");
          localStorage.removeItem("folder_setup_in_progress");
          setIsVisible(false);
          router.refresh();
        }
      } catch (error) {
        console.error("[FolderSetup] ❌ Error:", error);
        // Don't mark as complete on error - will retry on next mount
        localStorage.removeItem("folder_setup_in_progress");
        setIsVisible(false);
      }
    };

    setupFolders();

    return () => {
      isCancelled = true;
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
