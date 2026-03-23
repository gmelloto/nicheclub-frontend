import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, AuthProvider } from './context';
import Navbar from './components/layout/Navbar';
import Catalogo from './pages/Catalogo';
import Perfume from './pages/Perfume';
import Carrinho from './pages/Carrinho';
import Admin from './pages/Admin';
import Login from './pages/Login';
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
