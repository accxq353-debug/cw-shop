"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { playSound } from "@/lib/audio";
import { useLanguage } from "@/lib/language";

export function CopyField({
  label,
  value,
  display,
  href,
}: {
  label: string;
  value: string;
  display: string;
  href?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      playSound("copy");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`group relative rounded-xl border transition-all duration-200 ${
      copied
        ? "border-signal bg-signal/[0.08] shadow-[0_0_20px_rgba(183,139,255,0.25)]"
        : "border-line bg-void hover:border-signal/50"
    } px-4 py-3.5`}>
      <div className="flex items-center justify-between">
        <div className="micro text-muted/70">{label}</div>
        {copied ? (
          <span className="micro flex items-center gap-1 font-bold text-live">
            <Check size={12} strokeWidth={3} /> {t.copied}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-3">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="num min-w-0 flex-1 truncate text-[14px] text-signal underline-offset-4 hover:underline"
          >
            {display}
          </a>
        ) : (
          <span className="num min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
            {display}
          </span>
        )}

        <button
          type="button"
          onClick={copy}
          title={t.copyHelper}
          aria-label={`Kopijuoti ${label}`}
          className={`relative flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-semibold transition-all duration-200 ${
            copied
              ? "border-live/60 bg-live/20 text-live scale-105"
              : "border-line bg-white/[0.04] text-muted hover:border-signal/60 hover:text-ink hover:bg-signal/15 active:scale-95"
          }`}
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={3} className="text-live" />
              <span>{t.copied}</span>
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={2.2} />
              <span className="hidden sm:inline">{t.copyHelper}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
