import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const links = [
    ['/decants', 'Decants'],
    ['#catalogo', 'Catálogo'],
    ['#como-funciona', 'Como Funciona'],
    ['#faq', 'FAQ'],
    ['#quem-somos', 'Quem Somos'],
  ];

  const linkStyle = {
    fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'rgba(240,236,224,0.7)', fontWeight: 500, transition: 'color 0.2s',
    cursor: 'pointer', textDecoration: 'none', padding: '6px 0',
  };

  return (
    <>
      <nav style={{ background: '#0d0b07', borderBottom: '1px solid rgba(201,168,76,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* ── Linha 1: Hamburger | Logo central | Ícones ── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70, position: 'relative' }}>

          {/* Hamburger mobile */}
          <button onClick={() => setMenuAberto(!menuAberto)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none', flexDirection: 'column', gap: 5, flexShrink: 0, width: 40, zIndex: 2 }}>
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#c9a84c', transition: 'all 0.3s', transform: menuAberto ? 'rotate(45deg) translateY(6.5px)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#c9a84c', opacity: menuAberto ? 0 : 1, transition: 'opacity 0.3s' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#c9a84c', transition: 'all 0.3s', transform: menuAberto ? 'rotate(-45deg) translateY(-6.5px)' : 'none' }} />
          </button>

          {/* Spacer esquerdo desktop */}
          <div className="nav-desktop" style={{ width: 120, flexShrink: 0 }} />

          {/* Logo centralizado (absolute para ficar sempre no centro) */}
          <Link to="/" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', zIndex: 1 }}>
            <span style={{
              fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700,
              color: '#D3AF37', letterSpacing: '0.15em', lineHeight: 1,
            }}>NICHE CLUB</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 9, letterSpacing: '0.3em', color: 'rgba(211,175,55,0.75)', textTransform: 'uppercase', fontWeight: 500 }}>Luxury Perfumes</span>
          </Link>

          {/* Ícones à direita */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: 120, justifyContent: 'flex-end', flexShrink: 0, zIndex: 2 }}>
            {/* Login/Sair - desktop only */}
            <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center' }}>
              {usuario ? (
                <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(240,236,224,0.6)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,224,0.6)'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              ) : (
                <Link to="/admin/login" style={{ color: 'rgba(240,236,224,0.6)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,224,0.6)'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
              )}
            </div>

            {/* Carrinho */}
            <Link to="/carrinho" style={{ position: 'relative', color: 'rgba(240,236,224,0.6)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,236,224,0.6)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {items.length > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: '#c9a84c', color: '#0d0b07', width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{items.length}</span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Linha 2: Links de navegação (desktop) ── */}
        <div className="nav-desktop" style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 3vw, 3rem)',
          padding: '0 1.25rem 12px', borderTop: '1px solid rgba(201,168,76,0.08)',
        }}>
          {links.map(([to, label]) => (
            <a key={label} href={to} style={linkStyle}
              onMouseEnter={e => e.target.style.color = '#c9a84c'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,236,224,0.7)'}
            >{label}</a>
          ))}
          {usuario && <Link to="/admin" style={linkStyle}>Admin</Link>}
        </div>

        {/* Menu mobile dropdown */}
        {menuAberto && (
          <div className="nav-mobile" style={{ display: 'none', background: '#0d0b07', borderTop: '1px solid rgba(201,168,76,0.1)', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {links.map(([to, label]) => (
                <a key={label} href={to} onClick={() => setMenuAberto(false)}
                  style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.7)', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}
                >{label}</a>
              ))}
              {usuario && <Link to="/admin" onClick={() => setMenuAberto(false)} style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.7)', fontWeight: 500 }}>Admin</Link>}
              {usuario
                ? <button onClick={() => { logout(); navigate('/'); setMenuAberto(false); }} style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.4)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0' }}>Sair</button>
                : <Link to="/admin/login" onClick={() => setMenuAberto(false)} style={{ fontSize: 12, color: 'rgba(240,236,224,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.5rem 0' }}>Login</Link>
              }
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile { display: none !important; }
          .nav-desktop { display: flex !important; }
        }
      `}</style>
    </>
  );
}
