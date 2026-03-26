import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,9,5,0.95)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(201,168,76,0.12)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Links esquerda */}
        <div style={{ display: 'flex', gap: '2.5rem', flex: 1 }}>
          {[['/', 'Catálogo'], ['/', 'Como Funciona'], ['/', 'FAQ']].map(([to, l]) => (
            <Link key={l} to={to} style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.5)', fontWeight: 400, transition: 'color 0.3s' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'rgba(240,236,224,0.5)'}
            >{l}</Link>
          ))}
        </div>

        {/* Logo central com imagem */}
        <Link to="/" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/logo.jpeg" alt="Niche Club" style={{ height: 48, objectFit: 'contain' }} />
        </Link>

        {/* Ações direita */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2rem' }}>
          {usuario ? (
            <>
              <Link to="/admin" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.5)' }}>Admin</Link>
              <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Sair</button>
            </>
          ) : (
            <Link to="/admin/login" style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.5)' }}>Login</Link>
          )}
          <Link to="/carrinho" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', border: '1px solid rgba(201,168,76,0.28)', color: 'var(--gold)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'background 0.3s', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Carrinho
            {items.length > 0 && (
              <span style={{ position: 'absolute', top: -7, right: -7, background: 'var(--gold)', color: '#0a0905', width: 17, height: 17, borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
