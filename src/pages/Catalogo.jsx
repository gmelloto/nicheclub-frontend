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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Hero */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '5rem 2rem 4rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '1rem' }}>
              Perfumaria de nicho fracionada
            </p>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
              Descubra o mundo<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>das fragrâncias</em><br />únicas
            </h1>
            <p style={{ color: 'var(--text2)', maxWidth: 440, lineHeight: 1.8, marginBottom: '2rem', fontSize: 15 }}>
              Explore os maiores nomes da perfumaria mundial em doses de 3ml a 15ml — sem compromisso, com toda a experiência.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#catalogo" style={{ padding: '13px 28px', background: 'var(--text)', color: '#fff', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Ver catálogo
              </a>
              <Link to="/como-funciona" style={{ padding: '12px 28px', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 'var(--radius)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Como funciona
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[{ n: '+200', l: 'Fragrâncias' }, { n: '5ml', l: 'Menor dose' }, { n: '100%', l: 'Originais' }, { n: '24h', l: 'Envio rápido' }].map(s => (
              <div key={s.n} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <div id="catalogo" style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
          {[{ key: 'decants', label: 'Decants' }, { key: 'lacrados', label: 'Perfumes Lacrados' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '12px 28px', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
              textTransform: 'uppercase', border: 'none', background: 'none', cursor: 'pointer',
              color: tab === t.key ? 'var(--text)' : 'var(--text2)',
              borderBottom: tab === t.key ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 }}>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar perfume ou marca..."
              style={{ maxWidth: 280, padding: '8px 14px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg2)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
          {filtrados.length} fragrâncias disponíveis
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 320 }} />
                <div style={{ padding: '1.25rem' }}>
                  <div className="skeleton" style={{ height: 11, width: '50%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 20, width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtrados.map((p, i) => <PerfumeCard key={p.id} perfume={p} delay={i * 50} />)}
          </div>
        )}
      </div>

      {/* Banner */}
      <div style={{ background: 'var(--text)', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Como funciona</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 400, color: '#fff', marginBottom: '3rem' }}>
          Simples como deve ser
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
          {[
            { n: '01', t: 'Escolha', d: 'Selecione o perfume e o tamanho desejado' },
            { n: '02', t: 'Pague', d: 'Pix ou cartão com total segurança' },
            { n: '03', t: 'Receba', d: 'Enviamos em até 24h para todo o Brasil' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center', maxWidth: 220 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 300 }}>{s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{s.t}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
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
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ position: 'relative', height: 300, background: 'var(--bg3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ fontSize: '5rem', opacity: 0.15, fontFamily: "'Playfair Display', serif" }}>N</div>
        }
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ background: 'var(--bg2)', color: 'var(--text2)', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {perfume.familia_olfativa}
          </span>
        </div>
        {esgotando && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span style={{ background: '#fff8e1', color: '#b8860b', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em' }}>
              Últimas unidades
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'var(--border)' }}>
          <div style={{ height: '100%', background: esgotando ? '#e6a817' : 'var(--gold)', width: `${pct}%`, transition: 'width 0.5s' }} />
        </div>
      </div>
      <div style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 4, fontWeight: 500 }}>{perfume.marca}</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 400, marginBottom: 8, color: 'var(--text)' }}>{perfume.nome}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {precoMin && <p style={{ fontSize: 13, color: 'var(--text2)' }}>a partir de <strong style={{ color: 'var(--text)', fontWeight: 500 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</strong></p>}
          </div>
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
