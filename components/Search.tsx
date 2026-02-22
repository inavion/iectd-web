"use client";

import Image from "next/image";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { searchFolders } from "@/lib/actions/folder.actions";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { useDebounce } from "use-debounce";

interface SearchResult {
  $id: string;
  name: string;
  itemType: "file" | "folder";
  fileType?: string;
  extension?: string;
  url?: string;
  $createdAt: string;
}

const Search = () => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [debouncedQuery] = useDebounce(query, 300);

  // Get current view from cookie
  const getViewFromCookie = () => {
    const match = document.cookie.match(/viewMode=(list|grid)/);
    return match ? match[1] : "list";
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return;
      }

      const [filesRes, foldersRes] = await Promise.all([
        getFiles({ searchText: debouncedQuery, limit: 5 }),
        searchFolders({ searchText: debouncedQuery}),
      ]);

      const fileResults: SearchResult[] = (filesRes?.documents || []).map((f: any) => ({
        $id: f.$id,
        name: f.name,
        itemType: "file",
        fileType: f.type,
        extension: f.extension,
        url: f.url,
        $createdAt: f.$createdAt,
      }));

      const folderResults: SearchResult[] = (foldersRes?.documents || []).map((f: any) => ({
        $id: f.$id,
        name: f.name,
        itemType: "folder",
        $createdAt: f.$createdAt,
      }));

      setResults([...folderResults, ...fileResults]);
      setOpen(true);
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleClickItem = (item: SearchResult) => {
    setOpen(false);
    setResults([]);

    const view = getViewFromCookie();
    
    // Navigate with item ID and type to filter, preserving view mode
    router.push(`/documents?search=${item.$id}&type=${item.itemType}&view=${view}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    const view = getViewFromCookie();
    router.push(`/documents?view=${view}`);
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image src="/assets/icons/search.svg" alt="search" width={24} height={24} />
        <Input
          value={query}
          placeholder="Search files and folders"
          className="search-input body-2 shad-no-focus"
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={handleClear} className="p-1 hover:bg-gray-100 rounded">
            <Image src="/assets/icons/close.svg" alt="clear" width={16} height={16} />
          </button>
        )}

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((item) => (
                <li
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2"
                  key={item.$id}
                  onClick={() => handleClickItem(item)}
                >
                  <div className="flex items-center gap-4">
                    {item.itemType === "folder" ? (
                      <Image src="/assets/icons/folder.png" alt="folder" width={36} height={36} />
                    ) : (
                      <Thumbnail
                        type={item.fileType as any}
                        extension={item.extension || ""}
                        url={item.url || ""}
                        className="size-9 min-w-9"
                      />
                    )}
                    <div>
                      <p className="subtitle-2 line-clamp-1">{item.name}</p>
                      <p className="caption text-light-200">{item.itemType === "folder" ? "Folder" : "File"}</p>
                    </div>
                  </div>
                  <FormattedDateTime date={item.$createdAt} className="caption text-light-200" />
                </li>
              ))
            ) : (
              <p className="empty-result body-2">No results found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;