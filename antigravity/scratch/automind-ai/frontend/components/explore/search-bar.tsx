"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  totalMatches?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search by brand, model or vehicle...",
  className,
  totalMatches,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K / slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
        <Search className="h-4 w-4 text-cyan-400" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search vehicles"
        className={cn(
          "flex h-12 w-full rounded-lg border border-white/[0.10] bg-[#0A0E17] pl-11 pr-24 text-sm text-slate-100 placeholder:text-slate-500",
          "transition-all duration-200 focus:border-cyan-400 focus:bg-[#0D131F] focus:outline-none focus:ring-1 focus:ring-cyan-400/40",
          "shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        )}
      />

      <div className="absolute right-3 flex items-center gap-2">
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search query"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/[0.12] bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 select-none">
            <span>⌘</span>K
          </kbd>
        )}

        {totalMatches !== undefined && (
          <span className="hidden md:inline-flex font-mono text-[11px] text-cyan-400 font-semibold px-2 py-0.5 rounded-sm bg-cyan-950/60 border border-cyan-500/20">
            {totalMatches} Found
          </span>
        )}
      </div>
    </div>
  );
};
