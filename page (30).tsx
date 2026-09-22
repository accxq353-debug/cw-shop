import type { Metadata } from "next";
import MyOrders from "@/components/MyOrders";

export const metadata: Metadata = {
  title: "Mano užsakymai — Cw-Shop",
  description: "Visi tavo užsakymai, jų būsena ir informacija vienoje vietoje.",
};

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-24 pt-14">
      <header className="mb-10">
        <div className="micro text-signal">Paskyra</div>
        <h1 className="display mt-3 text-[clamp(2.2rem,5.4vw,3.4rem)]">
          Mano užsakymai
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted">
          Čia matosi visi šioje naršyklėje atlikti užsakymai, jų būsena ir
          detalės. Užsakymo numerį visada gali nurodyti Discord — pagal jį randame
          tavo pirkinį akimirksniu.
        </p>
      </header>
      <MyOrders />
    </div>
  );
}
