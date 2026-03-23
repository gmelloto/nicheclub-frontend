import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Navbar({ onCartClick }) {
  const { quantidade } = useCart();
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          <span className="text-brand-400">◈</span> Niche Club
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-sm text-gray-400 hover:text-gray-600">Admin</Link>
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Carrinho
            {quantidade > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {quantidade}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
