import type { Metadata } from "next";
import DiscordVouchFeed from "@/components/DiscordVouchFeed";
import ReviewWall from "@/components/ReviewWall";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atsiliepimai — Cw-Shop",
  description:
    "Klientų atsiliepimai tiesiai iš oficialaus Discord #⭐・atsiliepimai kanalo ir svetainės pirkėjų atsiliepimai.",
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-10">
      {/* Discord Channel Interface (Exact look from screenshot) */}
      <Reveal>
        <DiscordVouchFeed />
      </Reveal>

      {/* Website Reviews submission form and customer reviews wall */}
      <section className="mt-20 border-t border-line/60 pt-16">
        <Reveal>
          <div className="mb-10 text-center sm:text-left">
            <div className="micro text-signal">Svetainės atsiliepimai</div>
            <h2 className="display mt-2 text-[clamp(1.9rem,4vw,2.6rem)] text-white">
              Palikti atsiliepimą svetainėje
            </h2>
            <p className="mt-2 text-[14.5px] text-muted max-w-2xl">
              Pirkote prekę? Pasidalinkite savo patirtimi arba prisekite veikiančios prekės ekrano nuotrauką.
            </p>
          </div>
        </Reveal>

        <ReviewWall limit={30} withForm />
      </section>
    </div>
  );
}
