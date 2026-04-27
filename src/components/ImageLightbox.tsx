"use client";

import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type LightboxImage = {
  src: string;
  alt?: string;
};

type Props = {
  open: boolean;
  images: LightboxImage[];
  index: number;
  title?: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
};

export function ImageLightbox({
  open,
  images,
  index,
  title = "查看大图",
  onClose,
  onIndexChange,
}: Props) {
  const active = images[index] ?? null;
  const hasMany = images.length > 1;

  const goTo = useCallback((nextIndex: number) => {
    if (!images.length) {
      return;
    }
    onIndexChange?.((nextIndex + images.length) % images.length);
  }, [images.length, onIndexChange]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (!hasMany) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, hasMany, index, onClose, open]);

  if (!open || !active) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex flex-col bg-stone-950/95 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white sm:p-5"
    >
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 shadow-2xl backdrop-blur-md">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          {hasMany && (
            <p className="mt-0.5 text-xs text-white/60">
              {index + 1} / {images.length}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/85 transition hover:bg-white/15 hover:text-white"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-xl backdrop-blur-md transition hover:bg-white/20 sm:left-2 sm:h-12 sm:w-12"
              aria-label="上一张"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-0 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/90 shadow-xl backdrop-blur-md transition hover:bg-white/20 sm:right-2 sm:h-12 sm:w-12"
              aria-label="下一张"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div
          className="flex h-full items-center justify-center px-1 py-4 sm:px-14 sm:py-6"
          onClick={onClose}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.src}
            alt={active.alt ?? title}
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            draggable={false}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
