"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

type Stage = "cart" | "form" | "done";

const DELIVERY_FEE = 25;
const FREE_OVER = 300;

export default function CartDrawer() {
  const { items, count, total, isOpen, setQty, remove, clear, closeCart } = useCart();
  const [stage, setStage] = useState<Stage>("cart");
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const delivery = total >= FREE_OVER || total === 0 ? 0 : DELIVERY_FEE;
  const grand = total + delivery;

  // sepet kapanınca bir sonraki açılış temiz başlasın
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Adını yazar mısın?";
    // 10-11 hane, boşluk ve parantezlere izin ver
    if (!/^[0-9\s()+-]{10,17}$/.test(form.phone.trim())) e.phone = "Telefon numarası eksik görünüyor.";
    if (form.address.trim().length < 10) e.address = "Adresi biraz daha açar mısın?";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    // Arka uç yok: sipariş numarası yerelde üretiliyor, hiçbir yere gönderilmiyor.
    const no = `TD-${String(Date.now()).slice(-6)}`;
    setOrderNo(no);
    setStage("done");
    clear();
  };

  const startOver = () => {
    setStage("cart");
    setOrderNo(null);
    setForm({ name: "", phone: "", address: "", note: "" });
    setErrors({});
    closeCart();
  };

  return (
    <>
      {/* karartma */}
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-[70] bg-void/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sepetin"
        className={`fixed top-0 right-0 z-[71] h-[100dvh] w-full max-w-[420px] bg-char border-l border-line flex flex-col transition-transform duration-400 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line shrink-0">
          <div>
            <p className="tag text-flame">Sepetin</p>
            <p className="font-display font-extrabold text-xl text-bone">
              {stage === "done" ? "Sipariş alındı" : `${count} ürün`}
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={closeCart}
            aria-label="Sepeti kapat"
            className="w-10 h-10 border border-line text-smoke hover:text-flame hover:border-flame transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ---- SEPET ---- */}
        {stage === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <p className="text-smoke text-sm">Sepetin henüz boş.</p>
                  <a
                    href="#builder"
                    onClick={closeCart}
                    className="tag border border-flame text-flame px-4 py-2 hover:bg-flame hover:text-void transition-colors"
                  >
                    Dönerini hazırla
                  </a>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((l) => (
                    <li key={l.id} className="border border-line p-4">
                      <div className="flex justify-between gap-3 mb-1">
                        <p className="font-display font-semibold text-bone text-sm">{l.label}</p>
                        <p className="font-mono text-sm text-bone shrink-0 tabular-nums">{l.price * l.qty}₺</p>
                      </div>
                      {l.detail && <p className="text-xs text-smoke mb-3">{l.detail}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button
                            onClick={() => setQty(l.id, l.qty - 1)}
                            aria-label={`${l.label} adetini azalt`}
                            className="w-8 h-8 text-bone hover:text-flame transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-mono text-sm text-bone tabular-nums">{l.qty}</span>
                          <button
                            onClick={() => setQty(l.id, l.qty + 1)}
                            aria-label={`${l.label} adetini artır`}
                            className="w-8 h-8 text-bone hover:text-flame transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => remove(l.id)}
                          className="tag text-smoke hover:text-flame transition-colors"
                        >
                          Çıkar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5 shrink-0">
                <div className="flex justify-between text-sm text-smoke mb-2">
                  <span>Ara toplam</span>
                  <span className="tabular-nums">{total}₺</span>
                </div>
                <div className="flex justify-between text-sm text-smoke mb-3">
                  <span>Paket servis</span>
                  <span className="tabular-nums">{delivery === 0 ? "Ücretsiz" : `${delivery}₺`}</span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-smoke/70 mb-3">
                    {FREE_OVER - total}₺ daha eklersen paket servis ücretsiz.
                  </p>
                )}
                <div className="flex justify-between items-center border-t border-line pt-3 mb-4">
                  <span className="tag text-smoke">Toplam</span>
                  <span className="font-display font-extrabold text-2xl text-flame tabular-nums">{grand}₺</span>
                </div>
                <button
                  onClick={() => setStage("form")}
                  className="w-full bg-flame text-void font-display font-extrabold py-3 hover:bg-amber transition-colors"
                >
                  ADRES BİLGİLERİ
                </button>
              </div>
            )}
          </>
        )}

        {/* ---- ADRES FORMU ---- */}
        {stage === "form" && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {(
                [
                  { k: "name", label: "Ad Soyad", ph: "Adın", type: "text" },
                  { k: "phone", label: "Telefon", ph: "05xx xxx xx xx", type: "tel" },
                ] as const
              ).map((f) => (
                <div key={f.k}>
                  <label htmlFor={f.k} className="tag text-smoke block mb-2">
                    {f.label}
                  </label>
                  <input
                    id={f.k}
                    type={f.type}
                    value={form[f.k]}
                    onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))}
                    placeholder={f.ph}
                    className={`w-full bg-void border px-3 py-2.5 text-sm text-bone placeholder:text-smoke/50 outline-none transition-colors focus:border-flame ${
                      errors[f.k] ? "border-flame" : "border-line"
                    }`}
                  />
                  {errors[f.k] && <p className="text-xs text-flame mt-1.5">{errors[f.k]}</p>}
                </div>
              ))}

              <div>
                <label htmlFor="address" className="tag text-smoke block mb-2">
                  Adres
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                  placeholder="Mahalle, sokak, bina, daire"
                  className={`w-full bg-void border px-3 py-2.5 text-sm text-bone placeholder:text-smoke/50 outline-none resize-none transition-colors focus:border-flame ${
                    errors.address ? "border-flame" : "border-line"
                  }`}
                />
                {errors.address && <p className="text-xs text-flame mt-1.5">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="note" className="tag text-smoke block mb-2">
                  Not <span className="normal-case tracking-normal">(isteğe bağlı)</span>
                </label>
                <input
                  id="note"
                  value={form.note}
                  onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
                  placeholder="Soğansız olsun, zili çalmayın…"
                  className="w-full bg-void border border-line px-3 py-2.5 text-sm text-bone placeholder:text-smoke/50 outline-none focus:border-flame transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-line px-6 py-5 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="tag text-smoke">Ödenecek</span>
                <span className="font-display font-extrabold text-2xl text-flame tabular-nums">{grand}₺</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStage("cart")}
                  className="tag border border-line text-smoke px-4 hover:border-smoke transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={submit}
                  className="flex-1 bg-flame text-void font-display font-extrabold py-3 hover:bg-amber transition-colors"
                >
                  SİPARİŞİ VER
                </button>
              </div>
              <p className="text-xs text-smoke/60 mt-3 leading-relaxed">
                Kapıda nakit veya kart. Siparişini aldıktan sonra seni arayıp teyit ediyoruz.
              </p>
            </div>
          </>
        )}

        {/* ---- ONAY ---- */}
        {stage === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <div className="w-16 h-16 border border-flame text-flame flex items-center justify-center text-2xl">✓</div>
            <p className="font-display font-extrabold text-2xl text-bone">Siparişin bize ulaştı</p>
            <p className="tag text-flame">Sipariş no: {orderNo}</p>
            <p className="text-sm text-smoke leading-relaxed">
              Birkaç dakika içinde arayıp teyit edeceğiz. Şiş zaten ateşte, uzun sürmez.
            </p>
            <button
              onClick={startOver}
              className="tag border border-flame text-flame px-5 py-2.5 mt-2 hover:bg-flame hover:text-void transition-colors"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </>
  );
}
