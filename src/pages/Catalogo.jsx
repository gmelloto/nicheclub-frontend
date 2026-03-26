import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Catalogo() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.perfumes()
      .then(setPerfumes)
      .catch(() => setPerfumes(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = perfumes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.marca.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #c8c0f0 0%, #e8d8c8 40%, #d8e8d0 100%)', minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(45,45,245,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: 800 }}>
          <p className="section-num" style={{ marginBottom: '1.5rem' }}>Drinkable IV Formula™ → Niche Club</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3.5rem, 9vw, 8rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.0, marginBottom: '1.5rem', color: '#0f0f1a' }}>
            Fragrance<br /><em style={{ fontStyle: 'italic' }}>Formula.</em>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(15,15,26,0.6)', marginBottom: '2.5rem', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.7, fontWeight: 300 }}>
            Perfumaria de nicho fracionada. Cada fragrância, do 3ml ao frasco completo.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#colecao" style={{ background: 'var(--blue)', color: '#fff', padding: '14px 32px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-block' }}>
              Explore the Range
            </a>
            <a href="#como-funciona" style={{ background: '#fff', color: 'var(--text)', padding: '14px 32px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-block', border: 'none' }}>
              Como Funciona
            </a>
          </div>
        </div>

        {/* Tags credenciais */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['01 / 100% Original', '02 / Frete 24h', '03 / Estoque Limitado', '04 / APC Disponível'].map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Shop by solution */}
      <div id="colecao" style={{ maxWidth: 1280, margin: '0 auto', padding: '6rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem' }}>
          <div>
            <p className="section-num">01 / Our Formulas</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, letterSpacing: '-0.01em' }}>
              Shop by<br /><em>fragrance</em>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Search_"
              style={{ maxWidth: 200, background: 'transparent', border: 'none', borderBottom: '2px solid var(--text)', borderRadius: 0, padding: '8px 0', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', outline: 'none', color: 'var(--text)' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{filtrados.length} results</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 360 }} />
                <div style={{ padding: '1.5rem 0' }}>
                  <div className="skeleton" style={{ height: 11, width: '40%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 22, width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtrados.map((p, i) => <PerfumeCard key={p.id} perfume={p} delay={i * 70} />)}
          </div>
        )}
      </div>

      {/* Why we exist */}
      <div style={{ background: '#0f0f1a', padding: '8rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="section-num" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>02 / Why We Exist</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, color: '#f5f5f0', lineHeight: 1.2, marginBottom: '3rem' }}>
            Criamos o Niche Club para democratizar a perfumaria de nicho. Grandes fragrâncias, sem o compromisso do frasco completo.
          </h2>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            {[{ n: '+200', l: 'Fragrâncias' }, { n: '3ml', l: 'Menor Dose' }, { n: '24h', l: 'Envio' }, { n: '100%', l: 'Originais' }].map(s => (
              <div key={s.n}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#f5f5f0', fontWeight: 400, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '3rem' }}>
            <a href="#colecao" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', background: 'var(--blue)', padding: '14px 28px', borderRadius: 'var(--radius-pill)' }}>
              Explore our formulas
            </a>
          </div>
        </div>
      </div>

      {/* Como funciona */}
      <div id="como-funciona" style={{ maxWidth: 1280, margin: '0 auto', padding: '6rem 2rem' }}>
        <p className="section-num">03 / The Process</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, marginBottom: '4rem', letterSpacing: '-0.01em' }}>
          Simples como deve ser.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { n: '001', t: 'Escolha', d: 'Navegue pelo catálogo. Selecione a fragrância e o tamanho — de 3ml a APC.' },
            { n: '002', t: 'Pague', d: 'Pix ou cartão em até 12x via PagSeguro. Aprovação imediata.' },
            { n: '003', t: 'Receba', d: 'Enviamos em até 24h para todo o Brasil. Atualizações via WhatsApp.' },
          ].map(s => (
            <div key={s.n} style={{ padding: '2.5rem', background: 'var(--bg2)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', color: 'var(--border)', fontWeight: 400, lineHeight: 1, marginBottom: '1.5rem', fontStyle: 'italic' }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 400, marginBottom: '1rem' }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clean label */}
      <div style={{ background: 'linear-gradient(135deg, #e8e4f8 0%, #f8f0e8 100%)', padding: '5rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p className="section-num" style={{ marginBottom: '2rem' }}>04 / Our Promise</p>
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {['01 / 100% Originais', '02 / Estoque Controlado', '03 / Fracionamento Preciso', '04 / Embalagem Segura', '05 / WhatsApp Direto'].map(t => (
            <span key={t} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text2)' }}>{t}</span>
          ))}
        </div>
        <Link to="/carrinho" style={{ background: 'var(--blue)', color: '#fff', padding: '16px 40px', borderRadius: 'var(--radius-pill)', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block' }}>
          Shop All Fragrances
        </Link>
      </div>
    </div>
  );
}

function PerfumeCard({ perfume, delay }) {
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = Math.min(100, Math.round((disponivel / total) * 100));
  const precoMin = perfume.opcoes?.[0]?.preco;
  const esgotando = pct >= 75;
  const [hovered, setHovered] = useState(false);

  const gradients = [
    'linear-gradient(160deg, #c8d8f0 0%, #e8c8f0 100%)',
    'linear-gradient(160deg, #f0e8c8 0%, #c8f0e8 100%)',
    'linear-gradient(160deg, #f0c8c8 0%, #f0e8c8 100%)',
    'linear-gradient(160deg, #c8f0d8 0%, #c8d8f0 100%)',
  ];
  const gradIdx = (perfume.nome.length) % gradients.length;

  return (
    <Link to={`/perfume/${perfume.id}`} className="fade-in" style={{
      animationDelay: `${delay}ms`, opacity: 0, display: 'block',
      transition: 'transform 0.3s ease',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem */}
      <div style={{ position: 'relative', height: 360, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: gradients[gradIdx], marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.4s ease' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '5rem', fontWeight: 700, color: 'rgba(15,15,26,0.12)', fontStyle: 'italic', letterSpacing: '-0.03em', lineHeight: 1 }}>{perfume.nome.split(' ')[0]}</div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(15,15,26,0.35)', marginTop: 12 }}>{perfume.familia_olfativa}</div>
            </div>
        }
        {/* Badges */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="badge-neon" style={{ fontSize: 10 }}>{perfume.familia_olfativa?.split(' ')[0].toUpperCase()}</span>
          {esgotando && <span style={{ background: 'rgba(255,255,255,0.85)', color: '#c00', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Últimas unidades</span>}
        </div>
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <span style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--text)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>+</span>
        </div>
        {/* Estoque bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.08)' }}>
          <div style={{ height: '100%', background: esgotando ? '#e03030' : 'var(--blue)', width: `${100 - pct}%` }} />
        </div>
      </div>

      {/* Info */}
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text3)' }}>{perfume.marca}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{disponivel}ml disp.</span>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 400, marginBottom: 6, color: 'var(--text)', letterSpacing: '-0.01em' }}>{perfume.nome}</h3>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, fontStyle: 'italic' }}>{perfume.familia_olfativa}</p>
        {precoMin && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>A partir de R$ {Number(precoMin).toFixed(2).replace('.', ',')}</p>
            <span style={{ background: 'var(--blue)', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>+</span>
          </div>
        )}
      </div>
    </Link>
  );
}

const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'MFK', familia_olfativa: 'Amadeirado Floral', ml_disponivel: 38, ml_total: 100, opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', familia_olfativa: 'Oriental', ml_disponivel: 220, ml_total: 250, opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Neroli Portofino', marca: 'Tom Ford', familia_olfativa: 'Cítrico', ml_disponivel: 12, ml_total: 100, opcoes: [{ preco: 35 }] },
  { id: '4', nome: 'Rose Prick', marca: 'Tom Ford', familia_olfativa: 'Floral', ml_disponivel: 105, ml_total: 150, opcoes: [{ preco: 40 }] },
];
