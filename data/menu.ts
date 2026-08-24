export type Option = {
  id: string;
  label: string;
  desc: string;
  price: number;
  kcal: number;
  image?: string;
};

export const BREADS: Option[] = [
  { id: "kalin", label: "Kalın Pide", desc: "Dolgun, yoğun iç", price: 0, kcal: 320, image: "/assets/ing-bun-thick.webp" },
  { id: "ince", label: "İnce Pide", desc: "Hafif, gevrek kabuk", price: 6, kcal: 240, image: "/assets/ing-bun-bottom.webp" },
];

export const PROTEIN: Option[] = [
  { id: "et-tek", label: "Tek Porsiyon Et", desc: "180g, şişten taze kesim", price: 0, kcal: 340, image: "/assets/ing-meat.webp" },
  { id: "et-cift", label: "Çift Porsiyon Et", desc: "320g, doyurucu seçim", price: 45, kcal: 610 },
];

export const VEGGIES: Option[] = [
  { id: "domates", label: "Domates", desc: "Dilim dilim taze", price: 0, kcal: 18, image: "/assets/ing-tomato.webp" },
  { id: "sogan", label: "Kırmızı Soğan", desc: "İnce halka kesim", price: 0, kcal: 12, image: "/assets/ing-onion.webp" },
  { id: "marul", label: "Marul", desc: "Buz gibi taze", price: 0, kcal: 8, image: "/assets/ing-lettuce.webp" },
];

export const SAUCES: Option[] = [
  { id: "sarimsak", label: "Sarımsak Sos", desc: "Yoğurt bazlı, otlu", price: 0, kcal: 90, image: "/assets/ing-sauce.webp" },
  { id: "acili", label: "Acı Sos", desc: "Köz biber, ateşli", price: 0, kcal: 45, image: "/assets/ing-ketchup.webp" },
  { id: "ikisi", label: "İkisi Birden", desc: "Kararsız kalanlar için", price: 4, kcal: 120, image: "/assets/ing-sauce-mix.webp" },
];

export const MENU_COMBOS = [
  {
    id: "klasik",
    code: "Menü 01",
    name: "Klasik Döner",
    desc: "Somun ekmek, tek porsiyon et, tam malzeme, sarımsak sos.",
    price: 165,
    image: "/assets/menu-klasik.webp",
    alt: "Susamlı somun ekmekte, sarımsak ve acı soslu, domates-marul-soğanlı klasik döner sandviç",
  },
  {
    id: "ateshane",
    code: "Menü 02",
    name: "Ateşhane Özel",
    desc: "Izgara pide, çift porsiyon et, acı sos, közlenmiş biber.",
    price: 215,
    image: "/assets/menu-ateshane.webp",
    alt: "Izgara pide içinde acı soslu çift porsiyon et, yanında közlenmiş biber",
  },
  {
    id: "iki-dunya",
    code: "Menü 03",
    name: "İki Dünya Menü",
    desc: "Klasik döner, yanında ayran ve patates.",
    price: 195,
    image: "/assets/menu-iki-dunya.webp",
    alt: "Tepside döner sandviç, patates kızartması ve ayran",
  },
];
