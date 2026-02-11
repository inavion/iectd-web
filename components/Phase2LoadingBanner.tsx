"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  isPhase2Complete,
  createEctdPhase2,
} from "@/lib/actions/folder.actions";

const Phase2LoadingBanner = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const hasStarted = useRef(false); // Prevent multiple runs

  useEffect(() => {
    // Prevent running multiple times
    if (hasStarted.current) return;
    hasStarted.current = true;

    let isCancelled = false;

    const checkAndComplete = async () => {
      // Check localStorage lock first
      const isCreating = localStorage.getItem("phase2_creating");
      if (isCreating === "true") {
        // Another tab/instance is already creating, just wait and poll
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

      const complete = await isPhase2Complete();

      if (isCancelled) return;

      if (complete) {
        setIsComplete(true);
        setIsLoading(false);
      } else {
        try {
          // Set lock
          localStorage.setItem("phase2_creating", "true");
          await createEctdPhase2({ path: "/documents" });
          if (!isCancelled) {
            setIsComplete(true);
            router.refresh();
          }
        } catch (error) {
          console.error("Phase 2 creation failed:", error);
        } finally {
          // Remove lock
          localStorage.removeItem("phase2_creating");
          if (!isCancelled) setIsLoading(false);
        }
      }
    };

    checkAndComplete();

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
        className="animate-spin"
      />
      <span className="text-sm text-blue-700">
        Setting up remaining folders (MODULE 3, 4, 5)... This may take a moment.
      </span>
    </div>
  );
};

export default Phase2LoadingBanner;
