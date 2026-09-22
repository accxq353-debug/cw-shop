"use client";

import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import Reveal from "@/components/Reveal";

type Review = {
  id: number;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-[2px]" aria-label={`${value} iš 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={2}
          className={i < value ? "fill-warn text-warn" : "text-line"}
        />
      ))}
    </span>
  );
}

export default function ReviewWall({
  limit = 3,
  withForm = false,
}: {
  limit?: number;
  withForm?: boolean;
}) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d.reviews) ? d.reviews : []))
      .catch(() => {
        setReviews([]);
        setError("Nepavyko užkrauti atsiliepimų.");
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, body, rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko siųsti.");
      setReviews((prev) => [data.review, ...(prev ?? [])]);
      setAuthor("");
      setBody("");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko siųsti.");
    } finally {
      setBusy(false);
    }
  };

  const shown = (reviews ?? []).slice(0, limit);

  return (
    <div className={withForm ? "grid gap-10 lg:grid-cols-[1fr_360px]" : ""}>
      <div>
        {reviews === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="panel h-[168px] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.05}>
                <figure className="panel flex h-full flex-col rounded-2xl p-5">
                  <Stars value={r.rating} />
                  <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-ink/90">
                    „{r.body}“
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="font-display text-[13.5px] font-extrabold">
                      {r.author}
                    </span>
                    <span className="num text-[11px] text-muted/70">
                      {new Date(r.createdAt).toLocaleDateString("lt-LT")}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
            {shown.length === 0 ? (
              <p className="text-[14px] text-muted">
                {error || "Kol kas nėra atsiliepimų — būk pirmas."}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {withForm ? (
        <form
          onSubmit={submit}
          className="panel h-fit rounded-2xl p-6 lg:sticky lg:top-28"
        >
          <div className="micro text-signal">Palik atsiliepimą</div>
          <h3 className="mt-2 font-display text-[22px] font-extrabold tracking-[-0.02em]">
            Kaip praėjo pirkimas?
          </h3>

          <label className="micro mt-5 block text-muted/70">Vardas</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tavo vardas"
            className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3 text-[14px] outline-none transition-colors focus:border-signal/60"
          />

          <label className="micro mt-4 block text-muted/70">Įvertinimas</label>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} žvaigždutės`}
                className={`num h-9 w-9 rounded-lg border text-[13px] transition-colors ${
                  rating === n
                    ? "border-warn bg-warn/15 text-warn"
                    : "border-line text-muted hover:text-ink"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <label className="micro mt-4 block text-muted/70">Atsiliepimas</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Ką pirkai, kaip greitai gavai?"
            className="mt-2 w-full resize-none rounded-xl border border-line bg-void px-4 py-3 text-[14px] outline-none transition-colors focus:border-signal/60"
          />

          {error ? (
            <p className="mt-3 text-[13px] text-warn">{error}</p>
          ) : null}
          {sent && !error ? (
            <p className="mt-3 text-[13px] text-live">
              Ačiū! Atsiliepimas paskelbtas.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[14px] font-extrabold text-void transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            <Send size={15} strokeWidth={2.4} />
            {busy ? "Siunčiama…" : "Paskelbti"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
