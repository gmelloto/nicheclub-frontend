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

const C = {
  bg: '#ffffff',
  bg2: '#f8f7f4',
  border: '#e8e4dc',
  text: '#0d0b07',
  text2: '#5a5550',
  text3: '#9a9080',
  gold: '#8a6a10',
  goldLight: '#c9a84c',
  goldBg: '#fdf8ee',
};

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionar } = useCart();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.perfume(id)
      .then(setPerfume)
      .catch(() => setPerfume(DEMO))
      .finally(() => setLoading(false));
  }, [id]);

  const opcaoSel = perfume?.opcoes?.find(o => o.tamanho === selecionado);
  const disponivel = Number(perfume?.ml_disponivel || 0);
  const total = Number(perfume?.ml_total || 100);
  const pct = Math.min(100, Math.round((disponivel / total) * 100));
  const esgotado = disponivel === 0;

  const handleAdicionar = () => {
    if (!selecionado || !opcaoSel || esgotado) return;
    adicionar(perfume, selecionado, Number(opcaoSel.preco), opcaoSel.ml_quantidade || opcaoSel.ml);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2500);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.goldLight}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!perfume) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.text3, fontSize: 14 }}>Perfume não encontrado.</p>
    </div>
  );

  const notas_topo = perfume.notas_topo?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_coracao = perfume.notas_coracao?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_base = perfume.notas_base?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const acordes = [perfume.acorde1, perfume.acorde2, perfume.acorde3, perfume.acorde4, perfume.acorde5].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>

      {/* Voltar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.75rem 2.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.text3, background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = C.text3}
        >← Voltar</button>
      </div>

      {/* Header — título acima das colunas */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.4rem', fontWeight: 600 }}>{perfume.marca}</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '0.6rem', letterSpacing: '-0.02em', color: C.text }}>{perfume.nome}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {perfume.genero && <span style={{ fontSize: 12, color: C.text2 }}>{perfume.genero}</span>}
          {perfume.ano && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.ano}</span></>}
          {perfume.pais && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.text2 }}>{perfume.pais}</span></>}
          {perfume.rating_valor && <><span style={{ color: C.border }}>·</span><span style={{ fontSize: 12, color: C.gold }}>★ {Number(perfume.rating_valor).toFixed(2)} <span style={{ color: C.text3 }}>({perfume.rating_count?.toLocaleString()})</span></span></>}
        </div>
      </div>

      {/* Layout 50/50 */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 2.5rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem', alignItems: 'start' }}>

        {/* Coluna esquerda — imagem */}
        <div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden', height: 'min(70vh, 480px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={perfume.foto_url || '/frasco.jpeg'}
              alt={perfume.nome}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
            />
          </div>

          {/* Pirâmide olfativa */}
          {(notas_topo.length > 0 || notas_coracao.length > 0 || notas_base.length > 0) && (
            <div style={{ marginTop: '1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: C.text }}>Pirâmide Olfativa</h3>
              {notas_topo.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.5rem' }}>Topo</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {notas_topo.map(n => <NotaBadge key={n} nota={n} />)}
                  </div>
                </div>
              )}
              {notas_coracao.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.5rem' }}>Coração</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {notas_coracao.map(n => <NotaBadge key={n} nota={n} />)}
                  </div>
                </div>
              )}
              {notas_base.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.5rem' }}>Base</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {notas_base.map(n => <NotaBadge key={n} nota={n} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acordes */}
          {acordes.length > 0 && (
            <div style={{ marginTop: '1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1.25rem' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.75rem' }}>Principais Acordes</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {acordes.map(a => <NotaBadge key={a} nota={a} gold />)}
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita */}
        <div>

          {/* Descricao */}
          {perfume.descricao && (
            <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.8, marginBottom: '1.25rem' }}>{perfume.descricao}</p>
          )}

          <div style={{ height: 1, background: C.border, marginBottom: '1.25rem' }} />

          {/* Disponibilidade */}
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: esgotado ? '#c0392b' : C.goldLight }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: esgotado ? '#c0392b' : C.text }}>{esgotado ? 'Esgotado' : 'Disponível'}</span>
              </div>
              <span style={{ fontSize: 13, color: C.gold, fontWeight: 500 }}>{disponivel}ml de {total}ml</span>
            </div>
            <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg,${C.goldLight},#e8c870)`, borderRadius: 2, width: `${100 - pct}%` }} />
            </div>
          </div>

          {/* Tamanhos */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text3, marginBottom: '0.75rem' }}>Escolha sua opção</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem' }}>
            {TAMANHOS.map(t => {
              const opcao = perfume.opcoes?.find(o => o.tamanho === t.key);
              if (!opcao) return null;
              const disp = disponivel >= t.ml;
              const sel = selecionado === t.key;
              return (
                <button key={t.key} onClick={() => disp && setSelecionado(t.key)} disabled={!disp}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 4, border: sel ? `1px solid ${C.goldLight}` : `1px solid ${C.border}`, background: sel ? C.goldBg : C.bg, cursor: disp ? 'pointer' : 'not-allowed', opacity: disp ? 1 : 0.45, transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (disp && !sel) e.currentTarget.style.borderColor = C.goldLight; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.border; }}
                >
                  <span style={{ fontSize: 14, color: C.text, fontWeight: sel ? 600 : 400 }}>
                    {t.label}{!disp && <span style={{ fontSize: 11, color: C.text3, marginLeft: 8 }}>— indisponível</span>}
                  </span>
                  <span style={{ fontSize: 14, color: C.gold, fontWeight: 600 }}>R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}</span>
                </button>
              );
            })}
          </div>

          {/* Botão comprar / esgotado */}
          {esgotado ? (
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, padding: '1.25rem' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.75rem', textAlign: 'center' }}>Esgotado — Avise-me</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="Seu nome" style={{ padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, outline: 'none' }} />
                <input placeholder="Telefone" style={{ padding: '10px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, outline: 'none' }} />
              </div>
            </div>
          ) : (
            <button onClick={handleAdicionar} disabled={!selecionado}
              style={{ width: '100%', padding: '14px', borderRadius: 4, background: selecionado ? `linear-gradient(135deg,${C.goldLight},#e8c870)` : C.bg2, border: `1px solid ${selecionado ? C.goldLight : C.border}`, cursor: selecionado ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: selecionado ? '#0d0b07' : C.text3, transition: 'all 0.2s' }}
            >
              {adicionado ? '✓ Adicionado!' : selecionado ? `Adicionar — R$ ${Number(opcaoSel?.preco || 0).toFixed(2).replace('.', ',')}` : 'Selecione um tamanho'}
            </button>
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

function NotaBadge({ nota, gold }) {
  return (
    <span style={{ padding: '4px 12px', borderRadius: 2, background: gold ? '#fdf8ee' : '#f0ede8', border: `1px solid ${gold ? '#c9a84c' : '#e0d8c8'}`, fontSize: 12, color: gold ? '#8a6a10' : '#4a4440', fontWeight: gold ? 600 : 400 }}>
      {nota}
    </span>
  );
}

const DEMO = {
  id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian',
  familia_olfativa: 'Amadeirado Floral', genero: 'Unissex', pais: 'França',
  ano: 2015, rating_valor: 4.75, rating_count: 12500,
  descricao: 'Uma criação icônica com notas de jasmim, açafrão, cedro e ambrofix.',
  ml_disponivel: 62, ml_total: 100,
  notas_topo: 'açafrão, jasmim', notas_coracao: 'ambrofix, fava tonka', notas_base: 'cedro, resina',
  acorde1: 'Floral', acorde2: 'Amadeirado', acorde3: 'Adocicado',
  perfumista1: 'Francis Kurkdjian',
  opcoes: [
    { tamanho: 'apc', preco: 320 }, { tamanho: '3ml', preco: 38 },
    { tamanho: '5ml', preco: 58 }, { tamanho: '10ml', preco: 105 }, { tamanho: '15ml', preco: 148 },
  ],
};
