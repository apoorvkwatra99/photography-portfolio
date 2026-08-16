"use client";

import { MouseEvent } from "react";
import Image from "next/image";
import { Photo } from "@/types";
import { formatDate } from "@/lib/formatDate";

export default function Lightbox({
  photo,
  onClose,
}: {
  photo: Photo;
  onClose: () => void;
}) {
  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
    >
      <div
        className="relative max-h-full max-w-full"
        onClick={stopPropagation}
      >
        <div className="relative h-[90vh] w-[90vw] max-h-[90vh] max-w-[90vw]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
        <div className="flex items-end justify-between gap-4 p-4">
          <p className="text-white/60 text-xs mt-0.5 text-left">
            {photo.placeLabel}, {photo.countryLabel}
          </p>
          <p className="text-white/60 text-xs mt-0.5 text-right">
            {formatDate(photo.dateTaken)}
          </p>
        </div>
      </div>
    </div>
  );
}
