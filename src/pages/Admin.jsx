import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../services/api';
import './Admin.css';

export default function Admin() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState('pedidos');

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <span className="gold">◈</span> Admin
        </div>
        <p className="small muted" style={{ marginBottom: '2rem' }}>{usuario?.nome}</p>
        {['pedidos', 'estoque', 'whatsapp'].map(a => (
          <button key={a} className={`admin-nav-btn ${aba === a ? 'active' : ''}`} onClick={() => setAba(a)}>
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
        <button className="admin-nav-btn" onClick={() => navigate('/admin/produtos')} style={{ marginTop: '1rem', color: '#c9a84c', borderTop: '1px solid #e8e4dc', paddingTop: '1rem' }}>
          + Cadastrar Produto
        </button>
        <button className="admin-nav-btn" onClick={() => navigate('/admin/notas')} style={{ color: '#c9a84c' }}>
          Notas Olfativas
        </button>
      </div>
      <div className="admin-content">
        {aba === 'pedidos' && <PainelPedidos token={token} />}
        {aba === 'estoque' && <PainelEstoque token={token} />}
        {aba === 'whatsapp' && <PainelWhatsApp token={token} />}
      </div>
    </div>
  );
}

function PainelPedidos({ token }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    api.listarPedidos(token, filtro || undefined)
      .then(setPedidos).catch(() => setPedidos(DEMO_PEDIDOS))
      .finally(() => setLoading(false));
  }, [token, filtro]);

  const statusLabel = {
    aguardando_pagamento: { label: 'Aguardando pgto', cls: 'badge-gray' },
    pagamento_aprovado: { label: 'Pago', cls: 'badge-green' },
    em_separacao: { label: 'Em separação', cls: 'badge-gold' },
    enviado: { label: 'Enviado', cls: 'badge-gold' },
    entregue: { label: 'Entregue', cls: 'badge-green' },
    cancelado: { label: 'Cancelado', cls: 'badge-red' },
  };

  return (
    <div className="fade-in">
      <div className="painel-header">
        <h2>Pedidos</h2>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
          <option value="">Todos os status</option>
          <option value="aguardando_pagamento">Aguardando pagamento</option>
          <option value="pagamento_aprovado">Pagamento aprovado</option>
          <option value="em_separacao">Em separação</option>
          <option value="enviado">Enviado</option>
          <option value="entregue">Entregue</option>
        </select>
      </div>
      {loading ? <p className="muted">Carregando...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>
              {pedidos.map(p => {
                const s = statusLabel[p.status] || { label: p.status, cls: 'badge-gray' };
                return (
                  <tr key={p.id}>
                    <td className="gold">{p.numero}</td>
                    <td>{p.cliente}</td>
                    <td>R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td className="muted small">{new Date(p.criado_em).toLocaleDateString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PainelEstoque({ token }) {
  const [frascos, setFrascos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({ ml_total: '', ml_vendido: '' });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const API = 'https://nicheclub-backend-production.up.railway.app';

  const carregar = () => {
    setLoading(true);
    api.estoque(token)
      .then(setFrascos).catch(() => setFrascos(DEMO_ESTOQUE))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [token]);

  const filtrados = frascos.filter(f =>
    !busca || f.perfume?.toLowerCase().includes(busca.toLowerCase()) || f.marca?.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirEditar = (f) => {
    setEditando(f);
    setEditForm({ ml_total: String(f.ml_total), ml_vendido: String(f.ml_vendido) });
  };

  const salvarEdicao = async () => {
    setSalvando(true);
    try {
      const res = await fetch(`${API}/api/admin/frascos/${editando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ml_total: Number(editForm.ml_total), ml_vendido: Number(editForm.ml_vendido) }),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      setEditando(null);
      carregar();
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const confirmarExcluir = async (f) => {
    if (!window.confirm(`Excluir frasco de "${f.perfume}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(f.id);
    try {
      const res = await fetch(`${API}/api/admin/frascos/${f.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      carregar();
    } catch(e) { alert(e.message); }
    finally { setExcluindo(null); }
  };

  return (
    <div className="fade-in">
      {/* Modal editar */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '2rem', width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: 4, color: '#0d0b07' }}>Editar Frasco</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{editando.perfume} — {editando.marca}</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>ML TOTAL</label>
              <input type="number" value={editForm.ml_total} onChange={e => setEditForm(f => ({ ...f, ml_total: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>ML VENDIDO</label>
              <input type="number" value={editForm.ml_vendido} onChange={e => setEditForm(f => ({ ...f, ml_vendido: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} />
              <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Disponível: {Math.max(0, Number(editForm.ml_total) - Number(editForm.ml_vendido))}ml</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditando(null)} style={{ flex: 1, padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#0d0b07' }}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="painel-header">
        <h2>Estoque</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar perfume ou marca..."
            style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 220, outline: 'none' }}
          />
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => window.location.href = '/admin/produtos'}>
            + Novo perfume
          </button>
        </div>
      </div>

      {loading ? <p className="muted">Carregando...</p> : (
        <>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{filtrados.length} de {frascos.length} frascos</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Perfume</th><th>Marca</th><th>Total</th><th>Vendido</th><th>Disponível</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {filtrados.map(f => {
                  const pct = Math.round((Number(f.ml_vendido) / Number(f.ml_total)) * 100);
                  const cls = pct >= 80 ? 'badge-red' : pct >= 60 ? 'badge-gold' : 'badge-green';
                  const label = pct >= 80 ? 'Crítico' : pct >= 60 ? 'Atenção' : 'OK';
                  return (
                    <tr key={f.id}>
                      <td>{f.perfume}</td>
                      <td className="muted small">{f.marca}</td>
                      <td>{f.ml_total}ml</td>
                      <td>{f.ml_vendido}ml</td>
                      <td className="gold">{f.ml_disponivel}ml</td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => abrirEditar(f)}
                            style={{ padding: '4px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#333' }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => confirmarExcluir(f)} disabled={excluindo === f.id}
                            style={{ padding: '4px 10px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#c0392b' }}>
                            {excluindo === f.id ? '...' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function PainelWhatsApp({ token }) {
  const [conversas, setConversas] = useState([]);
  const [sel, setSel] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [broadcast, setBroadcast] = useState('');

  useEffect(() => {
    api.conversas(token)
      .then(setConversas).catch(() => setConversas(DEMO_CONVERSAS));
  }, [token]);

  useEffect(() => {
    if (!sel) return;
    api.mensagens(token, sel.id)
      .then(setMsgs).catch(() => setMsgs(DEMO_MSGS));
  }, [token, sel]);

  const enviar = async () => {
    if (!texto.trim() || !sel) return;
    await api.enviarMensagem(token, sel.id, texto).catch(() => {});
    setMsgs(m => [...m, { id: Date.now(), direcao: 'saida', conteudo: texto, enviado_por: 'você', enviado_em: new Date() }]);
    setTexto('');
  };

  const enviarBroadcast = async () => {
    if (!broadcast.trim()) return;
    await api.broadcast(token, broadcast, 'grupo').catch(() => {});
    alert('Mensagem enviada!');
    setBroadcast('');
  };

  return (
    <div className="fade-in">
      <div className="painel-header"><h2>WhatsApp</h2></div>
      <div className="wa-layout">
        <div className="wa-conversas">
          <p className="caps muted small" style={{ padding: '0 0 12px' }}>Conversas</p>
          {conversas.map(c => (
            <div key={c.id} className={`wa-conversa-item ${sel?.id === c.id ? 'active' : ''}`} onClick={() => setSel(c)}>
              <div className="wa-avatar">{(c.cliente_nome || c.telefone || '?').charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 400 }}>{c.cliente_nome || c.telefone}</p>
                <p className="small muted">{c.ultima_msg?.substring(0, 30)}...</p>
              </div>
            </div>
          ))}
        </div>
        <div className="wa-chat">
          {sel ? (
            <>
              <div className="wa-chat-header">
                <strong>{sel.cliente_nome || sel.telefone}</strong>
                <span className={`badge ${sel.status === 'atendimento' ? 'badge-green' : 'badge-gray'}`}>{sel.status}</span>
              </div>
              <div className="wa-msgs">
                {msgs.map(m => (
                  <div key={m.id} className={`wa-msg ${m.direcao === 'saida' ? 'out' : 'in'} ${m.enviado_por === 'bot' ? 'bot' : ''}`}>
                    {m.conteudo}
                  </div>
                ))}
              </div>
              <div className="wa-input">
                <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Digite uma mensagem..." onKeyDown={e => e.key === 'Enter' && enviar()} />
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={enviar}>Enviar</button>
              </div>
            </>
          ) : (
            <div className="wa-empty">
              <div className="broadcast-form">
                <p className="caps muted small" style={{ marginBottom: '1rem' }}>Enviar oferta para grupo</p>
                <textarea value={broadcast} onChange={e => setBroadcast(e.target.value)} placeholder="Novidade! Baccarat Rouge 540 com 20% OFF..." rows={4} />
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={enviarBroadcast}>Enviar para grupo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DEMO_PEDIDOS = [
  { id: '1', numero: 'NC-2024-0001', cliente: 'Maria Silva', total: 194.90, status: 'pagamento_aprovado', criado_em: new Date() },
  { id: '2', numero: 'NC-2024-0002', cliente: 'João Pereira', total: 58, status: 'enviado', criado_em: new Date() },
];
const DEMO_ESTOQUE = [
  { id: '1', perfume: 'Baccarat Rouge 540', marca: 'MFK', ml_total: 100, ml_vendido: 62, ml_disponivel: 38 },
  { id: '2', perfume: 'Oud Wood', marca: 'Tom Ford', ml_total: 250, ml_vendido: 30, ml_disponivel: 220 },
];
const DEMO_CONVERSAS = [
  { id: '1', cliente_nome: 'Maria Silva', telefone: '11999999999', status: 'atendimento', ultima_msg: 'Tem o Baccarat Rouge em 10ml?' },
];
const DEMO_MSGS = [
  { id: '1', direcao: 'entrada', conteudo: 'Oi! Tem o Baccarat Rouge em 10ml?', enviado_por: 'cliente', enviado_em: new Date() },
  { id: '2', direcao: 'saida', conteudo: 'Sim! Temos 38ml disponíveis no frasco.', enviado_por: 'admin', enviado_em: new Date() },
];
