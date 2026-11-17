import { wedding } from "@/config/wedding";

import { Divider } from "./Ornament";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative bg-blossom px-6 pt-16 pb-14 text-center">
      <Reveal>
        <Divider />

        {/* Sign-off - holly red */}
        <p className="mt-8 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-gold">
          {wedding.footer.signOff}
        </p>

        {/* Initials - midnight navy */}
        <p className="font-script mt-3 text-4xl text-deep sm:text-5xl">
          {wedding.initials}
        </p>

        {/* Thanks */}
        <p className="mt-4 text-sm font-medium text-deep/80">
          {wedding.footer.thanks}
        </p>

        {/* Date - muted navy */}
        <p className="mt-8 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {wedding.date}
        </p>
      </Reveal>
    </footer>
  );
}