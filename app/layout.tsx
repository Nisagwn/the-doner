import type { Metadata } from "next";
import { Unbounded, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart";

const display = Unbounded({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "THE // DÖNER — Ateşte Doğdu",
  description:
    "İki dünyadan doğan döner. Kendi tarifini kur, siparişini oluştur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <div className="grain-overlay" />
        <CartProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
