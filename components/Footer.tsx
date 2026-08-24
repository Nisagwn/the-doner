export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-void border-t border-line pt-20 pb-10">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#FF3D12,#FFC247,#62D5FF,transparent)]" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-16">
          <div>
            <p className="font-display font-extrabold text-2xl text-bone mb-4">
              THE <span className="text-amber">//</span> DÖNER
            </p>
            <p className="text-smoke text-sm max-w-xs">
              Almanya ve Türkiye sokak lezzetinin buluştuğu yer. Her gün açık
              ateşte, elle hazırlıyoruz.
            </p>
          </div>
          <div>
            <p className="tag text-smoke mb-4">Konum</p>
            <p className="text-bone text-sm leading-relaxed">
              Bağdat Cd. No: 142
              <br />
              Kadıköy, İstanbul
            </p>
          </div>
          <div>
            <p className="tag text-smoke mb-4">Saatler</p>
            <p className="text-bone text-sm leading-relaxed">
              Her gün
              <br />
              11:00 — 02:00
            </p>
          </div>
          <div>
            <p className="tag text-smoke mb-4">İletişim</p>
            <p className="text-bone text-sm leading-relaxed">
              +90 216 000 00 00
              <br />
              siparis@thedoner.com
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-line tag text-smoke">
          <span>© {new Date().getFullYear()} THE // DÖNER — TÜM HAKLARI SAKLIDIR</span>
          <div className="flex gap-6">
            <a href="#top" className="focus-ring hover:text-amber transition-colors">
              YUKARI ÇIK ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
