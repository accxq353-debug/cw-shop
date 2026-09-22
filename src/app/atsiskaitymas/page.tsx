import type { Metadata } from "next";
import Checkout from "@/components/Checkout";

export const metadata: Metadata = {
  title: "Atsiskaitymas — Cw-Shop",
  description:
    "Saugus atsiskaitymas per PayPal Friends & Family. Užsakymo numerį nurodyk mokėjimo laukelyje.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-12">
      <Checkout />
    </div>
  );
}
