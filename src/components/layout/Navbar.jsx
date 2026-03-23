import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 2rem',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, letterSpacing: '0.05em', color: 'var(--text)', lineHeight: 1.1 }}>
            Niche Club
          </span>
          <span style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>
            Luxury Perfumes
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {['Catálogo', 'Como Funciona', 'FAQ'].map(l => (
            <Link key={l} to="/" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 400, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text2)'}
            >{l}</Link>
          ))}
          {usuario && (
            <Link to="/admin" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)', fontWeight: 400 }}>Admin</Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {usuario ? (
            <button onClick={() => { logout(); navigate('/'); }}
              style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Sair
            </button>
          ) : (
            <Link to="/admin/login" style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</Link>
          )}
          <Link to="/carrinho" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'var(--text)', color: '#fff',
            borderRadius: 'var(--radius)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase', position: 'relative',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--text)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Carrinho
            {items.length > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -7,
                background: 'var(--gold)', color: '#fff',
                width: 18, height: 18, borderRadius: '50%',
                fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
