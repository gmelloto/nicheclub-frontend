import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const { token, usuario } = await api.login(email, senha);
      login(token, usuario);
      navigate('/admin');
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/images/logo/logo-icon.png" alt="Niche Club" style={{ height: 80, borderRadius: 16, objectFit: 'contain', marginBottom: '0.5rem' }} />
          <p className="muted small caps" style={{ marginTop: 8 }}>Painel Admin</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)', display: 'block', marginBottom: 6 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@nicheclub.com" required />
          </div>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          {erro && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{erro}</p>}
          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', padding: '12px', width: '100%', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', color: '#0d0b07', opacity: loading ? 0.7 : 1, letterSpacing: '0.05em' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
