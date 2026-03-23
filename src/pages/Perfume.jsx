import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context';
import './Perfume.css';

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
      .catch(() => setPerfume(DEMO[id] || DEMO['1']))
      .finally(() => setLoading(false));
  }, [id]);

  const opcaoSel = perfume?.opcoes?.find(o => o.tamanho === selecionado);
  const disponivel = Number(perfume?.ml_disponivel || 0);
  const tamanhoDisp = (t) => disponivel >= t.ml;

  const handleAdicionar = () => {
    if (!selecionado || !opcaoSel) return;
    adicionar(perfume, selecionado, Number(opcaoSel.preco), opcaoSel.ml_quantidade || opcaoSel.ml);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  if (loading) return (
    <div className="perfume-page">
      <div className="perfume-inner">
        <div className="skeleton" style={{ height: 400, borderRadius: 4 }} />
      </div>
    </div>
  );

  if (!perfume) return <div className="perfume-page"><p className="muted" style={{ padding: '4rem 2rem' }}>Perfume não encontrado.</p></div>;

  return (
    <div className="perfume-page fade-in">
      <div className="perfume-inner">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="perfume-layout">
          <div className="perfume-img-col">
            <div className="perfume-img-wrap">
              {perfume.foto_url
                ? <img src={perfume.foto_url} alt={perfume.nome} />
                : <div className="perfume-img-placeholder">◈</div>
              }
            </div>
            <div className="estoque-info">
              <div className="estoque-bar-lg">
                <div className="estoque-fill-lg" style={{
                  width: `${Math.min(100, Math.round((disponivel / Number(perfume.ml_total || 100)) * 100))}%`
                }} />
              </div>
              <p className="small muted">{disponivel}ml disponíveis de {perfume.ml_total}ml no frasco</p>
            </div>
          </div>

          <div className="perfume-info-col">
            <p className="perfume-marca-lg caps muted">{perfume.marca}</p>
            <h1 className="perfume-nome-lg">{perfume.nome}</h1>
            <p className="perfume-familia-lg small muted">{perfume.familia_olfativa}</p>

            {perfume.descricao && (
              <p className="perfume-descricao">{perfume.descricao}</p>
            )}

            <div className="divider" />

            <p className="caps muted" style={{ marginBottom: '1rem' }}>Escolha o tamanho</p>

            <div className="tamanhos-grid">
              {TAMANHOS.map(t => {
                const opcao = perfume.opcoes?.find(o => o.tamanho === t.key);
                if (!opcao) return null;
                const disp = tamanhoDisp(t);
                return (
                  <button
                    key={t.key}
                    className={`tamanho-btn ${selecionado === t.key ? 'selected' : ''} ${!disp ? 'esgotado' : ''}`}
                    onClick={() => disp && setSelecionado(t.key)}
                    disabled={!disp}
                  >
                    <span className="tamanho-label">{t.label}</span>
                    <span className="tamanho-preco gold">
                      R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}
                    </span>
                    {!disp && <span className="esgotado-label">Esgotado</span>}
                  </button>
                );
              })}
            </div>

            {opcaoSel && (
              <div className="preco-total">
                <span className="muted small">Total selecionado</span>
                <span className="preco-valor gold">R$ {Number(opcaoSel.preco).toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleAdicionar}
              disabled={!selecionado}
              style={{ marginTop: '1.5rem' }}
            >
              {adicionado ? '✓ Adicionado ao carrinho' : 'Adicionar ao carrinho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEMO = {
  '1': { id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', familia_olfativa: 'Amadeirado Floral', descricao: 'Uma criação icônica com notas de jasmim, açafrão, cedro e ambrofix. Deixa um rastro marcante e sofisticado.', ml_disponivel: 38, ml_total: 100, opcoes: [{ tamanho: '3ml', preco: 38, ml_quantidade: 3 }, { tamanho: '5ml', preco: 58, ml_quantidade: 5 }, { tamanho: '10ml', preco: 105, ml_quantidade: 10 }] },
};
