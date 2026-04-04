import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/index.jsx';

// ─── Card do Perfume Lacrado ──────────────────────────────────────────────
function LacradoCard({ perfume }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <Link to={`/perfume/${perfume.perfume_id || perfume.id}`}
        style={{ display: 'block', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e4dc', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.3s, border-color 0.3s', transform: hovered ? 'translateY(-6px)' : 'translateY(0)', borderColor: hovered ? 'rgba(201,168,76,0.5)' : '#e8e4dc' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, overflow: 'hidden' }}>
          <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome}
            style={{ width: '100%', height: 240, objectFit: 'contain', padding: 12, transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s' }}
          />
          {perfume.estoque === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', color: '#e84040', textTransform: 'uppercase', border: '2px solid #e84040', padding: '4px 12px' }}>Esgotado</span>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6020', marginBottom: 3, fontWeight: 600 }}>{perfume.marca}</p>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: 4, lineHeight: 1.2 }}>{perfume.nome}</h3>
          {perfume.genero && <p style={{ fontSize: 11, color: '#111', marginBottom: 16 }}>{perfume.genero}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {perfume.preco
              ? <p style={{ fontSize: 13, color: '#111' }}>
                  <span style={{ color: '#c9a84c', fontWeight: 700 }}>R$ {Number(perfume.preco).toFixed(2).replace('.', ',')}</span>
                </p>
              : <p style={{ fontSize: 12, color: 'rgb(122, 96, 32)' }}>Consultar preço</p>
            }
            <span style={{ fontSize: 10, color: 'rgb(122, 96, 32)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ver →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────
export default function Lacrados() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscaInput, setBuscaInput] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMITE = 12;

  const carregar = async (pag = 1, termo = busca, reset = false) => {
    if (pag === 1) setLoading(true);
    try {
      const res = await api.lacrados({ pagina: pag, limite: LIMITE, busca: termo });
      const lista = res.lacrados || res.perfumes || res;
      if (reset || pag === 1) setPerfumes(lista);
      else setPerfumes(prev => [...prev, ...lista]);
      setTotal(res.total || lista.length);
      setPagina(pag);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(1, '', true); }, []);

  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); carregar(1, buscaInput, true); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '2rem 2rem 3rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#c9a84c' }}>
          Perfumes Lacrados
        </h1>
        <p style={{ fontSize: 15, color: '#888', marginBottom: '2rem' }}>
          {(() => { const disp = perfumes.filter(p => (p.estoque === undefined || p.estoque > 0)).length; return disp > 0 ? `${disp} fragrâncias disponíveis` : 'Fragrâncias originais e lacradas!'; })()}
        </p>

        {/* Busca */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#aaa' }}>🔍</span>
            <input
              value={buscaInput}
              onChange={e => setBuscaInput(e.target.value)}
              placeholder="Buscar perfume ou marca..."
              style={{ width: 300, background: '#f5f3ef', border: '1px solid #e0dcd4', color: '#111', padding: '10px 16px 10px 40px', fontSize: 13, outline: 'none', borderRadius: 2 }}
            />
            {buscaInput && (
              <button onClick={() => setBuscaInput('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#f0ece6', borderRadius: 12, height: 420 }} />
            ))}
          </div>
        ) : perfumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#aaa' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
            <p style={{ fontSize: 18 }}>Nenhum resultado para "{buscaInput}"</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {perfumes.map(p => (
              <LacradoCard key={p.id} perfume={p} />
            ))}
          </div>
        )}

        {perfumes.length < total && !loading && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button onClick={() => carregar(pagina + 1, busca)}
              style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', padding: '12px 36px', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>
              Carregar mais
            </button>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: '1rem' }}>{perfumes.length} de {total}</p>
          </div>
        )}
      </div>
    </div>
  );
}
