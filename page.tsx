import type { Metadata } from "next";
import AdminApp from "@/components/AdminApp";

export const metadata: Metadata = {
  title: "Administravimas — Cw-Shop",
  description: "Mokėjimų patvirtinimas, užsakymų vykdymas ir vartotojų paieška.",
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <AdminApp />
    </div>
  );
}
