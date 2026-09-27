"use client";

import { useEffect, useRef, useState } from "react";

type Country = { value: string; label: string };

export default function FilterBar({
  countries,
  selected,
  onSelect,
  onSelectAll,
}: {
  countries: Country[];
  selected: string | null;
  onSelect: (country: string) => void;
  onSelectAll: () => void;
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

  const sortedCountries = [...countries].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const buttonLabel =
    selected === null
      ? "Country"
      : countries.find((c) => c.value === selected)?.label ??
        "Select country";

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
          <button
            onClick={onSelectAll}
            className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-white/5 ${
              selected === null
                ? "bg-zinc-950 text-white font-semibold"
                : "text-white/80"
            }`}
          >
            All
          </button>
          <div className="my-1 border-t border-white/10" />
          <div className="max-h-72 overflow-y-auto">
            {sortedCountries.map((country) => (
              <button
                key={country.value}
                onClick={() => onSelect(country.value)}
                className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-white/5 ${
                  selected === country.value
                    ? "bg-zinc-950 text-white font-semibold"
                    : "text-white/80"
                }`}
              >
                {country.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
