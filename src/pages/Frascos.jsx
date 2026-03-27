import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const COR_ACORDE = {
  'Floral': '#e8a0b0', 'Floral Branco': '#f0c8d8', 'Rosa': '#e87090',
  'Amadeirado': '#c8a878', 'Sândalo': '#d4b896', 'Cedro': '#b89060',
  'Oud': '#8a6030', 'Patchouli': '#9a7850',
  'Oriental': '#d4884c', 'Adocicado': '#e8b060', 'Baunilha': '#f0c878',
  'Âmbar': '#d4a040', 'Almiscarado': '#c8b8a0', 'Especiado': '#c87840',
  'Cítrico': '#e8d040', 'Fresco': '#78c8d8', 'Aromático': '#78b890',
  'Verde': '#88c878', 'Aquático': '#60b8d8', 'Marinho': '#4898c8',
  'Frutado': '#e87878', 'Gourmet': '#e8a060', 'Almiscarado Suave': '#d8c8b8',
  'Couro': '#a07848', 'Defumado': '#9898a8', 'Terroso': '#a08868',
  'Herbal': '#90b870', 'Mineral': '#a8b0b8', 'Tropical': '#f0b040',
};

function corAcorde(nome) {
  if (!nome) return '#c9a84c';
  return COR_ACORDE[nome] || '#c9a84c';
}

export default function Frascos() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMITE = 12;

  const carregar = async (pag = 1, termo = busca, reset = false) => {
    if (pag === 1) setLoading(true);
    try {
      const res = await api.perfumes({ pagina: pag, limite: LIMITE, busca: termo });
      const lista = res.perfumes || res;
      if (reset || pag === 1) setPerfumes(lista);
      else setPerfumes(prev => [...prev, ...lista]);
      setTotal(res.total || lista.length);
      setPagina(pag);
    } catch { if (pag === 1) setPerfumes(DEMO); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(1, '', true); }, []);

  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); carregar(1, buscaInput, true); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b07', color: '#f0ece0' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.75rem', fontWeight: 500 }}>Nossa Coleção</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Perfumes <span style={{ color: '#c9a84c' }}>Disponíveis</span>
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(240,236,224,0.5)', marginBottom: '2rem' }}>Experimente fragrâncias premium!</p>
        <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)} placeholder="Buscar perfume ou marca..."
          style={{ width: 300, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', color: '#f0ece0', padding: '10px 16px', fontSize: 13, outline: 'none', borderRadius: 2 }}
        />
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#1a1810', borderRadius: 12, height: 560 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {perfumes.map((p, i) => <FrascoCard key={p.id} perfume={p} />)}
          </div>
        )}

        {perfumes.length < total && !loading && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button onClick={() => carregar(pagina + 1, busca)}
              style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', padding: '12px 36px', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2 }}>
              Carregar mais
            </button>
            <p style={{ fontSize: 12, color: 'rgba(240,236,224,0.25)', marginTop: '1rem' }}>{perfumes.length} de {total}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FrascoCard({ perfume }) {
  const [hovered, setHovered] = useState(false);
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = total > 0 ? Math.round((disponivel / total) * 100) : 0;
  const esgotado = disponivel === 0;
  const precoMin = perfume.opcoes?.[0]?.preco;
  const acordes = [perfume.acorde1, perfume.acorde2, perfume.acorde3, perfume.acorde4, perfume.acorde5].filter(Boolean);

  return (
    <Link to={`/perfume/${perfume.id}`}
      style={{ display: 'block', background: '#111009', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)', transition: 'transform 0.3s, border-color 0.3s', transform: hovered ? 'translateY(-6px)' : 'translateY(0)', borderColor: hovered ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.1)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem + acordes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 200 }}>

        {/* Imagem */}
        <div style={{ background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, overflow: 'hidden' }}>
          <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome}
            style={{ width: '100%', height: 200, objectFit: 'contain', padding: 8, transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s' }}
          />
          {esgotado && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', color: '#e84040', textTransform: 'uppercase', border: '2px solid #e84040', padding: '4px 12px' }}>Esgotado</span>
            </div>
          )}
        </div>

        {/* Acordes barras */}
        <div style={{ padding: '12px 12px 12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 4 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: 6, fontWeight: 600 }}>Principais acordes</p>
          {acordes.length > 0 ? acordes.map(a => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 18, borderRadius: 3, background: corAcorde(a), display: 'flex', alignItems: 'center', paddingLeft: 8, overflow: 'hidden' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{a}</span>
              </div>
            </div>
          )) : (
            <p style={{ fontSize: 11, color: 'rgba(240,236,224,0.25)', fontStyle: 'italic' }}>—</p>
          )}

          {/* Rating */}
          {perfume.rating_valor && (
            <div style={{ marginTop: 'auto', paddingTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f0ece0' }}>{Number(perfume.rating_valor).toFixed(1)}</span>
                <div style={{ display: 'flex', gap: 1 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: 10, color: s <= Math.round(perfume.rating_valor) ? '#c9a84c' : 'rgba(201,168,76,0.2)' }}>★</span>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 10, color: 'rgba(240,236,224,0.3)' }}>({perfume.rating_count?.toLocaleString()})</p>
            </div>
          )}
        </div>
      </div>

      {/* Info inferior */}
      <div style={{ padding: '1rem 1.25rem' }}>
        {/* Nome e marca */}
        <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: 3, fontWeight: 500 }}>{perfume.marca}</p>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0ece0', marginBottom: 4, lineHeight: 1.2 }}>{perfume.nome}</h3>
        {perfume.genero && <p style={{ fontSize: 11, color: 'rgba(240,236,224,0.35)', marginBottom: 8 }}>{perfume.genero}</p>}

        {/* Barra estoque */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(240,236,224,0.4)', marginBottom: 4 }}>
          <span>{disponivel}ml disponível</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: '0.75rem' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: `${100 - pct}%`, transition: 'width 0.5s' }} />
        </div>

        {/* Preço */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {precoMin
            ? <p style={{ fontSize: 13, color: 'rgba(240,236,224,0.6)' }}>A partir de <span style={{ color: '#c9a84c', fontWeight: 700 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>
            : <p style={{ fontSize: 12, color: 'rgba(240,236,224,0.25)', fontStyle: 'italic' }}>Consultar preço</p>
          }
          <span style={{ fontSize: 10, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ver →</span>
        </div>
      </div>
    </Link>
  );
}

const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'MFK', genero: 'Unissex', ml_disponivel: 38, ml_total: 100, rating_valor: 4.7, rating_count: 12500, acorde1: 'Floral', acorde2: 'Amadeirado', acorde3: 'Adocicado', acorde4: 'Âmbar', opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', genero: 'Unissex', ml_disponivel: 0, ml_total: 100, rating_valor: 4.4, rating_count: 8200, acorde1: 'Oud', acorde2: 'Amadeirado', acorde3: 'Especiado', opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Santal 33', marca: 'Le Labo', genero: 'Unissex', ml_disponivel: 55, ml_total: 100, rating_valor: 4.1, rating_count: 6300, acorde1: 'Sândalo', acorde2: 'Almiscarado', acorde3: 'Couro', opcoes: [{ preco: 36 }] },
];
