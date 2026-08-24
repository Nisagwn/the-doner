"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playLayerThud, playDrip, unlockAudio } from "@/lib/kitchenAudio";

type Step = {
  code: string;
  name: string;
  image: string;
  from: "left" | "right" | "top";
  top: string; // yığındaki dikey konum, sahne yüksekliğinin %'si
  width: number; // masaüstünde px genişlik
  rotate: number;
  glow: string; // katman ekrana oturunca arkada yanan radyal ışıma
  bigText: string; // arka plandaki dev teknik tipografi
  origin: string; // etikete tıklayınca açılan köken bilgisi
  snap: number; // finalde birleşirken uygulanan dikey kayma (px)
  liquid?: boolean; // sos katmanı: iniş sesi tok vuruş yerine damla olur
};

// Not: her görsel kare bir kutuda object-contain ile çiziliyor, yani görünen
// yükseklik en-boy oranına bağlı. `top` değerleri bu yüzden görselin kutu
// içindeki gerçek bandına göre ayarlandı — sıra: 01 en altta, 08 en üstte.
const STEPS: Step[] = [
  {
    code: "01", name: "Kalın pide", image: "/assets/ing-bun-base.webp", from: "left",
    top: "43%", width: 310, rotate: -6, snap: 0,
    glow: "rgba(255,168,74,0.46)", bigText: "01 // ARTISAN PITA",
    origin: "Kendi fırınımızdan; susam ve çörek otuyla mühürlenmiş kalın pide.",
  },
  {
    code: "02", name: "Acı sos", image: "/assets/ing-ketchup.webp", from: "right",
    top: "61%", width: 140, rotate: 6, snap: 0, liquid: true,
    glow: "rgba(255,54,28,0.52)", bigText: "02 // CHILI EMBER",
    origin: "Közlenmiş kırmızı biber, 6 saat dinlendirilmiş acı sos.",
  },
  {
    code: "03", name: "Şişten taze et", image: "/assets/ing-meat.webp", from: "left",
    top: "33%", width: 310, rotate: -2, snap: 25,
    glow: "rgba(255,122,0,0.54)", bigText: "03 // AGED BEEF",
    origin: "24 saat marine edilmiş dana antrikot, şişten elde kesim.",
  },
  {
    code: "04", name: "Sarımsak sos", image: "/assets/ing-sauce.webp", from: "right",
    top: "39%", width: 150, rotate: 4, snap: 55, liquid: true,
    glow: "rgba(198,232,180,0.34)", bigText: "04 // GARLIC HERB",
    origin: "Süzme yoğurt, taze sarımsak ve maydanoz.",
  },
  {
    code: "05", name: "Taze marul", image: "/assets/ing-lettuce.webp", from: "left",
    top: "31%", width: 160, rotate: -6, snap: 85,
    glow: "rgba(46,204,113,0.42)", bigText: "05 // CRISP GREENS",
    origin: "Günlük gelen kıvırcık, buzlu suda diri tutulur.",
  },
  {
    code: "06", name: "Kırmızı soğan", image: "/assets/ing-onion.webp", from: "right",
    top: "22%", width: 150, rotate: 5, snap: 115,
    glow: "rgba(190,88,196,0.44)", bigText: "06 // RED ONION",
    origin: "Kırmızı soğan, sumakla ovulmuş ince halka.",
  },
  {
    code: "07", name: "Dilim domates", image: "/assets/ing-tomato.webp", from: "left",
    top: "11%", width: 170, rotate: -3, snap: 145,
    glow: "rgba(255,64,44,0.48)", bigText: "07 // VINE TOMATO",
    origin: "Dalından domates, kalın dilim ve tuzla dinlendirilmiş.",
  },
  {
    code: "08", name: "İnce pide", image: "/assets/ing-bun-lid.webp", from: "right",
    top: "-16%", width: 290, rotate: 3, snap: 175,
    glow: "rgba(255,186,96,0.46)", bigText: "08 // SESAME CROWN",
    origin: "Aynı hamurun ince kesimi, ızgarada mühürlenip kapak olur.",
  },
];

