import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/index.jsx';

const API = 'https://nicheclub-backend-production.up.railway.app';

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
  'Aromatico': '#78b890', 'Violeta': '#b090d0', 'Picante Quente': '#d87840',
  'Picante Fresco': '#88d0b0',
};

function corAcorde(nome) {
  if (!nome) return '#c9a84c';
  return COR_ACORDE[nome] || '#c9a84c';
}

// ─── Modal de Edição ───────────────────────────────────────────────────────
function ModalEditar({ frasco, onFechar, onSalvo }) {
  const { token } = useAuth();
  const [mlTotal, setMlTotal] = useState(String(frasco.ml_total || ''));
  const [mlVendido, setMlVendido] = useState(String(frasco.ml_vendido || '0'));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async () => {
    setSalvando(true); setErro('');
    try {
      const res = await fetch(`${API}/api/admin/frascos/${frasco.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ml_total: Number(mlTotal), ml_vendido: Number(mlVendido) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao salvar');
      onSalvo();
    } catch(e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1a1810', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 400 }}>
        <h3 style={{ color: '#f0ece0', marginBottom: 4, fontSize: '1.1rem' }}>Editar Frasco</h3>
        <p style={{ color: 'rgba(240,236,224,0.5)', fontSize: 13, marginBottom: '1.5rem' }}>{frasco.nome} — {frasco.marca}</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', display: 'block', marginBottom: 6 }}>ML Total</label>
          <input type="number" value={mlTotal} onChange={e => setMlTotal(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, color: '#f0ece0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', display: 'block', marginBottom: 6 }}>ML Vendido</label>
          <input type="number" value={mlVendido} onChange={e => setMlVendido(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, color: '#f0ece0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          <p style={{ fontSize: 11, color: 'rgba(240,236,224,0.3)', marginTop: 4 }}>
            Disponível: {Math.max(0, Number(mlTotal) - Number(mlVendido))}ml
          </p>
        </div>

        {erro && <p style={{ color: '#e84040', fontSize: 12, marginBottom: 12 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onFechar} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(240,236,224,0.2)', borderRadius: 4, color: 'rgba(240,236,224,0.6)', fontSize: 13, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={salvar} disabled={salvando} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, color: '#0d0b07', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: salvando ? 0.7 : 1 }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Confirmação de Exclusão ─────────────────────────────────────
function ModalExcluir({ frasco, onFechar, onExcluido }) {
  const { token } = useAuth();
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  const excluir = async () => {
    setExcluindo(true); setErro('');
    try {
      const res = await fetch(`${API}/api/admin/frascos/${frasco.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao excluir');
      onExcluido();
    } catch(e) {
      setErro(e.message);
      setExcluindo(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1a1810', border: '1px solid rgba(232,64,64,0.3)', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 400 }}>
        <h3 style={{ color: '#f0ece0', marginBottom: 4, fontSize: '1.1rem' }}>Excluir Frasco</h3>
        <p style={{ color: 'rgba(240,236,224,0.5)', fontSize: 13, marginBottom: '1.5rem' }}>
          Tem certeza que deseja excluir o frasco de <b style={{ color: '#f0ece0' }}>{frasco.nome}</b>?
          <br /><span style={{ color: '#e84040', fontSize: 12 }}>Esta ação não pode ser desfeita.</span>
        </p>

        {erro && <p style={{ color: '#e84040', fontSize: 12, marginBottom: 12 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onFechar} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(240,236,224,0.2)', borderRadius: 4, color: 'rgba(240,236,224,0.6)', fontSize: 13, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={excluir} disabled={excluindo} style={{ flex: 1, padding: '10px', background: '#c0392b', border: 'none', borderRadius: 4, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: excluindo ? 0.7 : 1 }}>
            {excluindo ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card do Frasco ────────────────────────────────────────────────────────
function FrascoCard({ perfume, isAdmin, onEditar, onExcluir }) {
  const [hovered, setHovered] = useState(false);
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = total > 0 ? Math.round((disponivel / total) * 100) : 0;
  const esgotado = disponivel === 0;
  const precoMin = perfume.opcoes?.[0]?.preco;
  const acordes = [perfume.acorde1, perfume.acorde2, perfume.acorde3, perfume.acorde4, perfume.acorde5].filter(Boolean);

  return (
    <div style={{ position: 'relative' }}>
      <Link to={`/perfume/${perfume.perfume_id || perfume.id}`}
        style={{ display: 'block', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e4dc', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.3s, border-color 0.3s', transform: hovered ? 'translateY(-6px)' : 'translateY(0)', borderColor: hovered ? 'rgba(201,168,76,0.5)' : '#e8e4dc' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 200 }}>
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

          <div style={{ padding: '12px 12px 12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 4 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6020', marginBottom: 6, fontWeight: 600 }}>Principais acordes</p>
            {acordes.length > 0 ? acordes.map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 18, borderRadius: 3, background: corAcorde(a), display: 'flex', alignItems: 'center', paddingLeft: 8, overflow: 'hidden' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{a}</span>
                </div>
              </div>
            )) : <p style={{ fontSize: 11, color: '#ccc', fontStyle: 'italic' }}>—</p>}

            {perfume.rating_valor && (
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{Number(perfume.rating_valor).toFixed(1)}</span>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ fontSize: 10, color: s <= Math.round(perfume.rating_valor) ? '#c9a84c' : 'rgba(201,168,76,0.2)' }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 10, color: '#888' }}>({perfume.rating_count?.toLocaleString()})</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6020', marginBottom: 3, fontWeight: 600 }}>{perfume.marca}</p>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: 4, lineHeight: 1.2 }}>{perfume.nome}</h3>
          {perfume.genero && <p style={{ fontSize: 11, color: '#111', marginBottom: 8 }}>{perfume.genero}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#111', marginBottom: 4 }}>
            <span>{disponivel}ml disponível</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: '0.75rem' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: `${100 - pct}%`, transition: 'width 0.5s' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {precoMin
              ? <p style={{ fontSize: 13, color: '#111' }}>A partir de <span style={{ color: '#c9a84c', fontWeight: 700 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>
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
export default function Frascos() {
  const { token } = useAuth();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscaInput, setBuscaInput] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalExcluir, setModalExcluir] = useState(null);
  const LIMITE = 12;

  const isAdmin = !!token;

  const carregar = async (pag = 1, termo = busca, reset = false) => {
    if (pag === 1) setLoading(true);
    try {
      const res = await api.frascos({ pagina: pag, limite: LIMITE, busca: termo });
      const lista = res.frascos || res.perfumes || res;
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

  const recarregar = () => carregar(1, busca, true);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>

      {/* Modais */}
      {modalEditar && (
        <ModalEditar
          frasco={modalEditar}
          onFechar={() => setModalEditar(null)}
          onSalvo={() => { setModalEditar(null); recarregar(); }}
        />
      )}
      {modalExcluir && (
        <ModalExcluir
          frasco={modalExcluir}
          onFechar={() => setModalExcluir(null)}
          onExcluido={() => { setModalExcluir(null); recarregar(); }}
        />
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '2rem 2rem 3rem' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.75rem', fontWeight: 500 }}>Decants</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Perfumes <span style={{ color: 'rgb(122, 96, 32)' }}>Disponíveis</span>
        </h1>
        <p style={{ fontSize: 15, color: '#888', marginBottom: '2rem' }}>
          {total > 0 ? `${total} fragrâncias` : 'Experimente fragrâncias premium!'}
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
              <FrascoCard
                key={p.id}
                perfume={p}
                isAdmin={isAdmin}
                onEditar={setModalEditar}
                onExcluir={setModalExcluir}
              />
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
