"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Gift,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import SalesVelocityChart from "@/components/SalesVelocityChart";
import { eur, categories, type CategoryId } from "@/data/catalog";
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
  deliveredContent?: string | null;
  deliveredDescription?: string | null;
  totalCents: number;
  status: string;
  ipAddress?: string | null;
  riskScore?: number | null;
  riskFlags?: string | null;
  twoFactorVerified?: boolean | null;
  createdAt: string;
  ackedAt: string | null;
  decidedAt: string | null;
  deliveredAt: string | null;
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

type AdminProduct = {
  id: number;
  slug: string;
  brand: string;
  name: string;
  kind: string;
  category: string;
  tagline: string;
  description: string;
  accent: string;
  accent2: string;
  delivery: string;
  badge?: string | null;
  featured: boolean;
  allowedMethods: string[];
  variants: { id: string; label: string; priceCents: number; unit?: string }[];
  isActive: boolean;
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
  const [tab, setTab] = useState<"orders" | "velocity" | "products" | "users">("orders");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [productsList, setProductsList] = useState<AdminProduct[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Deliver modal state
  const [deliveringCode, setDeliveringCode] = useState<string | null>(null);
  const [deliveredDescription, setDeliveredDescription] = useState("");
  const [deliveredContent, setDeliveredContent] = useState("");

  // Add new admin state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminDiscord, setNewAdminDiscord] = useState("");
  const [addAdminBusy, setAddAdminBusy] = useState(false);

  // Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings/maintenance")
      .then((r) => r.json())
      .then((d) => setMaintenanceMode(Boolean(d.maintenance)))
      .catch(() => {});
  }, []);

  const toggleMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const res = await apiFetch("/api/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !maintenanceMode }),
      });
      const data = await res.json();
      setMaintenanceMode(Boolean(data.maintenance));
      setSuccessMsg(data.maintenance ? "Parduotuvės atnaujinimo rėžimas (Maintenance Mode) ĮJUNGTAS!" : "Parduotuvės atnaujinimo rėžimas IŠJUNGTAS — parduotuvė atidaryta.");
    } catch {
      setError("Nepavyko pakeisti atnaujinimo rėžimo.");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // Edit/Add product state
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState<{
    id?: number;
    slug: string;
    brand: string;
    name: string;
    kind: string;
    category: string;
    tagline: string;
    description: string;
    delivery: string;
    accent: string;
    accent2: string;
    allowedMethods: string[];
    variants: { id: string; label: string; priceCents: number; unit?: string }[];
  }>({
    slug: "",
    brand: "",
    name: "",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "",
    description: "",
    delivery: "1–10 min.",
    accent: "#b78bff",
    accent2: "#6d28d9",
    allowedMethods: ["paypal", "bank", "ltc"],
    variants: [{ id: "v1", label: "Standartinis", priceCents: 100, unit: "1 vnt." }],
  });

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

  const loadProducts = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/products");
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setProductsList(res.ok ? data.products ?? [] : []);
    } catch {
      setProductsList([]);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "orders") void loadOrders();
    else if (tab === "users") void loadUsers();
    else if (tab === "products") void loadProducts();
  }, [isAdmin, tab, loadOrders, loadUsers, loadProducts]);

  const act = async (
    code: string,
    action: string,
    extra?: { reason?: string; note?: string; deliveredContent?: string; deliveredDescription?: string },
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
      setSuccessMsg(`Užsakymas #${code} sėkmingai atnaujintas ir pirkėjui išsiųstas sąskaitos laiškas.`);
      if (action === "deliver") {
        setDeliveringCode(null);
        setDeliveredContent("");
        setDeliveredDescription("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringCode) return;
    await act(deliveringCode, "deliver", {
      deliveredDescription,
      deliveredContent,
    });
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

  // Product management actions
  const openEditProduct = (p: AdminProduct) => {
    setIsCreatingProduct(false);
    setEditingProduct(p);
    setProductForm({
      id: p.id,
      slug: p.slug,
      brand: p.brand,
      name: p.name,
      kind: p.kind,
      category: p.category,
      tagline: p.tagline,
      description: p.description,
      delivery: p.delivery,
      accent: p.accent,
      accent2: p.accent2,
      allowedMethods: p.allowedMethods && p.allowedMethods.length > 0 ? p.allowedMethods : ["paypal", "bank", "ltc"],
      variants: p.variants.map((v) => ({ ...v })),
    });
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsCreatingProduct(true);
    setProductForm({
      slug: `product-${Date.now().toString(36)}`,
      brand: "Brand",
      name: "Nauja prekė",
      kind: "Prenumerata",
      category: "prenumeratos",
      tagline: "Trumpas aprašymas",
      description: "Pilnas prekės aprašymas ir aktyvavimo sąlygos.",
      delivery: "1–10 min.",
      accent: "#b78bff",
      accent2: "#6d28d9",
      allowedMethods: ["paypal", "bank", "ltc"],
      variants: [{ id: "v1", label: "Standartinis", priceCents: 150, unit: "1 vnt." }],
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      if (isCreatingProduct) {
        const res = await apiFetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForm),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(data.error ?? "Nepavyko sukurti produkto.");
        setSuccessMsg("Prekė sėkmingai sukurta!");
      } else {
        const res = await apiFetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForm),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(data.error ?? "Nepavyko atnaujinti produkto.");
        setSuccessMsg("Prekė sėkmingai atnaujinta!");
      }
      setIsCreatingProduct(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida išsaugant prekę.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Ar tikrai norite pašalinti šį produktą iš parduotuvės?")) return;
    try {
      const res = await apiFetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko ištrinti.");
      setSuccessMsg("Prekė pašalinta.");
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida trinant prekę.");
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
            Čia tvarkomi mokėjimai, prekių pristatymas, produktų kainos ir galimi atsiskaitymo būdai.
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
            Cw-Shop Valdymo Pultas
          </h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Secret One-Click Maintenance Mode Toggle */}
          <button
            type="button"
            disabled={maintenanceLoading}
            onClick={toggleMaintenance}
            title="Vienu paspaudimu paslėpti parduotuvę lankytojams ir rodyti Restocking skydelį"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[13px] font-extrabold transition-all ${
              maintenanceMode
                ? "bg-warn text-void animate-pulse border-2 border-yellow-300"
                : "border border-line bg-white/[0.04] text-muted hover:text-ink hover:border-warn/50"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${maintenanceMode ? "bg-black" : "bg-muted"}`} />
            {maintenanceLoading ? "Keičiama..." : maintenanceMode ? "Restocking RĖŽIMAS ĮJUNGTAS" : "Restocking Rėžimas"}
          </button>

          {tab === "products" ? (
            <button
              type="button"
              onClick={openNewProduct}
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 font-display text-[13.5px] font-extrabold text-void transition-colors hover:opacity-90"
            >
              <Plus size={15} />
              Pridėti naują prekę
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 font-display text-[13.5px] font-extrabold text-void transition-colors hover:opacity-90"
            >
              <UserPlus size={15} />
              Pridėti administratorių
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (tab === "orders") void loadOrders();
              else if (tab === "users") void loadUsers();
              else if (tab === "products") void loadProducts();
            }}
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

      {/* Product Edit / Create Modal */}
      {(isCreatingProduct || editingProduct) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveProduct}
            className="my-8 w-full max-w-2xl rounded-2xl border border-signal/60 bg-panel p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-display text-[19px] font-extrabold text-ink">
                <Sliders size={20} className="text-signal" />
                {isCreatingProduct ? "Sukurti naują prekę" : `Redaguoti prekę: ${productForm.name}`}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProduct(false);
                  setEditingProduct(null);
                }}
                className="text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="micro block text-muted/70">Prekės pavadinimas *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Pvz.: Netflix 4K Premium"
                  className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2 text-[14px] outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="micro block text-muted/70">Prekės ženklas (Brand) *</label>
                <input
                  type="text"
                  required
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="Pvz.: Netflix"
                  className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2 text-[14px] outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="micro block text-muted/70">Unikalus ID (slug) *</label>
                <input
                  type="text"
                  required
                  disabled={!isCreatingProduct}
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="netflix-4k"
                  className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2 text-[14px] outline-none focus:border-signal disabled:opacity-60"
                />
              </div>

              <div>
                <label className="micro block text-muted/70">Kategorija</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value as CategoryId })}
                  className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2 text-[14px] outline-none focus:border-signal"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="micro block text-muted/70">Trumpas šūkis / Tagline</label>
                <input
                  type="text"
                  value={productForm.tagline}
                  onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                  placeholder="Pvz.: 4K Ultra HD paskyra su garantija"
                  className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2 text-[14px] outline-none focus:border-signal"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="micro block text-muted/70">Pilnas aprašymas (Išsamus produkto aprašymas ir sąlygos) *</label>
                  <span className="text-[11px] text-muted">Galite naudoti naujas eilutes ir formatavimą</span>
                </div>
                <textarea
                  rows={6}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Įveskite išsamų produkto aprašymą, pvz.:&#10;• Kas įeina į šią prekę&#10;• Kaip vyksta aktyvavimas&#10;• Garantijos taisyklės ir reikalavimai (pvz. VPN, platforma)&#10;• Kita svarbi informacija pirkėjui..."
                  className="mt-1.5 w-full resize-y rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-signal"
                />
              </div>
            </div>

            {/* ALLOWED PAYMENT METHODS */}
            <div className="mt-5 border-t border-line pt-4">
              <label className="micro block text-signal">
                Leidžiami atsiskaitymo būdai šiai prekei (galite palikti tik vieną būdą!)
              </label>
              <div className="mt-2.5 flex flex-wrap gap-4">
                {[
                  { id: "paypal", label: "PayPal (Friends & Family)" },
                  { id: "bank", label: "Banko pavedimas (LT/IBAN)" },
                  { id: "ltc", label: "Litecoin (LTC)" },
                ].map((m) => {
                  const checked = productForm.allowedMethods.includes(m.id);
                  return (
                    <label key={m.id} className="inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = [...productForm.allowedMethods];
                          if (e.target.checked) {
                            if (!current.includes(m.id)) current.push(m.id);
                          } else {
                            if (current.length === 1) {
                              alert("Produktas privalo turėti bent vieną apmokėjimo būdą!");
                              return;
                            }
                            const filtered = current.filter((x) => x !== m.id);
                            setProductForm({ ...productForm, allowedMethods: filtered });
                            return;
                          }
                          setProductForm({ ...productForm, allowedMethods: current });
                        }}
                        className="rounded border-line"
                      />
                      {m.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* VARIANTS AND PRICES */}
            <div className="mt-5 border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <label className="micro text-signal">Kainos ir Variantai</label>
                <button
                  type="button"
                  onClick={() => {
                    const newVar = {
                      id: `v_${Date.now().toString(36)}`,
                      label: "Naujas variantas",
                      priceCents: 100,
                      unit: "1 vnt.",
                    };
                    setProductForm({
                      ...productForm,
                      variants: [...productForm.variants, newVar],
                    });
                  }}
                  className="inline-flex items-center gap-1 text-[12px] text-signal hover:underline"
                >
                  <Plus size={13} /> Pridėti variantą
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                {productForm.variants.map((v, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-void p-2.5">
                    <input
                      type="text"
                      required
                      value={v.label}
                      onChange={(e) => {
                        const updated = [...productForm.variants];
                        updated[idx].label = e.target.value;
                        setProductForm({ ...productForm, variants: updated });
                      }}
                      placeholder="Varianto pavadinimas"
                      className="min-w-[140px] flex-1 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[13px] outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] text-muted">Kaina (€):</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.10"
                        required
                        value={(v.priceCents / 100).toFixed(2)}
                        onChange={(e) => {
                          const updated = [...productForm.variants];
                          updated[idx].priceCents = Math.round(parseFloat(e.target.value || "0") * 100);
                          setProductForm({ ...productForm, variants: updated });
                        }}
                        className="w-20 rounded-lg border border-line bg-panel px-2 py-1.5 font-mono text-[13px] outline-none"
                      />
                    </div>
                    {productForm.variants.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = productForm.variants.filter((_, i) => i !== idx);
                          setProductForm({ ...productForm, variants: updated });
                        }}
                        className="p-1 text-muted hover:text-red-400"
                        title="Pašalinti variantą"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProduct(false);
                  setEditingProduct(null);
                }}
                className="rounded-xl border border-line px-4 py-2 text-[13.5px] text-muted hover:text-ink"
              >
                Atšaukti
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2 font-display text-[14px] font-extrabold text-void hover:opacity-90"
              >
                <Check size={16} strokeWidth={3} />
                {isCreatingProduct ? "Sukurti prekę" : "Išsaugoti pakeitimus"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Deliver Product Modal */}
      {deliveringCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleDeliverSubmit}
            className="w-full max-w-xl rounded-2xl border border-signal/60 bg-panel p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-display text-[19px] font-extrabold text-ink">
                <Gift size={20} className="text-signal" />
                Pristatyti prekę · Užsakymas #{deliveringCode}
              </div>
              <button
                type="button"
                onClick={() => setDeliveringCode(null)}
                className="text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
              Klientas matys šį aprašymą ir prekę (raktą / paskyrą / instrukciją) savo paskyroje svetainėje bei gaus oficialią sąskaitą-faktūrą su preke el. paštu.
              Jei per 24 valandas nepaliks atsiliepimo — sistema automatiškai sugeneruos 5★ atsiliepimą.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="micro block text-muted/70">Pristatymo aprašymas / instrukcija *</label>
                <textarea
                  required
                  rows={3}
                  value={deliveredDescription}
                  onChange={(e) => setDeliveredDescription(e.target.value)}
                  placeholder="Pvz.: Dėkojame už pirkinį! Prisijunkite prie savo paskyros ir aktyvuokite žemiau esantį raktą. Jei kyla klausimų, parašykite Discord."
                  className="mt-1.5 w-full resize-none rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="micro block text-muted/70">Prekė / Raktas / Paskyros duomenys / Kodas *</label>
                <textarea
                  required
                  rows={4}
                  value={deliveredContent}
                  onChange={(e) => setDeliveredContent(e.target.value)}
                  placeholder="Pvz.: RAKTAS: XXXXX-YYYYY-ZZZZZ arba Login: user@email.com / Pass: 12345678"
                  className="mt-1.5 w-full resize-none rounded-xl border border-line bg-void font-mono text-[14px] outline-none focus:border-signal"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setDeliveringCode(null)}
                className="rounded-xl border border-line px-4 py-2.5 text-[13.5px] text-muted hover:text-ink"
              >
                Atšaukti
              </button>
              <button
                type="submit"
                disabled={busy === deliveringCode + "deliver"}
                className="inline-flex items-center gap-2 rounded-xl bg-signal px-6 py-2.5 font-display text-[14px] font-extrabold text-void hover:opacity-90 disabled:opacity-50"
              >
                <Send size={16} />
                {busy === deliveringCode + "deliver" ? "Pristatoma & Siunčiama sąskaita..." : "Pristatyti ir išsiųsti sąskaitą"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Add Admin Form */}
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
            Įveskite vartotojo Gmail adresą. Jei vartotojas jau užsiregistravęs, jo teisės bus paaukštintos į administratorių.
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

      <div className="mt-6 flex flex-wrap gap-2">
        {(["orders", "velocity", "products", "users"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2.5 font-display text-[14px] font-extrabold transition-colors ${
              tab === t
                ? "bg-signal text-void shadow-md shadow-signal/20"
                : "border border-line text-muted hover:text-ink hover:bg-white/[0.04]"
            }`}
          >
            {t === "orders" ? "Užsakymai" : t === "velocity" ? "📊 Sales Velocity & Rizika" : t === "products" ? "Prekių valdymas & Kainos" : "Vartotojai ir Adminai"}
          </button>
        ))}
        {tab === "orders" && orders ? (
          <span className="num ml-auto self-center text-[13px] text-muted">
            rodoma {orders.length} · suma {eur(totals.sum)}€
          </span>
        ) : null}
      </div>

      {/* ── SALES VELOCITY & ANALYTICS TAB ── */}
      {tab === "velocity" ? (
        <div className="mt-5">
          <SalesVelocityChart />
        </div>
      ) : null}

      {/* ── PREKIŲ VALDYMAS TAB ── */}
      {tab === "products" ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="text-[14px] text-muted">
              Iš viso parduotuvėje: <strong className="text-ink">{productsList?.length || 0}</strong> prekių.
              Galite redaguoti kainas, keisti pavadinimus arba nustatyti, kad prekė turėtų <strong>tik 1 apmokėjimo būdą</strong> (pvz., tik PayPal arba tik Banku).
            </div>
          </div>

          {productsList === null ? (
            <div className="panel h-[180px] animate-pulse rounded-2xl" />
          ) : productsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-[14px] text-muted">
              Prekių nerasta. Spauskite „Pridėti naują prekę“.
            </div>
          ) : (
            productsList.map((p) => {
              const minP = Math.min(...p.variants.map((v) => v.priceCents));
              const maxP = Math.max(...p.variants.map((v) => v.priceCents));
              const priceStr = minP === maxP ? `${eur(minP)}€` : `${eur(minP)}€ – ${eur(maxP)}€`;

              return (
                <article key={p.id} className="panel rounded-2xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="micro rounded-md border border-line bg-void px-2 py-0.5 text-muted">
                          {p.category}
                        </span>
                        <h3 className="font-display text-[17px] font-extrabold text-ink">
                          {p.name}
                        </h3>
                        <span className="text-[12px] text-muted">({p.brand})</span>
                      </div>
                      {p.tagline ? (
                        <p className="mt-1 text-[13px] font-medium text-signal">{p.tagline}</p>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-[13px] text-muted">{p.description}</p>
                      
                      {/* Allowed methods indicators */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11.5px] text-muted/70">Apmokėjimo būdai:</span>
                        {(p.allowedMethods || ["paypal", "bank", "ltc"]).map((m) => (
                          <span key={m} className="micro rounded bg-signal/15 px-2 py-0.5 text-[10px] text-signal">
                            {m.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="micro text-muted/70">Kaina</div>
                      <div className="num text-[17px] font-bold text-signal">{priceStr}</div>
                      <div className="text-[11.5px] text-muted">{p.variants.length} variantai</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditProduct(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-signal/40 bg-signal/10 px-3.5 py-2 font-display text-[13px] font-extrabold text-signal hover:bg-signal/20"
                      >
                        <Edit2 size={14} />
                        Redaguoti & Kainos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="rounded-xl border border-line p-2 text-muted hover:border-red-400 hover:text-red-400"
                        title="Ištrinti prekę"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : null}

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
                  <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-3 p-5 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(expanded ? null : o.code);
                        setNote(o.adminNote ?? "");
                      }}
                      className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-3 text-left"
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

                      {/* IP / Risk Badge */}
                      <div className="hidden sm:block">
                        <div className="micro text-muted/70">Rizika / IP</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`micro px-2 py-0.5 rounded font-bold ${
                            (o.riskScore || 0) >= 60 ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                            (o.riskScore || 0) >= 35 ? "bg-warn/20 text-warn border border-warn/30" :
                            "bg-live/15 text-live border border-live/30"
                          }`}>
                            {(o.riskScore || 0) >= 60 ? "DIDELĖ" : (o.riskScore || 0) >= 35 ? "VIDUTINĖ" : "ŠVARI"} ({o.riskScore || 0})
                          </span>
                          {o.twoFactorVerified ? (
                            <span className="micro px-1.5 py-0.5 rounded bg-signal/15 text-signal font-bold" title="2FA patvirtinta">
                              2FA ✓
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <span
                        className={`micro rounded-full border px-3 py-1.5 ${STATUS_TONE[o.status]}`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliveringCode(o.code);
                        setDeliveredDescription(o.deliveredDescription || "");
                        setDeliveredContent(o.deliveredContent || "");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-3.5 py-2 font-display text-[13px] font-extrabold text-void hover:opacity-90"
                    >
                      <Gift size={14} />
                      {o.status === "ivykdyta" ? "Atnaujinti prekę" : "Pristatyti prekę"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(expanded ? null : o.code);
                        setNote(o.adminNote ?? "");
                      }}
                      className="text-muted hover:text-ink"
                    >
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

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

                      {/* Delivered Product Box in Admin */}
                      {o.deliveredContent || o.deliveredDescription ? (
                        <div className="mt-4 rounded-xl border border-live/30 bg-live/10 p-4">
                          <div className="flex items-center gap-2 font-display text-[14px] font-extrabold text-live">
                            <Gift size={16} />
                            Pristatytos prekės informacija klientui:
                          </div>
                          {o.deliveredDescription ? (
                            <p className="mt-1.5 text-[13.5px] text-ink">
                              {o.deliveredDescription}
                            </p>
                          ) : null}
                          {o.deliveredContent ? (
                            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2.5 font-mono text-[13px] text-live">
                              {o.deliveredContent}
                            </pre>
                          ) : null}
                        </div>
                      ) : null}

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

                        <button
                          type="button"
                          onClick={() => {
                            setDeliveringCode(o.code);
                            setDeliveredDescription(o.deliveredDescription || "");
                            setDeliveredContent(o.deliveredContent || "");
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-3 font-display text-[13.5px] font-extrabold text-void transition-transform hover:-translate-y-px"
                        >
                          <Gift size={16} />
                          Pristatyti prekę
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
