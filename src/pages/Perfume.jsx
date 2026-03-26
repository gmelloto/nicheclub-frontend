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

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionar } = useCart();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
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
    <div style={{ minHeight: '100vh', background: '#0a0905', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(201,168,76,0.2)', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!perfume) return (
    <div style={{ minHeight: '100vh', background: '#0a0905', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(240,236,224,0.4)', fontSize: 14, letterSpacing: '0.1em' }}>Perfume não encontrado.</p>
    </div>
  );

  const notas_topo = perfume.notas_topo?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_coracao = perfume.notas_coracao?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const notas_base = perfume.notas_base?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const acordes = [perfume.acorde1, perfume.acorde2, perfume.acorde3, perfume.acorde4, perfume.acorde5].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0905', color: '#f0ece0' }}>

      {/* Voltar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 2.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(240,236,224,0.5)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,224,0.5)'}
        >
          ← Voltar
        </button>
      </div>

      {/* Layout principal */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

        {/* Coluna esquerda — imagem */}
        <div>
          <div style={{ position: 'relative', background: '#111009', borderRadius: 4, overflow: 'hidden', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {perfume.foto_url
              ? <img src={perfume.foto_url} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src="/frasco2.jpeg" alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            }
            {/* Overlay sutil */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,9,5,0.4) 0%, transparent 50%)' }} />
          </div>

          {/* Pirâmide Olfativa */}
          {(notas_topo.length > 0 || notas_coracao.length > 0 || notas_base.length > 0) && (
            <div style={{ marginTop: '1.5rem', background: '#111009', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 4, padding: '1.75rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.5rem', color: '#f0ece0' }}>Pirâmide Olfativa</h3>

              {notas_topo.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.6rem' }}>Topo</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_topo.map(n => <NotaBadge key={n} nota={n} />)}
                  </div>
                </div>
              )}
              {notas_coracao.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.6rem' }}>Coração</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_coracao.map(n => <NotaBadge key={n} nota={n} />)}
                  </div>
                </div>
              )}
              {notas_base.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.6rem' }}>Base</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {notas_base.map(n => <NotaBadge key={n} nota={n} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acordes principais */}
          {acordes.length > 0 && (
            <div style={{ marginTop: '1rem', background: '#111009', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 4, padding: '1.5rem' }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.75rem' }}>Principais Acordes</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {acordes.map(a => <NotaBadge key={a} nota={a} gold />)}
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita — info + compra */}
        <div style={{ paddingTop: '0.5rem' }}>

          {/* Marca */}
          <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '0.75rem', fontWeight: 500 }}>{perfume.marca}</p>

          {/* Nome */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.5rem', letterSpacing: '0.02em' }}>{perfume.nome}</h1>

          {/* Info linha */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {perfume.genero && <span style={{ fontSize: 12, color: 'rgba(240,236,224,0.45)', letterSpacing: '0.05em' }}>{perfume.genero}</span>}
            {perfume.ano && <><span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span><span style={{ fontSize: 12, color: 'rgba(240,236,224,0.45)' }}>{perfume.ano}</span></>}
            {perfume.pais && <><span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span><span style={{ fontSize: 12, color: 'rgba(240,236,224,0.45)' }}>{perfume.pais}</span></>}
            {perfume.rating_valor && (
              <><span style={{ color: 'rgba(201,168,76,0.3)' }}>·</span>
              <span style={{ fontSize: 12, color: '#c9a84c' }}>★ {Number(perfume.rating_valor).toFixed(2)} <span style={{ color: 'rgba(240,236,224,0.3)' }}>({perfume.rating_count?.toLocaleString()})</span></span></>
            )}
          </div>

          {/* Descrição */}
          {perfume.descricao && (
            <p style={{ fontSize: 14, color: 'rgba(240,236,224,0.6)', lineHeight: 1.9, marginBottom: '2rem', maxWidth: 520 }}>{perfume.descricao}</p>
          )}

          <div style={{ height: 1, background: 'rgba(201,168,76,0.1)', marginBottom: '2rem' }} />

          {/* Barra de disponibilidade */}
          <div style={{ background: '#111009', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 4, padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: esgotado ? '#c0392b' : '#c9a84c' }} />
                <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', color: esgotado ? '#c0392b' : '#f0ece0' }}>
                  {esgotado ? 'Esgotado' : 'Disponível'}
                </span>
              </div>
              <span style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500 }}>{disponivel}ml de {total}ml</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', background: esgotado ? '#c0392b' : 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: `${pct}%`, transition: 'width 0.5s' }} />
            </div>
            {perfume.ml_vendido > 0 && (
              <p style={{ fontSize: 11, color: 'rgba(240,236,224,0.3)', marginTop: '0.5rem', textAlign: 'right' }}>{perfume.ml_vendido}ml vendidos</p>
            )}
          </div>

          {/* Escolha de tamanho */}
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.5)', marginBottom: '1rem' }}>Escolha sua opção</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '2rem' }}>
            {TAMANHOS.map(t => {
              const opcao = perfume.opcoes?.find(o => o.tamanho === t.key);
              if (!opcao) return null;
              const disp = disponivel >= t.ml;
              const sel = selecionado === t.key;
              return (
                <button key={t.key} onClick={() => disp && setSelecionado(t.key)} disabled={!disp}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', borderRadius: 4,
                    border: sel ? '1px solid #c9a84c' : '1px solid rgba(201,168,76,0.12)',
                    background: sel ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: disp ? 'pointer' : 'not-allowed',
                    opacity: disp ? 1 : 0.4,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (disp && !sel) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; }}
                >
                  <span style={{ fontSize: 14, color: disp ? '#f0ece0' : 'rgba(240,236,224,0.4)', letterSpacing: '0.03em' }}>
                    {t.label}{!disp && <span style={{ fontSize: 11, color: 'rgba(240,236,224,0.3)', marginLeft: 8 }}>— indisponível</span>}
                  </span>
                  <span style={{ fontSize: 14, color: '#c9a84c', fontWeight: 500 }}>
                    R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botão comprar */}
          {esgotado ? (
            <div style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 4, padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '1rem' }}>Esgotado</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="Seu nome" style={{ padding: '10px 14px', background: '#111009', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, color: '#f0ece0', fontSize: 13 }} />
                <input placeholder="Telefone" style={{ padding: '10px 14px', background: '#111009', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, color: '#f0ece0', fontSize: 13 }} />
              </div>
            </div>
          ) : (
            <button onClick={handleAdicionar} disabled={!selecionado}
              style={{
                width: '100%', padding: '16px', borderRadius: 4,
                background: selecionado ? 'linear-gradient(135deg,#c9a84c,#e8c870)' : 'rgba(201,168,76,0.1)',
                border: 'none', cursor: selecionado ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: selecionado ? '#0a0905' : 'rgba(201,168,76,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {adicionado ? '✓ Adicionado ao carrinho' : selecionado ? `Adicionar ao Carrinho — R$ ${Number(opcaoSel?.preco || 0).toFixed(2).replace('.', ',')}` : 'Selecione um tamanho'}
            </button>
          )}

          {/* Perfumistas */}
          {(perfume.perfumista1 || perfume.perfumista2) && (
            <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#111009', border: '1px solid rgba(201,168,76,0.08)', borderRadius: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.3)', marginBottom: '0.5rem' }}>Perfumista</p>
              <p style={{ fontSize: 14, color: 'rgba(240,236,224,0.7)' }}>
                {[perfume.perfumista1, perfume.perfumista2].filter(Boolean).join(' & ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotaBadge({ nota, gold }) {
  return (
    <span style={{
      padding: '5px 14px', borderRadius: 2,
      background: gold ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${gold ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.08)'}`,
      fontSize: 12, color: gold ? '#c9a84c' : 'rgba(240,236,224,0.7)',
      letterSpacing: '0.03em', fontWeight: gold ? 500 : 300,
    }}>
      {nota}
    </span>
  );
}

const DEMO = {
  id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian',
  familia_olfativa: 'Amadeirado Floral', genero: 'Unissex', pais: 'França',
  ano: 2015, rating_valor: 4.75, rating_count: 12500,
  descricao: 'Uma criação icônica com notas de jasmim, açafrão, cedro e ambrofix. Deixa um rastro marcante e sofisticado, perfeito para ocasiões especiais.',
  ml_disponivel: 62, ml_total: 100, ml_vendido: 38,
  notas_topo: 'açafrão, jasmim', notas_coracao: 'ambrofix, fava tonka', notas_base: 'cedro, resina',
  acorde1: 'Floral', acorde2: 'Amadeirado', acorde3: 'Adocicado', acorde4: 'Almiscarado', acorde5: null,
  perfumista1: 'Francis Kurkdjian', perfumista2: null,
  opcoes: [
    { tamanho: 'apc', preco: 320, ml_quantidade: 50 },
    { tamanho: '3ml', preco: 38, ml_quantidade: 3 },
    { tamanho: '5ml', preco: 58, ml_quantidade: 5 },
    { tamanho: '10ml', preco: 105, ml_quantidade: 10 },
    { tamanho: '15ml', preco: 148, ml_quantidade: 15 },
  ],
};
