import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { wedding } from "@/config/wedding";

import { SectionHeading } from "./Ornament";
import { Reveal } from "./Reveal";

// 👉 Your scratch card image (white circle centers)
import scratchBackground from "@/assets/scratch-background.png";

/* ------------------------------------------------------------------ */
/*  THEME: change these colors per invitation theme                    */
/* ------------------------------------------------------------------ */
const THEME = {
  /** Scratch foil gradient (pearl pink -> light blush -> soft lavender) */
  foil: ["#f3c9d5", "#fdf0f3", "#d6c4e8"] as const,

  /** Fine rings drawn on the foil */
  ring: "rgba(255,255,255,0.32)",

  /** Glitter colors (white sparkle + champagne gold sparkle) */
  glitterWhite: "255,255,255",
  glitterGold: "232,201,138",

  /** Text colors of the revealed value */
  label: "var(--muted-foreground)",
  value: "var(--gold)",
};

/** Share of the circle that must be scratched before it auto-reveals */
const THRESHOLD = 0.5;

/** Add ?debug to the page URL to see the detected circles outlined in red */
const DEBUG =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("debug");

/* ------------------------------------------------------------------ */
/*  IMAGE GEOMETRY                                                     */
/*  The circles are found automatically by scanning the image for the  */
/*  3 big pure-white circles. If detection ever fails, these fallback  */
/*  numbers (in image pixels) are used instead.                        */
/* ------------------------------------------------------------------ */
type Geo = {
  w: number; // image width
  h: number; // image height
  cy: number; // vertical center of all 3 circles
  r: number; // radius of the white inner circle
  cx: number[]; // horizontal centers: left, middle, right
};

const FALLBACK: Geo = {
  w: 1376,
  h: 768,
  cy: 382,
  r: 127,
  cx: [355, 688, 1021],
};

/** Finds the 3 white circles in the image. Returns null if it cannot. */
function detectCircles(img: HTMLImageElement): Geo | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  if (!w || !h) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);

  let data: Uint8ClampedArray;

  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }

  const isWhite = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;

    const i = (y * w + x) * 4;

    return (
      data[i + 3] > 200 &&
      data[i] >= 240 &&
      data[i + 1] >= 240 &&
      data[i + 2] >= 240
    );
  };

  /** How many white pixels in a straight line from (x, y) */
  const extend = (
    x: number,
    y: number,
    dx: number,
    dy: number
  ) => {
    let n = 0;

    while (isWhite(x + dx * (n + 1), y + dy * (n + 1))) n++;

    return n;
  };

  const minRun = w * 0.1;
  const maxRun = w * 0.25;

  /** White runs on one row that are circle-sized */
  const rowRuns = (y: number) => {
    const runs: [number, number][] = [];
    let start = -1;

    for (let x = 0; x <= w; x++) {
      const white = x < w && isWhite(x, y);

      if (white && start < 0) start = x;

      if (!white && start >= 0) {
        const len = x - start;

        if (len >= minRun && len <= maxRun) {
          runs.push([start, x - 1]);
        }

        start = -1;
      }
    }

    return runs;
  };

  // Try the middle row first, then rows a little above / below
  let runs: [number, number][] = [];

  for (const k of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5]) {
    const y = Math.round(h / 2 + k * h * 0.03);

    runs = rowRuns(y);

    if (runs.length === 3) break;
  }

  if (runs.length !== 3) return null;

  const cxs: number[] = [];
  const cys: number[] = [];
  const rs: number[] = [];

  for (const [s, e] of runs) {
    let cx = (s + e) / 2;
    let cy = Math.round(h / 2);
    let r = (e - s + 1) / 2;

    // Refine: measure top/bottom through cx, then left/right through cy
    for (let pass = 0; pass < 3; pass++) {
      const x = Math.round(cx);
      const y = Math.round(cy);

      const up = extend(x, y, 0, -1);
      const down = extend(x, y, 0, 1);

      cy = y + (down - up) / 2;

      const yy = Math.round(cy);

      const left = extend(x, yy, -1, 0);
      const right = extend(x, yy, 1, 0);

      cx = x + (right - left) / 2;
      r = (left + right + 1) / 2;
    }

    cxs.push(cx);
    cys.push(cy);
    rs.push(r);
  }

  const cy = cys.reduce((a, b) => a + b, 0) / 3;
  const r = rs.reduce((a, b) => a + b, 0) / 3;

  // Sanity checks: circles must be on one row and a sensible size
  if (r < w * 0.03 || r > w * 0.15) return null;
  if (Math.max(...cys) - Math.min(...cys) > h * 0.03) return null;

  return { w, h, cy, r, cx: cxs };
}

