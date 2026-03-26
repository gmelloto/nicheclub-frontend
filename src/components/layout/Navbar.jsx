import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const linkStyle = { fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.75)', fontWeight: 500, transition: 'color 0.2s', cursor: 'pointer' };

  return (
    <nav style={{ background: '#0d0b07', borderBottom: '1px solid rgba(201,168,76,0.2)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.3)', flexShrink: 0 }}>
            <img src="/logo.jpeg" alt="Niche Club" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#c9a84c', letterSpacing: '0.08em', lineHeight: 1.1 }}>NICHE CLUB</div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', textTransform: 'uppercase', fontWeight: 400 }}>Luxury Perfumes</div>
          </div>
        </Link>

        {/* Links centro */}
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {[['#catalogo', 'Catálogo'], ['#como-funciona', 'Como Funciona'], ['#faq', 'FAQ'], ['#quem-somos', 'Quem Somos']].map(([to, label]) => (
            <a key={label} href={to} style={linkStyle}
              onMouseEnter={e => e.target.style.color = '#c9a84c'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,236,224,0.75)'}
            >{label}</a>
          ))}
          {usuario && <Link to="/admin" style={linkStyle}>Admin</Link>}
        </div>

        {/* Carrinho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {usuario ? (
            <button onClick={() => { logout(); navigate('/'); }} style={{ ...linkStyle, background: 'none', border: 'none' }}>Sair</button>
          ) : (
            <Link to="/admin/login" style={linkStyle}>Login</Link>
          )}
          <Link to="/carrinho" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c9a84c', color: '#0d0b07', padding: '10px 20px', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8c870'}
            onMouseLeave={e => e.currentTarget.style.background = '#c9a84c'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Carrinho
            {items.length > 0 && (
              <span style={{ position: 'absolute', top: -7, right: -7, background: '#fff', color: '#0d0b07', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
