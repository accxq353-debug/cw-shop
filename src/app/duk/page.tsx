import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "DUK — Cw-Shop",
  description:
    "Dažniausiai užduodami klausimai apie pristatymą, atsiskaitymą PayPal, garantiją ir FA / NFA paskyras.",
};

const DISCORD = "https://discord.gg/asMCPaCKk";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-24 pt-14">
      <header className="mb-12">
        <Reveal>
          <div className="micro text-signal">Pagalba</div>
          <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4rem)]">
            Dažniausiai klausiama
          </h1>
          <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-muted">
            Atsakymai į klausimus, kuriuos gauname beveik kasdien. Neradai savo
            atsakymo? Discord atsakome greičiau nei el. paštu.
          </p>
        </Reveal>
      </header>

      <Faq />

      <Reveal>
        <div className="mt-16 flex flex-col items-start gap-5 rounded-2xl border border-line bg-panel p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[22px] font-extrabold tracking-[-0.02em]">
              Liko klausimų?
            </h2>
            <p className="mt-2 max-w-[48ch] text-[14px] text-muted">
              Parašyk Discord serveryje — atsakome greitai ir be automatinių
              atsakymų.
            </p>
          </div>
          <a
            href={DISCORD}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-display text-[14.5px] font-extrabold text-void transition-transform hover:-translate-y-px"
          >
            <MessageCircle size={16} strokeWidth={2.4} />
            Discord serveris
          </a>
        </div>
      </Reveal>

      <div className="mt-10 text-center">
        <Link
          href="/produktai"
          className="text-[14px] text-muted transition-colors hover:text-ink"
        >
          ← Grįžti į kainoraštį
        </Link>
      </div>
    </div>
  );
}
