import { motion } from "framer-motion";
import {
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
  /** Scratch foil gradient (silver-blue -> frost white -> pale periwinkle),
   *  chosen to match the pearl ring of the frame */
  foil: ["#a9b8d4", "#f1f5fb", "#c3cde6"] as const,

  /** Fine rings drawn on the foil */
  ring: "rgba(255,255,255,0.38)",

  /** Snowflake drawn in the middle of the foil */
  emblem: "rgba(255,255,255,0.7)",

  /** Glitter colors (snow-white sparkle + candle-gold sparkle) */
  glitterWhite: "255,255,255",
  glitterGold: "224,184,96",

  /** Revealed text colors and the paper color behind them */
  label: "var(--muted-foreground)",
  value: "var(--gold)",
  paper: "var(--soft-white)",
};

/** Share of the circle that must be scratched before it auto-reveals */
const THRESHOLD = 0.5;

/** Add ?debug to the page URL to see the detected circles outlined in red */
const DEBUG =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("debug");

/* ------------------------------------------------------------------ */
/*  IMAGE GEOMETRY                                                     */
/*  The three frame openings are found automatically: the code looks   */
/*  for paper-colored areas (transparent, white or cream) that are     */
/*  completely enclosed by the frames. If that ever fails, the         */
/*  fallback numbers below (image pixels) are used instead.            */
/* ------------------------------------------------------------------ */
type Circle = {
  cx: number; // horizontal center
  cy: number; // vertical center
  r: number; // radius
};

type Geo = {
  w: number; // image width
  h: number; // image height
  circles: Circle[]; // left, middle, right
};

const FALLBACK: Geo = {
  w: 1376,
  h: 768,
  circles: [
    { cx: 291, cy: 381, r: 127 },
    { cx: 688, cy: 381, r: 127 },
    { cx: 1085, cy: 381, r: 127 },
  ],
};

/** Finds the 3 frame openings in the image. Returns null if it cannot. */
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

  const n = w * h;

  // 1 = "paper": transparent, or white / cream with almost no color
  const paper = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    const p = i * 4;

    if (data[p + 3] < 40) {
      paper[i] = 1;
      continue;
    }

    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    if (
      Math.min(r, g, b) >= 228 &&
      Math.max(r, g, b) - Math.min(r, g, b) <= 16
    ) {
      paper[i] = 1;
    }
  }

  // label: 0 = not visited, -1 = outside, >0 = enclosed area number
  const label = new Int32Array(n);
  const stack = new Int32Array(n);

  const fill = (start: number, id: number) => {
    let sp = 0;
    stack[sp++] = start;
    label[start] = id;

    let area = 0;
    let minX = w;
    let maxX = 0;
    let minY = h;
    let maxY = 0;

    while (sp > 0) {
      const i = stack[--sp];
      const x = i % w;
      const y = (i - x) / w;

      area++;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (x > 0 && paper[i - 1] && !label[i - 1]) {
        label[i - 1] = id;
        stack[sp++] = i - 1;
      }

      if (x < w - 1 && paper[i + 1] && !label[i + 1]) {
        label[i + 1] = id;
        stack[sp++] = i + 1;
      }

      if (y > 0 && paper[i - w] && !label[i - w]) {
        label[i - w] = id;
        stack[sp++] = i - w;
      }

      if (y < h - 1 && paper[i + w] && !label[i + w]) {
        label[i + w] = id;
        stack[sp++] = i + w;
      }
    }

    return { area, minX, maxX, minY, maxY };
  };

  // Everything paper-colored that touches the image edge is "outside"
  for (let x = 0; x < w; x++) {
    if (paper[x] && !label[x]) fill(x, -1);

    const b = (h - 1) * w + x;

    if (paper[b] && !label[b]) fill(b, -1);
  }

  for (let y = 0; y < h; y++) {
    const l = y * w;
    const r = y * w + (w - 1);

    if (paper[l] && !label[l]) fill(l, -1);
    if (paper[r] && !label[r]) fill(r, -1);
  }

  // Paper-colored areas that are NOT outside are enclosed by a frame
  const found: Circle[] = [];
  let id = 0;

  for (let i = 0; i < n; i++) {
    if (!paper[i] || label[i]) continue;

    const c = fill(i, ++id);

    const bw = c.maxX - c.minX + 1;
    const bh = c.maxY - c.minY + 1;

    // Must be circle-sized, round, and fairly solid
    if (bw < w * 0.1 || bw > w * 0.3) continue;
    if (bh < w * 0.1 || bh > w * 0.3) continue;
    if (bw / bh < 0.8 || bw / bh > 1.25) continue;
    if (c.area / ((Math.PI / 4) * bw * bh) < 0.8) continue;

    found.push({
      cx: (c.minX + c.maxX + 1) / 2,
      cy: (c.minY + c.maxY + 1) / 2,
      r: (bw + bh) / 4,
    });
  }

  if (found.length !== 3) return null;

  found.sort((a, b) => a.cx - b.cx);

  // The three circles must sit on one row
  const ys = found.map((c) => c.cy);

  if (Math.max(...ys) - Math.min(...ys) > h * 0.03) return null;

  return { w, h, circles: found };
}

/* ------------------------------------------------------------------ */
/*  The scratch coating (silver-blue frosted foil with a snowflake)    */
/* ------------------------------------------------------------------ */
function paintFoil(canvas: HTMLCanvasElement) {
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

  // Snowflake in the middle
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = THEME.emblem;
  ctx.lineWidth = Math.max(1.5, w * 0.014);
  ctx.lineCap = "round";

  for (let k = 0; k < 6; k++) {
    ctx.save();
    ctx.rotate((k * Math.PI) / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -w * 0.25);
    ctx.moveTo(0, -w * 0.16);
    ctx.lineTo(-w * 0.07, -w * 0.225);
    ctx.moveTo(0, -w * 0.16);
    ctx.lineTo(w * 0.07, -w * 0.225);
    ctx.moveTo(0, -w * 0.09);
    ctx.lineTo(-w * 0.045, -w * 0.135);
    ctx.moveTo(0, -w * 0.09);
    ctx.lineTo(w * 0.045, -w * 0.135);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  // Glitter: mostly white, some candle gold
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const s = (Math.random() * 1.4 + 0.5) * (w / 180);
    const gold = Math.random() < 0.25;

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
}

/* ------------------------------------------------------------------ */
/*  One scratch circle                                                 */
/* ------------------------------------------------------------------ */
function ScratchBox({
  label,
  value,
  circle,
  geo,
}: {
  label: string;
  value: string;
  circle: Circle;
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

      paintFoil(canvas);
    };

    setupCanvas();

    const observer = new ResizeObserver(setupCanvas);
    observer.observe(wrap);

    return () => observer.disconnect();
  }, []);

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

  // +2 image pixels so the foil fully covers the inner edge of the frame
  const diameter = (circle.r + 2) * 2;

  return (
    <div
      ref={wrapRef}
      className="absolute select-none overflow-hidden rounded-full"
      style={{
        backgroundColor: THEME.paper,
        left: `${(circle.cx / geo.w) * 100}%`,
        top: `${(circle.cy / geo.h) * 100}%`,
        width: `${(diameter / geo.w) * 100}%`,
        aspectRatio: "1 / 1",
        transform: "translate(-50%, -50%)",
        outline: DEBUG ? "2px solid red" : undefined,
      }}
    >
      {/* Revealed value, sits on the paper color */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-full text-center"
        style={{ backgroundColor: THEME.paper }}
      >
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
                circle={geo.circles[i]}
                geo={geo}
              />
            ))}
        </div>
      </Reveal>
    </section>
  );
}