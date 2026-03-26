import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Barra de frete grátis */}
      <div style={{ background: "#1a1a2e", padding: '8px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
          Frete grátis acima de R$ 150
        </p>
      </div>

      <nav style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1 }}>NICHE</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--text3)', textTransform: 'uppercase' }}>01 / LUXURY PERFUMES</span>
          </Link>

          {/* Nav links com pill */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg3)', padding: '6px', borderRadius: 'var(--radius-pill)' }}>
            {[['/', 'Shop'], ['/', 'Catálogo'], ['/', 'Sobre'], ['/', 'FAQs']].map(([to, label]) => (
              <Link key={label} to={to} className="nav-pill" style={{ padding: '7px 16px', fontSize: 12 }}>{label}</Link>
            ))}
            {usuario && <Link to="/admin" className="nav-pill" style={{ padding: '7px 16px', fontSize: 12 }}>Admin</Link>}
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Search_
            </button>
            {usuario ? (
              <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Account
              </button>
            ) : (
              <Link to="/admin/login" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Account</Link>
            )}
            <Link to="/carrinho" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Bag [{items.length}]
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
