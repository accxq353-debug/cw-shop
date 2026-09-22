"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { productBySlug } from "@/data/catalog";

export type CartLine = {
  productSlug: string;
  variantId: string;
  qty: number;
};

export type ResolvedLine = CartLine & {
  name: string;
  brand: string;
  accent: string;
  accent2: string;
  variantLabel: string;
  unit?: string;
  unitCents: number;
  lineCents: number;
  slug: string;
};

type CartState = {
  lines: CartLine[];
  resolved: ResolvedLine[];
  totalCents: number;
  count: number;
  sessionKey: string;
  ready: boolean;
  add: (slug: string, variantId: string, qty?: number) => void;
  setQty: (slug: string, variantId: string, qty: number) => void;
  remove: (slug: string, variantId: string) => void;
  clear: () => void;
};

const STORAGE = "dt_cart_v1";
const SESSION = "dt_session_v1";

const CartContext = createContext<CartState | null>(null);

function resolve(lines: CartLine[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = productBySlug(line.productSlug);
    const variant = product?.variants.find((x) => x.id === line.variantId);
    if (!product || !variant) continue;
    out.push({
      ...line,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      accent: product.accent,
      accent2: product.accent2,
      variantLabel: variant.label,
      unit: variant.unit,
      unitCents: variant.priceCents,
      lineCents: variant.priceCents * line.qty,
    });
  }
  return out;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [sessionKey, setSessionKey] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
      let session = window.localStorage.getItem(SESSION);
      if (!session) {
        session =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `s-${Math.random().toString(36).slice(2)}${Date.now()}`;
        window.localStorage.setItem(SESSION, session);
      }
      setSessionKey(session);
    } catch {
      // storage unavailable — cart simply stays in memory
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, variantId: string, qty = 1) => {
    setLines((prev) => {
      const hit = prev.find(
        (l) => l.productSlug === slug && l.variantId === variantId,
      );
      if (hit) {
        return prev.map((l) =>
          l === hit
            ? { ...l, qty: Math.min(99, l.qty + Math.max(1, qty)) }
            : l,
        );
      }
      return [...prev, { productSlug: slug, variantId, qty: Math.max(1, qty) }];
    });
  }, []);

  const setQty = useCallback((slug: string, variantId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productSlug === slug && l.variantId === variantId
            ? { ...l, qty: Math.max(0, Math.min(99, Math.floor(qty))) }
            : l,
        )
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((slug: string, variantId: string) => {
    setLines((prev) =>
      prev.filter((l) => !(l.productSlug === slug && l.variantId === variantId)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(() => {
    const resolved = resolve(lines);
    return {
      lines,
      resolved,
      totalCents: resolved.reduce((n, l) => n + l.lineCents, 0),
      count: resolved.reduce((n, l) => n + l.qty, 0),
      sessionKey,
      ready,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, sessionKey, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart turi būti CartProvider viduje");
  return ctx;
}
