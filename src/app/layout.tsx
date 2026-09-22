import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { UserProvider } from "@/lib/useUser";
import Starfield from "@/components/Starfield";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-space",
  display: "swap",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-jbmono",
  display: "swap",
});

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
    <html
      lang="lt"
      className={`${outfit.variable} ${space.variable} ${jbmono.variable}`}
    >
      <body className="antialiased">
        <UserProvider>
          <CartProvider>
            <Starfield />
            <div className="relative z-10 flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
