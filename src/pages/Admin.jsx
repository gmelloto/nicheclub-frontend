import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../services/api';
import './Admin.css';

export default function Admin() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState('pedidos');
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  if (!token) return null;

  const selecionarAba = (a) => { setAba(a); setMenuAberto(false); };

  const abaLabels = { pedidos: 'Pedidos', estoque: 'Decants', perfumes: 'Perfumes', whatsapp: 'WhatsApp' };
  return (
    <div className="admin-page">
      <div className={`admin-sidebar-overlay ${menuAberto ? 'open' : ''}`} onClick={() => setMenuAberto(false)} />
      <div className={`admin-sidebar ${menuAberto ? 'open' : ''}`}>
        <div className="admin-brand">
          <span className="gold">◈</span> Admin
        </div>
        <p className="small muted" style={{ marginBottom: '2rem' }}>{usuario?.nome}</p>
        {['pedidos', 'estoque', 'perfumes', 'whatsapp'].map(a => (
          <button key={a} className={`admin-nav-btn ${aba === a ? 'active' : ''}`} onClick={() => selecionarAba(a)}>
            {abaLabels[a] || a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
        <button className="admin-nav-btn" onClick={() => { setMenuAberto(false); navigate('/admin/produtos'); }} style={{ marginTop: '1rem', color: '#c9a84c', borderTop: '1px solid #e8e4dc', paddingTop: '1rem' }}>
          + Cadastrar Produto
        </button>
        <button className="admin-nav-btn" onClick={() => { setMenuAberto(false); navigate('/admin/notas'); }} style={{ color: '#c9a84c' }}>
          Notas Olfativas
        </button>
      </div>
      <div className="admin-content">
        <button className="admin-menu-btn" onClick={() => setMenuAberto(v => !v)} aria-label="Menu">
          {menuAberto ? '✕' : '☰'}
        </button>
        {aba === 'pedidos' && <PainelPedidos token={token} />}
        {aba === 'estoque' && <PainelEstoque token={token} />}
        {aba === 'perfumes' && <PainelPerfumes token={token} />}
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
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ width: 'auto', minWidth: 140, maxWidth: '100%' }}>
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
  const [filtroStatus, setFiltroStatus] = useState('');
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({ ml_total: '', ml_vendido: '' });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [sels, setSels] = useState([]);
  const [massaForm, setMassaForm] = useState({ ml_total: '', ml_vendido: '' });
  const [salvandoMassa, setSalvandoMassa] = useState(false);
  const [showMassa, setShowMassa] = useState(false);
  const [filtroCriadoInicio, setFiltroCriadoInicio] = useState('');
  const [filtroCriadoFim, setFiltroCriadoFim] = useState('');
  const [filtroEsgotadoInicio, setFiltroEsgotadoInicio] = useState('');
  const [filtroEsgotadoFim, setFiltroEsgotadoFim] = useState('');
  const API = 'https://nicheclub-backend-production.up.railway.app';

  const carregar = () => {
    setLoading(true);
    api.estoque(token)
      .then(setFrascos).catch(() => setFrascos(DEMO_ESTOQUE))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [token]);

  const filtrados = frascos.filter(f => {
    const matchBusca = !busca || f.perfume?.toLowerCase().includes(busca.toLowerCase()) || f.marca?.toLowerCase().includes(busca.toLowerCase());
    const disp = Number(f.ml_disponivel || 0);
    const status = disp === 0 ? 'esgotado' : disp < 20 ? 'fechado' : 'aberto';
    const matchStatus = !filtroStatus || status === filtroStatus;
    const criado = f.criado_em ? new Date(f.criado_em) : null;
    const esgotado = f.esgotado_em ? new Date(f.esgotado_em) : null;
    const matchCriado = (!filtroCriadoInicio || (criado && criado >= new Date(filtroCriadoInicio))) &&
                        (!filtroCriadoFim || (criado && criado <= new Date(filtroCriadoFim + 'T23:59:59')));
    const matchEsgotado = (!filtroEsgotadoInicio || (esgotado && esgotado >= new Date(filtroEsgotadoInicio))) &&
                          (!filtroEsgotadoFim || (esgotado && esgotado <= new Date(filtroEsgotadoFim + 'T23:59:59')));
    return matchBusca && matchStatus && matchCriado && matchEsgotado;
  });

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
          <div style={{ background: '#fff', borderRadius: 8, padding: '2rem', width: 360, maxWidth: '92vw', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
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

      <div className="painel-header" style={{ marginBottom: 0 }}>
        <h2>Decants</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', color: '#0d0b07', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}
          onClick={() => window.location.href = '/admin/produtos'}>
          + Novo perfume
        </button>
      </div>
      <div style={{ background: '#f8f8f8', border: '1px solid #eee', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 20, marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 15 }}>&#128269;</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar perfume ou marca..."
            style={{ width: '100%', padding: '10px 16px 10px 40px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          />
        </div>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          style={{ flex: '1 1 160px', padding: '9px 14px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <option value="">Todos os status</option>
          <option value="aberto">✅ Aberto</option>
          <option value="fechado">⚠️ Fechado</option>
          <option value="esgotado">🔴 Esgotado</option>
        </select>
          <div style={{ flex: '1 1 100%', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#555', fontWeight: 500, flexShrink: 0, width: 62 }}>Criado:</span>
            <input type="date" value={filtroCriadoInicio} onChange={e => setFiltroCriadoInicio(e.target.value)}
              style={{ padding: '8px 6px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#333', flex: 1, minWidth: 0, boxSizing: 'border-box' }} />
            <span style={{ fontSize: 13, color: '#aaa' }}>–</span>
            <input type="date" value={filtroCriadoFim} onChange={e => setFiltroCriadoFim(e.target.value)}
              style={{ padding: '8px 6px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#333', flex: 1, minWidth: 0, boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 100%', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#555', fontWeight: 500, flexShrink: 0, width: 62 }}>Esgotado:</span>
            <input type="date" value={filtroEsgotadoInicio} onChange={e => setFiltroEsgotadoInicio(e.target.value)}
              style={{ padding: '8px 6px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#333', flex: 1, minWidth: 0, boxSizing: 'border-box' }} />
            <span style={{ fontSize: 13, color: '#aaa' }}>–</span>
            <input type="date" value={filtroEsgotadoFim} onChange={e => setFiltroEsgotadoFim(e.target.value)}
              style={{ padding: '8px 6px', border: '1.5px solid #e0e0e0', borderRadius: 6, fontSize: 12, outline: 'none', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#333', flex: 1, minWidth: 0, boxSizing: 'border-box' }} />
          </div>
          {(filtroCriadoInicio || filtroCriadoFim || filtroEsgotadoInicio || filtroEsgotadoFim) && (
            <button onClick={() => { setFiltroCriadoInicio(''); setFiltroCriadoFim(''); setFiltroEsgotadoInicio(''); setFiltroEsgotadoFim(''); }}
              style={{ padding: '6px 12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#666' }}>Limpar datas</button>
          )}
      </div>

      {loading ? <p className="muted">Carregando...</p> : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#888' }}>{filtrados.length} de {frascos.length} frascos</p>
            {sels.length > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fffbf0', border: '1px solid #e8c870', borderRadius: 6, padding: '8px 14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#8a6a10' }}>{sels.length} sel.</span>
                <button onClick={() => setShowMassa(v => !v)} style={{ padding: '4px 12px', background: '#c9a84c', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#0d0b07' }}>Editar</button>
                <button onClick={async () => { const ok = window.confirm('Excluir ' + sels.length + ' frasco(s)?'); if (!ok) return; setSalvandoMassa(true); for (const id of sels) { await fetch(API + '/api/admin/frascos/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }); } setSels([]); setSalvandoMassa(false); carregar(); }} disabled={salvandoMassa} style={{ padding: '4px 12px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 4, fontSize: 12, cursor: 'pointer', color: '#c0392b' }}>Excluir</button>
                <button onClick={() => setSels([])} style={{ padding: '4px 8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>X</button>
              </div>
            )}
          </div>
          {showMassa && sels.length > 0 && (
            <div style={{ background: '#fffbf0', border: '1px solid #e8c870', borderRadius: 6, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#888' }}>Aplicar a {sels.length} frasco(s):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#888' }}>ML Total:</label>
                <input type="number" value={massaForm.ml_total} onChange={e => setMassaForm(m => ({ ...m, ml_total: e.target.value }))} placeholder="Manter" style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 100, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#888' }}>ML Vendido:</label>
                <input type="number" value={massaForm.ml_vendido} onChange={e => setMassaForm(m => ({ ...m, ml_vendido: e.target.value }))} placeholder="Manter" style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 100, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 12, color: '#888' }}>Status:</label>
                <select value={massaForm.status || ''} onChange={e => setMassaForm(m => ({ ...m, status: e.target.value }))} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, outline: 'none', background: '#fff' }}>
                  <option value=''>Manter</option>
                  <option value='aberto'>Aberto</option>
                  <option value='fechado'>Fechado</option>
                  <option value='esgotado'>Esgotado</option>
                </select>
              </div>
              <button onClick={async () => { setSalvandoMassa(true); const body = {}; if (massaForm.ml_total !== '') body.ml_total = Number(massaForm.ml_total); if (massaForm.ml_vendido !== '') body.ml_vendido = Number(massaForm.ml_vendido); if (massaForm.status) body.status = massaForm.status; for (const id of sels) { await fetch(API + '/api/admin/frascos/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) }); } setSels([]); setMassaForm({ ml_total: '', ml_vendido: '' }); setShowMassa(false); setSalvandoMassa(false); carregar(); }} disabled={salvandoMassa} style={{ padding: '6px 16px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07' }}>
                {salvandoMassa ? 'Salvando...' : 'Aplicar'}
              </button>
            </div>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead style={{ fontWeight: 700 }}><tr><th style={{ width: 36 }}><input type="checkbox" checked={sels.length === filtrados.length && filtrados.length > 0} onChange={() => setSels(p => p.length === filtrados.length ? [] : filtrados.map(x => x.id))} style={{ cursor: "pointer" }} /></th><th>Perfume</th><th>Marca</th><th>Total</th><th>Vendido</th><th>Disponível</th><th>Status</th><th>Criado em</th><th>Esgotado em</th><th>Ações</th></tr></thead>
              <tbody>
                {filtrados.map(f => {
                  const disp = Number(f.ml_disponivel || 0);
                  const cls = disp === 0 ? 'badge-red' : disp < 20 ? 'badge-gold' : 'badge-green';
                  const label = disp === 0 ? 'Esgotado' : disp < 20 ? 'Fechado' : 'Aberto';
                  return (
                    <tr key={f.id} style={{ background: sels.includes(f.id) ? "#fffbf0" : "" }}>
                      <td><input type="checkbox" checked={sels.includes(f.id)} onChange={() => setSels(p => p.includes(f.id) ? p.filter(x => x !== f.id) : [...p, f.id])} style={{ cursor: "pointer" }} /></td>
                      <td>{f.perfume}</td>
                      <td className="muted small">{f.marca}</td>
                      <td>{f.ml_total}ml</td>
                      <td>{f.ml_vendido}ml</td>
                      <td className="gold">{f.ml_disponivel}ml</td>
                      <td><span className={`badge ${cls}`}>{label}</span></td>
                      <td className='muted small'>{f.criado_em ? new Date(f.criado_em).toLocaleString('pt-BR') : '-'}</td>
                      <td className='muted small'>{f.esgotado_em ? new Date(f.esgotado_em).toLocaleString('pt-BR') : '-'}</td>
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

const API_URL = 'https://nicheclub-backend-production.up.railway.app';

const TAMANHOS = [
  { key: 'apc', label: 'APC +50ml' },
  { key: '3ml', label: '3ml' },
  { key: '5ml', label: '5ml' },
  { key: '10ml', label: '10ml' },
  { key: '15ml', label: '15ml' },
];

function PainelPerfumes({ token }) {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtro, setFiltro] = useState('todos');
  const limite = 20;
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [detalhe, setDetalhe] = useState(null);

  const carregar = async (pag = 1, termo = busca) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina: pag, limite, busca: termo, todos: true });
      const res = await fetch(`${API_URL}/api/perfumes?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPerfumes(data.perfumes || data);
      setTotal(data.total || 0);
      setPagina(pag);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(1, ''); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); carregar(1, buscaInput); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const totalPaginas = Math.ceil(total / limite);

  const filtrados = perfumes.filter(p => {
    if (filtro === 'ativos') return p.ativo !== false;
    if (filtro === 'inativos') return p.ativo === false;
    return true;
  });

  const abrirEditar = (p) => {
    const precos = {};
    TAMANHOS.forEach(t => {
      const op = p.opcoes?.find(o => o.tamanho === t.key);
      precos[`preco_${t.key}`] = op ? String(op.preco) : '';
    });
    setEditForm({
      nome: p.nome || '', marca: p.marca || '', ano: p.ano || '',
      genero: p.genero || '', pais: p.pais || '', familia_olfativa: p.familia_olfativa || '',
      rating_valor: p.rating_valor || '', rating_count: p.rating_count || '',
      perfumista1: p.perfumista1 || '', perfumista2: p.perfumista2 || '',
      acorde1: p.acorde1 || '', acorde2: p.acorde2 || '', acorde3: p.acorde3 || '',
      acorde4: p.acorde4 || '', acorde5: p.acorde5 || '',
      notas_topo: p.notas_topo || '', notas_coracao: p.notas_coracao || '', notas_base: p.notas_base || '',
      foto_url: p.foto_url || '', link_fragrantica: p.link_fragrantica || '',
      descricao: p.descricao || '', ativo: p.ativo !== false,
      preco_lacrado: p.preco_lacrado || '',
      ...precos,
    });
    setEditando(p);
    setDetalhe(null);
  };

  const salvarEdicao = async () => {
    setSalvando(true);
    try {
      const body = { ...editForm };
      const precos = TAMANHOS.filter(t => body[`preco_${t.key}`]).map(t => ({
        tamanho: t.key, preco: Number(body[`preco_${t.key}`]),
      }));
      TAMANHOS.forEach(t => delete body[`preco_${t.key}`]);
      if (precos.length > 0) body.precos = precos;
      const res = await fetch(`${API_URL}/api/admin/perfumes/${editando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      setEditando(null);
      carregar(pagina, busca);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const excluir = async (p) => {
    if (!window.confirm(`Excluir "${p.nome}"? Isso remove também os frascos e preços.`)) return;
    setExcluindo(p.id);
    try {
      const res = await fetch(`${API_URL}/api/admin/perfumes/${p.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setDetalhe(null);
      carregar(pagina, busca);
    } catch(e) { alert(e.message); }
    finally { setExcluindo(null); }
  };

  const inp = (key) => ({
    value: editForm[key] || '',
    onChange: e => setEditForm(f => ({ ...f, [key]: e.target.value })),
    style: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#0d0b07', background: '#fff' }
  });

  // ── Modal Editar ──
  const ModalEditar = () => editando && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setEditando(null)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', animation: 'slideUp .25s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <h3 style={{ marginBottom: 16, color: '#0d0b07', fontSize: 18, fontWeight: 700 }}>Editar Perfume</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>NOME</label><input {...inp('nome')} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>MARCA</label><input {...inp('marca')} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>ANO</label><input {...inp('ano')} type="number" /></div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>GENERO</label>
              <select value={editForm.genero || ''} onChange={e => setEditForm(f => ({ ...f, genero: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0d0b07', background: '#fff' }}>
                <option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Unissex">Unissex</option>
              </select>
            </div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>PAIS</label><input {...inp('pais')} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>FAMILIA</label><input {...inp('familia_olfativa')} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>RATING</label><input {...inp('rating_valor')} type="number" step="0.01" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>VOTOS</label><input {...inp('rating_count')} type="number" /></div>
          </div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>ACORDES</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6 }}>
            <input {...inp('acorde1')} placeholder="1" /><input {...inp('acorde2')} placeholder="2" /><input {...inp('acorde3')} placeholder="3" />
            <input {...inp('acorde4')} placeholder="4" /><input {...inp('acorde5')} placeholder="5" />
          </div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>NOTAS TOPO</label><input {...inp('notas_topo')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>NOTAS CORACAO</label><input {...inp('notas_coracao')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>NOTAS BASE</label><input {...inp('notas_base')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>URL FOTO</label><input {...inp('foto_url')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>DESCRICAO</label>
            <textarea value={editForm.descricao || ''} onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0d0b07', background: '#fff', minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>PRECOS DECANT</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 6 }}>
            {TAMANHOS.map(t => (
              <div key={t.key}><label style={{ fontSize: 10, color: '#aaa', display: 'block', marginBottom: 2 }}>{t.label}</label><input type="number" step="0.01" placeholder="R$" {...inp(`preco_${t.key}`)} /></div>
            ))}
          </div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>PRECO LACRADO</label><input type="number" step="0.01" placeholder="R$" {...inp('preco_lacrado')} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#333', cursor: 'pointer' }}>
            <input type="checkbox" checked={editForm.ativo !== false} onChange={e => setEditForm(f => ({ ...f, ativo: e.target.checked }))} />
            Ativo no catalogo
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, position: 'sticky', bottom: 0, background: '#fff', paddingTop: 12 }}>
          <button onClick={() => setEditando(null)} style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Detalhe ──
  const ModalDetalhe = () => detalhe && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto', boxSizing: 'border-box', animation: 'slideUp .25s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* Foto + info */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 90, height: 110, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {detalhe.foto_url
              ? <img src={detalhe.foto_url} alt={detalhe.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 32, color: '#ccc' }}>🧴</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: '#8a6a10', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{detalhe.marca}</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 6px', color: '#111' }}>{detalhe.nome}</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 12, color: '#666' }}>
              {detalhe.genero && <span>{detalhe.genero}</span>}
              {detalhe.ano && <span>· {detalhe.ano}</span>}
              {detalhe.pais && <span>· {detalhe.pais}</span>}
            </div>
            {detalhe.rating_valor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{Number(detalhe.rating_valor).toFixed(1)}</span>
                <span style={{ color: '#c9a84c', fontSize: 12 }}>★</span>
                {detalhe.rating_count && <span style={{ fontSize: 11, color: '#999' }}>({Number(detalhe.rating_count).toLocaleString()})</span>}
              </div>
            )}
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: detalhe.ativo !== false ? '#e8f5e9' : '#fce4ec',
              color: detalhe.ativo !== false ? '#2e7d32' : '#c62828' }}>
              {detalhe.ativo !== false ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        {/* Acordes */}
        {detalhe.acorde1 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6, letterSpacing: '0.1em' }}>ACORDES</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[detalhe.acorde1, detalhe.acorde2, detalhe.acorde3, detalhe.acorde4, detalhe.acorde5].filter(Boolean).map(a => (
                <span key={a} style={{ padding: '4px 12px', background: '#f5f3ef', borderRadius: 20, fontSize: 12, color: '#555' }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {(detalhe.notas_topo || detalhe.notas_coracao || detalhe.notas_base) && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6, letterSpacing: '0.1em' }}>NOTAS</p>
            {detalhe.notas_topo && <p style={{ fontSize: 12, color: '#555', marginBottom: 2 }}><b style={{ color: '#8a6a10' }}>Topo:</b> {detalhe.notas_topo}</p>}
            {detalhe.notas_coracao && <p style={{ fontSize: 12, color: '#555', marginBottom: 2 }}><b style={{ color: '#8a6a10' }}>Coracao:</b> {detalhe.notas_coracao}</p>}
            {detalhe.notas_base && <p style={{ fontSize: 12, color: '#555' }}><b style={{ color: '#8a6a10' }}>Base:</b> {detalhe.notas_base}</p>}
          </div>
        )}

        {/* Descricao */}
        {detalhe.descricao && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, letterSpacing: '0.1em' }}>DESCRICAO</p>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{detalhe.descricao}</p>
          </div>
        )}

        {/* Familia + Perfumistas */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {detalhe.familia_olfativa && (
            <div><p style={{ fontSize: 10, fontWeight: 600, color: '#888' }}>FAMILIA</p><p style={{ fontSize: 13, color: '#333' }}>{detalhe.familia_olfativa}</p></div>
          )}
          {detalhe.perfumista1 && (
            <div><p style={{ fontSize: 10, fontWeight: 600, color: '#888' }}>PERFUMISTA</p><p style={{ fontSize: 13, color: '#333', fontStyle: 'italic' }}>{[detalhe.perfumista1, detalhe.perfumista2].filter(Boolean).join(', ')}</p></div>
          )}
        </div>

        {/* Acoes */}
        <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: '#fff', paddingTop: 12 }}>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666', flex: 0.5 }}>Fechar</button>
          <button onClick={() => abrirEditar(detalhe)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>Editar</button>
          <button onClick={() => excluir(detalhe)} disabled={excluindo === detalhe.id}
            style={{ padding: '12px 16px', background: '#fce4ec', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#c62828' }}>
            {excluindo === detalhe.id ? '...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <ModalEditar />
      <ModalDetalhe />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Produtos</h2>
        <button onClick={() => window.location.href = '/admin/produtos'}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}>
          + Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 15 }}>&#128269;</span>
        <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)} placeholder="Buscar..."
          style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {[['todos', 'Todos'], ['ativos', 'Ativos'], ['inativos', 'Inativos']].map(([key, label]) => (
          <button key={key} onClick={() => setFiltro(key)}
            style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: filtro === key ? 'none' : '1.5px solid #ddd',
              background: filtro === key ? '#111' : '#fff', color: filtro === key ? '#fff' : '#555', transition: 'all .2s' }}>
            {label}
          </button>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#999', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{total} total</span>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 100, background: '#f0f0f0', borderRadius: 12 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p>Nenhum perfume encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map(p => {
            const acordes = [p.acorde1, p.acorde2, p.acorde3].filter(Boolean);
            return (
              <div key={p.id} onClick={() => setDetalhe(p)}
                style={{ display: 'flex', gap: 14, padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #eee',
                  cursor: 'pointer', transition: 'all .15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(201,168,76,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>

                {/* Foto */}
                <div style={{ width: 70, height: 85, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.foto_url
                    ? <img src={p.foto_url} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 28, color: '#ccc' }}>🧴</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>{p.marca}</p>
                    </div>
                    <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: p.ativo !== false ? '#e8f5e9' : '#fce4ec',
                      color: p.ativo !== false ? '#2e7d32' : '#c62828' }}>
                      {p.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6, fontSize: 12, color: '#999' }}>
                    {p.genero && <span>{p.genero}</span>}
                    {p.ano && <span>· {p.ano}</span>}
                    {p.rating_valor && <span>· <span style={{ color: '#c9a84c' }}>★</span> {Number(p.rating_valor).toFixed(1)}</span>}
                  </div>

                  {acordes.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {acordes.map(a => (
                        <span key={a} style={{ padding: '2px 8px', background: '#f5f3ef', borderRadius: 12, fontSize: 10, color: '#777' }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seta */}
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginacao */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => carregar(pagina - 1, busca)} disabled={pagina === 1}
            style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: pagina === 1 ? 'not-allowed' : 'pointer', fontSize: 13, color: pagina === 1 ? '#ccc' : '#333' }}>
            ←
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#666', padding: '0 8px' }}>{pagina} / {totalPaginas}</span>
          <button onClick={() => carregar(pagina + 1, busca)} disabled={pagina === totalPaginas}
            style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer', fontSize: 13, color: pagina === totalPaginas ? '#ccc' : '#333' }}>
            →
          </button>
        </div>
      )}
    </div>
  );
}

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
