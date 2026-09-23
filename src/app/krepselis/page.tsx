import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Krepšelis — Cw-Shop",
  description: "Tavo krepšelis: patikrink prekes, kiekius ir bendrą sumą.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <header className="mb-10">
        <div className="micro text-signal">01 žingsnis iš 3</div>
        <h1 className="display mt-3 text-[clamp(2.2rem,5.4vw,3.4rem)]">
          Krepšelis
        </h1>
        <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-muted">
          Patikrink prekes ir kiekius. Kainos galutinės — be papildomų mokesčių.
        </p>
      </header>
      <CartView />
    </div>
  );
}
