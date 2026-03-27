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

const COR = {
  'Floral': '#e8a0b0', 'Rosa': '#e87090', 'Amadeirado': '#c8a878',
  'Cedro': '#b89060', 'Oud': '#8a6030', 'Patchouli': '#9a7850',
  'Oriental': '#d4884c', 'Adocicado': '#e8b060', 'Baunilha': '#f0c878',
  'Almiscarado': '#c8b8a0', 'Especiado': '#c87840', 'Citrico': '#e8d040',
  'Fresco': '#78c8d8', 'Aromatico': '#78b890', 'Verde': '#88c878',
  'Aquatico': '#60b8d8', 'Frutado': '#e87878', 'Gourmet': '#e8a060',
  'Couro': '#a07848', 'Defumado': '#9898a8', 'Terroso': '#a08868',
  'Herbal': '#90b870', 'Tropical': '#f0b040', 'Sandalo': '#d4b896',
  'Picante Fresco': '#d4a860', 'Picante Quente': '#c87040',
};

function corAcorde(n) {
  if (!n) return '#c9a84c';
  for (const k of Object.keys(COR)) {
    if (n.toLowerCase().includes(k.toLowerCase())) return COR[k];
  }
  return '#c9a84c';
}

const C = {
  bg: '#ffffff', bg2: '#f8f7f4', border: '#e8e4dc',
  text: '#0d0b07', text2: '#5a5550', text3: '#9a9080',
  gold: '#8a6a10', goldLight: '#c9a84c', goldBg: '#fdf8ee',
};

