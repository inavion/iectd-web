"use client";

import { useState, useRef, useEffect } from "react";
import FolderCard from "@/components/FolderCard";
import Card from "@/components/Card";

interface GridLayoutProps {
  folders: any[];
  files: any[];
}

const GridLayout = ({ folders, files }: GridLayoutProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedId(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef}>
      {/* FOLDERS */}
      {folders.length > 0 && (
        <section className="file-list mb-4 sm:mb-6 gap-3 sm:gap-6">
          {folders.map((folder) => (
            <FolderCard
              key={folder.$id}
              folder={folder}
              selected={selectedId === folder.$id}
              onSelect={() => setSelectedId(folder.$id)}
            />
          ))}
        </section>
      )}

      {/* FILES */}
      {files.length > 0 && (
        <section className="file-list gap-3 sm:gap-6">
          {files.map((file) => (
            <Card
              key={file.$id}
              file={file}
              selected={selectedId === file.$id}
              onSelect={() => setSelectedId(file.$id)}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default GridLayout;