"use client";

import { useMemo, useState } from "react";
import { Photo } from "@/types";
import PhotoGrid from "@/components/PhotoGrid";
import FilterBar from "@/components/FilterBar";
import SortDropdown, { SortOrder } from "@/components/SortDropdown";
import Lightbox from "@/components/Lightbox";

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recommended");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const countries = useMemo(() => {
    const seen = new Map<string, string>();
    for (const photo of photos) {
      if (!seen.has(photo.country)) {
        seen.set(photo.country, photo.countryLabel);
      }
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [photos]);

  const filteredPhotos =
    selectedCountries.length === 0
      ? photos
      : photos.filter((photo) => selectedCountries.includes(photo.country));

  const sortedPhotos = useMemo(() => {
    if (sortOrder === "recommended") return filteredPhotos;
    const sorted = [...filteredPhotos];
    sorted.sort((a, b) =>
      sortOrder === "date-asc"
        ? a.dateTaken.localeCompare(b.dateTaken)
        : b.dateTaken.localeCompare(a.dateTaken)
    );
    return sorted;
  }, [filteredPhotos, sortOrder]);

  function toggleCountry(country: string) {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  }

  function showPrevPhoto() {
    setSelectedIndex((current) =>
      current === null
        ? current
        : (current - 1 + sortedPhotos.length) % sortedPhotos.length
    );
  }

  function showNextPhoto() {
    setSelectedIndex((current) =>
      current === null ? current : (current + 1) % sortedPhotos.length
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 px-6 pt-6 pb-6">
        <FilterBar
          countries={countries}
          selected={selectedCountries}
          onToggle={toggleCountry}
        />
        <SortDropdown selected={sortOrder} onChange={setSortOrder} />
      </div>
      <div
        className={`transition-opacity duration-300 ${
          selectedIndex !== null ? "opacity-40" : "opacity-100"
        }`}
      >
        <PhotoGrid photos={sortedPhotos} onSelectPhoto={setSelectedIndex} />
      </div>
      {selectedIndex !== null && (
        <Lightbox
          photo={sortedPhotos[selectedIndex]}
          prevPhoto={
            sortedPhotos[
              (selectedIndex - 1 + sortedPhotos.length) % sortedPhotos.length
            ]
          }
          nextPhoto={sortedPhotos[(selectedIndex + 1) % sortedPhotos.length]}
          onClose={() => setSelectedIndex(null)}
          onPrev={showPrevPhoto}
          onNext={showNextPhoto}
        />
      )}
    </>
  );
}
