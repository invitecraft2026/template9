import { motion, useReducedMotion } from "framer-motion";

import { wedding, type WeddingEvent } from "@/config/wedding";

import archIllustration from "@/assets/Welcome Drinks.png";
import mehndiIllustration from "@/assets/Wedding Ceremony.png";
import ringsIllustration from "@/assets/Reception.png";
import dinnerIllustration from "@/assets/Farewell Brunch.png";

import { SectionHeading } from "./Ornament";
import { Reveal } from "./Reveal";

const illustrationByIcon: Record<WeddingEvent["icon"], string> = {
  crescent: archIllustration,
  rings: ringsIllustration,
  lantern: mehndiIllustration,
  dinner: dinnerIllustration,
};

/* ------------------------------------------------------------------ */
/*  Decorations (all use the theme colors from styles.css)             */
/* ------------------------------------------------------------------ */

/** A five-petal cherry blossom */
function Blossom({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-16 -16 32 32"
      className={className}
      aria-hidden="true"
    >
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d="M0 0 C -5 -4 -6 -12 -2.5 -14 C -1.5 -12.5 -0.8 -13 0 -12 C 0.8 -13 1.5 -12.5 2.5 -14 C 6 -12 5 -4 0 0Z"
          style={{
            fill: "var(--champagne)",
            stroke: "var(--gold-soft)",
            strokeWidth: 0.6,
          }}
        />
      ))}
      <circle r="2" style={{ fill: "var(--gold-soft)" }} />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <circle
          key={angle}
          cx={Math.cos((angle * Math.PI) / 180) * 3.6}
          cy={Math.sin((angle * Math.PI) / 180) * 3.6}
          r="0.7"
          style={{ fill: "var(--gold)" }}
        />
      ))}
    </svg>
  );
}

/** A single falling petal */
function PetalShape({ className }: { className?: string }) {
  return (
    <svg viewBox="-8 -8 16 16" className={className} aria-hidden="true">
      <path
        d="M0 6 C -6 2 -6 -5 -2 -7 C -1 -5.5 1 -5.5 2 -7 C 6 -5 6 2 0 6Z"
        style={{
          fill: "var(--champagne)",
          stroke: "var(--gold-soft)",
          strokeWidth: 0.5,
        }}
      />
    </svg>
  );
}

/** Slowly falling petals (skipped for people who prefer reduced motion) */
const PETALS = [
  { left: "6%", size: 14, duration: 19, delay: 0, sway: 18 },
  { left: "20%", size: 10, duration: 24, delay: 6, sway: -14 },
  { left: "36%", size: 12, duration: 21, delay: 12, sway: 16 },
  { left: "58%", size: 9, duration: 26, delay: 3, sway: -18 },
  { left: "74%", size: 13, duration: 20, delay: 9, sway: 14 },
  { left: "90%", size: 11, duration: 23, delay: 15, sway: -12 },
];

function FallingPetals() {
  const reduce = useReducedMotion();

  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {PETALS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block opacity-0"
          style={{ left: p.left, top: "-3%", width: p.size, height: p.size }}
          animate={{
            top: ["-3%", "103%"],
            x: [0, p.sway, -p.sway / 2, p.sway / 3],
            rotate: [0, 120, 240, 360],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <PetalShape className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  );
}

/** Round pearl-edged frame around each illustration */
function Medallion({ src }: { src: string }) {
  return (
    <div className="relative grid aspect-square h-24 w-24 shrink-0 place-items-center sm:h-28 sm:w-28">
      {/* soft blush disc */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-soft-white via-cream to-champagne/60 shadow-[0_10px_26px_-10px_rgba(166,82,117,0.45)]" />

      {/* pearl ring */}
      <span className="absolute inset-0 rounded-full border-[3px] border-dotted border-soft-white" />

      {/* fine gold ring */}
      <span className="absolute inset-[5px] rounded-full border border-gold-soft/70" />

      <img
        src={src}
        alt=""
        className="relative h-[72%] w-[72%] object-contain object-center mix-blend-multiply"
      />
    </div>
  );
}

/** Small line - diamond - line divider */
function MiniDivider({ align }: { align: "left" | "right" }) {
  return (
    <div
      className={`mt-2 flex items-center gap-1.5 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      <span className="h-px w-5 bg-gradient-to-r from-transparent to-gold-soft" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-soft" />
      <span className="h-px w-5 bg-gradient-to-l from-transparent to-gold-soft" />
    </div>
  );
}

/** Tiny map pin */
function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mr-1 inline-block h-3 w-3 -translate-y-px text-gold"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

/** Blossom marker that sits in the center gutter, on top of the line */
function Marker() {
  return (
    <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center justify-self-center rounded-full border border-gold-soft bg-background shadow-[0_0_14px_rgba(166,82,117,0.35)]">
      <Blossom className="h-5 w-5" />
    </span>
  );
}

/** Event text card */
function EventInfo({
  event,
  align,
}: {
  event: WeddingEvent;
  align: "left" | "right";
}) {
  return (
    <div
      className={`rounded-2xl border border-beige/80 bg-soft-white/70 px-3 py-3 shadow-[0_8px_24px_-14px_rgba(91,52,72,0.35)] backdrop-blur-[2px] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <p className="font-script text-2xl leading-none text-deep sm:text-3xl">
        {event.time}
      </p>

      <MiniDivider align={align} />

      <h3 className="mt-2 text-[0.78rem] font-bold uppercase leading-snug tracking-[0.1em] text-gold sm:text-sm">
        {event.title}
      </h3>

      <p className="mt-1.5 text-[0.8rem] font-medium leading-snug text-deep/80 sm:text-sm">
        <Pin />
        {event.venue}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */
export function EventTimeline() {
  return (
    <section className="relative overflow-hidden bg-blossom px-6 py-20">
      <FallingPetals />

      <div className="relative z-10 mx-auto max-w-md">
        <Reveal>
          <SectionHeading
            eyebrow="The celebrations"
            title="Wedding Timeline"
            script
          />
        </Reveal>

        <div className="relative mt-14">
          {/* Center vertical line */}
          <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold-soft to-transparent" />

          <div className="flex flex-col gap-12">
            {wedding.events.map((event, i) => {
              const imageLeft = i % 2 === 0;

              return (
                <Reveal key={event.id} delay={i * 0.08}>
                  {/* 3 columns: left half | marker gutter | right half.
                      Both halves are the same width, so the rows are
                      perfectly symmetrical around the center line. */}
                  <div className="relative grid grid-cols-[1fr_2.25rem_1fr] items-center">
                    {imageLeft ? (
                      <>
                        <div className="flex justify-center">
                          <Medallion src={illustrationByIcon[event.icon]} />
                        </div>

                        <Marker />

                        <EventInfo event={event} align="left" />
                      </>
                    ) : (
                      <>
                        <EventInfo event={event} align="right" />

                        <Marker />

                        <div className="flex justify-center">
                          <Medallion src={illustrationByIcon[event.icon]} />
                        </div>
                      </>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* End of the timeline */}
          <div className="relative mt-10 flex justify-center">
            <Blossom className="h-9 w-9 drop-shadow-[0_2px_8px_rgba(166,82,117,0.35)]" />
          </div>
        </div>
      </div>
    </section>
  );
}