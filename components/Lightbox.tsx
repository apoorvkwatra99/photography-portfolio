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
const DRAG_THRESHOLD = 5;
const SWIPE_TRANSITION_MS = 220;
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
  const didDrag = useRef(false);
  const naturalSizes = useRef<Map<string, Size>>(new Map());
  const [fittedSizes, setFittedSizes] = useState<Record<string, Size>>({});
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [dragX, setDragX] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  function recomputeFittedSizes() {
    const ids = [prevPhoto?.id, photo.id, nextPhoto?.id].filter(
      (id): id is string => Boolean(id)
    );
    setFittedSizes((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        const natural = naturalSizes.current.get(id);
        if (natural) next[id] = fitWithinViewport(natural);
      }
      return next;
    });
  }

  useEffect(() => {
    recomputeFittedSizes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id, prevPhoto?.id, nextPhoto?.id]);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
      recomputeFittedSizes();
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id, prevPhoto?.id, nextPhoto?.id]);

  function handleImageLoad(
    photoId: string,
    event: SyntheticEvent<HTMLImageElement>
  ) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    naturalSizes.current.set(photoId, {
      width: naturalWidth,
      height: naturalHeight,
    });
    recomputeFittedSizes();
  }

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  function animateSwipeAway(direction: "prev" | "next") {
    setTransitionEnabled(true);
    setDragX(direction === "prev" ? viewportWidth : -viewportWidth);
    window.setTimeout(() => {
      setTransitionEnabled(false);
      setDragX(0);
      if (direction === "prev") {
        onPrev();
      } else {
        onNext();
      }
    }, SWIPE_TRANSITION_MS);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
    didDrag.current = false;
    setTransitionEnabled(false);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      didDrag.current = true;
    }
    setDragX(delta);
  }

  function handlePointerUp() {
    if (dragStartX.current === null) return;
    dragStartX.current = null;
    setTransitionEnabled(true);
    if (dragX > SWIPE_THRESHOLD && prevPhoto) {
      animateSwipeAway("prev");
    } else if (dragX < -SWIPE_THRESHOLD && nextPhoto) {
      animateSwipeAway("next");
    } else {
      setDragX(0);
    }
  }

  function handlePointerCancel() {
    dragStartX.current = null;
    setTransitionEnabled(true);
    setDragX(0);
  }

  function handleTrackClick(event: MouseEvent) {
    if (didDrag.current) {
      event.stopPropagation();
      didDrag.current = false;
    }
  }

  function renderSlide(slidePhoto: Photo | undefined, key: string) {
    if (!slidePhoto) {
      return (
        <div
          key={key}
          style={{ width: viewportWidth || "100vw" }}
          className="h-full flex-shrink-0"
        />
      );
    }
    const size = fittedSizes[slidePhoto.id];
    return (
      <div
        key={key}
        style={{ width: viewportWidth || "100vw" }}
        className="flex h-full flex-shrink-0 items-center justify-center p-6"
      >
        <div
          className="relative max-h-full max-w-full select-none"
          onClick={stopPropagation}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            style={
              size
                ? { width: size.width, height: size.height }
                : { width: "90vw", height: "90vh" }
            }
          >
            <Image
              src={slidePhoto.src}
              alt={slidePhoto.alt}
              fill
              sizes="90vw"
              priority
              className="object-contain"
              draggable={false}
              onLoad={(event) => handleImageLoad(slidePhoto.id, event)}
            />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 p-4">
            <p className="text-white/60 text-xs mt-0.5 text-left">
              {slidePhoto.placeLabel}, {slidePhoto.countryLabel}
            </p>
            <p className="text-white/60 text-xs mt-0.5 text-center">
              {slidePhoto.camera}
            </p>
            <p className="text-white/60 text-xs mt-0.5 text-right">
              {formatDate(slidePhoto.dateTaken)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/80"
    >
      <div
        className="flex h-full touch-pan-y"
        style={{
          transform: `translateX(${-viewportWidth + dragX}px)`,
          transition: transitionEnabled
            ? `transform ${SWIPE_TRANSITION_MS}ms ease-out`
            : "none",
        }}
        onClick={handleTrackClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {renderSlide(prevPhoto, "prev")}
        {renderSlide(photo, "current")}
        {renderSlide(nextPhoto, "next")}
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation();
          if (prevPhoto) animateSwipeAway("prev");
        }}
        aria-label="Previous photo"
        className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 px-3 py-6 text-4xl text-white/50 transition-colors hover:text-white/90 cursor-pointer"
      >
        ‹
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          if (nextPhoto) animateSwipeAway("next");
        }}
        aria-label="Next photo"
        className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 px-3 py-6 text-4xl text-white/50 transition-colors hover:text-white/90 cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}
