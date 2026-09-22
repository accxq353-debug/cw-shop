"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Package,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  Trash2,
  X,
} from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import { eur } from "@/data/catalog";
import { apiFetch, useUser } from "@/lib/useUser";
import { DECLINE_REASONS, STATUS_LABEL, STATUS_TONE } from "@/lib/status";

type AdminOrder = {
  id: number;
  method?: string | null;
  proofs?: {
    id: number;
    filename: string;
    mime: string;
    size: number;
    createdAt: string;
  }[];
  code: string;
  email: string;
  discord: string | null;
  note: string | null;
  adminNote: string | null;
  declineReason: string | null;
  totalCents: number;
  status: string;
  createdAt: string;
  ackedAt: string | null;
  decidedAt: string | null;
  userName: string | null;
  items: {
    id: number;
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[];
};

type AdminUser = {
  id: number;
  email: string;
  name: string;
  discord: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
  spentCents: number;
  orders: { code: string; totalCents: number; status: string; createdAt: string }[];
};

const STATUS_FILTERS = [
  ["", "Visi"],
  ["laukiama", "Laukiama"],
  ["mokejimas_pateiktas", "Pateikta"],
  ["patvirtinta", "Patvirtinta"],
  ["ivykdyta", "Įvykdyta"],
  ["atmesta", "Atmesta"],
] as const;

export default function AdminApp() {
  const { user, ready, logout } = useUser();
  const [tab, setTab] = useState<"orders" | "users">("orders");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Add new admin state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminDiscord, setNewAdminDiscord] = useState("");
  const [addAdminBusy, setAddAdminBusy] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    try {
      const res = await apiFetch(`/api/admin/orders?${params.toString()}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setOrders(data.orders ?? []);
        setCounts(data.counts ?? {});
      } else {
        setOrders([]);
        setError(data.error ?? "Nėra prieigos.");
      }
    } catch (e: unknown) {
      setOrders([]);
      setError("Klaida kraunant užsakymus: " + (e instanceof Error ? e.message : String(e)));
    }
  }, [q, status]);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await apiFetch(`/api/admin/users?${params.toString()}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setUsers(res.ok ? data.users ?? [] : []);
    } catch {
      setUsers([]);
    }
  }, [q]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "orders") void loadOrders();
    else void loadUsers();
  }, [isAdmin, tab, loadOrders, loadUsers]);

  const act = async (
    code: string,
    action: string,
    extra?: { reason?: string; note?: string },
  ) => {
    setBusy(code + action);
    setError("");
    setSuccessMsg("");
    try {
      const res = await apiFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action, ...extra }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? "Nepavyko.");
      await loadOrders();
      setSuccessMsg(`Užsakymas #${code} sėkmingai atnaujintas.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko.");
    } finally {
      setBusy(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          password: newAdminPassword,
          discord: newAdminDiscord,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? "Nepavyko pridėti administratoriaus.");

      setSuccessMsg(data.message || "Administratorius sėkmingai pridėtas!");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPassword("");
      setNewAdminDiscord("");
      setShowAddAdmin(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida pridedant administratorių.");
    } finally {
      setAddAdminBusy(false);
    }
  };

  const handleUserRole = async (userId: number, action: "promote" | "demote" | "delete") => {
    if (action === "delete" && !confirm("Ar tikrai norite pašalinti šį vartotoją?")) {
      return;
    }
    setError("");
    setSuccessMsg("");
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? "Nepavyko atlikti veiksmo.");
      setSuccessMsg(data.message || "Veiksmas atliktas.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida.");
    }
  };

  if (!ready) {
    return <div className="panel h-[320px] animate-pulse rounded-2xl" />;
  }

  if (!user || !isAdmin) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl border border-dashed border-line px-6 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-panel">
            <ShieldAlert size={22} className="text-warn" />
          </div>
          <h2 className="mt-5 font-display text-[22px] font-extrabold tracking-[-0.02em]">
            Administratoriaus prieiga
          </h2>
          <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">
            Čia tvarkomi mokėjimai: kiekvienas kliento pažymėtas mokėjimas
            atkeliauja į Discord webhook&apos;ą kartu su suma ir užsakymo numeriu.
            Patvirtink, atmesk (suma nesutampa, ne Friends &amp; Family) arba
            pažymėk užsakymą kaip išsiųstą.
          </p>
          {user ? (
            <p className="mt-6 text-[14px] text-warn">
              Prisijungta kaip {user.email}, bet paskyra neturi administratoriaus
              teisių.
            </p>
          ) : null}
        </div>
        <AuthPanel compact onDone={() => {}} />
      </div>
    );
  }

  const totals = (orders ?? []).reduce(
    (acc, o) => {
      acc.sum += o.status === "atmesta" ? 0 : o.totalCents;
      return acc;
    },
    { sum: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <div className="micro text-signal">Administratorius · {user.name} ({user.email})</div>
          <h1 className="display mt-2 text-[clamp(2rem,5vw,3rem)]">
            Užsakymų ir vartotojų valdymas
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddAdmin(!showAddAdmin)}
            className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 font-display text-[13.5px] font-extrabold text-void transition-colors hover:opacity-90"
          >
            <UserPlus size={15} />
            Pridėti administratorių
          </button>
          <button
            type="button"
            onClick={() =>
              tab === "orders" ? void loadOrders() : void loadUsers()
            }
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            <RefreshCw size={15} />
            Atnaujinti
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            <X size={15} />
            Atsijungti
          </button>
        </div>
      </div>

      {/* Add Admin Modal / Expandable Box */}
      {showAddAdmin ? (
        <form
          onSubmit={handleAddAdmin}
          className="mt-6 rounded-2xl border border-signal/40 bg-panel p-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 font-display text-[18px] font-extrabold">
              <ShieldCheck size={20} className="text-signal" />
              Pridėti arba paskirti administratorių per Gmail
            </div>
            <button
              type="button"
              onClick={() => setShowAddAdmin(false)}
              className="text-muted hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-2 text-[13.5px] text-muted">
            Įveskite vartotojo Gmail adresą. Jei vartotojas jau užsiregistravęs, jo teisės bus paaukštintos į administratorių. Jei naujas — paskyra bus sukurta automatiškai su jūsų nurodytu slaptažodžiu.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="micro block text-muted/70">Gmail / El. paštas *</label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="naujasadmin@gmail.com"
                className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="micro block text-muted/70">Vardas (nebūtina)</label>
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Admin vardas"
                className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="micro block text-muted/70">Slaptažodis (naujam adminui)</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="pvz. @AdminSlaptazodis123"
                className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="micro block text-muted/70">Discord (nebūtina)</label>
              <input
                type="text"
                value={newAdminDiscord}
                onChange={(e) => setNewAdminDiscord(e.target.value)}
                placeholder="discord_tag"
                className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddAdmin(false)}
              className="rounded-xl border border-line px-4 py-2 text-[13.5px] text-muted hover:text-ink"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={addAdminBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2 font-display text-[14px] font-extrabold text-void hover:opacity-90 disabled:opacity-50"
            >
              <Check size={16} strokeWidth={3} />
              {addAdminBusy ? "Saugoma..." : "Paskirti administratorių"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-[14px] text-red-300">
          {error}
        </div>
      ) : null}

      {successMsg ? (
        <div className="mt-4 rounded-xl border border-live/40 bg-live/10 p-3.5 text-[14px] text-live">
          {successMsg}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-6">
        {[
          ["Visi", (orders ?? []).length || 0],
          ["Laukiama", counts["laukiama"] ?? 0],
          ["Pateikta", counts["mokejimas_pateiktas"] ?? 0],
          ["Patvirtinta", counts["patvirtinta"] ?? 0],
          ["Įvykdyta", counts["ivykdyta"] ?? 0],
          ["Atmesta", counts["atmesta"] ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-panel px-4 py-4">
            <div className="micro text-muted/70">{label}</div>
            <div className="num mt-1.5 text-[20px] font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-xl border border-line bg-panel px-4">
          <Search size={17} className="text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ieškok pagal el. paštą, vardą, Discord ar užsakymo numerį (STG…)"
            className="w-full bg-transparent py-3.5 text-[14px] outline-none placeholder:text-muted/60"
          />
        </div>
        {tab === "orders" ? (
          <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-panel p-1">
            {STATUS_FILTERS.map(([value, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setStatus(value)}
                className={`rounded-lg px-3.5 py-2 text-[13px] transition-colors ${
                  status === value
                    ? "bg-white/[0.08] font-semibold text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex gap-2">
        {(["orders", "users"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2.5 font-display text-[14px] font-extrabold transition-colors ${
              tab === t
                ? "bg-signal text-void"
                : "border border-line text-muted hover:text-ink"
            }`}
          >
            {t === "orders" ? "Užsakymai" : "Vartotojai ir Administratoriai"}
          </button>
        ))}
        {tab === "orders" && orders ? (
          <span className="num ml-auto self-center text-[13px] text-muted">
            rodoma {orders.length} · suma {eur(totals.sum)}€
          </span>
        ) : null}
      </div>

      {/* ── UŽSAKYMŲ SĄRAŠAS ── */}
      {tab === "orders" ? (
        <div className="mt-5 space-y-3">
          {orders === null ? (
            <div className="panel h-[180px] animate-pulse rounded-2xl" />
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-[14px] text-muted">
              Užsakymų pagal šią paiešką nerasta.
            </div>
          ) : (
            orders.map((o) => {
              const expanded = open === o.code;
              return (
                <article key={o.code} className="panel rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(expanded ? null : o.code);
                      setNote(o.adminNote ?? "");
                    }}
                    className="flex w-full flex-wrap items-center gap-x-5 gap-y-3 p-5 text-left"
                  >
                    <div>
                      <div className="micro text-muted/70">Užsakymas</div>
                      <div className="num text-[17px] font-bold">#{o.code}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="micro text-muted/70">Klientas</div>
                      <div className="truncate text-[14px]">
                        {o.userName ? (
                          <span className="font-display font-extrabold">
                            {o.userName}{" "}
                          </span>
                        ) : null}
                        <span className="text-muted">{o.email}</span>
                      </div>
                      {o.discord ? (
                        <div className="num text-[12px] text-muted/70">
                          discord: {o.discord}
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <div className="micro text-muted/70">Suma</div>
                      <div className="num text-[17px] font-bold">
                        {eur(o.totalCents)}€
                      </div>
                    </div>
                    <div>
                      <div className="micro text-muted/70">Mokėjimas</div>
                      <div className="num text-[12.5px] text-muted">
                        {o.ackedAt
                          ? new Date(o.ackedAt).toLocaleString("lt-LT", {
                              timeStyle: "short",
                              dateStyle: "short",
                            })
                          : "nepažymėtas"}
                      </div>
                    </div>
                    <span
                      className={`micro ml-auto rounded-full border px-3 py-1.5 ${STATUS_TONE[o.status]}`}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </button>

                  {expanded ? (
                    <div className="border-t border-line p-5">
                      <ul className="space-y-2">
                        {o.items.map((i) => (
                          <li
                            key={i.id}
                            className="flex items-center justify-between gap-4 text-[14px]"
                          >
                            <span>
                              <span className="font-display font-extrabold">
                                {i.productName}
                              </span>
                              <span className="text-muted">
                                {" "}
                                · {i.variantLabel}
                                {i.qty > 1 ? ` ×${i.qty}` : ""}
                              </span>
                            </span>
                            <span className="num">
                              {eur(i.unitCents * i.qty)}€
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 rounded-xl border border-line bg-void px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="micro text-muted/70">
                            Mokėjimo būdas
                          </span>
                          <span className="num text-[13.5px] text-ink">
                            {o.method === "bank"
                              ? "Banko pavedimas · paskirtis „Papildymas“"
                              : o.method === "ltc"
                                ? "Litecoin (LTC)"
                                : "PayPal Friends & Family"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
                          <span className="micro text-muted/70">Įrodymas</span>
                          {(o.proofs ?? []).length === 0 ? (
                            <span className="micro rounded-full bg-warn/15 px-2.5 py-1 text-warn">
                              nepridėtas
                            </span>
                          ) : (
                            (o.proofs ?? []).map((p) => (
                              <a
                                key={p.id}
                                href={`/api/proof/${p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center gap-3 rounded-lg border border-line bg-panel px-3 py-2 transition-colors hover:border-signal/50"
                              >
                                {p.mime.startsWith("image/") ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={`/api/proof/${p.id}`}
                                    alt={p.filename}
                                    className="h-11 w-11 rounded-md object-cover"
                                  />
                                ) : null}
                                <span className="num max-w-[180px] truncate text-[12.5px] text-muted group-hover:text-ink">
                                  {p.filename}
                                </span>
                                <span className="num text-[11px] text-muted/60">
                                  {(p.size / 1024).toFixed(0)} KB
                                </span>
                              </a>
                            ))
                          )}
                        </div>
                      </div>

                      {o.note ? (
                        <p className="mt-4 rounded-xl border border-line bg-void px-4 py-3 text-[13.5px] text-muted">
                          <span className="micro text-muted/70">
                            Kliento pastaba:{" "}
                          </span>
                          {o.note}
                        </p>
                      ) : null}

                      {o.declineReason ? (
                        <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13.5px] text-red-300">
                          Atmetimo priežastis: {o.declineReason}
                        </p>
                      ) : null}

                      <div className="mt-5 flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[240px]">
                          <label className="micro text-muted/70">
                            Administratoriaus pastaba
                          </label>
                          <div className="mt-2 flex gap-2">
                            <input
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Pvz.: gauta suma F&F, kodas išsiųstas į el. paštą"
                              className="w-full rounded-xl border border-line bg-void px-4 py-3 text-[13.5px] outline-none focus:border-signal/60"
                            />
                            <button
                              type="button"
                              disabled={busy === o.code + "note"}
                              onClick={() => void act(o.code, "note", { note })}
                              className="rounded-xl border border-line px-4 text-[13px] text-muted transition-colors hover:text-ink"
                            >
                              Išsaugoti
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5">
                        <button
                          type="button"
                          disabled={busy === o.code + "confirm"}
                          onClick={() => void act(o.code, "confirm")}
                          className="inline-flex items-center gap-2 rounded-xl bg-live px-5 py-3 font-display text-[13.5px] font-extrabold text-void transition-transform hover:-translate-y-px disabled:opacity-60"
                        >
                          <Check size={15} strokeWidth={3} />
                          Patvirtinti mokėjimą
                        </button>

                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="rounded-xl border border-line bg-void px-4 py-3 text-[13.5px] outline-none focus:border-signal/60"
                        >
                          {DECLINE_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={busy === o.code + "decline"}
                          onClick={() =>
                            void act(o.code, "decline", { reason })
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-5 py-3 font-display text-[13.5px] font-extrabold text-red-300 transition-transform hover:-translate-y-px disabled:opacity-60"
                        >
                          <X size={15} strokeWidth={3} />
                          Atmesti
                        </button>

                        <button
                          type="button"
                          disabled={busy === o.code + "fulfill"}
                          onClick={() => void act(o.code, "fulfill")}
                          className="inline-flex items-center gap-2 rounded-xl border border-signal/40 bg-signal/10 px-5 py-3 font-display text-[13.5px] font-extrabold text-signal transition-transform hover:-translate-y-px disabled:opacity-60"
                        >
                          <Send size={15} strokeWidth={2.4} />
                          Prekė išsiųsta
                        </button>

                        <button
                          type="button"
                          disabled={busy === o.code + "reopen"}
                          onClick={() => void act(o.code, "reopen")}
                          className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-[13.5px] text-muted transition-colors hover:text-ink disabled:opacity-60"
                        >
                          <RefreshCw size={15} />
                          Grąžinti į eilę
                        </button>

                        <span className="num ml-auto text-[12.5px] text-muted/70">
                          sukurtas{" "}
                          {new Date(o.createdAt).toLocaleString("lt-LT")}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      ) : null}

      {/* ── VARTOTOJAI IR ADMINISTRATORIAI ── */}
      {tab === "users" ? (
        <div className="mt-5 space-y-3">
          {users === null ? (
            <div className="panel h-[180px] animate-pulse rounded-2xl" />
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-[14px] text-muted">
              Vartotojų pagal šią paiešką nerasta.
            </div>
          ) : (
            users.map((u) => (
              <article key={u.id} className="panel rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-display text-[16px] font-extrabold">
                      {u.name}
                      {u.role === "admin" ? (
                        <span className="micro inline-flex items-center gap-1 rounded-full border border-signal/40 bg-signal/15 px-2.5 py-0.5 text-signal">
                          <ShieldCheck size={12} />
                          ADMIN
                        </span>
                      ) : (
                        <span className="micro rounded-full border border-line bg-white/[0.04] px-2 py-0.5 text-muted">
                          Klientas
                        </span>
                      )}
                    </div>
                    <div className="text-[13.5px] text-muted">{u.email}</div>
                    {u.discord ? (
                      <div className="num text-[12px] text-muted/70">
                        discord: {u.discord}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className="micro text-muted/70">Užsakymų</div>
                    <div className="num text-[16px] font-bold">
                      {u.orderCount}
                    </div>
                  </div>
                  <div>
                    <div className="micro text-muted/70">Išleista</div>
                    <div className="num text-[16px] font-bold">
                      {eur(u.spentCents)}€
                    </div>
                  </div>
                  <div>
                    <div className="micro text-muted/70">Narys nuo</div>
                    <div className="num text-[13px]">
                      {new Date(u.createdAt).toLocaleDateString("lt-LT")}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {u.role === "admin" ? (
                      u.id !== user.id ? (
                        <button
                          type="button"
                          onClick={() => handleUserRole(u.id, "demote")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[12.5px] text-red-300 hover:bg-red-500/20"
                        >
                          <UserMinus size={14} />
                          Atimti Admin
                        </button>
                      ) : (
                        <span className="text-[12px] italic text-muted">Jūs</span>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUserRole(u.id, "promote")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-signal/40 bg-signal/10 px-3 py-1.5 text-[12.5px] text-signal hover:bg-signal/20"
                      >
                        <UserCheck size={14} />
                        Padaryti Admin
                      </button>
                    )}

                    {u.id !== user.id ? (
                      <button
                        type="button"
                        onClick={() => handleUserRole(u.id, "delete")}
                        title="Ištrinti vartotoją"
                        className="rounded-lg border border-line p-2 text-muted hover:border-red-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        setTab("orders");
                        setQ(u.email);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-muted hover:text-ink"
                    >
                      <Package size={14} />
                      Užsakymai
                    </button>
                  </div>
                </div>

                {u.orders.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                    {u.orders.map((o) => (
                      <button
                        key={o.code}
                        type="button"
                        onClick={() => {
                          setTab("orders");
                          setQ(o.code);
                        }}
                        className="num rounded-lg border border-line bg-void px-3 py-1 text-[12px] text-muted transition-colors hover:text-ink"
                      >
                        #{o.code} · {eur(o.totalCents)}€ ·{" "}
                        {STATUS_LABEL[o.status] ?? o.status}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