/* ------------------------------------------------------------------ */
/*  One scratch circle                                                 */
/* ------------------------------------------------------------------ */
function ScratchBox({
  label,
  value,
  cx,
  geo,
}: {
  label: string;
  value: string;
  cx: number;
  geo: Geo;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const drawing = useRef(false);
  const lastWidth = useRef(0);

  const last = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const [revealed, setRevealed] = useState(false);

  /** Pearlescent pink + lavender foil with champagne glitter */
  const paintCoating = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      // Paint only inside the circle
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      ctx.clip();

      // Base foil gradient
      const base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, THEME.foil[0]);
      base.addColorStop(0.5, THEME.foil[1]);
      base.addColorStop(1, THEME.foil[2]);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // Fine concentric rings (like a polished disc)
      ctx.strokeStyle = THEME.ring;
      ctx.lineWidth = Math.max(1, w * 0.004);

      for (let r = w * 0.04; r < w / 2; r += w * 0.025) {
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Glitter: mostly white, some champagne gold
      for (let i = 0; i < 280; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const s = (Math.random() * 1.4 + 0.5) * (w / 180);
        const gold = Math.random() < 0.3;

        ctx.fillStyle = `rgba(${
          gold ? THEME.glitterGold : THEME.glitterWhite
        },${0.25 + Math.random() * 0.5})`;
        ctx.fillRect(x, y, s, s);
      }

      // Soft light highlight
      const light = ctx.createRadialGradient(
        w * 0.3,
        h * 0.3,
        0,
        w * 0.3,
        h * 0.3,
        w * 0.65
      );
      light.addColorStop(0, "rgba(255,255,255,0.45)");
      light.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;

    if (!canvas || !wrap) return;

    const setupCanvas = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      const rect = wrap.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      // Only repaint when the width really changed,
      // so a half-scratched circle is not reset by tiny layout shifts
      if (Math.abs(rect.width - lastWidth.current) < 1) return;
      lastWidth.current = rect.width;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      paintCoating(canvas);
    };

    setupCanvas();

    const observer = new ResizeObserver(setupCanvas);
    observer.observe(wrap);

    return () => observer.disconnect();
  }, [paintCoating]);

  /** Share of the circle (not the square) that is already scratched */
  const scratchedRatio = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return 0;

    const w = canvas.width;
    const h = canvas.height;

    const data = ctx.getImageData(0, 0, w, h).data;

    const step = Math.max(2, Math.round(w / 60));
    const r = w / 2;

    let clear = 0;
    let total = 0;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const dx = x - w / 2;
        const dy = y - h / 2;

        if (dx * dx + dy * dy > r * r) continue;

        total++;

        if (data[(y * w + x) * 4 + 3] < 16) {
          clear++;
        }
      }
    }

    return total === 0 ? 0 : clear / total;
  };

  const erase = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;

    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    // Brush size follows the circle size, so it feels the same on any screen
    const radius = canvas.width * 0.13;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = radius * 2;

    if (last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    last.current = { x, y };
  };

  const onDown = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (revealed) return;

    drawing.current = true;
    last.current = null;

    e.currentTarget.setPointerCapture(e.pointerId);

    erase(e);
  };

  const onMove = (
    e: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!drawing.current || revealed) return;

    erase(e);
  };

  const onUp = () => {
    if (!drawing.current) return;

    drawing.current = false;
    last.current = null;

    if (!revealed && scratchedRatio() >= THRESHOLD) {
      setRevealed(true);
    }
  };

  // +1 image pixel so the foil fully covers the white edge
  const diameter = (geo.r + 1) * 2;

  return (
    <div
      ref={wrapRef}
      className="absolute select-none overflow-hidden rounded-full bg-white"
      style={{
        left: `${(cx / geo.w) * 100}%`,
        top: `${(geo.cy / geo.h) * 100}%`,
        width: `${(diameter / geo.w) * 100}%`,
        aspectRatio: "1 / 1",
        transform: "translate(-50%, -50%)",
        outline: DEBUG ? "2px solid red" : undefined,
      }}
    >
      {/* Revealed value, sits on pure white */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-white text-center">
        <p
          className="font-semibold uppercase tracking-[0.2em]"
          style={{
            color: THEME.label,
            fontSize: "max(7px, 1.4cqw)",
          }}
        >
          {label}
        </p>

        <p
          className="font-script leading-none"
          style={{
            color: THEME.value,
            fontSize:
              value.length > 3
                ? "max(15px, 4.2cqw)"
                : "max(18px, 5.2cqw)",
            marginTop: "0.6cqw",
          }}
        >
          {value}
        </p>
      </div>

      {/* Scratch coating */}
      <motion.canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
        animate={{
          opacity: revealed ? 0 : 1,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
        className="absolute inset-0 h-full w-full touch-none rounded-full"
        style={{
          pointerEvents: revealed ? "none" : "auto",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */
export function ScratchReveal() {
  const [geo, setGeo] = useState<Geo | null>(null);

  // Find the circles in the image once it has loaded
  useEffect(() => {
    let cancelled = false;

    const img = new Image();

    img.onload = () => {
      if (cancelled) return;

      const found = detectCircles(img);

      if (DEBUG) {
        console.log(
          found ? "Detected circles:" : "Detection failed, using fallback",
          found ?? FALLBACK
        );
      }

      setGeo(found ?? FALLBACK);
    };

    img.onerror = () => {
      if (!cancelled) setGeo(FALLBACK);
    };

    img.src = scratchBackground;

    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { label: "Day", value: wedding.dayNumber },
    { label: "Month", value: wedding.monthName },
    { label: "Year", value: wedding.year },
  ];

  return (
    <section
      className="relative -mt-10 bg-blossom-flip pb-16 pt-0"
    >
      {/* Title: plain, no background image */}
      <div className="mx-auto max-w-md px-6 text-center">
        <Reveal>
          <SectionHeading title="The Date" script />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-deep">
            ✦ Scratch to reveal the date ✦
          </p>
        </Reveal>
      </div>

      {/* Scratch card image + circles */}
      <Reveal delay={0.15}>
        <div
          className="relative mx-auto mt-8 w-full max-w-3xl"
          style={{ containerType: "inline-size" }}
        >
          <img
            src={scratchBackground}
            alt=""
            draggable={false}
            className="pointer-events-none block h-auto w-full select-none"
          />

          {geo &&
            items.map((item, i) => (
              <ScratchBox
                key={item.label}
                label={item.label}
                value={item.value}
                cx={geo.cx[i]}
                geo={geo}
              />
            ))}
        </div>
      </Reveal>
    </section>
  );
}