"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MENU_COMBOS } from "@/data/menu";
import { useCart } from "@/lib/cart";

export default function MenuGrid() {
  const section = useRef<HTMLDivElement>(null);
  const { add, openCart } = useCart();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".menu-card", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        scrollTrigger: { trigger: section.current, start: "top 78%" },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="menu" className="relative bg-char py-28 md:py-36 border-t border-line">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="tag text-flame mb-3">Sabit Menü</p>
            <h2 className="font-display font-extrabold text-[9vw] md:text-[3.2vw] leading-[0.95] text-bone">
              HAZIR
              <br />
              <span className="text-flame">SEÇENEKLER</span>
            </h2>
          </div>
          <p className="tag text-smoke max-w-[280px]">
            Karar veremeyenler için, ustamızın önerdiği üçlü.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
          {MENU_COMBOS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                add({ id: `combo-${c.id}`, label: c.name, detail: c.desc, price: c.price });
                openCart();
              }}
              className="menu-card bg-void flex flex-col text-left hover:bg-panel transition-colors duration-300 group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-panel border-b border-line">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover saturate-[0.85] group-hover:saturate-110 group-hover:scale-[1.04] transition-[transform,filter] duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
                <p className="tag text-flame absolute bottom-3 left-4">{c.code}</p>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-display font-extrabold text-2xl text-bone mb-3">{c.name}</h3>
                <p className="text-smoke text-sm leading-relaxed mb-8 flex-1">{c.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <span className="font-display font-extrabold text-2xl text-bone">{c.price}₺</span>
                  <span className="tag text-smoke group-hover:text-flame transition-colors">SEPETE EKLE →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
