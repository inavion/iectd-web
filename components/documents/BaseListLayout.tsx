"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface BaseListLayoutProps<T> {
  items: T[];
  getId: (item: T) => string;
  header: React.ReactNode;
  renderRow: (
    item: T,
    isSelected: boolean,
    onMouseDown: (e: React.MouseEvent) => void,
    onMouseUp: (e: React.MouseEvent) => void
  ) => React.ReactNode;
}

export default function BaseListLayout<T>({
  items,
  getId,
  header,
  renderRow,
}: BaseListLayoutProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (id: string) => {
      setSelectedIds(new Set([id]));
    },
    []
  );

  const handleMouseUp = useCallback(() => {}, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelectedIds(new Set());
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="card w-full" ref={containerRef}>
      {header}
      <div className="header-divider" />

      {(items ?? []).map((item) => {
        const id = getId(item);
        return renderRow(
          item,
          selectedIds.has(id),
          (e) => {
            e.stopPropagation();
            handleMouseDown(id);
          },
          handleMouseUp
        );
      })}
    </div>
  );
}