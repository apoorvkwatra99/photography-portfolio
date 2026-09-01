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
const FULLSCREEN_VIEWPORT_FRACTION = 0.98;

type Size = { width: number; height: number };

// Safari (pre-16.4) only exposes the Fullscreen API under a webkit prefix,
// and iOS Safari doesn't support it at all for non-<video> elements.
type FullscreenDocument = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
}

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestFullscreen(el: HTMLElement) {
  const target = el as FullscreenElement;
  if (target.requestFullscreen) {
    await target.requestFullscreen();
  } else if (target.webkitRequestFullscreen) {
    await target.webkitRequestFullscreen();
  }
}

async function exitFullscreen() {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) {
    await doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  }
}

function fitWithinViewport(natural: Size, fraction: number): Size {
  const maxWidth = window.innerWidth * fraction;
  const maxHeight = window.innerHeight * fraction;
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
  const swipeTimeoutRef = useRef<number | null>(null);
  const naturalSizes = useRef<Map<string, Size>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [fittedSizes, setFittedSizes] = useState<Record<string, Size>>({});
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [dragX, setDragX] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [fullscreenSupported] = useState(isFullscreenSupported);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreenSupported) return;
    function handleFullscreenChange() {
      setIsFullscreen(getFullscreenElement() !== null);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      // Leave the browser's native fullscreen when the lightbox unmounts,
      // e.g. if the user closes it via Esc while already fullscreen.
      if (getFullscreenElement()) exitFullscreen();
    };
  }, [fullscreenSupported]);

  function toggleFullscreen() {
    if (isFullscreen) {
      exitFullscreen();
    } else if (containerRef.current) {
      requestFullscreen(containerRef.current);
    }
  }

  function recomputeFittedSizes() {
    const ids = [prevPhoto?.id, photo.id, nextPhoto?.id].filter(
      (id): id is string => Boolean(id)
    );
    const fraction = isFullscreen
      ? FULLSCREEN_VIEWPORT_FRACTION
      : VIEWPORT_FRACTION;
    setFittedSizes((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        const natural = naturalSizes.current.get(id);
        if (natural) next[id] = fitWithinViewport(natural, fraction);
      }
      return next;
    });
  }

  useEffect(() => {
    recomputeFittedSizes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id, prevPhoto?.id, nextPhoto?.id, isFullscreen]);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
      recomputeFittedSizes();
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id, prevPhoto?.id, nextPhoto?.id, isFullscreen]);

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

  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current !== null) {
        clearTimeout(swipeTimeoutRef.current);
      }
    };
  }, []);

  function animateSwipeAway(direction: "prev" | "next") {
    if (swipeTimeoutRef.current !== null) return;
    setTransitionEnabled(true);
    setDragX(direction === "prev" ? viewportWidth : -viewportWidth);
    swipeTimeoutRef.current = window.setTimeout(() => {
      swipeTimeoutRef.current = null;
      setTransitionEnabled(false);
      setDragX(0);
      if (direction === "prev") {
        onPrev();
      } else {
        onNext();
      }
    }, SWIPE_TRANSITION_MS);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && prevPhoto) {
        animateSwipeAway("prev");
      } else if (event.key === "ArrowRight" && nextPhoto) {
        animateSwipeAway("next");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevPhoto, nextPhoto, viewportWidth]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    // A swipe is still settling (photo hasn't swapped yet) — ignore new
    // gestures rather than risk showing a stale/repeated image mid-swap.
    if (swipeTimeoutRef.current !== null) return;
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

  function renderSlide(slidePhoto: Photo | undefined, fallbackKey: string) {
    const slideKey = slidePhoto?.id ?? fallbackKey;
    if (!slidePhoto) {
      return (
        <div
          key={slideKey}
          style={{ width: viewportWidth || "100vw" }}
          className="h-full flex-shrink-0"
        />
      );
    }
    const size = fittedSizes[slidePhoto.id];
    const viewportPercent = isFullscreen ? 98 : 90;
    return (
      <div
        key={slideKey}
        style={{ width: viewportWidth || "100vw" }}
        className={`flex h-full flex-shrink-0 items-center justify-center ${
          isFullscreen ? "p-1" : "p-6"
        }`}
      >
        <div
          className="relative max-h-full max-w-full select-none"
          onClick={stopPropagation}
        >
          <div
            className="relative"
            style={{
              maxHeight: `${viewportPercent}vh`,
              maxWidth: `${viewportPercent}vw`,
              ...(size
                ? { width: size.width, height: size.height }
                : { width: `${viewportPercent}vw`, height: `${viewportPercent}vh` }),
            }}
          >
            <Image
              src={slidePhoto.src}
              alt={slidePhoto.alt}
              fill
              sizes={`${viewportPercent}vw`}
              priority
              className="object-contain"
              draggable={false}
              onLoad={(event) => handleImageLoad(slidePhoto.id, event)}
            />
          </div>
          {!isFullscreen && (
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/80"
    >
      <div
        className="flex h-full [touch-action:pan-y_pinch-zoom]"
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
      {fullscreenSupported && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleFullscreen();
          }}
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          className="absolute right-4 top-4 z-10 p-2 text-white/50 transition-colors hover:text-white/90 cursor-pointer"
        >
          {isFullscreen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 3v4a2 2 0 0 1-2 2H3" />
              <path d="M21 9h-4a2 2 0 0 1-2-2V3" />
              <path d="M3 15h4a2 2 0 0 1 2 2v4" />
              <path d="M15 21v-4a2 2 0 0 1 2-2h4" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9V5a2 2 0 0 1 2-2h4" />
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
              <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
              <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
            </svg>
          )}
        </button>
      )}
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
