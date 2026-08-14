"use client";

import { useEffect, useRef, useState } from "react";

export type SortOrder = "recommended" | "date-asc" | "date-desc";

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "date-asc", label: "Oldest" },
  { value: "date-desc", label: "Latest" },
];

export default function SortDropdown({
  selected,
  onChange,
}: {
  selected: SortOrder;
  onChange: (order: SortOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonLabel =
    OPTIONS.find((option) => option.value === selected)?.label ??
    "Recommended";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide rounded-full border border-white/20 text-white/80 hover:border-white/50 transition-colors"
      >
        {buttonLabel}
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-56 rounded-lg border border-white/10 bg-zinc-900 py-2 shadow-lg">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-white/5 ${
                selected === option.value ? "text-white" : "text-white/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
