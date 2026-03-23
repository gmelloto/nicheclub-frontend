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
      {/* Hero full screen */}
      <div style={{ position: 'relative', height: '100vh', background: '#1a1612', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,8,6,0.3) 0%, rgba(10,8,6,0.5) 60%, rgba(10,8,6,0.85) 100%)' }} />
        {/* Padrão de fundo sutil */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(154,125,58,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(154,125,58,0.05) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: '0 2rem', maxWidth: 800 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(201,168,80,0.9)', marginBottom: '2rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
            Perfumaria de Nicho Fracionada
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 300, color: '#fff', lineHeight: 1.05, letterSpacing: '0.05em', marginBottom: '2rem' }}>
            A Arte das<br /><em style={{ fontStyle: 'italic', color: 'rgba(201,168,80,0.9)' }}>Fragrâncias</em>
          </h1>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', maxWidth: 480, margin: '0 auto 3rem', lineHeight: 1.9 }}>
            Explore os maiores nomes da perfumaria mundial em doses de 3ml a 15ml
          </p>
          <a href="#colecao" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: 4, transition: 'border-color 0.3s' }}>
            Descobrir a Coleção
            <span style={{ fontSize: 14 }}>↓</span>
          </a>
        </div>
        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.3)' }} />
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Role</p>
        </div>
      </div>

      {/* Intro section */}
      <div style={{ background: 'var(--bg2)', padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>Nossa Filosofia</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, lineHeight: 1.2, marginBottom: '2rem' }}>
            Cada fragrância conta<br />uma história única
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2, maxWidth: 480, margin: '0 auto' }}>
            Acreditamos que descobrir um perfume é uma experiência íntima. Por isso oferecemos doses exclusivas dos maiores criadores do mundo — sem compromisso, com toda a sofisticação.
          </p>
          <div style={{ width: 40, height: 1, background: 'var(--gold)', margin: '3rem auto 0' }} />
        </div>
      </div>

      {/* Coleção */}
      <div id="colecao" style={{ padding: '6rem 3rem', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>A Coleção</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 300 }}>Nossas Fragrâncias</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar"
              style={{ maxWidth: 220, borderBottom: '1px solid var(--border2)', padding: '8px 0', fontSize: 11, letterSpacing: '0.1em', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)', outline: 'none', color: 'var(--text)' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.05em' }}>{filtrados.length} fragrâncias</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '3rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ paddingBottom: '140%', marginBottom: '1.5rem' }} />
                <div className="skeleton" style={{ height: 11, width: '40%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 18, width: '70%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '3rem 2rem' }}>
            {filtrados.map((p, i) => <PerfumeCard key={p.id} perfume={p} delay={i * 80} />)}
          </div>
        )}
      </div>

      {/* Banner editorial */}
      <div style={{ background: 'var(--black)', padding: '8rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(201,168,80,0.7)', marginBottom: '2rem' }}>Como Funciona</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1, marginBottom: '4rem' }}>
            Simples como<br /><em style={{ fontStyle: 'italic', color: 'rgba(201,168,80,0.8)' }}>deve ser</em>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', flexWrap: 'wrap' }}>
            {[
              { n: 'I', t: 'Escolha', d: 'Selecione o perfume e o tamanho desejado' },
              { n: 'II', t: 'Pague', d: 'Pix ou cartão com total segurança' },
              { n: 'III', t: 'Receba', d: 'Enviamos em até 24h para todo o Brasil' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center', maxWidth: 180 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'rgba(201,168,80,0.6)', marginBottom: '1rem', fontStyle: 'italic', fontWeight: 300 }}>{s.n}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.75rem', fontWeight: 400 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>{s.d}</div>
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
  const esgotando = pct >= 75;
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/perfume/${perfume.id}`} className="fade-in" style={{ animationDelay: `${delay}ms`, opacity: 0, display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem */}
      <div style={{ position: 'relative', paddingBottom: '130%', overflow: 'hidden', background: 'var(--bg3)', marginBottom: '1.25rem' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.8s ease' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '6rem', fontWeight: 300, color: 'var(--border2)', fontStyle: 'italic' }}>N</span>
            </div>
        }
        {esgotando && (
          <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.9)', padding: '4px 12px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
            Últimas Unidades
          </div>
        )}
        {/* Barra de estoque */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.2)' }}>
          <div style={{ height: '100%', background: esgotando ? '#c0392b' : 'rgba(201,168,80,0.8)', width: `${pct}%` }} />
        </div>
      </div>

      {/* Info */}
      <div>
        <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 6, fontWeight: 400 }}>{perfume.marca}</p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.35rem', fontWeight: 400, marginBottom: 6, color: 'var(--text)', letterSpacing: '0.02em', borderBottom: hovered ? '1px solid var(--text)' : '1px solid transparent', display: 'inline-block', transition: 'border-color 0.3s', paddingBottom: 2 }}>{perfume.nome}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {precoMin && <p style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.05em' }}>A partir de <span style={{ color: 'var(--text)', fontWeight: 400 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>}
          <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.05em' }}>{disponivel}ml</p>
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
