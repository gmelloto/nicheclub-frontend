import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandCarousel from '../components/BrandCarousel.jsx';
import { api } from '../services/api';

const S = {
  gold: '#c9a84c',
  gold2: '#e8c870',
  black: '#0d0b07',
  black2: '#111009',
  black3: '#1a1810',
  text: '#f0ece0',
  text2: 'rgba(240,236,224,0.6)',
  text3: 'rgba(240,236,224,0.35)',
  border: 'rgba(201,168,76,0.15)',
};

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

function corAcorde(nome) {
  if (!nome) return '#c9a84c';
  return COR_ACORDE[nome] || '#c9a84c';
}

export default function Catalogo() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [tab, setTab] = useState('decants');
  const [faqAberto, setFaqAberto] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMITE = 12;

  const carregarPerfumes = async (pag = 1, buscaTermo = busca, reset = false, tabAtual = tab) => {
    if (pag === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { pagina: pag, limite: LIMITE, busca: buscaTermo };
      if (tabAtual === "catalogo") params.todos = true;
      const res = tabAtual === "decants" ? await api.frascos(params) : await api.perfumes(params);
      const lista = res.frascos || res.perfumes || res;
      if (reset || pag === 1) setPerfumes(lista);
      else setPerfumes(prev => [...prev, ...lista]);
      setTotal(res.total || lista.length);
      setPagina(pag);
    } catch {
      console.error("Erro ao carregar perfumes:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { carregarPerfumes(1, '', true, tab); }, [tab]);

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(buscaInput);
      carregarPerfumes(1, buscaInput, true);
    }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const temMais = perfumes.length < total;
  const filtrados = perfumes;

  const faqs = [
    { q: 'O que é um decant?', r: 'Decant é uma amostra fracionada de um perfume original, transferida para um frasco menor. É a maneira ideal de experimentar fragrâncias de alto padrão antes de investir no frasco completo.' },
    { q: 'Os perfumes são originais?', r: 'Sim! Todos os nossos decants são extraídos de frascos 100% originais, lacrados e adquiridos de distribuidores autorizados.' },
    { q: 'Quais tamanhos estão disponíveis?', r: 'Oferecemos decants nos tamanhos de 3ml, 5ml, 10ml e 15ml, perfeitos para testar a fragrância no dia a dia. Também temos APC (frasco completo +50ml).' },
    { q: 'Como funciona a reserva?', r: 'Você seleciona o perfume e o tamanho desejado, adiciona ao carrinho e finaliza o pedido. O pagamento é processado via Pix ou cartão de crédito em até 12x.' },
    { q: 'Posso trocar ou devolver?', r: 'Devido à natureza do produto (fragrância fracionada), não aceitamos trocas ou devoluções. Garantimos a qualidade e autenticidade de todos os decants.' },
  ];

  return (
    <div style={{ background: S.black, color: S.text, fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ─── HERO (texto sobre imagem) ──────────────────────────────────── */}
      <div className="hero-section" style={{
        position: 'relative', minHeight: '90vh',
        display: 'flex', overflow: 'hidden',
      }}>
        {/* Imagem de fundo */}
        <img src="https://res.cloudinary.com/dafksmivt/image/upload/v1775268145/ChatGPT_Image_Apr_3_2026_11_02_07_PM_qlh1pt.png" alt="Decants" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          animation: 'heroZoom 18s ease infinite alternate',
        }} />
        {/* Overlay escuro */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.2) 100%)' }} />

        {/* Texto */}
        <div style={{
          position: 'relative', maxWidth: 1280, margin: '0 auto',
          padding: 'clamp(2.5rem, 5vw, 5rem)', width: '100%',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}>
          <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500, color: S.gold }}>
            DECANTS
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700, lineHeight: 1.05, color: '#fff',
            textTransform: 'uppercase', maxWidth: 500,
          }}>
            Descubra as melhores fragrâncias do mundo
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 360 }}>
            Experimente antes de escolher.<br />
            Uma curadoria dos perfumes mais exclusivos em formatos práticos.
          </p>
          <div>
            <button
              onClick={() => { document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }); }}
              style={{
                border: `1px solid ${S.gold}`, padding: '16px 28px',
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                background: 'transparent', cursor: 'pointer', transition: '0.3s',
                color: S.gold, marginTop: '0.5rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = S.gold; e.currentTarget.style.color = '#0b0b0b'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.gold; }}
            >
              DESCUBRA
            </button>
          </div>
        </div>
      </div>

      {/* ─── BLOCO 2: Perfumes Lacrados ──────────────────────────────────── */}
      <div className="hero-section" style={{
        position: 'relative', minHeight: '90vh',
        display: 'flex', overflow: 'hidden',
      }}>
        <img src="https://res.cloudinary.com/dafksmivt/image/upload/v1775270482/ChatGPT_Image_Apr_3_2026_11_40_43_PM_rbnaj9.png" alt="Perfumes Lacrados" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center right', background: '#0a0a0a',
          animation: 'heroZoom 18s ease infinite alternate',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.15) 100%)' }} />

        <div style={{
          position: 'relative', maxWidth: 1280, margin: '0 auto',
          padding: 'clamp(2.5rem, 5vw, 5rem)', width: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem',
        }}>
          <p style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500, color: S.gold }}>
            PERFUMES LACRADOS
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 700, lineHeight: 1.05, color: '#fff',
            textTransform: 'uppercase', maxWidth: 500,
          }}>
            Boadicea<br />The Victorious
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 360 }}>
            Luxo, arte e exclusividade<br />em cada gota.
          </p>
          <div>
            <button
              onClick={() => { setTab('lacrados'); setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              style={{
                border: `1px solid ${S.gold}`, padding: '16px 28px',
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                background: 'transparent', cursor: 'pointer', transition: '0.3s',
                color: S.gold, marginTop: '0.5rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = S.gold; e.currentTarget.style.color = '#0b0b0b'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.gold; }}
            >
              CONHECER
            </button>
          </div>
        </div>
      </div>

      <BrandCarousel />

      {/* ─── CATÁLOGO ─────────────────────────────────────────────────────── */}
      <div id="catalogo" style={{ padding: '5rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#7a6020', marginBottom: '0.75rem', fontWeight: 500 }}>Nossa Coleção</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 600, marginBottom: '0.75rem' }}>Catálogo</h2>
            <p style={{ fontSize: 14, color: '#6b6460' }}>Selecione um perfume para escolher o tamanho e fazer sua reserva.</p>
          </div>

          {/* Tabs */}
          <div className="catalogo-tabs" style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button onClick={() => setTab('decants')} style={{ padding: '12px 24px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(201,168,76,0.4)', cursor: 'pointer', transition: 'all 0.2s', background: tab === 'decants' ? S.gold : 'transparent', color: tab === 'decants' ? '#0d0b07' : '#6b6460', flex: '1 1 auto', minWidth: 0 }}>
              Decants
            </button>
            <button onClick={() => setTab('lacrados')} style={{ padding: '12px 24px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(201,168,76,0.4)', borderLeft: 'none', cursor: 'pointer', transition: 'all 0.2s', background: tab === 'lacrados' ? S.gold : 'transparent', color: tab === 'lacrados' ? '#0d0b07' : '#6b6460', flex: '1 1 auto', minWidth: 0 }}>
              Lacrados
            </button>
            <button onClick={() => setTab('catalogo')} style={{ padding: '12px 24px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(201,168,76,0.4)', borderLeft: 'none', cursor: 'pointer', transition: 'all 0.2s', background: tab === 'catalogo' ? S.gold : 'transparent', color: tab === 'catalogo' ? '#0d0b07' : '#6b6460', flex: '1 1 auto', minWidth: 0 }}>
              Completo
            </button>
          </div>

          {/* Busca */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)} placeholder="Buscar perfume ou marca..." className="catalogo-busca"
              style={{ width: '100%', maxWidth: 320, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', color: S.text, padding: '10px 16px', fontSize: 13, outline: 'none', letterSpacing: '-0.01em', boxSizing: 'border-box' }}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: S.black3, height: 480, borderRadius: 2 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
              {filtrados.map((p, i) => tab === "decants" ? <FrascoCard key={p.id} perfume={p} /> : <PerfumeCard key={p.id} perfume={p} delay={i * 60} />)}
            </div>
          )}

          {/* Carregar mais */}
          {temMais && !loading && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => carregarPerfumes(pagina + 1, busca)} disabled={loadingMore}
                style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#7a6020', padding: '12px 36px', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {loadingMore ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: 12, color: 'rgba(240,236,224,0.25)' }}>{perfumes.length} de {total} fragrâncias</p>
          </div>
        </div>
      </div>

      {/* ─── COMO FUNCIONA ────────────────────────────────────────────────── */}
      <div id="como-funciona" style={{ background: S.black2, borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '3.5rem' }}>Como Funciona</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '2rem' }}>
            {[
              { n: '01', t: 'Escolha', d: 'Navegue pelo catálogo e selecione o perfume desejado.' },
              { n: '02', t: 'Reserve', d: 'Escolha o tamanho do decant e faça sua reserva.' },
              { n: '03', t: 'Receba', d: 'Finalize o pedido e receba seu decant em casa.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', fontWeight: 600, color: S.gold, lineHeight: 1 }}>{s.n}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: S.text2, lineHeight: 1.7, maxWidth: 220 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PRAZO DE ENTREGA ─────────────────────────────────────────────── */}
      <div style={{ padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.75rem', fontWeight: 500 }}>Entregas</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '3rem' }}>Prazo de Entrega</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '📦', t: 'Preparação', d: 'Seu pedido é preparado com cuidado em até 2 dias úteis.' },
              { icon: '🚚', t: 'Envio', d: 'Enviamos para todo o Brasil via transportadora rastreável.' },
              { icon: '📍', t: 'Prazo', d: 'Capitais: 3-5 dias úteis.\nInterior: 5-10 dias úteis.' },
            ].map(s => (
              <div key={s.t} style={{ background: S.black2, border: `1px solid ${S.border}`, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: 36 }}>{s.icon}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 600 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: S.text2, lineHeight: 1.7, whiteSpace: 'pre-line', textAlign: 'center' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <div id="faq" style={{ background: S.black2, borderTop: `1px solid ${S.border}`, padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.75rem', fontWeight: 500 }}>Dúvidas</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600 }}>Perguntas Frequentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ border: `1px solid ${S.border}`, overflow: 'hidden' }}>
                <button onClick={() => setFaqAberto(faqAberto === i ? null : i)} style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: 12, background: faqAberto === i ? 'rgba(201,168,76,0.06)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ color: S.gold, fontSize: 14, flexShrink: 0 }}>{faqAberto === i ? '▲' : '▼'}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: S.text }}>{f.q}</span>
                </button>
                {faqAberto === i && (
                  <div style={{ padding: '0 1.5rem 1.25rem 3rem', fontSize: 14, color: S.text2, lineHeight: 1.8 }}>{f.r}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── QUEM SOMOS ───────────────────────────────────────────────────── */}
      <div id="quem-somos" style={{ borderTop: `1px solid ${S.border}`, padding: '6rem 2.5rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: S.gold, marginBottom: '1rem', fontWeight: 500 }}>Nossa História</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '2rem' }}>Quem Somos</h2>
          <p style={{ fontSize: 15, color: S.text2, lineHeight: 1.9, marginBottom: '1.5rem' }}>
            A <strong style={{ color: S.text, fontWeight: 600 }}>Niche Club</strong> nasceu da paixão por perfumaria de nicho e do desejo de tornar fragrâncias exclusivas acessíveis a todos. Acreditamos que todo mundo merece experimentar o melhor da perfumaria mundial sem precisar investir em um frasco completo.
          </p>
          <p style={{ fontSize: 15, color: S.text2, lineHeight: 1.9 }}>
            Selecionamos cuidadosamente cada fragrância do nosso catálogo, garantindo autenticidade e qualidade em cada decant. Nossa missão é proporcionar uma experiência única de descoberta olfativa, conectando você às melhores casas de perfumaria do mundo.
          </p>
        </div>
      </div>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${S.border}`, padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: S.text3 }}>© 2026 Niche Club — Luxury Perfumes. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

function FrascoCard({ perfume }) {
  const [hovered, setHovered] = useState(false);
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = total > 0 ? Math.round((disponivel / total) * 100) : 0;
  const esgotado = disponivel === 0;
  const precoMin = perfume.opcoes?.[0]?.preco;
  const acordes = [perfume.acorde1, perfume.acorde2, perfume.acorde3, perfume.acorde4, perfume.acorde5].filter(Boolean);

  return (
    <Link to={`/perfume/${perfume.id}`}
      style={{ display: 'block', background: esgotado ? '#f8f6f2' : '#ffffff', border: '1px solid #e8e4dc', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', transition: 'border-color 0.3s, transform 0.3s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)', opacity: esgotado ? 0.65 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem + acordes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 200, position: 'relative' }}>

        {/* Tarja esgotado */}
        {esgotado && (
          <div style={{ position: 'absolute', top: 16, left: -28, width: 120, background: '#e84040', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', padding: '4px 0', transform: 'rotate(-45deg)', zIndex: 10 }}>
            Esgotado
          </div>
        )}

        {/* Imagem */}
        <div style={{ background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, overflow: 'hidden' }}>
          <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome}
            style={{ width: '100%', height: 200, objectFit: 'contain', padding: 8, transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s' }}
          />
        </div>

        {/* Acordes barras */}
        <div style={{ padding: '12px 12px 12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 4 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7a6020', marginBottom: 6, fontWeight: 700, whiteSpace: 'nowrap' }}>Principais acordes</p>
          {acordes.length > 0 ? acordes.map(a => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 18, borderRadius: 3, background: corAcorde(a), display: 'flex', alignItems: 'center', paddingLeft: 8, overflow: 'hidden' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.75)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{a}</span>
              </div>
            </div>
          )) : (
            <p style={{ fontSize: 11, color: '#ccc', fontStyle: 'italic' }}>—</p>
          )}

          {/* Rating */}
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

      {/* Info inferior */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6020', marginBottom: 3, fontWeight: 600 }}>{perfume.marca}</p>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: 4, lineHeight: 1.2 }}>{perfume.nome}</h3>
        {perfume.genero && <p style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>{perfume.genero}</p>}

        {/* Barra estoque */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 4 }}>
          <span>{disponivel}ml disponivel</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: '0.75rem' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: `${100 - pct}%`, transition: 'width 0.5s' }} />
        </div>

        {/* Preco */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {precoMin
            ? <p style={{ fontSize: 13, color: '#111' }}>A partir de <span style={{ color: '#c9a84c', fontWeight: 700 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>
            : <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Consultar preco</p>
          }
          <span style={{ fontSize: 10, color: '#c9a84c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ver →</span>
        </div>
      </div>
    </Link>
  );
}


function PerfumeCard({ perfume, delay }) {
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = Math.min(100, Math.round((disponivel / total) * 100));
  const precoMin = perfume.opcoes?.[0]?.preco;
  const esgotado = disponivel === 0;
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/perfume/${perfume.id}`} className="fade-in" style={{
      animationDelay: `${delay}ms`, opacity: 0, display: 'block',
      background: '#ffffff',
      border: '1px solid #e8e4dc',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      borderRadius: 4,
      overflow: 'hidden',
      transition: 'border-color 0.3s, transform 0.3s',
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem */}
      <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', background: '#ffffff' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '8px', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.5s ease' }} />
          : <img src="/frasco.jpeg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '8px', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.5s ease', filter: 'brightness(0.7)' }} />
        }
        {/* Badge família olfativa */}
        {perfume.acorde1 && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(13,11,7,0.85)', border: '1px solid rgba(201,168,76,0.35)', padding: '3px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a84c', backdropFilter: 'blur(4px)' }}>
            {perfume.acorde1}
          </div>
        )}
        {esgotado && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(160,30,30,0.9)', padding: '3px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
            Esgotado
          </div>
        )}
        {/* Barra de estoque */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8c870)', width: `${100 - pct}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7a6020', marginBottom: 5, fontWeight: 500 }}>{perfume.marca}</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 500, color: hovered ? '#9a7d3a' : '#0d0b07', transition: 'color 0.3s', marginBottom: 6, lineHeight: 1.2 }}>{perfume.nome}</h3>
        {perfume.familia_olfativa && (
          <p style={{ fontSize: 11, color: '#a09880', marginBottom: 12, fontStyle: 'italic' }}>{perfume.familia_olfativa}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #ede9e0' }}>
          {precoMin
            ? <p style={{ fontSize: 13, color: '#6b6460' }}>A partir de <span style={{ color: '#7a6020', fontWeight: 500 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>
            : <p style={{ fontSize: 12, color: '#b0a888', fontStyle: 'italic' }}>Consultar preço</p>
          }
          <span style={{ fontSize: 11, color: '#b0a888' }}>{disponivel}ml</span>
        </div>
      </div>
    </Link>
  );
}


const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', acorde1: 'Floral', ml_disponivel: 38, ml_total: 100, opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', acorde1: 'Amadeirado', ml_disponivel: 220, ml_total: 250, opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Neroli Portofino', marca: 'Tom Ford', acorde1: 'Cítrico', ml_disponivel: 0, ml_total: 100, opcoes: [{ preco: 35 }] },
  { id: '4', nome: 'Rose Prick', marca: 'Tom Ford', acorde1: 'Floral', ml_disponivel: 105, ml_total: 150, opcoes: [{ preco: 40 }] },
  { id: '5', nome: 'Santal 33', marca: 'Le Labo', acorde1: 'Amadeirado', ml_disponivel: 80, ml_total: 100, opcoes: [{ preco: 36 }] },
  { id: '6', nome: 'Another 13', marca: 'Le Labo', acorde1: 'Almiscarado', ml_disponivel: 25, ml_total: 100, opcoes: [{ preco: 38 }] },
];
