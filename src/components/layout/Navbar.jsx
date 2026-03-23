import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [bg, setBg] = useState('rgba(255,255,255,0.72)');

  useEffect(() => {
    const handler = () => {
      setBg(window.scrollY > 10 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.72)');
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLink = { fontSize: 12, color: '#1d1d1f', opacity: 0.8, letterSpacing: 0, fontWeight: 400, transition: 'opacity 0.2s', padding: '0 8px' };

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: bg, backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.08)', height: 44, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo Apple-style */}
        <Link to="/" style={{ fontSize: 18, color: '#1d1d1f', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
          ◈
        </Link>

        {/* Nav links centralizados */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[['/', 'Loja'], ['/', 'Catálogo'], ['/', 'Como Funciona'], ['/', 'FAQ']].map(([to, label]) => (
            <Link key={label} to={to} style={navLink}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0.8'}
            >{label}</Link>
          ))}
          {usuario && <Link to="/admin" style={navLink}>Admin</Link>}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {usuario ? (
            <button onClick={() => { logout(); navigate('/'); }} style={{ ...navLink, background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Sair</button>
          ) : (
            <Link to="/admin/login" style={navLink}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
          <Link to="/carrinho" style={{ ...navLink, position: 'relative', padding: '0 8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.8 }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {items.length > 0 && (
              <span style={{ position: 'absolute', top: -5, right: 0, background: '#0071e3', color: '#fff', width: 14, height: 14, borderRadius: '50%', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
