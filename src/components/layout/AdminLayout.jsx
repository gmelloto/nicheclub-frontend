import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { path: '/admin', label: 'Dashboard', icon: '◉' },
  { path: '/admin/estoque', label: 'Estoque', icon: '⊞' },
  { path: '/admin/pedidos', label: 'Pedidos', icon: '◫' },
  { path: '/admin/whatsapp', label: 'WhatsApp', icon: '◎' },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="font-semibold"><span className="text-brand-400">◈</span> Niche Club</div>
          <div className="text-xs text-gray-400 mt-1">{usuario?.nome}</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {MENU.map(m => (
            <Link key={m.path} to={m.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === m.path ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{m.icon}</span>{m.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/admin/login'); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
