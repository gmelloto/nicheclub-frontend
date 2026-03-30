import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider, AuthProvider } from './context/index.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Perfume from './pages/Perfume.jsx';
import Carrinho from './pages/Carrinho.jsx';
import Admin from './pages/Admin.js';
import AdminProdutos from './pages/AdminProdutos.jsx';
import AdminNotas from './pages/AdminNotas.jsx';
import Login from './pages/Login.jsx';
import Decants from './pages/Frascos.jsx';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Catalogo />} />
            <Route path="/perfume/:id" element={<Perfume />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/produtos" element={<AdminProdutos />} />
            <Route path="/admin/notas" element={<AdminNotas />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/decants" element={<Decants />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
