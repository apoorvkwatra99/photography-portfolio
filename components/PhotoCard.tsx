"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Photo } from "@/types";
import { formatDate } from "@/lib/formatDate";

const CONTAINER_ASPECT = 4 / 3;

function computeInset(imageAspect: number) {
  return imageAspect >= CONTAINER_ASPECT
    ? { left: 0, bottom: 50 * (1 - CONTAINER_ASPECT / imageAspect) }
    : { left: 50 * (1 - imageAspect / CONTAINER_ASPECT), bottom: 0 };
}

export default function PhotoCard({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick?: () => void;
}) {
  const [inset, setInset] = useState({ left: 0, bottom: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setInset(computeInset(img.naturalWidth / img.naturalHeight));
    }
  }, []);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setInset(computeInset(naturalWidth / naturalHeight));
  }

  return (
    <article
      onClick={onClick}
      className="relative overflow-hidden bg-black aspect-[4/3] group cursor-pointer"
    >
      <img
        ref={imgRef}
        src={photo.src}
        alt={photo.alt}
        onLoad={handleLoad}
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      <div
        className="absolute flex items-end justify-between gap-4 p-4 translate-y-3 opacity-0 group-hover:translate-y-1 group-hover:opacity-100 transition-all duration-300"
        style={{
          left: `${inset.left}%`,
          right: `${inset.left}%`,
          bottom: `${inset.bottom}%`,
        }}
      >
        <p className="text-white/60 text-xs mt-0.5 text-left">
          {photo.placeLabel}, {photo.countryLabel}
        </p>
        <p className="text-white/60 text-xs mt-0.5 text-right">
          {formatDate(photo.dateTaken)}
        </p>
      </div>
    </article>
  );
}
