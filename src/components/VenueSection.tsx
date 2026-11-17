import venueImg from "@/assets/venue-illustration.png";
import { wedding } from "@/config/wedding";
import { mapsDirectionsUrl } from "@/utils/calendar";

import { SectionHeading } from "./Ornament";
import { Reveal } from "./Reveal";

export function VenueSection() {
  return (
    <section className="relative bg-blossom px-6 py-20">
      <div className="relative mx-auto max-w-md">
        <Reveal>
          <SectionHeading
            eyebrow="Where we celebrate"
            title="The Venue"
            script
          />
        </Reveal>

        <Reveal delay={0.1}>
          {/* Watercolor illustration - no frame, blends into the page */}
          <div className="mt-8 flex justify-center">
            <img
              src={venueImg}
              alt="Watercolor illustration of the wedding venue"
              loading="lazy"
              width={1200}
              height={1044}
              className="h-auto w-full max-w-[17rem] mix-blend-multiply sm:max-w-[20rem]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-6 text-center">
            {/* Venue name - midnight navy */}
            <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-deep">
              {wedding.venue.name}
            </h3>

            {/* Address */}
            <p className="mt-2 text-sm font-medium leading-relaxed text-deep/80">
              {wedding.venue.address}
            </p>

            {/* Button - solid holly red, white text, candle-gold border */}
            <a
              href={mapsDirectionsUrl(wedding.venue.mapsQuery)}
              target="_blank"
              rel="noreferrer"
              className="
                mt-6
                inline-block
                rounded-md
                border
                border-gold-soft
                bg-primary
                px-6
                py-3
                text-[0.62rem]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-primary-foreground
                shadow-[0_6px_20px_color-mix(in_oklab,var(--gold)_35%,transparent)]
                transition-all
                duration-300
                hover:bg-deep
              "
            >
              Get Directions
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}