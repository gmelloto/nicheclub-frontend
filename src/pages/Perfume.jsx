import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const TAMANHOS = [
  { key: 'apc', label: 'APC +50ml', ml: 50 },
  { key: '3ml', label: '3ml', ml: 3 },
  { key: '5ml', label: '5ml', ml: 5 },
  { key: '10ml', label: '10ml', ml: 10 },
  { key: '15ml', label: '15ml', ml: 15 },
];

const COR_ACORDE = {
  'Floral': '#e8a0b0', 'Floral Branco': '#f0c8d8', 'Rosa': '#e87090',
  'Amadeirado': '#c8a878', 'Cedro': '#b89060', 'Oud': '#8a6030',
  'Oriental': '#d4884c', 'Adocicado': '#e8b060', 'Baunilha': '#f0c878',
  'Ambar': '#d4a040', 'Almiscarado': '#c8b8a0', 'Especiado': '#c87840',
  'Citrico': '#e8d040', 'Fresco': '#78c8d8', 'Aromatico': '#78b890',
  'Verde': '#88c878', 'Aquatico': '#60b8d8', 'Frutado': '#e87878',
  'Couro': '#a07848', 'Terroso': '#a08868', 'Tropical': '#f0b040',
  'Picante Fresco': '#d4a860', 'Sândalo': '#d4b896',
};
function corAcorde(n) { return COR_ACORDE[n] || '#c9a84c'; }

const C = {
  bg: '#ffffff', bg2: '#f8f7f4', border: '#e8e4dc',
  text: '#0d0b07', text2: '#5a5550', text3: '#9a9080',
  gold: '#8a6a10', goldLight: '#c9a84c', goldBg: '#fdf8ee',
};

