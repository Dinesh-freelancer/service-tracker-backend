import React, { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/**
 * ImageViewer – displays an image fitted to its container with
 * zoom-in / zoom-out / reset controls and mouse-drag panning when zoomed.
 * Falls back to an embedded <iframe> if the direct <img> fails to load.
 *
 * Props:
 *   src         – direct image URL
 *   fallbackUrl – optional iframe-compatible embed URL if <img> fails
 *   alt         – alt text
 *   className   – extra classes applied to the outer wrapper div
 */
export default function ImageViewer({
  src,
  fallbackUrl = null,
  alt = "Image",
  className = "",
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dragStart = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setImgError(false);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [src]);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const STEP = 0.5;

  const clampOffset = useCallback(
    (newOffset, currentScale) => {
      if (!containerRef.current) return newOffset;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const maxX = (width * (currentScale - 1)) / 2;
      const maxY = (height * (currentScale - 1)) / 2;
      return {
        x: Math.min(maxX, Math.max(-maxX, newOffset.x)),
        y: Math.min(maxY, Math.max(-maxY, newOffset.y)),
      };
    },
    []
  );

  const zoom = (delta) => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta));
      setOffset((o) => clampOffset(o, next));
      return next;
    });
  };

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // ── Pointer drag for panning ──────────────────────────────────────────────
  const onPointerDown = (e) => {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onPointerMove = (e) => {
    if (!dragging || !dragStart.current) return;
    const raw = {
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    };
    setOffset(clampOffset(raw, scale));
  };

  const onPointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  // ── Wheel zoom ────────────────────────────────────────────────────────────
  const onWheel = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? STEP : -STEP);
  };

  if (imgError && fallbackUrl) {
    return (
      <div
        className={`relative w-full bg-slate-100 dark:bg-slate-900 rounded overflow-hidden ${className}`}
        style={{ aspectRatio: "4/3" }}
      >
        <iframe
          src={fallbackUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          title={alt}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full bg-slate-100 dark:bg-slate-900 rounded overflow-hidden select-none ${className}`}
      style={{ aspectRatio: "4/3" }}
    >
      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onError={() => setImgError(true)}
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.15s ease",
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg p-1">
        <button
          onClick={() => zoom(STEP)}
          disabled={scale >= MAX_SCALE}
          className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <span className="text-white text-[11px] w-8 text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => zoom(-STEP)}
          disabled={scale <= MIN_SCALE}
          className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <div className="w-px h-4 bg-white/30 mx-0.5" />
        <button
          onClick={reset}
          disabled={scale === 1}
          className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Reset zoom"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
