"use client";

import { useEffect, useState } from "react";
import { eur } from "@/data/catalog";
import {
  TrendingUp,
  CreditCard,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
} from "lucide-react";
import { apiFetch } from "@/lib/useUser";

type HourlyPoint = {
  hour_label: string;
  order_count: number;
  total_cents: number;
};

type DailyPoint = {
  day_label: string;
  day_name: string;
  order_count: number;
  total_cents: number;
};

type TopProduct = {
  product_name: string;
  product_slug: string;
  units_sold: number;
  total_revenue_cents: number;
};

type PaymentStat = {
  method_name: string;
  total_orders: number;
  completed_orders: number;
  total_cents: number;
};

type RiskStat = {
  high_risk_orders: number;
  medium_risk_orders: number;
  two_factor_orders: number;
};

export default function SalesVelocityChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    hourly: HourlyPoint[];
    daily: DailyPoint[];
    topProducts: TopProduct[];
    paymentMethods: PaymentStat[];
    risk: RiskStat;
  } | null>(null);

  const [timeframe, setTimeframe] = useState<"daily" | "hourly">("daily");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="panel animate-pulse rounded-2xl p-8 h-80 flex items-center justify-center border border-line">
        <div className="flex items-center gap-3 text-signal">
          <RefreshCw className="animate-spin" size={20} />
          <span className="font-display font-extrabold text-[15px]">Kraunama pardavimų greičio statistika...</span>
        </div>
      </div>
    );
  }

  const currentTimeline = timeframe === "daily" ? (data?.daily || []) : (data?.hourly || []);
  const maxCents = Math.max(...currentTimeline.map((p) => p.total_cents), 100);

  return (
    <div className="space-y-6">
      {/* Velocity Top Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel rounded-2xl p-5 border border-line relative overflow-hidden">
          <div className="flex items-center justify-between text-muted">
            <span className="micro text-[11px] font-bold">24H / 7D PARDAVIMŲ GREITIS</span>
            <Activity className="text-signal" size={18} />
          </div>
          <div className="num mt-3 text-[26px] font-black text-white">
            {currentTimeline.reduce((acc, p) => acc + p.order_count, 0)} <span className="text-[14px] font-medium text-muted">užsakymai</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-live">
            <TrendingUp size={14} />
            <span>Realaus laiko apyvarta: <strong>{eur(currentTimeline.reduce((acc, p) => acc + p.total_cents, 0))}€</strong></span>
          </div>
        </div>

        <div className="panel rounded-2xl p-5 border border-line">
          <div className="flex items-center justify-between text-muted">
            <span className="micro text-[11px] font-bold">POPULIARIAUSIAS METODAS</span>
            <CreditCard className="text-live" size={18} />
          </div>
          <div className="num mt-3 text-[22px] font-black uppercase text-ink">
            {data?.paymentMethods?.[0]?.method_name || "PAYPAL"}
          </div>
          <div className="mt-1 text-[12px] text-muted">
            Konversija: {data?.paymentMethods?.[0] ? Math.round((data.paymentMethods[0].completed_orders / Math.max(data.paymentMethods[0].total_orders, 1)) * 100) : 100}%
          </div>
        </div>

        <div className="panel rounded-2xl p-5 border border-line">
          <div className="flex items-center justify-between text-muted">
            <span className="micro text-[11px] font-bold">2FA APSAUGA (DIDELĖ VERTĖ)</span>
            <Zap className="text-warn" size={18} />
          </div>
          <div className="num mt-3 text-[26px] font-black text-warn">
            {data?.risk?.two_factor_orders || 0}
          </div>
          <div className="mt-1 text-[12px] text-muted">
            Patvirtintų 2FA saugumo kodų
          </div>
        </div>

        <div className="panel rounded-2xl p-5 border border-line">
          <div className="flex items-center justify-between text-muted">
            <span className="micro text-[11px] font-bold">IP & BOTŲ RIZIKOS APSAUGA</span>
            <AlertTriangle className="text-signal" size={18} />
          </div>
          <div className="num mt-3 text-[26px] font-black text-signal">
            {data?.risk?.high_risk_orders || 0}
          </div>
          <div className="mt-1 text-[12px] text-muted">
            Aptikti įtartini proxy / VPN užsakymai
          </div>
        </div>
      </div>

      {/* Main Velocity Visual Chart */}
      <div className="panel rounded-3xl p-6 border border-line bg-gradient-to-b from-[#150c27] to-[#09050f] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="live-dot h-2 w-2 rounded-full bg-live" />
              <h3 className="font-display text-[18px] font-extrabold tracking-tight text-white">
                Pardavimų greičio grafikas (Sales Velocity)
              </h3>
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Stebėkite apyvartą valandomis ir dienomis, vidutinį krepšelį bei atsiskaitymo srautą.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-line bg-void p-1 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => setTimeframe("daily")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  timeframe === "daily" ? "bg-signal text-void" : "text-muted hover:text-ink"
                }`}
              >
                <Calendar size={13} />
                <span>Paskutinės 7 dienos</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("hourly")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  timeframe === "hourly" ? "bg-signal text-void" : "text-muted hover:text-ink"
                }`}
              >
                <Clock size={13} />
                <span>24 valandų greitis</span>
              </button>
            </div>

            <button
              type="button"
              onClick={loadData}
              title="Atnaujinti grafiką"
              className="rounded-xl border border-line bg-white/[0.04] p-2 text-muted hover:text-ink hover:border-signal/50"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Bar & Velocity graph visualizer */}
        <div className="mt-6">
          {currentTimeline.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-muted">
              Šiuo laikotarpiu naujų užsakymų dar nebuvo užregistruota.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-52 pt-8 px-2 overflow-x-auto">
              {currentTimeline.map((item, idx) => {
                const heightPct = Math.max(14, Math.round((item.total_cents / maxCents) * 100));
                const label = timeframe === "daily" ? (item as DailyPoint).day_name : (item as HourlyPoint).hour_label;

                return (
                  <div key={idx} className="flex-1 min-w-[48px] flex flex-col items-center justify-end h-full group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-center text-[11px] num font-bold text-signal bg-black/80 px-2 py-0.5 rounded border border-signal/30 whitespace-nowrap">
                      {eur(item.total_cents)}€ ({item.order_count} užs.)
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-signal-deep via-violet to-signal group-hover:brightness-125 transition-all shadow-[0_0_15px_rgba(183,139,255,0.2)]"
                    />
                    <span className="micro mt-2 text-[10px] text-muted/70 group-hover:text-ink">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Breakdown: Top Products & Conversion by Payment Method */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="panel rounded-3xl p-6 border border-line">
          <div className="flex items-center gap-2 font-display text-[16px] font-extrabold text-ink">
            <Layers size={18} className="text-signal" />
            Populiariausios prekės (Top Sellers)
          </div>
          <div className="mt-4 space-y-3">
            {(!data?.topProducts || data.topProducts.length === 0) ? (
              <p className="text-[13px] text-muted py-6 text-center">Nėra pardavimų duomenų.</p>
            ) : (
              data.topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-line bg-void p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="num font-black text-signal text-[16px]">#{idx + 1}</span>
                    <div>
                      <div className="font-display font-extrabold text-[14.5px] text-ink">{p.product_name}</div>
                      <div className="text-[12px] text-muted">Parduota: <strong>{p.units_sold} vnt.</strong></div>
                    </div>
                  </div>
                  <div className="num font-bold text-live text-[15px]">
                    {eur(p.total_revenue_cents)}€
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods & Conversion Comparison */}
        <div className="panel rounded-3xl p-6 border border-line">
          <div className="flex items-center gap-2 font-display text-[16px] font-extrabold text-ink">
            <CreditCard size={18} className="text-live" />
            Konversija pagal mokėjimo būdą (PayPal vs. SEPA vs. LTC)
          </div>
          <div className="mt-4 space-y-3">
            {(!data?.paymentMethods || data.paymentMethods.length === 0) ? (
              <p className="text-[13px] text-muted py-6 text-center">Nėra apmokėjimų statistikos.</p>
            ) : (
              data.paymentMethods.map((m, idx) => {
                const convRate = Math.round((m.completed_orders / Math.max(m.total_orders, 1)) * 100);
                const title = m.method_name === "bank" ? "Banko pavedimas (SEPA / LT)" : m.method_name === "ltc" ? "Litecoin (LTC Crypto)" : "PayPal Friends & Family";

                return (
                  <div key={idx} className="rounded-xl border border-line bg-void p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-extrabold text-[14px] text-ink">{title}</span>
                      <span className="num font-bold text-signal">{eur(m.total_cents)}€</span>
                    </div>

                    <div className="flex items-center justify-between text-[12px] text-muted mb-1.5">
                      <span>Užsakymai: {m.completed_orders} / {m.total_orders} patvirtinti</span>
                      <span className="num font-bold text-live">{convRate}% konversija</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-panel overflow-hidden border border-line/40">
                      <div
                        style={{ width: `${convRate}%` }}
                        className="h-full bg-gradient-to-r from-signal to-live rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
