import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const linkStyle = { fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.75)', fontWeight: 500, transition: 'color 0.2s', cursor: 'pointer', textDecoration: 'none' };

  return (
    <>
      <nav style={{ background: '#0d0b07', borderBottom: '1px solid rgba(201,168,76,0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Hamburguer mobile - ESQUERDA */}
          <button onClick={() => setMenuAberto(!menuAberto)} className="nav-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
            <span style={{ display: 'block', width: 22, height: 2, background: '#c9a84c', borderRadius: 1, transition: 'all 0.3s', transform: menuAberto ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#c9a84c', borderRadius: 1, opacity: menuAberto ? 0 : 1, transition: 'opacity 0.3s' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#c9a84c', borderRadius: 1, transition: 'all 0.3s', transform: menuAberto ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.3)', flexShrink: 0 }}>
              <img src="/logo.jpeg" alt="Niche Club" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 600, color: '#c9a84c', letterSpacing: '0.12em', lineHeight: 1.1 }}>NICHE CLUB</span>
              <span style={{ fontSize: 8, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase' }}>Luxury Perfumes</span>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="nav-desktop" style={{ display: 'flex', gap: '2rem' }}>
            {[['/decants', 'Decants'], ['#catalogo', 'Catálogo'], ['#como-funciona', 'Como Funciona'], ['#faq', 'FAQ'], ['#quem-somos', 'Quem Somos']].map(([to, label]) => (
              <a key={label} href={to} style={linkStyle}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = 'rgba(240,236,224,0.75)'}
              >{label}</a>
            ))}
            {usuario && <Link to="/admin" style={linkStyle}>Admin</Link>}
          </div>

          {/* Acoes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {usuario ? (
                <button onClick={() => { logout(); navigate('/'); }} style={{ ...linkStyle, background: 'none', border: 'none' }}>Sair</button>
              ) : (
                <Link to="/admin/login" style={linkStyle}>Login</Link>
              )}
            </div>

            <Link to="/carrinho" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#c9a84c', color: '#0d0b07', padding: '9px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', position: 'relative', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span className="nav-desktop">Carrinho</span>
              {items.length > 0 && (
                <span style={{ position: 'absolute', top: -7, right: -7, background: '#fff', color: '#0d0b07', width: 17, height: 17, borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{items.length}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Menu mobile */}
        {menuAberto && (
          <div className="nav-mobile" style={{ display: 'none', background: '#0d0b07', borderTop: '1px solid rgba(201,168,76,0.15)', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['/decants', 'Decants'], ['#catalogo', 'Catálogo'], ['#como-funciona', 'Como Funciona'], ['#faq', 'FAQ'], ['#quem-somos', 'Quem Somos']].map(([to, label]) => (
                <a key={label} href={to} onClick={() => setMenuAberto(false)}
                  style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.7)', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}
                >{label}</a>
              ))}
              {usuario && <Link to="/admin" onClick={() => setMenuAberto(false)} style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.7)', fontWeight: 500 }}>Admin</Link>}
              {usuario
                ? <button onClick={() => { logout(); navigate('/'); setMenuAberto(false); }} style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.5)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Sair</button>
                : <Link to="/admin/login" onClick={() => setMenuAberto(false)} style={{ fontSize: 13, color: 'rgba(240,236,224,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Login</Link>
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
