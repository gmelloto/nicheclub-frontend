import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://nicheclub-backend-production.up.railway.app";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cat-root {
    min-height: 100vh;
    background: #ffffff;
    font-family: 'Jost', sans-serif;
    color: #1a1a1a;
  }

  .cat-header {
    border-bottom: 1px solid #e8e0cc;
    padding: 36px 48px 24px;
  }
  .cat-eyebrow {
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #B8960C;
    margin-bottom: 10px;
  }
  .cat-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 300;
    color: #1a1a1a;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }
  .cat-heading em {
    font-style: italic;
    color: #B8960C;
  }
  .cat-sub {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 300;
    color: #888;
    letter-spacing: 0.05em;
  }

  .cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 40px 28px;
    padding: 48px 48px 0;
  }

  .cat-card {
    cursor: pointer;
  }
  .cat-img-wrap {
    position: relative;
    width: 100%;
    padding-bottom: 125%;
    background: #f5f3ef;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .cat-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .cat-card:hover .cat-img {
    transform: scale(1.04);
  }
  .cat-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px;
    font-weight: 300;
    font-style: italic;
    color: #c9bfa8;
  }
  .cat-stock {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 4px 9px;
    border-radius: 1px;
  }
  .cat-stock.yes { background: #B8960C; color: #fff; }
  .cat-stock.no {
    background: rgba(255,255,255,0.88);
    color: #aaa;
    border: 1px solid #ddd;
  }
  .cat-brand {
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #B8960C;
    margin-bottom: 5px;
  }
  .cat-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 400;
    color: #1a1a1a;
    line-height: 1.3;
  }

  .cat-load-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 56px 48px 72px;
  }
  .cat-load-btn {
    padding: 14px 52px;
    border: 1px solid #B8960C;
    background: transparent;
    color: #B8960C;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transition: background 0.22s, color 0.22s;
  }
  .cat-load-btn:hover:not(:disabled) { background: #B8960C; color: #fff; }
  .cat-load-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .cat-progress {
    font-size: 11px;
    font-weight: 300;
    color: #bbb;
    letter-spacing: 0.08em;
  }

  .cat-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 24px;
    gap: 14px;
    text-align: center;
  }
  .cat-state p {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 300;
    font-style: italic;
    color: #bbb;
  }
  .cat-state small {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: #ccc;
    letter-spacing: 0.1em;
  }
  .cat-spinner {
    width: 30px;
    height: 30px;
    border: 2px solid #eee;
    border-top-color: #B8960C;
    border-radius: 50%;
    animation: cat-spin 0.75s linear infinite;
  }
  @keyframes cat-spin { to { transform: rotate(360deg); } }

  @keyframes cat-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cat-card { animation: cat-fadeUp 0.4s ease both; }

  @media (max-width: 768px) {
    .cat-header { padding: 24px 20px 18px; }
    .cat-heading { font-size: 28px; }
    .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 24px 14px; padding: 28px 20px 0; }
    .cat-load-area { padding: 40px 20px 56px; }
  }
`;

const PAGE_SIZE = 12;

export default function Catalogo() {
  const navigate = useNavigate();

  const [perfumes, setPerfumes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPerfumes = async (pg, append = false) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await fetch(`${API}/perfumes?page=${pg}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const list = data.perfumes ?? data.data ?? (Array.isArray(data) ? data : []);
      const count = data.total ?? data.count ?? list.length;

      setPerfumes(prev => append ? [...prev, ...list] : list);
      setTotal(count);
      setPage(pg);
    } catch (e) {
      setError("Nao foi possivel conectar ao servidor.");
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPerfumes(1);
  }, []);

  const handleLoadMore = () => fetchPerfumes(page + 1, true);
  const hasMore = perfumes.length < total;

  return (
    <>
      <style>{styles}</style>
      <div className="cat-root">

        <header className="cat-header">
          <div className="cat-eyebrow">Niche Club</div>
          <h1 className="cat-heading">Nossa <em>colecao</em></h1>
          {total > 0 && (
            <p className="cat-sub">{total.toLocaleString("pt-BR")} perfumes</p>
          )}
        </header>

        {loading ? (
          <div className="cat-state">
            <div className="cat-spinner" />
            <small>Carregando colecao</small>
          </div>
        ) : error ? (
          <div className="cat-state">
            <p>Algo deu errado</p>
            <small>{error}</small>
          </div>
        ) : perfumes.length === 0 ? (
          <div className="cat-state">
            <p>Nenhum perfume encontrado</p>
          </div>
        ) : (
          <>
            <div className="cat-grid">
              {perfumes.map((p, i) => (
                <PerfumeCard
                  key={p.id}
                  perfume={p}
                  index={i}
                  onClick={() => navigate(`/perfumes/${p.slug ?? p.id}`)}
                />
              ))}
            </div>

            <div className="cat-load-area">
              {hasMore && (
                <button
                  className="cat-load-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Carregando..." : "Ver mais"}
                </button>
              )}
              <span className="cat-progress">
                Exibindo {perfumes.length} de {total.toLocaleString("pt-BR")}
              </span>
            </div>
          </>
        )}

      </div>
    </>
  );
}

function PerfumeCard({ perfume, index, onClick }) {
  const [imgError, setImgError] = useState(false);

  const nome = perfume.nome ?? perfume.name ?? "Sem nome";
  const marca = perfume.marca ?? perfume.brand ?? "";
  const imgUrl = perfume.imagem_url ?? perfume.image_url ?? perfume.foto ?? null;
  const disponivel = perfume.disponivel ?? perfume.available ?? false;
  const initials = nome.slice(0, 2).toUpperCase();

  return (
    <div
      className="cat-card"
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index % PAGE_SIZE, 11) * 45}ms` }}
    >
      <div className="cat-img-wrap">
        {imgUrl && !imgError ? (
          <img
            className="cat-img"
            src={imgUrl}
            alt={nome}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="cat-placeholder">{initials}</div>
        )}
        <span className={`cat-stock ${disponivel ? "yes" : "no"}`}>
          {disponivel ? "Disponivel" : "Esgotado"}
        </span>
      </div>
      {marca && <div className="cat-brand">{marca}</div>}
      <div className="cat-name">{nome}</div>
    </div>
  );
}