const LBL = {
  display: 'block', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.22em', textTransform: 'uppercase',
  color: '#8a6a10', marginBottom: '0.6rem',
};

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [mlAvulso, setMlAvulso] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [reservas, setReservas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [notasMap, setNotasMap] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setErro(null);
    api.perfume(id)
      .then(p => {
        setPerfume(p);
        // Busca reservas
        api.reservasPerfume(p.id).then(r => setReservas(Array.isArray(r) ? r : [])).catch(() => {});
        // Busca imagens das notas
        const notas = [
          ...(p.notas_topo ? p.notas_topo.split(',').map(n => n.trim()).filter(Boolean) : []),
          ...(p.notas_coracao ? p.notas_coracao.split(',').map(n => n.trim()).filter(Boolean) : []),
          ...(p.notas_base ? p.notas_base.split(',').map(n => n.trim()).filter(Boolean) : []),
        ];
        if (notas.length > 0 && api.notasBatch) {
          api.notasBatch(notas).then(rows => {
            if (!Array.isArray(rows)) return;
            const map = {};
            rows.forEach(r => {
              if (r.nota_ptb) map[r.nota_ptb.toLowerCase()] = r.cloudinary_url || r.photo_url;
              if (r.nota_en) map[r.nota_en.toLowerCase()] = r.cloudinary_url || r.photo_url;
            });
            setNotasMap(map);
          }).catch(() => {});
        }
      })
      .catch(e => setErro(e.message || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [id]);

  const opcaoSel = selecionado ? perfume?.opcoes?.find(o => o.tamanho === selecionado) : null;
  const disponivel = Number(perfume?.ml_disponivel || 0);
  const total = Number(perfume?.ml_total || 0);
  const pct = total > 0 ? Math.min(100, Math.round((disponivel / total) * 100)) : 0;
  const esgotado = disponivel === 0;
  const precoMl = opcaoSel ? (Number(opcaoSel.preco) / Number(opcaoSel.ml_quantidade || opcaoSel.ml || 1)) : 0;
  const totalAvulso = mlAvulso && precoMl ? (Number(mlAvulso) * precoMl).toFixed(2) : null;

  const notas_topo = perfume?.notas_topo ? perfume.notas_topo.split(',').map(n => n.trim()).filter(Boolean) : [];
  const notas_coracao = perfume?.notas_coracao ? perfume.notas_coracao.split(',').map(n => n.trim()).filter(Boolean) : [];
  const notas_base = perfume?.notas_base ? perfume.notas_base.split(',').map(n => n.trim()).filter(Boolean) : [];
  const acordes = [perfume?.acorde1, perfume?.acorde2, perfume?.acorde3, perfume?.acorde4, perfume?.acorde5].filter(Boolean);

  function imgNota(nota) {
    if (!nota || !notasMap) return null;
    return notasMap[nota.toLowerCase().trim()] || null;
  }

  const handleReservar = async () => {
    if (!nome.trim() || !telefone.trim()) return setMsg('Preencha nome e telefone.');
    if (!selecionado && !mlAvulso) return setMsg('Escolha um tamanho ou quantidade avulsa.');
    setSalvando(true); setMsg('');
    try {
      const res = await api.reservar({
        perfume_id: perfume.id, nome: nome.trim(), telefone: telefone.trim(),
        tamanho: selecionado || null,
        ml_avulso: mlAvulso ? Number(mlAvulso) : null,
      });
      setMsg(res.mensagem || 'Reserva confirmada!');
      setNome(''); setTelefone(''); setSelecionado(null); setMlAvulso('');
      api.reservasPerfume(perfume.id).then(r => setReservas(Array.isArray(r) ? r : [])).catch(() => {});
    } catch(e) {
      setMsg(e.message || 'Erro ao reservar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #e8e4dc', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (erro || !perfume) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: '#5a5550', fontSize: 15 }}>{erro || 'Perfume nao encontrado.'}</p>
      <button onClick={() => navigate(-1)} style={{ fontSize: 13, color: '#8a6a10', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Voltar</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0d0b07' }}>

      {/* Voltar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.75rem 2rem' }}>
        <button onClick={() => navigate(-1)}
          style={{ fontSize: 13, color: '#9a9080', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = '#8a6a10'}
          onMouseLeave={e => e.currentTarget.style.color = '#9a9080'}
        >
          &#8592; Voltar
        </button>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 1rem', borderBottom: '1px solid #e8e4dc' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8a6a10', marginBottom: 4, fontWeight: 600 }}>{perfume.marca}</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.02em' }}>{perfume.nome}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, color: '#5a5550' }}>
          {perfume.genero && <span>{perfume.genero}</span>}
          {perfume.ano && <><span style={{ color: '#e8e4dc' }}>|</span><span>{perfume.ano}</span></>}
          {perfume.pais && <><span style={{ color: '#e8e4dc' }}>|</span><span>{perfume.pais}</span></>}
          {perfume.perfumista1 && <><span style={{ color: '#e8e4dc' }}>|</span><span>{perfume.perfumista1}</span></>}
          {perfume.rating_valor && <><span style={{ color: '#e8e4dc' }}>|</span><span style={{ color: '#8a6a10' }}>&#9733; {Number(perfume.rating_valor).toFixed(2)} <span style={{ color: '#9a9080' }}>({Number(perfume.rating_count || 0).toLocaleString()})</span></span></>}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 2rem 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ESQUERDA: foto + acordes */}
        <div>
          <div style={{ border: '1px solid #e8e4dc', borderRadius: 4, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', height: 380, marginBottom: '1rem' }}>
            <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #e8e4dc' }}>
              <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
                onError={e => { e.target.src = '/frasco.jpeg'; }}
              />
            </div>
            <div style={{ background: '#f8f7f4', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden' }}>
              <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a6a10', marginBottom: 4, fontWeight: 600 }}>Acordes</p>
              {acordes.map(a => (
                <div key={a} style={{ height: 22, borderRadius: 3, background: corAcorde(a), display: 'flex', alignItems: 'center', paddingLeft: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a}</span>
                </div>
              ))}
              {perfume.rating_valor && (
                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #e8e4dc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0d0b07' }}>{Number(perfume.rating_valor).toFixed(2)}</span>
                    <div style={{ display: 'flex' }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 10, color: s <= Math.round(perfume.rating_valor) ? '#c9a84c' : '#e8e4dc' }}>&#9733;</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: 9, color: '#9a9080' }}>({Number(perfume.rating_count || 0).toLocaleString()} av.)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DIREITA: disponibilidade + reserva + piramide */}
        <div>
          {/* Descricao */}
          {perfume.descricao && (
            <p style={{ fontSize: 14, color: '#5a5550', lineHeight: 1.8, marginBottom: '1rem' }}>{perfume.descricao}</p>
          )}

          {/* Disponibilidade */}
          <span style={LBL}>Disponibilidade</span>
          <div style={{ background: '#f8f7f4', border: '1px solid #e8e4dc', borderRadius: 4, padding: '0.85rem 1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: esgotado ? '#c0392b' : '#c9a84c' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: esgotado ? '#c0392b' : '#0d0b07' }}>{esgotado ? 'Esgotado' : 'Disponivel'}</span>
              </div>
              <span style={{ fontSize: 13, color: '#8a6a10', fontWeight: 600 }}>{disponivel}ml de {total}ml</span>
            </div>
            <div style={{ height: 4, background: '#e8e4dc', borderRadius: 2 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: (100 - pct) + '%' }} />
            </div>
          </div>

          {/* Tamanhos */}
          <span style={LBL}>Escolha sua opcao</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' }}>
            {TAMANHOS.map(t => {
              const op = perfume.opcoes?.find(o => o.tamanho === t.key);
              if (!op) return null;
              const disp = disponivel >= t.ml;
              const sel = selecionado === t.key;
              return (
                <button key={t.key}
                  onClick={() => { if (disp) { setSelecionado(t.key); setMlAvulso(''); } }}
                  disabled={!disp}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 1rem', borderRadius: 4, border: sel ? '1px solid #c9a84c' : '1px solid #e8e4dc', background: sel ? '#fdf8ee' : '#fff', cursor: disp ? 'pointer' : 'not-allowed', opacity: disp ? 1 : 0.4, transition: 'all 0.15s' }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid ' + (sel ? '#c9a84c' : '#e8e4dc'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c' }} />}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: '#0d0b07', fontWeight: sel ? 600 : 400, textAlign: 'left' }}>
                    {t.label}{!disp && <span style={{ fontSize: 11, color: '#9a9080', marginLeft: 8 }}>indisponivel</span>}
                  </span>
                  <span style={{ fontSize: 13, color: sel ? '#8a6a10' : '#5a5550', fontWeight: 600 }}>R$ {Number(op.preco).toFixed(2).replace('.', ',')}</span>
                </button>
              );
            })}
          </div>

          {/* Avulso */}
          <span style={LBL}>Ou escolha a quantidade avulsa</span>
          <div style={{ background: '#f8f7f4', border: '1px solid #e8e4dc', borderRadius: 4, padding: '0.7rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="number" min="1" max={disponivel} placeholder="Quantos ml"
              value={mlAvulso}
              onChange={e => { setMlAvulso(e.target.value); setSelecionado(null); }}
              style={{ width: 120, background: '#fff', border: '1px solid #e8e4dc', borderRadius: 4, padding: '8px 10px', fontSize: 13, color: '#0d0b07', outline: 'none' }}
            />
            {totalAvulso
              ? <span style={{ fontSize: 13, color: '#5a5550' }}>x R$ {precoMl.toFixed(2)}/ml = <strong style={{ color: '#8a6a10' }}>R$ {totalAvulso}</strong></span>
              : <span style={{ fontSize: 12, color: '#9a9080' }}>x preco/ml</span>
            }
          </div>

          {/* Nome e telefone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9080', marginBottom: 4 }}>Seu nome</label>
              <input placeholder="Ex: Joao Silva" value={nome} onChange={e => setNome(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid #e8e4dc', borderRadius: 4, color: '#0d0b07', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9a9080', marginBottom: 4 }}>Telefone / WhatsApp</label>
              <input placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid #e8e4dc', borderRadius: 4, color: '#0d0b07', fontSize: 13, outline: 'none' }} />
            </div>
          </div>

          {msg && <p style={{ fontSize: 13, color: msg.includes('confirmad') || msg.includes('Reserva') ? '#2a7a2a' : '#c0392b', marginBottom: '0.75rem', fontWeight: 500 }}>{msg}</p>}

          <button onClick={handleReservar} disabled={salvando || esgotado}
            style={{ width: '100%', padding: '13px', borderRadius: 4, background: esgotado ? '#f8f7f4' : 'linear-gradient(135deg,#c9a84c,#e8c870)', border: '1px solid ' + (esgotado ? '#e8e4dc' : '#c9a84c'), cursor: esgotado ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: esgotado ? '#9a9080' : '#0d0b07', opacity: salvando ? 0.7 : 1 }}
          >
            {salvando ? 'Reservando...' : esgotado ? 'Esgotado' : 'Reservar'}
          </button>

          {reservas.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <span style={{ ...LBL, marginBottom: 8 }}>Reservas ({reservas.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {reservas.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: '#f8f7f4', border: '1px solid #e8e4dc', borderRadius: 4 }}>
                    <span style={{ fontSize: 13, color: '#0d0b07' }}>{r.nome}</span>
                    <span style={{ fontSize: 12, color: '#8a6a10', fontWeight: 600 }}>{r.tamanho}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Piramide */}
          {(notas_topo.length > 0 || notas_coracao.length > 0 || notas_base.length > 0) && (
            <div style={{ marginTop: '1.5rem', background: '#f8f7f4', border: '1px solid #e8e4dc', borderRadius: 4, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#0d0b07' }}>Piramide Olfativa</h3>
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
          ? <img src={img} alt={nota} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
          : <span style={{ fontSize: 20 }}>&#127807;</span>
        }
      </div>
      <span style={{ fontSize: 9, color: '#4a4440', textAlign: 'center', lineHeight: 1.3, fontWeight: 500, wordBreak: 'break-word' }}>{nota}</span>
    </div>
  );
}
