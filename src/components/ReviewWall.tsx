"use client";

import { useEffect, useState } from "react";
import { Star, Send, Image as ImageIcon, CheckCircle, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/lib/language";
import { playSound } from "@/lib/audio";

type Review = {
  id: number;
  author: string;
  rating: number;
  body: string;
  isAuto?: boolean;
  hasImage?: boolean;
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
  limit = 6,
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
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const { t } = useLanguage();

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
      const formData = new FormData();
      formData.append("author", author);
      formData.append("body", body);
      formData.append("rating", rating.toString());
      if (file) {
        formData.append("imageProof", file);
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko siųsti.");
      setReviews((prev) => [data.review, ...(prev ?? [])]);
      setAuthor("");
      setBody("");
      setFile(null);
      setSent(true);
      playSound("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko siųsti.");
      playSound("error");
    } finally {
      setBusy(false);
    }
  };

  const shown = (reviews ?? []).slice(0, limit);

  return (
    <>
      {/* Proof Lightbox Modal */}
      {selectedProofUrl ? (
        <div
          onClick={() => setSelectedProofUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-signal/40 bg-panel shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProofUrl}
              alt="Pirkėjo įrodymo nuotrauka"
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
            <div className="p-3 text-center micro text-muted">
              Pirkėjo pridėtas veikiančios prekės įrodymas (Spauskite bet kur, kad uždarytumėte)
            </div>
          </div>
        </div>
      ) : null}

      <div className={withForm ? "grid gap-10 lg:grid-cols-[1fr_380px]" : ""}>
        <div>
          {reviews === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="panel h-[180px] animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.05}>
                  <figure className="panel flex h-full flex-col justify-between rounded-2xl p-5 border border-line hover:border-signal/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <Stars value={r.rating} />
                        {r.hasImage ? (
                          <span className="micro flex items-center gap-1 rounded bg-signal/15 px-2 py-0.5 text-[10px] text-signal font-bold">
                            <ImageIcon size={11} /> Su foto įrodymu
                          </span>
                        ) : null}
                      </div>

                      <blockquote className="mt-3.5 text-[14px] leading-relaxed text-ink/90">
                        „{r.body}“
                      </blockquote>

                      {/* Clickable Image Proof Thumbnail */}
                      {r.hasImage ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setSelectedProofUrl(`/api/reviews/${r.id}/image`)}
                            className="group relative overflow-hidden rounded-xl border border-line bg-black/40 hover:border-signal/60 transition-all block w-full text-left"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/reviews/${r.id}/image`}
                              alt="Proof screenshot"
                              className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold text-signal backdrop-blur">
                              🔍 Peržiūrėti įrodymą
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <figcaption className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <span className="font-display text-[13.5px] font-extrabold flex items-center gap-1.5">
                        {r.author}
                        <ShieldCheck size={14} className="text-signal" />
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
            className="panel h-fit rounded-2xl p-6 lg:sticky lg:top-28 border border-line shadow-xl"
          >
            <div className="micro text-signal">{t.leaveReview}</div>
            <h3 className="mt-2 font-display text-[22px] font-extrabold tracking-[-0.02em]">
              Kaip praėjo pirkimas?
            </h3>

            <label className="micro mt-5 block text-muted/70">Vardas *</label>
            <input
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tavo vardas arba slapyvardis"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3 text-[14px] outline-none transition-colors focus:border-signal/60"
            />

            <label className="micro mt-4 block text-muted/70">{t.rating}</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setRating(n);
                    playSound("click");
                  }}
                  aria-label={`${n} žvaigždutės`}
                  className={`num h-9 w-9 rounded-lg border text-[13px] transition-colors ${
                    rating === n
                      ? "border-warn bg-warn/15 text-warn font-bold"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <label className="micro mt-4 block text-muted/70">{t.comment} *</label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Ką pirkai, kaip greitai gavai, ar viskas veikia?"
              className="mt-2 w-full resize-none rounded-xl border border-line bg-void px-4 py-3 text-[14px] outline-none transition-colors focus:border-signal/60"
            />

            {/* Proof Image Upload */}
            <label className="micro mt-4 block text-muted/70">{t.attachProof}</label>
            <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-void px-4 py-3 hover:border-signal/50 transition-colors">
              <ImageIcon size={18} className="text-signal shrink-0" />
              <span className="text-[13px] text-muted truncate flex-1">
                {file ? file.name : "Pasirink ekrano nuotrauką (maks. 8 MB)"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {error ? (
              <p className="mt-3 text-[13px] text-warn">{error}</p>
            ) : null}
            {sent && !error ? (
              <p className="mt-3 text-[13px] text-live flex items-center gap-1.5">
                <CheckCircle size={15} /> Ačiū! Atsiliepimas sėkmingai paskelbtas.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[14px] font-extrabold text-void transition-transform hover:-translate-y-px disabled:opacity-60"
            >
              <Send size={15} strokeWidth={2.4} />
              {busy ? "Siunčiama…" : t.sendReview}
            </button>
          </form>
        ) : null}
      </div>
    </>
  );
}
