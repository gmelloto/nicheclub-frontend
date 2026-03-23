import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(248,249,252,0.95)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 8px rgba(79,110,247,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(79,110,247,0.3)' }}>N</div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Niche </span>
            <span style={{ fontSize: 16, fontWeight: 700, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Club</span>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['/', 'Catálogo'], ['/como-funciona', 'Como Funciona'], ['/faq', 'FAQ']].map(([to, label]) => (
            <Link key={to} to={to} style={{ fontSize: 14, fontWeight: 400, color: 'var(--text2)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--blue)'}
              onMouseLeave={e => e.target.style.color = 'var(--text2)'}
            >{label}</Link>
          ))}
          {usuario && <Link to="/admin" style={{ fontSize: 14, color: 'var(--text2)' }}>Admin</Link>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {usuario ? (
            <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '9px 18px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, color: 'var(--text2)', background: 'none', cursor: 'pointer' }}>
              Sair
            </button>
          ) : (
            <Link to="/admin/login" style={{ padding: '9px 18px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Login
            </Link>
          )}
          <Link to="/carrinho" style={{ padding: '9px 20px', background: 'var(--grad)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, position: 'relative', boxShadow: '0 4px 12px rgba(79,110,247,0.3)', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Carrinho
            {items.length > 0 && (
              <span style={{ position: 'absolute', top: -7, right: -7, background: 'var(--gold)', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
