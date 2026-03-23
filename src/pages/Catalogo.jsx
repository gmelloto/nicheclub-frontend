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
    <div style={{ background: 'var(--bg)' }}>

      {/* Hero — estilo Apple, fundo preto */}
      <div style={{ background: 'var(--bg-black)', textAlign: 'center', padding: '5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
        <p className="apple-section-eyebrow" style={{ color: '#6e6e73', fontSize: 17, marginBottom: 8 }}>Niche Club</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#f5f5f7', marginBottom: '0.75rem' }}>
          Perfumaria<br />de Nicho.
        </h1>
        <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 300, color: '#6e6e73', marginBottom: '2rem', maxWidth: 560, margin: '0 auto 2rem' }}>
          Os maiores nomes do mundo em frações de 3ml a 15ml.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#colecao" style={{ background: '#0071e3', color: '#fff', padding: '12px 22px', borderRadius: 980, fontSize: 17, fontWeight: 400, cursor: 'pointer', display: 'inline-block' }}>Ver coleção</a>
          <a href="#como-funciona" style={{ color: '#2997ff', fontSize: 17, display: 'inline-flex', alignItems: 'center', padding: '12px 0' }}>Como funciona ›</a>
        </div>
      </div>

      {/* Grid de features — estilo Apple */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: '2px 0', background: 'var(--bg)' }}>
        {/* Card escuro grande */}
        <div style={{ background: '#1d1d1f', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 380 }}>
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              A partir de<br /><span style={{ fontSize: 48, color: '#f5f5f7' }}>3ml.</span>
            </p>
            <p style={{ fontSize: 17, color: '#6e6e73', marginTop: 12, lineHeight: 1.5 }}>Experimente antes de comprar o frasco completo.</p>
          </div>
          <a href="#colecao" style={{ color: '#2997ff', fontSize: 17, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 24 }}>Ver fragrâncias ›</a>
        </div>
        {/* Card claro */}
        <div style={{ background: '#fff', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 380 }}>
          <div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              100%<br />Originais.
            </p>
            <p style={{ fontSize: 17, color: '#6e6e73', marginTop: 12, lineHeight: 1.5 }}>Todos os perfumes são importados e autênticos.</p>
          </div>
          <a href="#colecao" style={{ color: '#0071e3', fontSize: 17, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 24 }}>Conheça ›</a>
        </div>
        {/* Card laranja/amarelo */}
        <div style={{ background: '#fbf0d9', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 280 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Entrega em<br /><span style={{ fontSize: 38 }}>24h.</span>
            </p>
            <p style={{ fontSize: 15, color: '#6e6e73', marginTop: 12 }}>Para todo o Brasil.</p>
          </div>
          <Link to="/carrinho" style={{ color: '#0071e3', fontSize: 17, marginTop: 24 }}>Comprar agora ›</Link>
        </div>
        {/* Card cinza */}
        <div style={{ background: '#f5f5f7', padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 280 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              APC disponível.
            </p>
            <p style={{ fontSize: 15, color: '#6e6e73', marginTop: 12, lineHeight: 1.5 }}>Frasco completo com 50ml para os favoritos.</p>
          </div>
          <a href="#colecao" style={{ color: '#0071e3', fontSize: 17, marginTop: 24 }}>Ver opções ›</a>
        </div>
      </div>

      {/* Catálogo */}
      <div id="colecao" style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>Todas as fragrâncias</h2>
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar"
            style={{ maxWidth: 220, background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 980, padding: '8px 16px', fontSize: 15, outline: 'none', color: '#1d1d1f' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 300 }} />
                <div style={{ padding: '1.25rem' }}>
                  <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 20, width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtrados.map((p, i) => <PerfumeCard key={p.id} perfume={p} delay={i * 60} />)}
          </div>
        )}
      </div>

      {/* Como funciona — fundo cinza Apple */}
      <div id="como-funciona" style={{ background: '#fff', padding: '5rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: '4rem' }}>
            Como funciona.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { num: '01', t: 'Escolha', d: 'Selecione a fragrância e o tamanho — de 3ml a 15ml ou APC.', icon: '🛍' },
              { num: '02', t: 'Pague', d: 'Pix ou cartão em até 12x via PagSeguro com total segurança.', icon: '💳' },
              { num: '03', t: 'Receba', d: 'Envio em até 24h. Atualizações pelo WhatsApp.', icon: '📦' },
            ].map(s => (
              <div key={s.num} style={{ background: 'var(--bg)', borderRadius: 18, padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{s.icon}</div>
                <div style={{ fontSize: 13, color: '#6e6e73', marginBottom: 8, fontWeight: 500 }}>{s.num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>{s.t}</h3>
                <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final — preto */}
      <div style={{ background: 'var(--bg-black)', padding: '5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 17, color: '#6e6e73', marginBottom: 12 }}>Niche Club</p>
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#f5f5f7', marginBottom: '2rem' }}>
          Sua próxima fragrância<br />favorita está aqui.
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#colecao" style={{ background: '#0071e3', color: '#fff', padding: '12px 22px', borderRadius: 980, fontSize: 17, cursor: 'pointer', display: 'inline-block' }}>Ver coleção</a>
          <Link to="/carrinho" style={{ color: '#2997ff', fontSize: 17, display: 'inline-flex', alignItems: 'center', padding: '12px 0' }}>Ir ao carrinho ›</Link>
        </div>
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

  return (
    <Link to={`/perfume/${perfume.id}`} className="fade-in" style={{
      animationDelay: `${delay}ms`, opacity: 0,
      background: '#fff', borderRadius: 18, overflow: 'hidden', display: 'block',
      transition: 'transform 0.3s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.015)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Imagem */}
      <div style={{ position: 'relative', height: 280, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, opacity: 0.1 }}>◈</div>
              <p style={{ fontSize: 12, color: '#6e6e73', marginTop: 8, letterSpacing: '0.05em' }}>{perfume.familia_olfativa}</p>
            </div>
        }
        {esgotando && (
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,59,48,0.9)', color: '#fff', padding: '4px 12px', borderRadius: 980, fontSize: 12, fontWeight: 500 }}>
            Últimas unidades
          </div>
        )}
        {/* Barra estoque */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.06)' }}>
          <div style={{ height: '100%', background: esgotando ? '#ff3b30' : '#34c759', width: `${100 - pct}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: 12, color: '#6e6e73', marginBottom: 4 }}>{perfume.marca}</p>
        <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8, color: '#1d1d1f' }}>{perfume.nome}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {precoMin && <p style={{ fontSize: 15, color: '#6e6e73' }}>A partir de <span style={{ color: '#1d1d1f', fontWeight: 500 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>}
          <p style={{ fontSize: 12, color: '#a1a1a6' }}>{disponivel}ml disp.</p>
        </div>
      </div>
    </Link>
  );
}

const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', familia_olfativa: 'Amadeirado Floral', ml_disponivel: 38, ml_total: 100, opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', familia_olfativa: 'Amadeirado Oriental', ml_disponivel: 220, ml_total: 250, opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Neroli Portofino', marca: 'Tom Ford', familia_olfativa: 'Cítrico', ml_disponivel: 12, ml_total: 100, opcoes: [{ preco: 35 }] },
  { id: '4', nome: 'Rose Prick', marca: 'Tom Ford', familia_olfativa: 'Floral', ml_disponivel: 105, ml_total: 150, opcoes: [{ preco: 40 }] },
];
