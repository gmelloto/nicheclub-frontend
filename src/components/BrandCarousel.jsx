import { useEffect, useRef } from 'react';

const MARCAS = [
  'Maison Francis Kurkdjian', 'Tom Ford', 'Creed', 'Amouage', 'Xerjoff',
  'Parfums de Marly', 'Initio', 'Le Labo', 'Byredo', 'Memo Paris',
  'Juliette Has A Gun', 'Mancera', 'Montale', 'Nishane', 'Orto Parisi',
  'Serge Lutens', 'Diptyque', 'Acqua di Parma', 'Penhaligon\'s', 'Clive Christian',
];

export default function BrandCarousel() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const speed = 0.5;
    let raf;
    const step = () => {
      pos -= speed;
      const half = track.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...MARCAS, ...MARCAS]; // duplica para loop infinito

  return (
    <div style={{ background: '#0d0b07', borderTop: '1px solid rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '1.25rem 0', overflow: 'hidden', position: 'relative' }}>
      {/* Gradiente esquerda */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, #0d0b07, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      {/* Gradiente direita */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, #0d0b07, transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', gap: 0, willChange: 'transform', whiteSpace: 'nowrap' }}>
        {items.map((marca, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', padding: '0 2.5rem', whiteSpace: 'nowrap' }}>
              {marca}
            </span>
            <span style={{ color: 'rgba(201,168,76,0.25)', fontSize: 8 }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
