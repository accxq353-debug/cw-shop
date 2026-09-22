"use client";

import { useLanguage } from "@/lib/language";
import { CheckCircle2, MessageSquare, ShieldCheck, Ticket } from "lucide-react";

export default function SecurityPipeline() {
  const { t } = useLanguage();

  const steps = [
    {
      step: "01",
      icon: MessageSquare,
      title: t.pipe1Title,
      desc: t.pipe1Desc,
      glow: "from-violet-500/20 to-purple-500/10",
      accent: "text-[#c084fc]",
    },
    {
      step: "02",
      icon: ShieldCheck,
      title: t.pipe2Title,
      desc: t.pipe2Desc,
      glow: "from-blue-500/20 to-cyan-500/10",
      accent: "text-[#60a5fa]",
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: t.pipe3Title,
      desc: t.pipe3Desc,
      glow: "from-emerald-500/20 to-teal-500/10",
      accent: "text-[#4ade80]",
    },
    {
      step: "04",
      icon: Ticket,
      title: t.pipe4Title,
      desc: t.pipe4Desc,
      glow: "from-amber-500/20 to-yellow-500/10",
      accent: "text-[#fbbf24]",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#150c27] via-[#0d0817] to-[#09050f] p-8 shadow-2xl md:p-12">
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-signal/15 blur-[120px]"
      />

      <div className="relative text-center">
        <span className="micro inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-4 py-1.5 text-signal">
          <ShieldCheck size={14} />
          {t.pipelineSubtitle}
        </span>
        <h2 className="display mt-4 text-[clamp(1.9rem,4vw,2.8rem)]">
          {t.pipelineTitle}
        </h2>
      </div>

      <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className="group relative flex flex-col justify-between rounded-2xl border border-line bg-void/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-signal/50 hover:shadow-[0_10px_30px_rgba(183,139,255,0.15)]"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-gradient-to-br ${st.glow} ${st.accent} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={22} strokeWidth={2.4} />
                </span>
                <span className="num text-[28px] font-black text-white/10 group-hover:text-signal/30">
                  {st.step}
                </span>
              </div>

              {/* Text */}
              <div className="mt-6">
                <h3 className="font-display text-[16.5px] font-extrabold tracking-tight text-ink group-hover:text-signal transition-colors">
                  {st.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {st.desc}
                </p>
              </div>

              {/* Connecting arrow line on desktop */}
              {i < steps.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-signal/40"
                >
                  ➔
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
