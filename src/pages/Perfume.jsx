import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/index.jsx';

const TAMANHOS = [
  { key: 'apc', label: 'APC +50ml', ml: 50 },
  { key: '3ml', label: '3ml', ml: 3 },
  { key: '5ml', label: '5ml', ml: 5 },
  { key: '10ml', label: '10ml', ml: 10 },
  { key: '15ml', label: '15ml', ml: 15 },
];

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
function corAcorde(n) { return COR_ACORDE[n] || '#c9a84c'; }

const NOTA_IMG = {
  'almíscar': '/almiscar.jpg',
  'almiscar': '/almiscar.jpg',
  'âmbar': '/ambar.jpg',
  'ambar': '/ambar.jpg',
  'bergamota': '/bergamota.jpg',
  'cedro': '/cedro.jpg',
  'jasmim': '/jasmim.jpg',
  'limão': '/limao.jpg',
  'limao': '/limao.jpg',
  'caramelo': '/caramelo.jpg',
  'orris': '/orris.jpg',
  'raiz de orris': '/orris.jpg',
  'notas frutadas': '/notas-frutadas.jpg',
  'notas balsâmicas': '/balsamic-notes.jpg',
  'balsâmico': '/balsamic-notes.jpg',
  'balsamic notes': '/balsamic-notes.jpg',
};

function notaImg(nota) {
  if (!nota) return null;
  const key = nota.toLowerCase().trim();
  return NOTA_IMG[key] || null;
}

const C = {
  bg: '#ffffff', bg2: '#f8f7f4', border: '#e8e4dc',
  text: '#0d0b07', text2: '#5a5550', text3: '#9a9080',
  gold: '#8a6a10', goldLight: '#c9a84c', goldBg: '#fdf8ee',
};

