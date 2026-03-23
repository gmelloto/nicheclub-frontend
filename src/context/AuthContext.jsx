import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nc_token');
    const user = localStorage.getItem('nc_usuario');
    if (token && user) setUsuario(JSON.parse(user));
    setCarregando(false);
  }, []);

  async function login(email, senha) {
    const { data } = await api.post('/api/auth/login', { email, senha });
    localStorage.setItem('nc_token', data.token);
    localStorage.setItem('nc_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  }

  function logout() {
    localStorage.removeItem('nc_token');
    localStorage.removeItem('nc_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
