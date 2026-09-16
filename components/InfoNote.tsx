"use client";

import { useEffect, useRef, useState } from "react";

export default function InfoNote() {
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

  return (
    <div className="flex justify-end px-6 py-8">
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Photo editing info"
          aria-expanded={open}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/30 text-xs text-white/60 transition-colors hover:border-white/60 hover:text-white/90 cursor-pointer"
        >
          i
        </button>
        {open && (
          <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border border-white/10 bg-zinc-900 p-3 text-xs text-white/70 shadow-lg">
            Photos have been edited using Lightroom. In rare cases,
            generative AI has been used to remove people. These photos have
            been marked with *.
          </div>
        )}
      </div>
    </div>
  );
}
