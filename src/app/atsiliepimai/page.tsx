import type { Metadata } from "next";
import ReviewWall from "@/components/ReviewWall";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Atsiliepimai — Cw-Shop",
  description:
    "Tikri pirkėjų atsiliepimai apie Netflix, Spotify, Discord boost'ai, SMM ir kitas skaitmenines prekes.",
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <header className="mb-12">
        <Reveal>
          <div className="micro text-signal">Tikri pirkėjai</div>
          <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4rem)]">
            Atsiliepimai
          </h1>
          <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed text-muted">
            Tikri žmonės, tikri užsakymai. Atsiliepimus palieka pirkėjai po
            pristatymo — be redagavimo ir be filtrų. Jei kažkas nepavyko,
            parašyk Discord ir ištaisysime.
          </p>
        </Reveal>
      </header>

      <ReviewWall limit={30} withForm />
    </div>
  );
}
