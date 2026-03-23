import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, AuthProvider } from './context/index.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Perfume from './pages/Perfume.jsx';
import Carrinho from './pages/Carrinho.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Catalogo />} />
            <Route path="/perfume/:id" element={<Perfume />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
