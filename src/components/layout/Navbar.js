import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context';
import './Navbar.css';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">◈</span>
          <span className="logo-text">NICHE CLUB</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Catálogo</Link>
          {usuario && <Link to="/admin" className="nav-link">Admin</Link>}
        </div>

        <div className="navbar-actions">
          {usuario ? (
            <button className="nav-link" onClick={() => { logout(); navigate('/'); }}>
              Sair
            </button>
          ) : (
            <Link to="/admin/login" className="nav-link muted">Admin</Link>
          )}
          <Link to="/carrinho" className="cart-btn">
            <span className="cart-icon">◻</span>
            <span className="cart-label">Carrinho</span>
            {items.length > 0 && (
              <span className="cart-count">{items.length}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
