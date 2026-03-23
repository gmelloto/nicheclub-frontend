import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: transparent ? 'transparent' : 'rgba(255,255,255,0.96)',
      backdropFilter: transparent ? 'none' : 'blur(12px)',
      borderBottom: transparent ? 'none' : '1px solid var(--border)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 3rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Links esquerda */}
        <div style={{ display: 'flex', gap: '2.5rem', flex: 1 }}>
          {[['/', 'Catálogo'], ['/', 'Como Funciona'], ['/', 'FAQ']].map(([to, label]) => (
            <Link key={label} to={to} style={{
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: transparent ? 'rgba(255,255,255,0.85)' : 'var(--text2)',
              fontWeight: 400, transition: 'color 0.3s',
            }}
              onMouseEnter={e => e.target.style.color = transparent ? '#fff' : 'var(--text)'}
              onMouseLeave={e => e.target.style.color = transparent ? 'rgba(255,255,255,0.85)' : 'var(--text2)'}
            >{label}</Link>
          ))}
        </div>

        {/* Logo centro */}
        <Link to="/" style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 400, letterSpacing: '0.25em',
            color: transparent ? '#fff' : 'var(--text)',
            textTransform: 'uppercase', lineHeight: 1,
            transition: 'color 0.4s',
          }}>Niche Club</span>
          <span style={{
            fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
            color: transparent ? 'rgba(255,255,255,0.6)' : 'var(--gold)',
            fontWeight: 400, marginTop: 3, transition: 'color 0.4s',
          }}>Luxury Perfumes</span>
        </Link>

        {/* Ações direita */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem', flex: 1 }}>
          {usuario ? (
            <>
              <Link to="/admin" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: transparent ? 'rgba(255,255,255,0.85)' : 'var(--text2)' }}>Admin</Link>
              <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: transparent ? 'rgba(255,255,255,0.85)' : 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer' }}>Sair</button>
            </>
          ) : (
            <Link to="/admin/login" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: transparent ? 'rgba(255,255,255,0.85)' : 'var(--text2)' }}>Login</Link>
          )}
          <Link to="/carrinho" style={{ position: 'relative', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: transparent ? 'rgba(255,255,255,0.85)' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            Carrinho
            {items.length > 0 && (
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--gold)', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
