import partyImg from "@/assets/dress-code.png";
import { wedding } from "@/config/wedding";

import { SectionHeading } from "./Ornament";
import { Reveal } from "./Reveal";

export function DressCode() {
  return (
    <section className="relative bg-blossom-flip px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative mx-auto max-w-md text-center">
        <Reveal>
          <SectionHeading eyebrow="What to wear" title="Dress Code" />
        </Reveal>

        <Reveal delay={0.1}>
          <img
            src={partyImg}
            alt="Wedding party in navy, burgundy and silver under a pine and poinsettia arch"
            loading="lazy"
            width={1100}
            height={1459}
            className="mx-auto mt-8 h-auto w-full mix-blend-multiply drop-shadow-[0_10px_18px_color-mix(in_oklab,var(--deep-text)_14%,transparent)]"
          />
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xs font-serif text-base italic leading-relaxed text-deep/90 sm:text-lg">
            {wedding.dressCode.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}