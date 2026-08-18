"use client";

import {
  MouseEvent,
  PointerEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Photo } from "@/types";
import { formatDate } from "@/lib/formatDate";

const SWIPE_THRESHOLD = 50;
const VIEWPORT_FRACTION = 0.9;

type Size = { width: number; height: number };

function fitWithinViewport(natural: Size): Size {
  const maxWidth = window.innerWidth * VIEWPORT_FRACTION;
  const maxHeight = window.innerHeight * VIEWPORT_FRACTION;
  const scale = Math.min(
    maxWidth / natural.width,
    maxHeight / natural.height
  );
  return { width: natural.width * scale, height: natural.height * scale };
}

export default function Lightbox({
  photo,
  prevPhoto,
  nextPhoto,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  prevPhoto?: Photo;
  nextPhoto?: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dragStartX = useRef<number | null>(null);
  const naturalSizes = useRef<Map<string, Size>>(new Map());
  const [renderSize, setRenderSize] = useState<Size | null>(null);

  useEffect(() => {
    const cached = naturalSizes.current.get(photo.id);
    if (cached) {
      setRenderSize(fitWithinViewport(cached));
    }
  }, [photo.id]);

  useEffect(() => {
    function handleResize() {
      const cached = naturalSizes.current.get(photo.id);
      if (cached) {
        setRenderSize(fitWithinViewport(cached));
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [photo.id]);

  function handleImageLoad(
    photoId: string,
    event: SyntheticEvent<HTMLImageElement>
  ) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const size = { width: naturalWidth, height: naturalHeight };
    naturalSizes.current.set(photoId, size);
    if (photoId === photo.id) {
      setRenderSize(fitWithinViewport(size));
    }
  }

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const deltaX = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD) {
      onPrev();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      onNext();
    }
  }

  function handlePointerCancel() {
    dragStartX.current = null;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
    >
      {[prevPhoto, nextPhoto].map(
        (preloadPhoto) =>
          preloadPhoto && (
            <div
              key={preloadPhoto.id}
              className="hidden"
              aria-hidden="true"
            >
              <div className="relative h-[90vh] w-[90vw]">
                <Image
                  src={preloadPhoto.src}
                  alt=""
                  fill
                  sizes="90vw"
                  priority
                  className="object-contain"
                  onLoad={(event) => handleImageLoad(preloadPhoto.id, event)}
                />
              </div>
            </div>
          )
      )}
      <button
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-6 text-4xl text-white/50 transition-colors hover:text-white/90 cursor-pointer"
      >
        ‹
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-6 text-4xl text-white/50 transition-colors hover:text-white/90 cursor-pointer"
      >
        ›
      </button>
      <div
        className="relative max-h-full max-w-full touch-pan-y select-none"
        onClick={stopPropagation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="relative max-h-[90vh] max-w-[90vw]"
          style={
            renderSize
              ? { width: renderSize.width, height: renderSize.height }
              : { width: "90vw", height: "90vh" }
          }
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="90vw"
            className="object-contain"
            draggable={false}
            onLoad={(event) => handleImageLoad(photo.id, event)}
          />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 p-4">
          <p className="text-white/60 text-xs mt-0.5 text-left">
            {photo.placeLabel}, {photo.countryLabel}
          </p>
          <p className="text-white/60 text-xs mt-0.5 text-center">
            {photo.camera}
          </p>
          <p className="text-white/60 text-xs mt-0.5 text-right">
            {formatDate(photo.dateTaken)}
          </p>
        </div>
      </div>
    </div>
  );
}