const LABEL = { fontSize: 11, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.6rem' };

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionar } = useCart();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [mlAvulso, setMlAvulso] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [reservas, setReservas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.perfume(id)
      .then(p => { setPerfume(p); return api.reservasPerfume(p.id); })
      .then(setReservas)
      .catch(() => setPerfume(DEMO))
      .finally(() => setLoading(false));
  }, [id]);

  const opcaoSel = perfume?.opcoes?.find(o => o.tamanho === selecionado);
  const disponivel = Number(perfume?.ml_disponivel || 0);
  const total = Number(perfume?.ml_total || 100);
  const pct = total > 0 ? Math.min(100, Math.round((disponivel / total) * 100)) : 0;
  const esgotado = disponivel === 0;
  const precoPorMl = opcaoSel ? (Number(opcaoSel.preco) / (opcaoSel.ml || 1)).toFixed(2) : null;
  const totalAvulso = mlAvulso && precoPorMl ? (Number(mlAvulso) * Number(precoPorMl)).toFixed(2) : null;
  const acordes = [perfume?.acorde1, perfume?.acorde2, perfume?.acorde3, perfume?.acorde4, perfume?.acorde5].filter(Boolean);

  const handleReservar = async () => {
    if (!nome || !telefone) return setMsg('Preencha nome e telefone.');
    if (!selecionado && !mlAvulso) return setMsg('Escolha um tamanho ou quantidade avulsa.');
    setSalvando(true); setMsg('');
    try {
      const res = await api.reservar({
        perfume_id: perfume.id,
        nome, telefone,
        tamanho: selecionado || null,
        ml_avulso: mlAvulso ? Number(mlAvulso) : null,
      });
      setMsg(res.mensagem || '✓ Reserva confirmada!');
      setNome(''); setTelefone(''); setSelecionado(null); setMlAvulso('');
      const novasReservas = await api.reservasPerfume(perfume.id);
      setReservas(novasReservas);
    } catch(e) {
      setMsg(e.message || 'Erro ao reservar.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.goldLight}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!perfume) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.text3 }}>Perfume não encontrado.</p>
    </div>
  );

  const notas_topo = perfume.notas_topo?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_coracao = perfume.notas_coracao?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_base = perfume.notas_base?.split(',').map(n => n.trim()).filter(Boolean) || [];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>

      {/* Voltar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.75rem 2.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text3, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = C.text3}
        >← Voltar</button>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.4rem', fontWeight: 600 }}>{perfume.marca}</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.6rem', letterSpacing: '-0.02em', color: C.text }}>{perfume.nome}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {perfume.genero && <span style={{ fontSize: 12, color: C.text2 }}>{perfume.genero}</span>}
          {perfume.ano && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.ano}</span></>}
          {perfume.pais && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.pais}</span></>}
          {perfume.perfumista1 && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.perfumista1.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span></>}
        </div>
      </div>

      {/* Layout 50/50 */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 2.5rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Coluna esquerda */}
        <div>
          {/* Foto + acordes */}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'min(55vh, 400px)' }}>
            <div style={{ background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${C.border}` }}>
              <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
            </div>
            <div style={{ background: C.bg2, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{ ...LABEL, fontSize: 9, marginBottom: 6 }}>Principais Acordes</p>
              {acordes.map(a => (
                <div key={a} style={{ height: 24, borderRadius: 3, background: corAcorde(a), display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.65)', whiteSpace: 'nowrap' }}>{a}</span>
                </div>
              ))}
              {perfume.rating_valor && (
                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{Number(perfume.rating_valor).toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: 1 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, color: s <= Math.round(perfume.rating_valor) ? C.goldLight : C.border }}>★</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: C.text3 }}>({perfume.rating_count?.toLocaleString()} avaliações)</p>
                </div>
              )}
            </div>
          </div>

          {/* Pirâmide */}
          {(notas_topo.length > 0 || notas_coracao.length > 0 || notas_base.length > 0) && (
            <div style={{ marginTop: '1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: C.text }}>Pirâmide Olfativa</h3>
              {notas_topo.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={LABEL}>Topo</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_topo.map(n => <NotaBadge key={n} nota={n} img={notaImg(n)} />)}
                  </div>
                </div>
              )}
              {notas_coracao.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={LABEL}>Coração</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_coracao.map(n => <NotaBadge key={n} nota={n} img={notaImg(n)} />)}
                  </div>
                </div>
              )}
              {notas_base.length > 0 && (
                <div>
                  <p style={LABEL}>Base</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_base.map(n => <NotaBadge key={n} nota={n} img={notaImg(n)} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coluna direita */}
        <div>
          {perfume.descricao && <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.8, marginBottom: '1rem' }}>{perfume.descricao}</p>}

          <div style={{ height: 1, background: C.border, marginBottom: '1rem' }} />

          {/* Disponibilidade */}
          <p style={{ ...LABEL }}>Disponibilidade</p>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '0.85rem 1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: esgotado ? '#c0392b' : C.goldLight }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: esgotado ? '#c0392b' : C.text }}>{esgotado ? 'Esgotado' : 'Disponível'}</span>
              </div>
              <span style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{disponivel}ml de {total}ml</span>
            </div>
            <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg,${C.goldLight},#e8c870)`, borderRadius: 2, width: `${100 - pct}%` }} />
            </div>
          </div>

          {/* Escolha sua opção */}
          <p style={{ ...LABEL, marginBottom: '0.75rem' }}>Escolha sua opção</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
            {TAMANHOS.map(t => {
              const opcao = perfume.opcoes?.find(o => o.tamanho === t.key);
              if (!opcao) return null;
              const disp = disponivel >= t.ml;
              const sel = selecionado === t.key;
              return (
                <button key={t.key} onClick={() => { if (disp) { setSelecionado(t.key); setMlAvulso(''); } }}
                  disabled={!disp}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 4, border: sel ? `1px solid ${C.goldLight}` : `1px solid ${C.border}`, background: sel ? C.goldBg : C.bg, cursor: disp ? 'pointer' : 'not-allowed', opacity: disp ? 1 : 0.45, transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (disp && !sel) e.currentTarget.style.borderColor = C.goldLight; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? C.goldLight : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.goldLight }} />}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, color: C.text, fontWeight: sel ? 600 : 400, textAlign: 'left' }}>
                    {t.label}{!disp && <span style={{ fontSize: 11, color: C.text3, marginLeft: 8 }}>— indisponível</span>}
                  </span>
                  <span style={{ fontSize: 14, color: sel ? C.gold : C.text2, fontWeight: 600 }}>R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}</span>
                </button>
              );
            })}
          </div>

          {/* Quantidade avulsa */}
          <p style={{ ...LABEL, marginBottom: '0.6rem' }}>Ou escolha a quantidade avulsa</p>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="number" min="1" max={disponivel} placeholder="Quantos ml"
              value={mlAvulso}
              onChange={e => { setMlAvulso(e.target.value); setSelecionado(null); }}
              style={{ width: 130, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px', fontSize: 14, color: C.text, outline: 'none' }}
            />
            {mlAvulso && precoPorMl && (
              <span style={{ fontSize: 14, color: C.text2 }}>× R$ {precoPorMl}/ml = <strong style={{ color: C.gold }}>R$ {totalAvulso}</strong></span>
            )}
            {!precoPorMl && <span style={{ fontSize: 13, color: C.text3 }}>× preço/ml</span>}
          </div>

          {/* Nome e telefone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.text3, marginBottom: 4 }}>Seu nome</label>
              <input placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.text3, marginBottom: 4 }}>Telefone / WhatsApp</label>
              <input placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, outline: 'none' }} />
            </div>
          </div>

          {/* Mensagem de feedback */}
          {msg && <p style={{ fontSize: 13, color: msg.includes('✓') || msg.includes('confirmada') ? '#2a7a2a' : '#c0392b', marginBottom: '0.75rem', fontWeight: 500 }}>{msg}</p>}

          {/* Botão Reservar */}
          <button onClick={handleReservar} disabled={salvando || esgotado}
            style={{ width: '100%', padding: '14px', borderRadius: 4, background: esgotado ? C.bg2 : `linear-gradient(135deg,${C.goldLight},#e8c870)`, border: `1px solid ${esgotado ? C.border : C.goldLight}`, cursor: esgotado ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: esgotado ? C.text3 : '#0d0b07', transition: 'all 0.2s', opacity: salvando ? 0.7 : 1 }}
          >
            {salvando ? 'Reservando...' : esgotado ? 'Esgotado' : 'Reservar'}
          </button>

          {/* Lista de reservas */}
          {reservas.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ ...LABEL, fontSize: 12, marginBottom: '0.75rem' }}>Reservas ({reservas.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reservas.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span style={{ fontSize: 14, color: C.text }}>{r.nome}</span>
                    </div>
                    <span style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{r.tamanho}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfumista */}
          {(perfume.perfumista1 || perfume.perfumista2) && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: '0.4rem' }}>Perfumista</p>
              <p style={{ fontSize: 14, color: C.text2 }}>{[perfume.perfumista1, perfume.perfumista2].filter(Boolean).join(' & ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotaBadge({ nota, img }) {
  if (img) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 72 }}>
        <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0d8c8', background: '#fff' }}>
          <img src={img} alt={nota} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: 10, color: '#4a4440', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{nota}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: 72 }}>
      <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f0ede8', border: '1px solid #e0d8c8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22 }}>🌿</span>
      </div>
      <span style={{ fontSize: 10, color: '#4a4440', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{nota}</span>
    </div>
  );
}

const DEMO = {
  id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian',
  genero: 'Unissex', pais: 'França', ano: 2015, rating_valor: 4.75, rating_count: 12500,
  descricao: 'Uma criação icônica com notas de jasmim, açafrão, cedro e ambrofix.',
  ml_disponivel: 62, ml_total: 100,
  notas_topo: 'açafrão, jasmim', notas_coracao: 'ambrofix, fava tonka', notas_base: 'cedro, resina',
  acorde1: 'Floral', acorde2: 'Amadeirado', acorde3: 'Adocicado', acorde4: 'Âmbar',
  perfumista1: 'Francis Kurkdjian',
  opcoes: [
    { tamanho: 'apc', preco: 320, ml: 50 }, { tamanho: '3ml', preco: 38, ml: 3 },
    { tamanho: '5ml', preco: 58, ml: 5 }, { tamanho: '10ml', preco: 105, ml: 10 }, { tamanho: '15ml', preco: 148, ml: 15 },
  ],
};
