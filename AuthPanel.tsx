"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { storeToken, useUser, type SessionUser } from "@/lib/useUser";
import { useLanguage } from "@/lib/language";
import { playSound } from "@/lib/audio";

export default function AuthPanel({
  onDone,
  redirectTo,
  compact = false,
}: {
  onDone?: (user: SessionUser) => void;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { setUser } = useUser();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [discord, setDiscord] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, discord }),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Serverio klaida (${res.status}): ${text.slice(0, 100) || "Tuščias atsakymas"}`);
      }
      if (!res.ok) throw new Error((data.error as string) ?? "Nepavyko prisijungti.");
      
      const logged = data.user as SessionUser;
      const token = (data.token as string) ?? null;
      storeToken(token);
      setUser(logged);
      playSound("success");

      if (onDone) {
        onDone(logged);
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        if (logged.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/paskyra");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko prisijungti.");
      playSound("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "" : "panel rounded-2xl p-7 border border-line shadow-2xl"}>
      {/* Discord OAuth Login Button */}
      <div className="mb-5">
        <a
          href="/api/auth/discord"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#5865f2] py-3 font-display text-[14px] font-extrabold text-white shadow-md transition-all hover:bg-[#4752c4] hover:scale-[1.01]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span>Prisijungti su Discord (Gauk prekę į DM)</span>
        </a>
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-line w-full" />
          <span className="bg-panel px-3 text-[11px] text-muted/60 uppercase tracking-widest absolute">arba</span>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-line bg-void p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
              playSound("click");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[13.5px] transition-colors ${
              mode === m
                ? "bg-white/[0.08] font-semibold text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {m === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
            {m === "login" ? t.signInTab : t.signUpTab}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6">
        {mode === "register" ? (
          <>
            <label className="micro block text-muted/70">{t.nameLabel} *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jūsų vardas / slapyvardis"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
            />
          </>
        ) : null}

        <label className="micro mt-4 block text-muted/70">{t.emailLabel}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vardas@pastas.lt"
          className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
        />

        <label className="micro mt-4 block text-muted/70">{t.passwordLabel} *</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
        />

        {mode === "register" ? (
          <>
            <label className="micro mt-4 block text-muted/70">
              {t.discordNameLabel}
            </label>
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="vardas#0000"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
            />
          </>
        ) : null}

        {error ? <p className="mt-4 text-[13.5px] text-warn">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[15px] font-extrabold text-void transition-transform hover:-translate-y-px disabled:opacity-60 shadow-lg hover:shadow-signal/20"
        >
          {busy
            ? "..."
            : mode === "login"
              ? t.submitSignIn
              : t.submitSignUp}
        </button>
      </form>
    </div>
  );
}
