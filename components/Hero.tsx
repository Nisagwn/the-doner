"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Sol/sağ kolonlardaki kısa bilgiler. İlk maddede canlı sinyal noktası var.
const LEFT_NOTES = [
  { text: "Şu an ateşte", live: true },
  { text: "Elde kesim" },
  { text: "Dana ve kuzu" },
  { text: "Odun ateşi" },
];

const RIGHT_NOTES = ["Karaköy, İstanbul", "Her gün 11.00 – 22.00", "Bugün ikinci şiş", "Paket servis var"];

// Kıvılcımlar SSR ile istemcide aynı çıksın diye tohumlanmış üreteçle kuruluyor.
function seeded(n: number) {
  let t = n + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const r = (k: number) => seeded(i * 11 + k);
  return {
    left: 34 + r(1) * 32, // şişin altından yükselsinler
    bottom: -6 - r(2) * 14,
    size: 1.6 + r(3) * 2.4,
    duration: 8 + r(4) * 9,
    delay: -r(5) * 14,
    drift: (r(6) - 0.5) * 130,
    rise: 60 + r(7) * 35,
    peak: 0.5 + r(8) * 0.45,
  };
});

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const bgWrap = useRef<HTMLDivElement>(null);
  const spitWrap = useRef<HTMLDivElement>(null);
  const gridLayer = useRef<HTMLDivElement>(null);
  const titleBack = useRef<HTMLDivElement>(null);
  const titleFront = useRef<HTMLDivElement>(null);
  const titleGroup = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // giriş
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 14, duration: 0.6 })
        .from(".hero-title-line", { opacity: 0, y: 60, stagger: 0.08, duration: 0.9 }, "-=0.2")
        .from(spitWrap.current, { opacity: 0, scale: 1.12, duration: 1.2, ease: "power4.out" }, "-=0.8")
        .from(".hero-note", { opacity: 0, y: 8, stagger: 0.06, duration: 0.5 }, "-=0.6")
        .from(".hero-sub", { opacity: 0, y: 14, duration: 0.6 }, "-=0.3");

      // scroll: başlık büyüyerek dağılır, şiş sonraki bölüme doğru yaklaşır
      gsap.to([titleGroup.current, titleFront.current], {
        scale: 1.45,
        opacity: 0,
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: 1 },
      });
      gsap.to(spitWrap.current, {
        scale: 1.35,
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    }, root);

    // Fare parallaksı: katmanlar farklı oranlarda ve fareye ters yönde kayar.
    // Grid %2, tipografi %4, şiş %8 — derinlik hissi bu farktan doğuyor.
    let movers: { set: (v: number) => void; axis: "x" | "y"; amp: number }[] = [];
    if (!reduced) {
      const mk = (el: HTMLElement | null, amp: number) => {
        if (!el) return;
        movers.push({ set: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }), axis: "x", amp });
        movers.push({ set: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }), axis: "y", amp });
      };
      mk(gridLayer.current, 0.02);
      mk(titleGroup.current, 0.04);
      mk(titleFront.current, 0.04);
      mk(spitWrap.current, 0.08);
    }

    const el = root.current;
    const onMove = (e: PointerEvent) => {
      if (!el || !movers.length) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      for (const m of movers) {
        const n = m.axis === "x" ? nx : ny;
        m.set(-n * r[m.axis === "x" ? "width" : "height"] * m.amp);
      }
    };
    const onLeave = () => movers.forEach((m) => m.set(0));
    el?.addEventListener("pointermove", onMove);
    el?.addEventListener("pointerleave", onLeave);

    return () => {
      el?.removeEventListener("pointermove", onMove);
      el?.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-void flex items-center justify-center"
    >
      {/* arka plan sahnesi — hafif bulanık ve koyu, odak öndeki şişte kalsın */}
      <div ref={bgWrap} className="absolute inset-0">
        <Image
          src="/assets/hero-fire.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-110 blur-[8px] brightness-[0.48] saturate-[1.18]"
        />
      </div>

      {/* merkezden dışa köz parıltısı */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 60% at 50% 52%, rgba(255,85,20,0.36) 0%, rgba(255,194,71,0.12) 34%, transparent 70%)" }}
      />
      {/* yanlara doğru koyulaşan vinyet: odağı ortaya toplar */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #070604 0%, rgba(7,6,4,0.58) 22%, transparent 45%, transparent 55%, rgba(7,6,4,0.58) 78%, #070604 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(7,6,4,0.88) 0%, transparent 30%, transparent 55%, #070604 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-[linear-gradient(90deg,#FF3D12,#FFC247,#7BD66F,#62D5FF)] opacity-25 blur-2xl" />

      {/* teknik grid — en yavaş kayan katman */}
      <div
        ref={gridLayer}
        className="absolute inset-[-4%] opacity-[0.07] pointer-events-none [background-image:linear-gradient(#FFF6E8_1px,transparent_1px),linear-gradient(90deg,#FFF6E8_1px,transparent_1px)] [background-size:48px_48px]"
      />

      {/* yükselen köz kıvılcımları */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="ember absolute rounded-full bg-amber"
            style={
              {
                left: `${s.left}%`,
                bottom: `${s.bottom}%`,
                width: s.size,
                height: s.size,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
                boxShadow: "0 0 7px rgba(255,150,50,0.95)",
                "--drift": `${s.drift}px`,
                "--rise": `${s.rise}vh`,
                "--peak": s.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* scanline */}
      <div className="scanline pointer-events-none absolute inset-x-0 h-40 bg-gradient-to-b from-flame/10 to-transparent" />

      {/*
        Katmanlama: arka başlık (z-10) → şiş (z-20) → ön başlık (z-30).
        Böylece ilk kelime dönerin arkasında kalır, ikinci kelime etin önünü keser.
      */}
      <div ref={titleGroup} className="absolute inset-0 z-10 pointer-events-none">
        <div ref={titleBack} className="absolute inset-x-0 top-[30%] text-center px-6">
          <h1 className="font-display font-black leading-[0.9] text-[13vw] md:text-[7.5vw] text-bone">
            <span className="hero-title-line block">ODUN ATEŞİNDE</span>
          </h1>
        </div>
      </div>

      {/* öndeki şiş */}
      <div ref={spitWrap} className="absolute inset-0 z-20 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[64vh] max-h-[700px] aspect-[440/1188]">
          {/* şişin ardındaki sıcak hale */}
          <div className="absolute -inset-x-28 -inset-y-8 bg-flame/20 blur-[90px] rounded-full" />
          <Image
            src="/assets/hero-spit-cut.webp"
            alt="Ateş karşısında dönen döner şişi"
            fill
            priority
            sizes="(max-width: 768px) 55vw, 26vw"
            className="object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.8)] contrast-[1.08] saturate-[1.12] brightness-[1.06]"
          />
        </div>
      </div>

      {/* etin önünü kesen ikinci kelime */}
      <div ref={titleFront} className="absolute inset-0 z-30 pointer-events-none">
        <p className="hero-eyebrow absolute inset-x-0 top-[12%] text-center px-6 font-mono text-xs tracking-widest uppercase text-amber">
          Karaköy&apos;de 2011&apos;den beri
        </p>
        <div className="absolute inset-x-0 top-[54%] text-center px-6">
          <h2 className="font-display font-black leading-[0.9] text-[22vw] md:text-[13vw] text-bone drop-shadow-[0_18px_40px_rgba(0,0,0,0.8)]">
            <span className="hero-title-line block">DÖNER</span>
          </h2>
        </div>
      </div>

      {/* yan notlar */}
      <div className="relative z-40 max-w-[1400px] w-full mx-auto px-6 md:px-10 grid md:grid-cols-[1fr_auto_1fr] items-center gap-8 pointer-events-none">
        <div className="hidden md:flex flex-col gap-3.5">
          {LEFT_NOTES.map((n) => (
            <div key={n.text} className="hero-note flex items-center gap-2.5 font-mono text-xs tracking-widest uppercase text-smoke/80">
              {n.live ? (
                <span className="relative flex w-1.5 h-1.5 shrink-0">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-flame opacity-70 animate-ping" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-flame" />
                </span>
              ) : (
                <span className="w-1.5 h-1.5 shrink-0 bg-smoke/40" />
              )}
              {n.text}
            </div>
          ))}
        </div>

        <div className="hidden md:block w-[300px]" aria-hidden />

        <div className="hidden md:flex flex-col gap-3.5 text-right items-end">
          {RIGHT_NOTES.map((t, i) => (
            <div key={t} className={`hero-note font-mono text-xs tracking-widest uppercase ${i === 2 ? "text-amber" : "text-smoke/80"}`}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* alt satır */}
      <div className="absolute inset-x-0 bottom-8 z-40 px-6 text-center">
        <p className="hero-sub font-mono text-xs tracking-widest uppercase text-smoke/70">
          Her sabah tek şiş çekeriz, bitince kapatırız ↓
        </p>
      </div>
    </section>
  );
}
