"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ViewMode = "list" | "grid";

const VersionToggle = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = (searchParams.get("view") as ViewMode) || "list";

  const setView = (mode: ViewMode) => {
    // Save to cookie (expires in 1 year)
    document.cookie = `viewMode=${mode}; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="card-options flex items-center p-1">
      {/* LIST */}
      <button
        onClick={() => setView("list")}
        className={`w-9 h-7 rounded-l-sm flex items-center justify-center ${
          view === "list" ? "bg-brand-100/30" : "hover:bg-gray-100"
        }`}
      >
        <Image
          src="/assets/icons/list-option-removebg-preview.png"
          alt="List"
          width={18}
          height={18}
        />
      </button>

      <button
        onClick={() => setView("grid")}
        className={`w-9 h-7 rounded-r-sm flex items-center justify-center ${
          view === "grid" ? "bg-brand-100/30" : "hover:bg-gray-100"
        }`}
      >
        <Image
          src="/assets/icons/icon-option-removebg-preview.png"
          alt="Grid"
          width={18}
          height={18}
        />
      </button>
    </div>
  );
};

export default VersionToggle;