"use client";

import { useEffect, useRef, useState } from "react";

type Country = { value: string; label: string };

export default function FilterBar({
  countries,
  selected,
  onToggle,
}: {
  countries: Country[];
  selected: string[];
  onToggle: (country: string) => void;
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
    selected.length === 0
      ? "Country"
      : selected.length === 1
        ? countries.find((c) => c.value === selected[0])?.label ??
          "Select country"
        : `${selected.length} countries`;

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
        <div className="absolute z-10 mt-2 w-56 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-zinc-900 py-2 shadow-lg">
          {sortedCountries.map((country) => (
            <label
              key={country.value}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(country.value)}
                onChange={() => onToggle(country.value)}
                className="accent-white"
              />
              {country.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
