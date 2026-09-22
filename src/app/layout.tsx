import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { UserProvider } from "@/lib/useUser";
import { LanguageProvider } from "@/lib/language";
import Starfield from "@/components/Starfield";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MaintenanceBanner from "@/components/MaintenanceBanner";

export const metadata: Metadata = {
  title: "Cw-Shop — kainoraštis: prenumeratos, žaidimai, SMM",
  description:
    "Skaitmeninės prekės už mažesnę kainą: Netflix, Spotify, Gemini Pro+, Claude, Robux, Minecraft, Discord boost'ai, SMM paslaugos ir VPN. Pristatymas per kelias minutes per Discord.",
  keywords: [
    "Netflix",
    "Spotify",
    "Claude",
    "ChatGPT Codex",
    "Robux",
    "Minecraft",
    "Discord boost",
    "SMM",
    "VPN",
    "kainoraštis",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="lt">
      <body className="antialiased font-sans">
        <LanguageProvider>
          <UserProvider>
            <CartProvider>
              <Starfield />
              <MaintenanceBanner>
                <div className="relative z-10 flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
              </MaintenanceBanner>
            </CartProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
