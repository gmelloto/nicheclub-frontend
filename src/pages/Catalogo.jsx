import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

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
    <div style={{ background: 'var(--black)' }}>

      {/* Hero — foto do frasco em tela cheia */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/frasco.jpeg" alt="Niche Club" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,9,5,0.2) 0%, rgba(10,9,5,0.5) 50%, rgba(10,9,5,0.95) 100%)' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 2rem', maxWidth: 700 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem', fontWeight: 500 }}>
            Perfumaria de Nicho Fracionada
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3.5rem, 8vw, 7rem)', fontWeight: 400, color: '#fff', lineHeight: 1.0, letterSpacing: '0.04em', marginBottom: '1.5rem' }}>
            A Essência<br /><em style={{ fontStyle: 'italic', color: 'var(--gold2)' }}>do Luxo</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(240,236,224,0.65)', marginBottom: '3rem', lineHeight: 1.9, letterSpacing: '0.03em' }}>
            Os maiores perfumes do mundo em doses exclusivas de 3ml a 15ml
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#colecao" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c870)', color: '#0a0905', padding: '14px 36px', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'inline-block', cursor: 'pointer' }}>
              Ver Coleção
            </a>
            <a href="#como-funciona" style={{ background: 'transparent', color: 'var(--gold)', padding: '13px 36px', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(201,168,76,0.4)', display: 'inline-block', cursor: 'pointer' }}>
              Como Funciona
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 1, height: 40, background: 'rgba(201,168,76,0.4)' }} />
          <p style={{ fontSize: 9, letterSpacing: '0.4em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase' }}>Role</p>
        </div>
      </div>

      {/* Seção com caixa + texto */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '70vh' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="/caixa.jpeg" alt="Embalagem Niche Club" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,9,5,0.3)' }} />
        </div>
        <div style={{ background: 'var(--black2)', padding: '5rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem', fontWeight: 500 }}>Nossa Proposta</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: '2rem' }}>
            Cada frasco,<br />uma<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>experiência única</em>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.9, marginBottom: '2.5rem', maxWidth: 380 }}>
            Acreditamos que descobrir um perfume é uma experiência íntima. Por isso oferecemos as melhores fragrâncias do mundo em doses acessíveis — com embalagem exclusiva Niche Club.
          </p>
          <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem' }}>
            {[{ n: '+50', l: 'Fragrâncias' }, { n: '3ml', l: 'Dose mínima' }, { n: '24h', l: 'Entrega' }].map(s => (
              <div key={s.n}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: 'var(--gold)', lineHeight: 1, fontWeight: 400 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <a href="#colecao" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.3)', paddingBottom: 4, width: 'fit-content', transition: 'border-color 0.3s', cursor: 'pointer' }}>
            Explorar coleção →
          </a>
        </div>
      </div>

      {/* Catálogo */}
      <div id="colecao" style={{ maxWidth: 1280, margin: '0 auto', padding: '7rem 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontWeight: 500 }}>A Coleção</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400 }}>Nossas Fragrâncias</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar..."
              style={{ maxWidth: 220, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border2)', borderRadius: 0, padding: '8px 0', fontSize: 12, letterSpacing: '0.08em', outline: 'none', color: 'var(--text)' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.1em' }}>{filtrados.length} fragrâncias</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ paddingBottom: '145%', marginBottom: '1.5rem' }} />
                <div className="skeleton" style={{ height: 11, width: '40%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 20, width: '70%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {filtrados.map((p, i) => <PerfumeCard key={p.id} perfume={p} delay={i * 80} />)}
          </div>
        )}
      </div>

      {/* Segundo frasco — seção escura */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <img src="/frasco2.jpeg" alt="Niche Club Perfume" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,9,5,0.95) 40%, rgba(10,9,5,0.3) 100%)' }} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', width: '100%' }}>
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem', fontWeight: 500 }}>Como Funciona</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem, 4vw, 4rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '3rem' }}>
              Simples como<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>deve ser</em>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { n: '01', t: 'Escolha a fragrância', d: 'Navegue pelo catálogo e selecione o perfume e o tamanho — de 3ml a 15ml ou APC (frasco completo).' },
                { n: '02', t: 'Pague com segurança', d: 'Pix com aprovação imediata ou cartão em até 12x via PagSeguro.' },
                { n: '03', t: 'Receba em casa', d: 'Enviamos em até 24h. Atualizações do pedido pelo WhatsApp.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'rgba(201,168,76,0.4)', lineHeight: 1, fontStyle: 'italic', flexShrink: 0, minWidth: 40 }}>{s.n}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text)', marginBottom: 6 }}>{s.t}</p>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '3rem' }}>
              <Link to="/carrinho" style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c870)', color: '#0a0905', padding: '14px 36px', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'inline-block', cursor: 'pointer' }}>
                Comprar Agora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '3rem 2.5rem', textAlign: 'center' }}>
        <img src="/logo.jpeg" alt="Niche Club" style={{ height: 40, objectFit: 'contain', opacity: 0.7, marginBottom: '1.5rem', display: 'block', margin: '0 auto 1.5rem' }} />
        <p style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Luxury Perfumes · Fracionamento Exclusivo · Brasil
        </p>
      </div>
    </div>
  );
}

