import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Catalogo.css';

export default function Catalogo() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.perfumes()
      .then(setPerfumes)
      .catch(() => setPerfumes(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = perfumes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.marca.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="catalogo-page">
      <div className="catalogo-hero">
        <p className="hero-eyebrow caps gold">Perfumaria de nicho</p>
        <h1 className="hero-title">Experiências<br /><em>em frações</em></h1>
        <p className="hero-sub muted">Explore os maiores nomes da perfumaria mundial em doses de 3ml a 15ml — ou adquira o frasco completo.</p>
      </div>

      <div className="catalogo-body">
        <div className="catalogo-toolbar">
          <input
            type="text"
            placeholder="Buscar perfume ou marca..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="busca-input"
          />
          <span className="muted small">{filtrados.length} fragrâncias</span>
        </div>

        {loading ? (
          <div className="perfume-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="perfume-card-skeleton">
                <div className="skeleton" style={{ height: 200, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 18, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="perfume-grid">
            {filtrados.map((p, i) => (
              <PerfumeCard key={p.id} perfume={p} delay={i * 60} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PerfumeCard({ perfume, delay }) {
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = Math.min(100, Math.round((disponivel / total) * 100));
  const precoMin = perfume.opcoes?.[0]?.preco;

  return (
    <Link
      to={`/perfume/${perfume.id}`}
      className="perfume-card fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="perfume-card-img">
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} />
          : <div className="perfume-placeholder">◈</div>
        }
        <div className="estoque-bar">
          <div className="estoque-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="estoque-label small">{disponivel}ml disponíveis</div>
      </div>
      <div className="perfume-card-body">
        <p className="perfume-marca caps muted">{perfume.marca}</p>
        <h3 className="perfume-nome">{perfume.nome}</h3>
        <p className="perfume-familia small muted">{perfume.familia_olfativa}</p>
        {precoMin && (
          <p className="perfume-preco">
            <span className="muted small">a partir de </span>
            <span className="gold">R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', familia_olfativa: 'Amadeirado Floral', ml_disponivel: 38, ml_total: 100, opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', familia_olfativa: 'Amadeirado Oriental', ml_disponivel: 220, ml_total: 250, opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Neroli Portofino', marca: 'Tom Ford', familia_olfativa: 'Cítrico Aromático', ml_disponivel: 12, ml_total: 100, opcoes: [{ preco: 35 }] },
  { id: '4', nome: 'Rose Prick', marca: 'Tom Ford', familia_olfativa: 'Floral', ml_disponivel: 105, ml_total: 150, opcoes: [{ preco: 40 }] },
  { id: '5', nome: 'Santal 33', marca: 'Le Labo', familia_olfativa: 'Amadeirado', ml_disponivel: 80, ml_total: 100, opcoes: [{ preco: 36 }] },
  { id: '6', nome: 'Another 13', marca: 'Le Labo', familia_olfativa: 'Almíscar', ml_disponivel: 25, ml_total: 100, opcoes: [{ preco: 38 }] },
];
