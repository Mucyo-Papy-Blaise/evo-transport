"use client";

import { Search } from "lucide-react";
import { cn } from "@/utils/utils";
import { NotificationPopover } from "./Notificationpopover";
import { UserDropdown } from "./Userdropdown";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useGlobalSearch } from "@/contexts/SearchContext";

interface TopbarProps {
  placeholder?: string;
}

export function Topbar({ placeholder = "Search..." }: TopbarProps) {
  const { globalSearch, setGlobalSearch } = useGlobalSearch();
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setGlobalSearch(debouncedSearch);
  }, [debouncedSearch, setGlobalSearch]);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={cn(
            "w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted text-sm text-foreground",
            "placeholder:text-muted-foreground outline-none",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
          )}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationPopover />
        <UserDropdown />
      </div>
    </header>
  );
}
