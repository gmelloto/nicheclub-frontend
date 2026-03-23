import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Catalogo from './pages/Catalogo';
import Perfume from './pages/Perfume';
import Checkout from './pages/Checkout';
import Confirmacao from './pages/Confirmacao';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEstoque from './pages/admin/Estoque';
import AdminPedidos from './pages/admin/Pedidos';
import AdminWhatsApp from './pages/admin/WhatsApp';

function RotaAdmin({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return null;
  return usuario ? children : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogo />} />
      <Route path="/perfume/:id" element={<Perfume />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmacao/:numero" element={<Confirmacao />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RotaAdmin><AdminDashboard /></RotaAdmin>} />
      <Route path="/admin/estoque" element={<RotaAdmin><AdminEstoque /></RotaAdmin>} />
      <Route path="/admin/pedidos" element={<RotaAdmin><AdminPedidos /></RotaAdmin>} />
      <Route path="/admin/whatsapp" element={<RotaAdmin><AdminWhatsApp /></RotaAdmin>} />
    </Routes>
  );
}
