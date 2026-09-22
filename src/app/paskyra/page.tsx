import type { Metadata } from "next";
import AccountView from "@/components/AccountView";

export const metadata: Metadata = {
  title: "Paskyra — Cw-Shop",
  description:
    "Prisijunk ir matyk visus savo užsakymus, jų būsenas, numerius ir istoriją.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <header className="mb-10">
        <div className="micro text-signal">Paskyra</div>
        <h1 className="display mt-3 text-[clamp(2.2rem,5.4vw,3.4rem)]">
          Mano paskyra
        </h1>
      </header>
      <AccountView />
    </div>
  );
}
