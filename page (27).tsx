import type { Metadata } from "next";
import AuthPanel from "@/components/AuthPanel";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Prisijungimas — Cw-Shop",
  description:
    "Prisijunk arba registruokis ir stebėk visus savo užsakymus vienoje vietoje.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
          <header>
            <Logo size={120} />
            <div className="micro mt-6 text-signal">Paskyra</div>
          <h1 className="display mt-3 text-[clamp(2.2rem,5.4vw,3.4rem)]">
            Prisijunk prie
            <br />
            savo užsakymų
          </h1>
          <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-muted">
            Viena paskyra — visa pirkimų istorija. Kiekvienas užsakymas turi
            savo numerį, būseną ir administratoriaus pastabas, todėl nereikia
            ieškoti senų žinučių Discord ar el. pašte.
          </p>
          <ul className="mt-8 space-y-3 text-[14px] text-muted">
            <li>· Mokėjimą tvirtiname rankiniu būdu — saugu abiem pusėm</li>
            <li>· Apie gautą mokėjimą iš karto gaunu žinutę Discord'e</li>
            <li>· Patvirtinus, prekė keliauja į tavo el. paštą</li>
          </ul>
        </header>
        <AuthPanel />
      </div>
    </div>
  );
}
