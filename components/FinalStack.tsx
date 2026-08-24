"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STATS = [
  { k: "AĞIRLIK", v: "420G" },
  { k: "KATMAN", v: "8" },
  { k: "PİŞİRME", v: "AÇIK ATEŞ" },
  { k: "SÜRE", v: "3 DK" },
];

const START_REVEAL = 50;

export default function FinalStack() {
  const section = useRef<HTMLDivElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const revealLayer = useRef<HTMLDivElement>(null);
  // fare pozisyonunu yumuşatarak clip-path'e aktaran quickTo
  const revealTo = useRef<((v: number) => void) | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgWrap.current,
        { clipPath: "inset(18% 18% 18% 18% round 12px)", scale: 0.92 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 0.6,
          },
        }
      );

      gsap.from(".stat-item", {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".stat-row",
          start: "top 85%",
        },
      });
    }, section);

    // Fareyle sağa/sola gezindikçe iki görsel arasında geçiş.
    // Sayısal bir vekil değer tweenlenip her karede clip-path'e yazılıyor —
    // string clip-path'i doğrudan quickTo ile tweenlemek güvenilir değil.
    const proxy = { v: START_REVEAL };
    revealTo.current = gsap.quickTo(proxy, "v", {
      duration: 0.45,
      ease: "power3.out",
      onUpdate: () => {
        if (revealLayer.current) {
          revealLayer.current.style.clipPath = `inset(0 ${100 - proxy.v}% 0 0)`;
        }
      },
    });

    return () => {
      ctx.revert();
      revealTo.current = null;
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = imgWrap.current;
    if (!el || !revealTo.current) return;
    const rect = el.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    revealTo.current(gsap.utils.clamp(0, 100, pct));
  };

  const handlePointerLeave = () => revealTo.current?.(START_REVEAL);

  return (
    <section ref={section} id="stack" className="relative bg-void py-28 md:py-36">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="tag text-flame mb-3">Kesit</p>
            <h2 className="font-display font-extrabold text-[9vw] md:text-[3.2vw] leading-[0.95] text-bone">
              İÇİNDE
              <br />
              <span className="text-flame">NE VAR</span>
            </h2>
          </div>
          <p className="tag text-smoke max-w-[280px]">
            Her katman elle tartılır, sırayla dizilir. Rastgele değil.
          </p>
        </div>

        <div
          ref={imgWrap}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative w-full aspect-[16/9] overflow-hidden bg-void border border-line cursor-ew-resize select-none touch-pan-y"
        >
          {/* Alt katman: tezgâhtaki ham malzemeler */}
          <Image
            src="/assets/ingredients-board.webp"
            alt="Kayrak tahtada sırayla dizili malzemeler: acı sos, sarımsak sos, döner eti, domates, kırmızı soğan, marul, köz biber ve susamlı pide"
            fill
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover"
          />

          {/* Üst katman: kurulmuş döner — fare sağa gittikçe alanı büyür */}
          <div
            ref={revealLayer}
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - START_REVEAL}% 0 0)` }}
          >
            <Image
              src="/assets/cross-section.webp"
              alt="Havada katmanlarına ayrılmış döner: susamlı pide, kırmızı soğan, domates, marul, şişten kesilmiş et, sarımsak ve acı sos"
              fill
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-void/40 via-transparent to-transparent pointer-events-none" />

          <p className="tag text-smoke absolute top-4 left-4 z-10 pointer-events-none">Kurulu Hâli</p>
          <p className="tag text-smoke absolute top-4 right-4 z-10 pointer-events-none">Ham Malzeme</p>
          <p className="tag text-smoke/70 absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            ← fareyi gezdir →
          </p>
        </div>

        <div className="stat-row grid grid-cols-2 md:grid-cols-4 gap-px bg-line mt-px border border-line">
          {STATS.map((s) => (
            <div key={s.k} className="stat-item bg-char p-6">
              <p className="tag text-smoke mb-2">{s.k}</p>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-bone">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
