"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BREADS, PROTEIN, VEGGIES, SAUCES, type Option } from "@/data/menu";
import { playToggle, unlockAudio } from "@/lib/kitchenAudio";
import { useCart } from "@/lib/cart";

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-4 border p-3 text-left transition-all duration-300 ${
        selected ? "border-flame bg-flame/[0.06]" : "border-line hover:border-smoke"
      }`}
    >
      {option.image ? (
        <div className="relative w-14 h-14 shrink-0">
          <Image src={option.image} alt={option.label} fill className="object-contain" sizes="56px" />
        </div>
      ) : (
        <div className="w-14 h-14 shrink-0 border border-line flex items-center justify-center tag text-smoke">
          +
        </div>
      )}
      <div className="min-w-0">
        <p className="font-display font-semibold text-bone truncate">{option.label}</p>
        <p className="text-xs text-smoke truncate">{option.desc}</p>
      </div>
      <div className="ml-auto tag text-flame shrink-0">
        {option.price > 0 ? `+${option.price}₺` : "DAHİL"}
      </div>
      <span
        className={`absolute -top-px -left-px w-2 h-2 border-t border-l transition-colors ${
          selected ? "border-flame" : "border-transparent"
        }`}
      />
    </button>
  );
}

export default function OrderBuilder() {
  const section = useRef<HTMLDivElement>(null);
  const previewFlash = useRef<HTMLDivElement>(null);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bread, setBread] = useState(BREADS[0].id);
  const [protein, setProtein] = useState(PROTEIN[0].id);
  const [veg, setVeg] = useState<string[]>(VEGGIES.map((v) => v.id));
  const [sauce, setSauce] = useState(SAUCES[0].id);
  const [qty, setQty] = useState(1);
  const [showReveal, setShowReveal] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const { add, openCart, count: cartCount, total: cartTotal } = useCart();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".builder-in", {
        opacity: 0,
        y: 24,
        stagger: 0.06,
        scrollTrigger: { trigger: section.current, start: "top 78%" },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  const toggleVeg = (id: string) => {
    setVeg((prev) => {
      const on = !prev.includes(id);
      if (soundOn) playToggle(on);
      return on ? [...prev, id] : prev.filter((v) => v !== id);
    });
  };

  const breakdown = useMemo(() => {
    const b = BREADS.find((x) => x.id === bread)!;
    const p = PROTEIN.find((x) => x.id === protein)!;
    const s = SAUCES.find((x) => x.id === sauce)!;
    const vgs = VEGGIES.filter((x) => veg.includes(x.id));
    const base = 145;
    const total = base + b.price + p.price + s.price;
    const kcal = b.kcal + p.kcal + s.kcal + vgs.reduce((n, v) => n + v.kcal, 0);
    return { b, p, s, vgs, base, total, kcal };
  }, [bread, protein, sauce, veg]);

  const lineLabel = `${breakdown.b.label} • ${breakdown.p.label} • ${breakdown.s.label}`;

  // Kutudaki her yuva sabit kalır; sebze çıkarılınca hücre unmount olmaz,
  // `active: false` ile kenara uçarak solar. Yuvalar sabit olduğu için
  // kalan malzemeler yerinden zıplamaz.
  const chips = useMemo(() => {
    const sauceImage = breakdown.s.image ?? (sauce === "acili" ? "/assets/ing-ketchup.webp" : "/assets/ing-sauce.webp");
    const proteinImage = breakdown.p.image ?? "/assets/ing-meat.webp";
    return [
      { id: "bread", label: breakdown.b.label, image: breakdown.b.image, active: true },
      { id: "protein", label: breakdown.p.label, image: proteinImage, active: true },
      ...VEGGIES.map((v) => ({ id: v.id, label: v.label, image: v.image, active: veg.includes(v.id) })),
      { id: "sauce", label: breakdown.s.label, image: sauceImage, active: true },
    ];
  }, [breakdown, sauce, veg]);

  const addToCart = () => {
    const key = `${bread}-${protein}-${sauce}-${veg.slice().sort().join(",")}`;
    add(
      {
        id: key,
        label: "Kendin Hazırla Döner",
        detail: `${lineLabel}${breakdown.vgs.length ? " • " + breakdown.vgs.map((v) => v.label).join(", ") : " • sebzesiz"}`,
        price: breakdown.total,
        kcal: breakdown.kcal,
      },
      qty
    );
    setQty(1);

    // brief flash + real-photo confirmation, then back to the picker
    setShowReveal(true);
    gsap.fromTo(
      previewFlash.current,
      { opacity: 0.85 },
      { opacity: 0, duration: 0.9, ease: "power2.out" }
    );
    if (revealTimeout.current) clearTimeout(revealTimeout.current);
    revealTimeout.current = setTimeout(() => setShowReveal(false), 1900);
  };

  useEffect(() => {
    return () => {
      if (revealTimeout.current) clearTimeout(revealTimeout.current);
    };
  }, []);

  return (
    <section ref={section} id="builder" className="relative bg-void py-28 md:py-36">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="builder-in flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="tag text-flame mb-3">Kendin Seç</p>
            <h2 className="font-display font-extrabold text-[9vw] md:text-[3.2vw] leading-[0.95] text-bone">
              KENDİ
              <br />
              <span className="text-flame">DÖNERİNİ HAZIRLA</span>
            </h2>
          </div>
          <p className="tag text-smoke max-w-[280px]">
            Seç, fiyat anında güncellensin.
          </p>
        </div>

        <div className="grid md:grid-cols-[1.3fr_0.9fr] gap-10 items-start">
          {/* options */}
          <div className="space-y-10">
            <div className="builder-in">
              <p className="tag text-smoke mb-3">01 — Ekmek</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {BREADS.map((o) => (
                  <OptionCard key={o.id} option={o} selected={bread === o.id} onClick={() => setBread(o.id)} />
                ))}
              </div>
            </div>

            <div className="builder-in">
              <p className="tag text-smoke mb-3">02 — Et</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {PROTEIN.map((o) => (
                  <OptionCard key={o.id} option={o} selected={protein === o.id} onClick={() => setProtein(o.id)} />
                ))}
              </div>
            </div>

            <div className="builder-in">
              <p className="tag text-smoke mb-3">03 — Sebzeler (istediğin kadar seç)</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {VEGGIES.map((o) => (
                  <OptionCard key={o.id} option={o} selected={veg.includes(o.id)} onClick={() => toggleVeg(o.id)} />
                ))}
              </div>
            </div>

            <div className="builder-in">
              <p className="tag text-smoke mb-3">04 — Sos</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {SAUCES.map((o) => (
                  <OptionCard key={o.id} option={o} selected={sauce === o.id} onClick={() => setSauce(o.id)} />
                ))}
              </div>
            </div>
          </div>

          {/* summary panel */}
          <div className="builder-in md:sticky md:top-28 border border-line bg-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="tag text-flame">Siparişin</p>
              <button
                onClick={() => {
                  unlockAudio();
                  setSoundOn((v) => !v);
                }}
                aria-pressed={soundOn}
                className={`tag border px-2 py-1 transition-colors ${
                  soundOn ? "border-flame text-flame" : "border-line text-smoke hover:border-smoke"
                }`}
              >
                {soundOn ? "◼ Ses" : "▶ Ses"}
              </button>
            </div>

            <div className="relative aspect-square w-full mb-6 border border-line bg-void/60 overflow-hidden">
              {/* flash burst on add-to-cart */}
              <div
                ref={previewFlash}
                className="absolute inset-0 z-20 pointer-events-none opacity-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(255,180,90,0.9), rgba(255,77,0,0.35) 45%, transparent 75%)",
                }}
              />

              {/* default state: each selected item shown separately, never overlapping */}
              <div
                className={`absolute inset-0 p-3 grid grid-cols-3 auto-rows-[1fr] gap-2 transition-opacity duration-500 ${
                  showReveal ? "opacity-0" : "opacity-100"
                }`}
              >
                {chips.map((chip) => (
                  <div
                    key={chip.id}
                    className={`relative border bg-panel transition-all duration-500 ease-out ${
                      chip.active
                        ? "border-line opacity-100 translate-x-0 rotate-0 scale-100"
                        : "border-line/30 opacity-0 translate-x-8 -rotate-12 scale-75"
                    }`}
                  >
                    {chip.image ? (
                      <Image src={chip.image} alt={chip.label} fill className="object-contain p-2" sizes="140px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center tag text-smoke text-center px-1">
                        {chip.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* confirmation state: the real finished photo, briefly, after adding to cart */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  showReveal ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src="/assets/final-reveal-plate.webp"
                  alt="Hazırlanan döner"
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
                <p className="absolute bottom-3 inset-x-0 text-center tag text-bone">Sepete eklendi</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm mb-4">
              <li className="flex justify-between text-smoke">
                <span>Baz Fiyat</span> <span>{breakdown.base}₺</span>
              </li>
              <li className="flex justify-between text-smoke">
                <span>{breakdown.b.label}</span> <span>{breakdown.b.price > 0 ? `+${breakdown.b.price}₺` : "—"}</span>
              </li>
              <li className="flex justify-between text-smoke">
                <span>{breakdown.p.label}</span> <span>{breakdown.p.price > 0 ? `+${breakdown.p.price}₺` : "—"}</span>
              </li>
              <li className="flex justify-between text-smoke">
                <span>{breakdown.s.label}</span> <span>{breakdown.s.price > 0 ? `+${breakdown.s.price}₺` : "—"}</span>
              </li>
            </ul>

            <div className="flex items-center justify-between border-t border-line pt-4 mb-2">
              <span className="tag text-smoke">Toplam</span>
              <span className="font-display font-extrabold text-2xl text-bone">{breakdown.total}₺</span>
            </div>

            <div className="flex items-center justify-between mb-5">
              <span className="tag text-smoke">Tahmini Enerji</span>
              <span className="font-mono text-sm text-flame tabular-nums">{breakdown.kcal} kcal</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-line">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 text-bone hover:text-flame transition-colors"
                  aria-label="azalt"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono text-bone">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 text-bone hover:text-flame transition-colors"
                  aria-label="artır"
                >
                  +
                </button>
              </div>
              <button
                onClick={addToCart}
                className="flex-1 bg-flame text-void font-display font-extrabold py-3 hover:bg-amber transition-colors"
              >
                SEPETE EKLE
              </button>
            </div>

            {cartCount > 0 && (
              <div className="border-t border-line pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="tag text-smoke">Sepette {cartCount} ürün</span>
                  <span className="font-display font-extrabold text-xl text-flame tabular-nums">{cartTotal}₺</span>
                </div>
                <button
                  onClick={openCart}
                  className="w-full border border-flame text-flame font-display font-semibold py-3 hover:bg-flame hover:text-void transition-colors"
                >
                  SEPETİ GÖR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