function PerfumeCard({ perfume, delay }) {
  const disponivel = Number(perfume.ml_disponivel || 0);
  const total = Number(perfume.ml_total || 100);
  const pct = Math.min(100, Math.round((disponivel / total) * 100));
  const precoMin = perfume.opcoes?.[0]?.preco;
  const esgotando = pct >= 75;
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/perfume/${perfume.id}`} className="fade-in" style={{ animationDelay: `${delay}ms`, opacity: 0, display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem */}
      <div style={{ position: 'relative', paddingBottom: '145%', overflow: 'hidden', background: 'var(--black3)', marginBottom: '1.25rem' }}>
        {perfume.foto_url
          ? <img src={perfume.foto_url} alt={perfume.nome} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.8s ease' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <img src="/frasco.jpeg" alt="" style={{ width: '60%', height: '80%', objectFit: 'contain', opacity: 0.7, transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.8s ease' }} />
            </div>
        }
        {/* Badges */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {esgotando && <span style={{ background: 'rgba(180,30,30,0.85)', color: '#fff', padding: '3px 10px', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Últimas unidades</span>}
        </div>
        {/* Estoque */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', background: esgotando ? '#c0392b' : 'var(--gold)', width: `${100 - pct}%` }} />
        </div>
      </div>

      {/* Info */}
      <div>
        <p style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>{perfume.marca}</p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 400, marginBottom: 6, color: hovered ? 'var(--gold2)' : 'var(--text)', transition: 'color 0.3s', letterSpacing: '0.02em' }}>{perfume.nome}</h3>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, fontStyle: 'italic' }}>{perfume.familia_olfativa}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {precoMin && <p style={{ fontSize: 13, color: 'var(--text2)' }}>a partir de <span style={{ color: 'var(--gold)', fontWeight: 500 }}>R$ {Number(precoMin).toFixed(2).replace('.', ',')}</span></p>}
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{disponivel}ml</span>
        </div>
      </div>
    </Link>
  );
}

const DEMO = [
  { id: '1', nome: 'Baccarat Rouge 540', marca: 'Maison Francis Kurkdjian', familia_olfativa: 'Amadeirado Floral', ml_disponivel: 38, ml_total: 100, opcoes: [{ preco: 38 }] },
  { id: '2', nome: 'Oud Wood', marca: 'Tom Ford', familia_olfativa: 'Amadeirado Oriental', ml_disponivel: 220, ml_total: 250, opcoes: [{ preco: 42 }] },
  { id: '3', nome: 'Neroli Portofino', marca: 'Tom Ford', familia_olfativa: 'Cítrico', ml_disponivel: 12, ml_total: 100, opcoes: [{ preco: 35 }] },
  { id: '4', nome: 'Rose Prick', marca: 'Tom Ford', familia_olfativa: 'Floral', ml_disponivel: 105, ml_total: 150, opcoes: [{ preco: 40 }] },
];
