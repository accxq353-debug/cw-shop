"use client";

import Link from "next/link";
import { BadgeCheck, LogOut, Mail, User as UserIcon } from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import MyOrders from "@/components/MyOrders";
import { useUser } from "@/lib/useUser";
import { useLanguage } from "@/lib/language";

export default function AccountView() {
  const { user, ready, logout } = useUser();
  const { t } = useLanguage();

  if (!ready) {
    return <div className="panel h-[280px] animate-pulse rounded-2xl" />;
  }

  if (!user) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-panel">
            <UserIcon size={22} strokeWidth={1.8} className="text-signal" />
          </div>
          <h2 className="mt-5 font-display text-[19px] font-extrabold">
            {t.signInToSeeOrders}
          </h2>
          <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-muted">
            {t.signInDesc}
          </p>
          <ul className="mx-auto mt-6 max-w-[40ch] space-y-2 text-left text-[13.5px] text-muted">
            <li className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-live" />
              {t.authBenefit1}
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-live" />
              {t.authBenefit2}
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-live" />
              {t.authBenefit3}
            </li>
          </ul>
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <div>
      <div className="panel flex flex-wrap items-center gap-5 rounded-2xl p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal/15">
          <UserIcon size={24} className="text-signal" />
        </div>
        <div className="min-w-0">
          <div className="micro text-muted/70">{t.account}</div>
          <div className="font-display text-[20px] font-extrabold tracking-[-0.02em]">
            {user.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} /> {user.email}
            </span>
            {user.discord ? (
              <span className="num">discord: {user.discord}</span>
            ) : null}
            <span className="num">
              {t.memberSince}{" "}
              {new Date(user.createdAt).toLocaleDateString("lt-LT")}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-xl border border-signal/40 bg-signal/10 px-4 py-2.5 font-display text-[13.5px] font-extrabold text-signal transition-colors hover:bg-signal/20"
            >
              {t.adminDashboardBtn}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            <LogOut size={15} />
            {t.logOutBtn}
          </button>
        </div>
      </div>

      <h2 className="display mt-12 text-[clamp(1.7rem,3.8vw,2.3rem)]">
        {t.myOrdersBtn}
      </h2>
      <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-muted">
        {t.signInDesc}
      </p>

      <div className="mt-8">
        <MyOrders />
      </div>
    </div>
  );
}