const LBL = { fontSize: 11, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.5rem', display: 'block' };

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [mlAvulso, setMlAvulso] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [reservas, setReservas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [notasImgs, setNotasImgs] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    api.perfume(id)
      .then(p => {
        setPerfume(p);
        // Busca imagens das notas
        const todasNotas = [
          ...(p.notas_topo?.split(',').map(n => n.trim()).filter(Boolean) || []),
          ...(p.notas_coracao?.split(',').map(n => n.trim()).filter(Boolean) || []),
          ...(p.notas_base?.split(',').map(n => n.trim()).filter(Boolean) || []),
        ];
        if (todasNotas.length) {
          api.notasBatch(todasNotas).then(rows => {
            const map = {};
            (rows || []).forEach(r => {
              if (r.nota_ptb) map[r.nota_ptb.toLowerCase().trim()] = r.cloudinary_url || r.photo_url;
              if (r.nota_en) map[r.nota_en.toLowerCase().trim()] = r.cloudinary_url || r.photo_url;
            });
            setNotasImgs(map);
          }).catch(() => {});
        }
        return api.reservasPerfume(p.id).catch(() => []);
      })
      .then(r => setReservas(r || []))
      .catch(() => setPerfume(DEMO))
      .finally(() => setLoading(false));
  }, [id]);

  const opcaoSel = perfume?.opcoes?.find(o => o.tamanho === selecionado);
  const disponivel = Number(perfume?.ml_disponivel || 0);
  const total = Number(perfume?.ml_total || 0);
  const pct = total > 0 ? Math.min(100, Math.round((disponivel / total) * 100)) : 0;
  const esgotado = disponivel === 0;
  const precoPorMl = opcaoSel ? (Number(opcaoSel.preco) / (opcaoSel.ml_quantidade || opcaoSel.ml || 1)).toFixed(2) : null;
  const totalAvulso = mlAvulso && precoPorMl ? (Number(mlAvulso) * Number(precoPorMl)).toFixed(2) : null;
  const acordes = [perfume?.acorde1, perfume?.acorde2, perfume?.acorde3, perfume?.acorde4, perfume?.acorde5].filter(Boolean);
  const notas_topo = perfume?.notas_topo?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_coracao = perfume?.notas_coracao?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_base = perfume?.notas_base?.split(',').map(n => n.trim()).filter(Boolean) || [];

  const imgNota = (nota) => notasImgs[nota.toLowerCase().trim()] || null;

  const handleReservar = async () => {
    if (!nome || !telefone) return setMsg('Preencha nome e telefone.');
    if (!selecionado && !mlAvulso) return setMsg('Escolha um tamanho ou quantidade avulsa.');
    setSalvando(true); setMsg('');
    try {
      const res = await api.reservar({ perfume_id: perfume.id, nome, telefone, tamanho: selecionado || null, ml_avulso: mlAvulso ? Number(mlAvulso) : null });
      setMsg(res.mensagem || 'Reserva confirmada!');
      setNome(''); setTelefone(''); setSelecionado(null); setMlAvulso('');
      api.reservasPerfume(perfume.id).then(r => setReservas(r || [])).catch(() => {});
    } catch(e) { setMsg(e.message || 'Erro ao reservar.'); }
    finally { setSalvando(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #e8e4dc', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!perfume) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.text3 }}>Perfume nao encontrado.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <style>{`
        @media(max-width:768px){
          .perfume-grid{ grid-template-columns: 1fr !important; }
          .foto-acordes{ grid-template-columns: 1fr !important; height: auto !important; }
          .foto-acordes img{ height: 260px !important; }
        }
      `}</style>

      {/* Voltar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.75rem 2.5rem' }}>
        <button onClick={() => navigate(-1)}
          style={{ fontSize: 13, color: C.text3, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = C.text3}
        >&#8592; Voltar</button>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem 1.25rem', borderBottom: '1px solid #e8e4dc' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.4rem', fontWeight: 600 }}>{perfume.marca}</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>{perfume.nome}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {perfume.genero && <span style={{ fontSize: 12, color: C.text2 }}>{perfume.genero}</span>}
          {perfume.ano && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.ano}</span></>}
          {perfume.pais && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.pais}</span></>}
          {perfume.perfumista1 && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.perfumista1.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span></>}
          {perfume.rating_valor && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.gold }}>&#9733; {Number(perfume.rating_valor).toFixed(2)} <span style={{ color: C.text3 }}>({perfume.rating_count?.toLocaleString()})</span></span></>}
        </div>
      </div>

      {/* Grid 50/50 */}
      <div className="perfume-grid" style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 2.5rem 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ESQUERDA: foto + acordes + piramide + disponibilidade + reserva */}
        <div>
          {/* Foto + acordes */}
          <div className="foto-acordes" style={{ border: '1px solid #e8e4dc', borderRadius: 4, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', height: 380, marginBottom: '1rem' }}>
            <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #e8e4dc' }}>
              <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
            </div>
            <div style={{ background: C.bg2, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 6, fontWeight: 600 }}>Principais Acordes</p>
              {acordes.map(a => (
                <div key={a} style={{ height: 24, borderRadius: 3, background: corAcorde(a), display: 'flex', alignItems: 'center', paddingLeft: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.65)', whiteSpace: 'nowrap' }}>{a}</span>
                </div>
              ))}
              {perfume.rating_valor && (
                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #e8e4dc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{Number(perfume.rating_valor).toFixed(2)}</span>
                    <div>{[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 10, color: s <= Math.round(perfume.rating_valor) ? C.goldLight : C.border }}>&#9733;</span>)}</div>
                  </div>
                  <p style={{ fontSize: 10, color: C.text3 }}>({perfume.rating_count?.toLocaleString()} av.)</p>
                </div>
              )}
            </div>
          </div>

          {/* Piramide olfativa */}
          {(notas_topo.length > 0 || notas_coracao.length > 0 || notas_base.length > 0) && (
            <div style={{ background: C.bg2, border: '1px solid #e8e4dc', borderRadius: 4, padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: C.text }}>Piramide Olfativa</h3>
              {notas_topo.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={LBL}>Topo</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_topo.map(n => <NotaBadge key={n} nota={n} img={imgNota(n)} />)}
                  </div>
                </div>
              )}
              {notas_coracao.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={LBL}>Coracao</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_coracao.map(n => <NotaBadge key={n} nota={n} img={imgNota(n)} />)}
                  </div>
                </div>
              )}
              {notas_base.length > 0 && (
                <div>
                  <span style={LBL}>Base</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_base.map(n => <NotaBadge key={n} nota={n} img={imgNota(n)} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disponibilidade */}
          <span style={LBL}>Disponibilidade</span>
          <div style={{ background: C.bg2, border: '1px solid #e8e4dc', borderRadius: 4, padding: '0.85rem 1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: esgotado ? '#c0392b' : C.goldLight }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: esgotado ? '#c0392b' : C.text }}>{esgotado ? 'Esgotado' : 'Disponivel'}</span>
              </div>
              <span style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{disponivel}ml de {total}ml</span>
            </div>
            <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: (100 - pct) + '%' }} />
            </div>
          </div>

          {/* Escolha opcao */}
          <span style={LBL}>Escolha sua opcao</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
            {TAMANHOS.map(t => {
              const opcao = perfume.opcoes?.find(o => o.tamanho === t.key);
              if (!opcao) return null;
              const disp = disponivel >= t.ml;
              const sel = selecionado === t.key;
              return (
                <button key={t.key}
                  onClick={() => { if (disp) { setSelecionado(t.key); setMlAvulso(''); } }}
                  disabled={!disp}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.7rem 1rem', borderRadius: 4, border: sel ? '1px solid #c9a84c' : '1px solid #e8e4dc', background: sel ? '#fdf8ee' : '#fff', cursor: disp ? 'pointer' : 'not-allowed', opacity: disp ? 1 : 0.45, transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (disp && !sel) e.currentTarget.style.borderColor = '#c9a84c'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = '#e8e4dc'; }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (sel ? '#c9a84c' : '#e8e4dc'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c' }} />}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, color: C.text, fontWeight: sel ? 600 : 400, textAlign: 'left' }}>
                    {t.label}{!disp && <span style={{ fontSize: 11, color: C.text3, marginLeft: 8 }}>indisponivel</span>}
                  </span>
                  <span style={{ fontSize: 14, color: sel ? C.gold : C.text2, fontWeight: 600 }}>R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}</span>
                </button>
              );
            })}
          </div>

          {/* Quantidade avulsa */}
          <span style={LBL}>Ou escolha a quantidade avulsa</span>
          <div style={{ background: C.bg2, border: '1px solid #e8e4dc', borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="number" min="1" max={disponivel} placeholder="Quantos ml"
              value={mlAvulso}
              onChange={e => { setMlAvulso(e.target.value); setSelecionado(null); }}
              style={{ width: 120, background: '#fff', border: '1px solid #e8e4dc', borderRadius: 4, padding: '8px 12px', fontSize: 14, color: C.text, outline: 'none' }}
            />
            {mlAvulso && precoPorMl && (
              <span style={{ fontSize: 13, color: C.text2 }}>x R$ {precoPorMl}/ml = <strong style={{ color: C.gold }}>R$ {totalAvulso}</strong></span>
            )}
            {!precoPorMl && <span style={{ fontSize: 12, color: C.text3 }}>x preco/ml</span>}
          </div>

          {/* Nome e telefone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text3, marginBottom: 4 }}>Seu nome</label>
              <input placeholder="Ex: Joao Silva" value={nome} onChange={e => setNome(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#fff', border: '1px solid #e8e4dc', borderRadius: 4, color: C.text, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text3, marginBottom: 4 }}>Telefone / WhatsApp</label>
              <input placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#fff', border: '1px solid #e8e4dc', borderRadius: 4, color: C.text, fontSize: 13, outline: 'none' }} />
            </div>
          </div>

          {msg && <p style={{ fontSize: 13, color: msg.includes('confirmad') ? '#2a7a2a' : '#c0392b', marginBottom: '0.75rem', fontWeight: 500 }}>{msg}</p>}

          <button onClick={handleReservar} disabled={salvando || esgotado}
            style={{ width: '100%', padding: '14px', borderRadius: 4, background: esgotado ? C.bg2 : 'linear-gradient(135deg,#c9a84c,#e8c870)', border: '1px solid ' + (esgotado ? C.border : '#c9a84c'), cursor: esgotado ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: esgotado ? C.text3 : '#0d0b07', transition: 'all 0.2s', opacity: salvando ? 0.7 : 1 }}
          >
            {salvando ? 'Reservando...' : esgotado ? 'Esgotado' : 'Reservar'}
          </button>

          {reservas.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <span style={{ ...LBL, marginBottom: '0.75rem' }}>Reservas ({reservas.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reservas.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1rem', background: C.bg2, border: '1px solid #e8e4dc', borderRadius: 4 }}>
                    <span style={{ fontSize: 14, color: C.text }}>{r.nome}</span>
                    <span style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{r.tamanho}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DIREITA: descricao */}
        <div>
          {perfume.descricao && (
            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.8 }}>{perfume.descricao}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NotaBadge({ nota, img }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 68 }}>
      <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0d8c8', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {img
          ? <img src={img} alt={nota} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='&#127807;'; }} />
          : <span style={{ fontSize: 20 }}>&#127807;</span>
        }
      </div>
      <span style={{ fontSize: 9, color: '#4a4440', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{nota}</span>
    </div>
  );
}

const DEMO = {
  id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian',
  genero: 'Unissex', pais: 'Franca', ano: 2015, rating_valor: 4.75, rating_count: 12500,
  descricao: 'Uma criacao iconica com notas de jasmim, acafrao, cedro e ambrofix.',
  ml_disponivel: 62, ml_total: 100,
  notas_topo: 'acafrao, jasmim', notas_coracao: 'ambrofix, fava tonka', notas_base: 'cedro, resina',
  acorde1: 'Floral', acorde2: 'Amadeirado', acorde3: 'Adocicado', acorde4: 'Ambar',
  perfumista1: 'Francis Kurkdjian',
  opcoes: [
    { tamanho: 'apc', preco: 320, ml_quantidade: 50 },
    { tamanho: '3ml', preco: 38, ml_quantidade: 3 },
    { tamanho: '5ml', preco: 58, ml_quantidade: 5 },
    { tamanho: '10ml', preco: 105, ml_quantidade: 10 },
    { tamanho: '15ml', preco: 148, ml_quantidade: 15 },
  ],
};
