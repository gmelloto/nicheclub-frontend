import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Catalogo() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tab, setTab] = useState('decants');

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
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '5rem 2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: 20, padding: '6px 14px', marginBottom: '1.5rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>Perfumaria de nicho fracionada</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Descubra as melhores<br />
              <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                fragrâncias do mundo
              </span>
            </h1>
            <p style={{ color: 'var(--text2)', maxWidth: 480, lineHeight: 1.8, marginBottom: '2.5rem', fontSize: 16, fontWeight: 300 }}>
              Explore os maiores nomes da perfumaria mundial em doses de 3ml a 15ml — sem compromisso, com toda a experiência.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#catalogo" style={{ padding: '13px 28px', background: 'var(--grad)', color: '#fff', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(79,110,247,0.3)' }}>
                Ver catálogo →
              </a>
              <Link to="/" style={{ padding: '12px 28px', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 400, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Como funciona
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
              {[{ n: '+200', l: 'Fragrâncias' }, { n: '3ml', l: 'Menor dose' }, { n: '100%', l: 'Originais' }].map(s => (
                <div key={s.n}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards flutuantes */}
          <div style={{ position: 'relative', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 20, right: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', minWidth: 210, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Mais vendido hoje</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Baccarat Rouge 540</div>
              <div style={{ fontSize: 12, color: 'var(--blue)' }}>MFK · 5ml · R$ 58,00</div>
            </div>
            <div style={{ position: 'absolute', bottom: 40, left: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', minWidth: 200, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>Estoque limitado</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Neroli Portofino</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: 'var(--bg3)', borderRadius: 3 }}>
                  <div style={{ width: '12%', height: '100%', background: '#dc2626', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>12ml</span>
              </div>
            </div>
            <div style={{ width: 260, height: 340, background: 'linear-gradient(160deg, var(--bg3), var(--bg2))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--grad)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', boxShadow: '0 8px 24px rgba(79,110,247,0.3)' }}>N</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Niche Club</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Luxury Perfumes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <div id="catalogo" style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4 }}>
            {[{ key: 'decants', label: 'Decants' }, { key: 'lacrados', label: 'Perfumes Lacrados' }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 500, borderRadius: 6,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.key ? 'var(--grad)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text2)',
                boxShadow: tab === t.key ? '0 2px 8px rgba(79,110,247,0.3)' : 'none',
              }}>{t.label}</button>
            ))}
          </div>
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar perfume ou marca..."
            style={{ maxWidth: 280, padding: '9px 14px', fontSize: 13 }}
          />
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text2)' }}>{filtrados.length} fragrâncias disponíveis</span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg2)' }}>
                <div className="skeleton" style={{ height: 280 }} />
                <div style={{ padding: '1.25rem' }}>
                  <div className="skeleton" style={{ height: 11, width: '50%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 20, width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {filtrados.map((p, i) => <PerfumeCard key={p.id} perfume={p} delay={i * 50} />)}
          </div>
        )}
      </div>

      {/* Como funciona */}
      <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,108,247,0.08)', border: '1px solid rgba(139,108,247,0.15)', borderRadius: 20, padding: '6px 14px', marginBottom: '1rem' }}>
              <span style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 500 }}>Simples como deve ser</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Como funciona</h2>
            <p style={{ color: 'var(--text2)', marginTop: '0.75rem', fontSize: 15 }}>Três passos simples para descobrir sua próxima fragrância favorita</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { n: '01', icon: '🛍️', t: 'Escolha o perfume', d: 'Navegue pelo catálogo e selecione o perfume e o tamanho — de 3ml a 15ml ou o frasco completo.', color: 'rgba(79,110,247,0.08)', border: 'rgba(79,110,247,0.15)', label: 'var(--blue)' },
              { n: '02', icon: '💳', t: 'Pague com segurança', d: 'Pix com aprovação imediata ou cartão de crédito em até 12x com total segurança via PagSeguro.', color: 'rgba(139,108,247,0.08)', border: 'rgba(139,108,247,0.15)', label: 'var(--purple)' },
              { n: '03', icon: '📦', t: 'Receba em casa', d: 'Enviamos em até 24h para todo o Brasil. Você recebe atualizações pelo WhatsApp.', color: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.15)', label: '#16a34a' },
            ].map(s => (
              <div key={s.n} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: s.label, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Passo {s.n}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, fontWeight: 300 }}>{s.d}</p>
              </div>
            ))}
          </div>
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
  const esgotando = pct >= 70;

  return (
    <Link to={`/perfume/${perfume.id}`} className="fade-in" style={{
      animationDelay: `${delay}ms`, opacity: 0,
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'block',
      transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
      boxShadow: 'var(--shadow)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'rgba(79,110,247,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ position: 'relative', height: 280, background: 'var(--bg3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ fontSize: '4rem', opacity: 0.06, fontWeight: 800, color: 'var(--text)' }}>N</div>
        }
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: 'rgba(79,110,247,0.1)', color: 'var(--blue)', border: '1px solid rgba(79,110,247,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500 }}>
            {perfume.familia_olfativa}
          </span>
        </div>
        {esgotando && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500 }}>
              Últimas unidades
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.06)' }}>
          <div style={{ height: '100%', background: esgotando ? '#dc2626' : 'var(--grad)', width: `${pct}%`, transition: 'width 0.5s' }} />
        </div>
      </div>
      <div style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 4, fontWeight: 500 }}>{perfume.marca}</p>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{perfume.nome}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {precoMin && <p style={{ fontSize: 13, color: 'var(--text2)' }}>a partir de <strong style={{ color: 'var(--blue)', fontWeight: 600 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</strong></p>}
          <p style={{ fontSize: 11, color: 'var(--text3)' }}>{disponivel}ml disp.</p>
        </div>
      </div>
    </Link>
  );
}

const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', familia_olfativa: 'Amadeirado Floral', ml_disponivel: 38, ml_total: 100, opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', familia_olfativa: 'Amadeirado Oriental', ml_disponivel: 220, ml_total: 250, opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Neroli Portofino', marca: 'Tom Ford', familia_olfativa: 'Cítrico Aromático', ml_disponivel: 12, ml_total: 100, opcoes: [{ preco: 35 }] },
  { id: '4', nome: 'Rose Prick', marca: 'Tom Ford', familia_olfativa: 'Floral', ml_disponivel: 105, ml_total: 150, opcoes: [{ preco: 40 }] },
  { id: '5', nome: 'Santal 33', marca: 'Le Labo', familia_olfativa: 'Amadeirado', ml_disponivel: 80, ml_total: 100, opcoes: [{ preco: 36 }] },
  { id: '6', nome: 'Another 13', marca: 'Le Labo', familia_olfativa: 'Almíscar', ml_disponivel: 25, ml_total: 100, opcoes: [{ preco: 38 }] },
];
