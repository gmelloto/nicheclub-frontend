import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const AuthContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const adicionar = (perfume, tamanho, preco, ml) => {
    setItems(prev => [...prev, {
      id: Date.now(),
      perfume_id: perfume.id,
      nome: perfume.nome,
      marca: perfume.marca,
      tamanho,
      preco,
      ml,
    }]);
  };

  const remover = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const limpar = () => setItems([]);

  const total = items.reduce((a, i) => a + i.preco, 0);

  return (
    <CartContext.Provider value={{ items, adicionar, remover, limpar, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('nc_token');
    const u = localStorage.getItem('nc_usuario');
    if (t && u) { setToken(t); setUsuario(JSON.parse(u)); }
  }, []);

  const login = (t, u) => {
    setToken(t); setUsuario(u);
    localStorage.setItem('nc_token', t);
    localStorage.setItem('nc_usuario', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null); setUsuario(null);
    localStorage.removeItem('nc_token');
    localStorage.removeItem('nc_usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
export const useAuth = () => useContext(AuthContext);