// SSR ile istemcinin aynı sonucu üretmesi için tohumlanmış üreteç:
// Math.random() burada hydration uyuşmazlığı yaratırdı.
function seeded(n: number) {
  let t = n + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const EMBERS = Array.from({ length: 18 }, (_, i) => {
  const r = (k: number) => seeded(i * 7 + k);
  return {
    left: 4 + r(1) * 92,
    bottom: -10 - r(2) * 25,
    size: 1.5 + r(3) * 2.6,
    duration: 9 + r(4) * 11,
    delay: -r(5) * 18,
    drift: (r(6) - 0.5) * 160,
    rise: 55 + r(7) * 45,
    peak: 0.45 + r(8) * 0.5,
  };
});

export default function AssemblyLog() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stackGroup = useRef<HTMLDivElement>(null);
  const tiltGroup = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bigTextRefs = useRef<(HTMLDivElement | null)[]>([]);

  const smokeBg = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const finalImg = useRef<HTMLDivElement>(null);
  const finalCaption = useRef<HTMLDivElement>(null);
  const headerBlock = useRef<HTMLDivElement>(null);

  const [openTip, setOpenTip] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  // ScrollTrigger callback'i kapanışta eski state'i görmesin diye ref üzerinden okunuyor
  const soundOnRef = useRef(false);
  const lastSounded = useRef(-1);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const step = STEPS[i];
        const xStart = step.from === "left" ? -260 : step.from === "right" ? 260 : 0;
        gsap.set(el, {
          opacity: 0,
          x: xStart,
          y: step.from === "top" ? -160 : 0,
          rotate: step.rotate * 4,
          scale: 0.7,
          // katmanları Z ekseninde ayır: fare eğdiğinde derinlik hissi bundan doğuyor
          z: (i - (STEPS.length - 1) / 2) * 16,
        });
        const label = labelRefs.current[i];
        if (label) gsap.set(label, { opacity: 0, x: step.from === "left" ? -12 : 12 });
      });

      gsap.set(glowRefs.current.filter(Boolean), { opacity: 0 });
      gsap.set(bigTextRefs.current.filter(Boolean), { opacity: 0, x: 60 });
      gsap.set(smokeBg.current, { opacity: 0 });
      gsap.set(flash.current, { opacity: 0 });
      gsap.set(finalImg.current, { opacity: 0, scale: 0.65, filter: "blur(40px)" });
      gsap.set(finalCaption.current, { opacity: 0, y: 16 });

      const STEP_UNIT = 380;
      const FINALE_UNIT = 900;
      const TOTAL = STEPS.length * STEP_UNIT + FINALE_UNIT;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: `+=${TOTAL}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // katman iniş sesleri: yalnızca ileri yönde ve katman değiştiğinde
            if (!soundOnRef.current) return;
            // her katmanın tween'i zaman çizelgesinde tam 1 birim yer kaplıyor,
            // bu yüzden geçen süre doğrudan katman sırasını veriyor
            const idx = Math.floor(self.progress * (self.animation?.duration() ?? 0));
            if (idx > lastSounded.current && idx < STEPS.length) {
              lastSounded.current = idx;
              if (STEPS[idx].liquid) playDrip();
              else playLayerThud(idx / (STEPS.length - 1));
            } else if (idx < lastSounded.current) {
              // geri kaydırınca sayaç geri alınır, tekrar inince yine çalar
              lastSounded.current = idx;
            }
          },
        },
      });

      // 1) malzemeler tek tek iniyor; her inişte arka plan o malzemenin rengiyle yanıyor
      STEPS.forEach((step, i) => {
        tl.to(itemRefs.current[i], { opacity: 1, x: 0, y: 0, rotate: step.rotate, scale: 1, duration: 1, ease: "power3.out" }, i)
          .to(labelRefs.current[i], { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, i + 0.25)
          .to(glowRefs.current[i], { opacity: 1, duration: 0.7, ease: "power2.out" }, i)
          .to(bigTextRefs.current[i], { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, i);
        if (i > 0) {
          tl.to(glowRefs.current[i - 1], { opacity: 0, duration: 0.7 }, i)
            .to(bigTextRefs.current[i - 1], { opacity: 0, x: -60, duration: 0.8 }, i);
        }
      });

      // 2) tamamlanan yığın bir nefes bekliyor
      tl.to({}, { duration: 0.5 });
      tl.addLabel("assemble");

      // 3) katmanlar birbirine kapanıyor — ama tam oturmasına izin verilmiyor.
      // Ham malzeme fotoğrafları üst üste bindiğinde ortaya çıkan kolaj
      // ekranda okunacak kadar durmadan duman ve parlama devralıyor.
      STEPS.forEach((step, i) => {
        tl.to(
          itemRefs.current[i],
          {
            y: step.snap,
            rotate: step.rotate * 0.2,
            duration: 0.7,
            ease: reduced ? "power2.out" : "power2.in",
          },
          "assemble"
        );
      });
      tl.to(labelRefs.current.filter(Boolean), { opacity: 0, duration: 0.25 }, "assemble");
      tl.to(bigTextRefs.current[STEPS.length - 1], { opacity: 0, duration: 0.4 }, "assemble");

      // 4) kapanışın son anında duman yükselip yığını yutuyor
      tl.to(smokeBg.current, { opacity: 0.65, duration: 0.5, ease: "power1.in" }, "assemble+=0.26");
      tl.to(
        stackGroup.current,
        { opacity: 0, scale: 1.06, filter: "blur(26px)", duration: 0.34, ease: "power2.in" },
        "assemble+=0.34"
      );
      tl.to(glowRefs.current.filter(Boolean), { opacity: 0, duration: 0.4 }, "assemble+=0.34");

      // 5) katmanların çarpıştığı andaki parlama
      tl.to(flash.current, { opacity: 1, duration: 0.14, ease: "power1.in" }, "assemble+=0.5")
        .to(flash.current, { opacity: 0, duration: 0.7, ease: "power2.out" }, "assemble+=0.64");

      // 6) gerçek döner parlamanın içinden çıkıyor
      tl.to(
        finalImg.current,
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
        "assemble+=0.58"
      );
      tl.to(smokeBg.current, { opacity: 0.28, duration: 1 }, "assemble+=0.58");
      tl.to(finalCaption.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "assemble+=1.15");
      tl.to(headerBlock.current, { opacity: 0.15, duration: 0.8 }, "assemble+=1.15");
    }, section);

    // fare parallax: yığın havada dururken hafif 3B eğim
    let tiltX: ((v: number) => void) | null = null;
    let tiltY: ((v: number) => void) | null = null;
    if (!reduced && tiltGroup.current) {
      tiltX = gsap.quickTo(tiltGroup.current, "rotationX", { duration: 0.7, ease: "power3.out" });
      tiltY = gsap.quickTo(tiltGroup.current, "rotationY", { duration: 0.7, ease: "power3.out" });
    }
    const el = section.current;
    const onMove = (e: PointerEvent) => {
      if (!el || !tiltX || !tiltY) return;
      const r = el.getBoundingClientRect();
      tiltY(((e.clientX - r.left) / r.width - 0.5) * 14);
      tiltX(-((e.clientY - r.top) / r.height - 0.5) * 10);
    };
    const onLeave = () => {
      tiltX?.(0);
      tiltY?.(0);
    };
    el?.addEventListener("pointermove", onMove);
    el?.addEventListener("pointerleave", onLeave);

    return () => {
      el?.removeEventListener("pointermove", onMove);
      el?.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={section} id="assembly" className="relative min-h-[100svh] bg-char overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-[3] h-px bg-[linear-gradient(90deg,transparent,#FF3D12,#FFC247,#7BD66F,transparent)]" />
      {/* katmana tepki veren radyal ışımalar */}
      {STEPS.map((step, i) => (
        <div
          key={`glow-${step.code}`}
          ref={(el) => {
            glowRefs.current[i] = el;
          }}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              // merkezdeki ana ışıma
              `radial-gradient(circle at 50% 52%, ${step.glow} 0%, transparent 70%)`,
              // tabandan yükselen geniş yansıma — rengi sahnenin altına da taşır
              `radial-gradient(ellipse 130% 65% at 50% 110%, ${step.glow} 0%, transparent 65%)`,
            ].join(", "),
          }}
        />
      ))}

      {/* süzülen duman perdesi */}
      <div
        className="smoke-drift absolute inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(255,140,60,0.14) 0%, transparent 65%)" }}
      />

      {/* köz kıvılcımları */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="ember absolute rounded-full bg-amber"
            style={
              {
                left: `${e.left}%`,
                bottom: `${e.bottom}%`,
                width: e.size,
                height: e.size,
                animationDuration: `${e.duration}s`,
                animationDelay: `${e.delay}s`,
                boxShadow: "0 0 6px rgba(255,140,40,0.9)",
                "--drift": `${e.drift}px`,
                "--rise": `${e.rise}vh`,
                "--peak": e.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* dev arka plan tipografisi */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden>
        {STEPS.map((step, i) => (
          <div
            key={`big-${step.code}`}
            ref={(el) => {
              bigTextRefs.current[i] = el;
            }}
            className="absolute whitespace-nowrap font-display font-extrabold text-bone/[0.07] text-[7vw] leading-none tracking-tight"
          >
            {step.bigText}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 z-[1] opacity-[0.055] pointer-events-none [background-image:linear-gradient(#FFF6E8_1px,transparent_1px),linear-gradient(90deg,#FFF6E8_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* duman / ateş atmosferi, sona doğru açılır */}
      <div ref={smokeBg} className="absolute inset-0 z-[2]">
        <Image src="/assets/kitchen-atmosphere.webp" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-void/55" />
      </div>

      {/* parlama */}
      <div
        ref={flash}
        className="absolute inset-0 z-30 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 55%, rgba(255,180,90,0.9), rgba(255,77,0,0.4) 45%, transparent 75%)" }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto h-[100svh] px-6 md:px-10 flex flex-col">
        <div ref={headerBlock} className="pt-28 md:pt-32 flex items-start justify-between gap-6">
          <div>
            <p className="tag text-flame mb-3">Nasıl Hazırlanır</p>
            <h2 className="font-display font-extrabold text-[9vw] md:text-[3.4vw] leading-[0.95] text-bone">
              KATMAN
              <br />
              KATMAN
            </h2>
          </div>
          <div className="flex flex-col items-end gap-3">
            <p className="tag text-smoke max-w-[220px] text-right hidden md:block">
              Her döner aynı sırayla, elle dizilir. Kısayolumuz yok.
            </p>
            <button
              onClick={() => {
                unlockAudio();
                setSoundOn((v) => !v);
              }}
              aria-pressed={soundOn}
              className={`focus-ring tag border px-3 py-2 transition-colors ${
                soundOn ? "border-amber text-amber bg-amber/10" : "border-line text-smoke hover:border-smoke"
              }`}
            >
              {soundOn ? "◼ Ses açık" : "▶ Ses kapalı"}
            </button>
          </div>
        </div>

        {/* yığılan malzemeler */}
        <div ref={stage} className="relative flex-1 mt-6 md:mt-4" style={{ perspective: 1200 }}>
          <div ref={stackGroup} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            <div ref={tiltGroup} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.code}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: step.top, width: step.width, transformStyle: "preserve-3d" }}
                >
                  <div className="relative" style={{ aspectRatio: "1/1" }}>
                    <Image src={step.image} alt={step.name} fill sizes="340px" className="object-contain" />
                  </div>

                  <div
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 z-20 max-md:top-auto max-md:bottom-full max-md:left-1/2 max-md:right-auto max-md:mb-1 max-md:-translate-x-1/2 max-md:translate-y-0 ${
                      step.from === "left" ? "left-full ml-4" : "right-full mr-4"
                    }`}
                  >
                    <button
                      onClick={() => setOpenTip((v) => (v === step.code ? null : step.code))}
                      aria-expanded={openTip === step.code}
                      className={`focus-ring tag whitespace-nowrap flex items-center gap-2 group max-md:bg-void/75 max-md:px-2 max-md:py-1 max-md:backdrop-blur-sm ${
                        step.from === "left" ? "" : "flex-row-reverse"
                      }`}
                    >
                      <span className="w-6 h-px bg-amber transition-all duration-300 group-hover:w-10 max-md:hidden" />
                      <span className="text-amber">{step.code}</span>
                      <span className="text-smoke group-hover:text-bone transition-colors">{step.name}</span>
                      <span className="text-smoke/50 group-hover:text-amber transition-colors">
                        {openTip === step.code ? "−" : "+"}
                      </span>
                    </button>

                    {openTip === step.code && (
                      <div
                        className={`absolute top-full mt-2 w-[240px] max-md:w-[210px] border border-amber/50 bg-void/95 backdrop-blur-sm p-3 text-xs leading-relaxed text-smoke shadow-[0_20px_50px_rgba(0,0,0,0.6)] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 ${
                          step.from === "left" ? "left-0" : "right-0"
                        }`}
                      >
                        <p className="tag text-amber mb-1.5">{step.code} — Köken</p>
                        {step.origin}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* final: gerçek döner dumandan çıkıyor */}
          <div ref={finalImg} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[85%] max-w-[640px] aspect-[948/624]">
              <div className="absolute -inset-16 bg-flame/25 blur-[90px] rounded-full" />
              <Image
                src="/assets/final-reveal-cross.webp"
                alt="Hazırlanmış döner"
                fill
                sizes="640px"
                className="object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>

          <div ref={finalCaption} className="absolute bottom-[8%] inset-x-0 text-center pointer-events-none">
            <p className="tag text-amber mb-2">Sekiz katman, tek lokma</p>
            <p className="font-display font-extrabold text-[8vw] md:text-[2.6vw] text-bone">İŞTE BU.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
