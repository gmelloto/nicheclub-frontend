import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    try {
      await login(email, senha);
      navigate('/admin');
    } catch {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl">◈</span>
          <h1 className="text-xl font-semibold mt-2">Niche Club</h1>
          <p className="text-sm text-gray-400">Painel administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" required />
          </div>
          {erro && <p className="text-xs text-red-500">{erro}</p>}
          <button type="submit" disabled={carregando} className="w-full py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
