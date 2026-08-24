"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const LINKS = [
  { href: "#assembly", label: "Nasıl Yapılır" },
  { href: "#stack", label: "İçinde Ne Var" },
  { href: "#builder", label: "Kendin Seç" },
  { href: "#menu", label: "Menü" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-void/88 backdrop-blur-md border-b border-line shadow-[0_14px_50px_rgba(0,0,0,0.32)]" : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10 py-5">
        <a href="#top" className="focus-ring font-display font-extrabold text-lg tracking-tight text-bone">
          THE <span className="text-amber">//</span> DÖNER
        </a>
        <ul className="hidden md:flex items-center gap-8 tag text-smoke">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="focus-ring hover:text-amber transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={openCart}
          aria-label={`Sepeti aç, ${count} ürün`}
          className="focus-ring relative tag border border-amber text-amber px-4 py-2 hover:bg-amber hover:text-void transition-colors"
        >
          Sepet
          {count > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-herb text-void font-mono text-[11px] leading-5 text-center shadow-[0_0_20px_rgba(123,214,111,0.75)]">
              {count}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}
