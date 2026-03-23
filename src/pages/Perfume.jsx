import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/index.jsx';

const TAMANHOS = [
  { key: '3ml', label: '3ml', ml: 3 },
  { key: '5ml', label: '5ml', ml: 5 },
  { key: '10ml', label: '10ml', ml: 10 },
  { key: '15ml', label: '15ml', ml: 15 },
  { key: 'apc', label: 'APC — Frasco', ml: 50 },
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

  const handleAdicionar = () => {
    if (!selecionado || !opcaoSel) return;
    adicionar(perfume, selecionado, Number(opcaoSel.preco), opcaoSel.ml_quantidade || opcaoSel.ml);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
    </div>
  );

  if (!perfume) return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text2)' }}>Perfume não encontrado.</div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Voltar
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          <div>
            <div style={{ aspectRatio: '3/4', background: 'var(--bg3)', borderRadius: 14, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--border)' }}>
              {perfume.foto_url
                ? <img src={perfume.foto_url} alt={perfume.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ fontSize: '5rem', opacity: 0.06, fontWeight: 800 }}>N</div>
              }
            </div>
            <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 6 }}>
              <div style={{ height: '100%', background: 'var(--grad)', width: `${Math.min(100, Math.round((disponivel / Number(perfume.ml_total || 100)) * 100))}%`, borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>{disponivel}ml disponíveis de {perfume.ml_total}ml</p>
          </div>

          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 8, fontWeight: 500 }}>{perfume.marca}</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{perfume.nome}</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1.5rem' }}>{perfume.familia_olfativa}</p>

            {perfume.descricao && (
              <p style={{ color: 'var(--text2)', lineHeight: 1.8, fontSize: 14, marginBottom: '1.5rem' }}>{perfume.descricao}</p>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '1.5rem 0' }} />

            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: '1rem', fontWeight: 500 }}>Escolha o tamanho</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
              {TAMANHOS.map(t => {
                const opcao = perfume.opcoes?.find(o => o.tamanho === t.key);
                if (!opcao) return null;
                const disp = disponivel >= t.ml;
                const sel = selecionado === t.key;
                return (
                  <button key={t.key} onClick={() => disp && setSelecionado(t.key)} disabled={!disp} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: 8, cursor: disp ? 'pointer' : 'not-allowed',
                    border: sel ? '2px solid var(--blue)' : '1px solid var(--border)',
                    background: sel ? 'rgba(79,110,247,0.06)' : 'var(--bg2)',
                    opacity: disp ? 1 : 0.4, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{t.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: sel ? 'var(--blue)' : 'var(--text)' }}>
                      R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                );
              })}
            </div>

            {opcaoSel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total selecionado</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue)' }}>R$ {Number(opcaoSel.preco).toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <button onClick={handleAdicionar} disabled={!selecionado} style={{
              width: '100%', padding: 14, background: selecionado ? 'var(--grad)' : 'var(--bg3)',
              color: selecionado ? '#fff' : 'var(--text3)', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: selecionado ? 'pointer' : 'not-allowed',
              boxShadow: selecionado ? '0 4px 16px rgba(79,110,247,0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
              {adicionado ? 'Adicionado ao carrinho!' : 'Adicionar ao carrinho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEMO = {
  id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian',
  familia_olfativa: 'Amadeirado Floral',
  descricao: 'Uma criacao iconica com notas de jasmim, acafrao, cedro e ambrofix.',
  ml_disponivel: 38, ml_total: 100,
  opcoes: [
    { tamanho: '3ml', preco: 38, ml_quantidade: 3 },
    { tamanho: '5ml', preco: 58, ml_quantidade: 5 },
    { tamanho: '10ml', preco: 105, ml_quantidade: 10 },
  ],
};
