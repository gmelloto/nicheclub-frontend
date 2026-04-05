import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../services/api';
import './Admin.css';

export default function Admin() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState('pedidos');
  const [maisAberto, setMaisAberto] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    return () => document.body.removeAttribute('data-admin');
  }, []);

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  // Botao voltar ao topo - escuta todos os scrolls possiveis
  useEffect(() => {
    let ticking = false;
    const check = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const container = document.querySelector('.admin-content');
        const y = Math.max(container?.scrollTop || 0, window.scrollY || 0, document.documentElement.scrollTop || 0);
        setShowTop(y > 50);
        ticking = false;
      });
    };
    const container = document.querySelector('.admin-content');
    container?.addEventListener('scroll', check, { passive: true });
    window.addEventListener('scroll', check, { passive: true });
    document.addEventListener('scroll', check, { passive: true });
    return () => {
      container?.removeEventListener('scroll', check);
      window.removeEventListener('scroll', check);
      document.removeEventListener('scroll', check);
    };
  }, []);

  if (!token) return null;

  const selecionarAba = (a) => { setAba(a); setMaisAberto(false); };

  const abaLabels = { pedidos: 'Pedidos', estoque: 'Decants', perfumes: 'Perfumes', whatsapp: 'WhatsApp' };

  const bottomTabs = [
    { key: 'pedidos', label: 'Pedidos', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    )},
    { key: 'perfumes', label: 'Perfumes', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="8" width="12" height="13" rx="2" />
        <path d="M10 4h4v4h-4z" />
        <path d="M9 8V6a1 1 0 011-1h4a1 1 0 011 1v2" />
        <path d="M12 12v5" />
      </svg>
    )},
    { key: 'estoque', label: 'Decants', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2h8l2 4v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6l2-4z" />
        <path d="M6 6h12" />
        <path d="M10 10v6" />
        <path d="M14 10v6" />
      </svg>
    )},
    { key: 'whatsapp', label: 'Chat', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    )},
  ];

  const maisOpcoes = [
    { label: 'Cadastrar Produto', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
    ), onClick: () => { setMaisAberto(false); navigate('/admin/produtos'); }},
    { label: 'Notas Olfativas', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4 0-8-2-8-6 0-6 8-14 8-14s8 8 8 14c0 4-4 6-8 6z"/></svg>
    ), onClick: () => { setMaisAberto(false); navigate('/admin/notas'); }},
    { label: 'Ver Loja', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    ), onClick: () => { setMaisAberto(false); navigate('/'); }},
  ];

  return (
    <div className="admin-page">
      {/* Sidebar desktop */}
      <div className="admin-sidebar">
        <div className="admin-brand">
          <span className="gold">◈</span> Admin
        </div>
        <p className="small muted" style={{ marginBottom: '2rem' }}>{usuario?.nome}</p>
        {['pedidos', 'estoque', 'perfumes', 'whatsapp'].map(a => (
          <button key={a} className={`admin-nav-btn ${aba === a ? 'active' : ''}`} onClick={() => selecionarAba(a)}>
            {abaLabels[a] || a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
        <button className="admin-nav-btn" onClick={() => navigate('/admin/produtos')} style={{ marginTop: '1rem', color: '#c9a84c', borderTop: '1px solid #e8e4dc', paddingTop: '1rem' }}>
          + Cadastrar Produto
        </button>
        <button className="admin-nav-btn" onClick={() => navigate('/admin/notas')} style={{ color: '#c9a84c' }}>
          Notas Olfativas
        </button>
      </div>
      <div className="admin-content" style={{ paddingBottom: 80 }}>
        {aba === 'pedidos' && <PainelPedidos token={token} />}
        {aba === 'estoque' && <PainelEstoque token={token} />}
        {aba === 'perfumes' && <PainelPerfumes token={token} />}
        {aba === 'whatsapp' && <PainelWhatsApp token={token} />}
      </div>

      {/* Menu "Mais" overlay */}
      {maisAberto && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9997 }} onClick={() => setMaisAberto(false)}>
          <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 340,
            background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', padding: 8, animation: 'slideUp .2s ease' }}
            onClick={e => e.stopPropagation()}>
            {maisOpcoes.map((op, i) => (
              <button key={i} onClick={op.onClick}
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#333', borderRadius: 8, fontFamily: "'Inter', sans-serif",
                  transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f3ef'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ color: '#c9a84c' }}>{op.icon}</span>
                {op.label}
              </button>
            ))}
          </div>
        </div>
      , document.body)}

      {/* Botao voltar ao topo */}
      {showTop && (
        <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); document.documentElement.scrollTop = 0; document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 900, width: 44, height: 44, borderRadius: '50%',
            background: '#111', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* Bottom Nav - Mobile */}
      <div className="admin-bottom-nav">
        {bottomTabs.map(tab => (
          <button key={tab.key} onClick={() => selecionarAba(tab.key)}
            className={`admin-bottom-tab ${aba === tab.key ? 'active' : ''}`}>
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
        <button onClick={() => setMaisAberto(v => !v)}
          className={`admin-bottom-tab ${maisAberto ? 'active' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Mais</span>
        </button>
      </div>
    </div>
  );
}

function PainelPedidos({ token }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [statusEdit, setStatusEdit] = useState('');
  const [rastreio, setRastreio] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setLoading(true);
    api.listarPedidos(token, filtro || undefined)
      .then(setPedidos).catch(() => setPedidos(DEMO_PEDIDOS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [token, filtro]);

  const statusMap = {
    aguardando_pagamento: { label: 'Aguardando', bg: '#f5f5f5', color: '#888' },
    pagamento_aprovado: { label: 'Pago', bg: '#e8f5e9', color: '#2e7d32' },
    em_separacao: { label: 'Separando', bg: '#fff3e0', color: '#e65100' },
    enviado: { label: 'Enviado', bg: '#e3f2fd', color: '#1565c0' },
    entregue: { label: 'Entregue', bg: '#e8f5e9', color: '#2e7d32' },
    cancelado: { label: 'Cancelado', bg: '#fce4ec', color: '#c62828' },
  };

  const getStatus = (s) => statusMap[s] || { label: s, bg: '#f5f5f5', color: '#888' };

  const abrirDetalhe = (p) => {
    setDetalhe(p);
    setStatusEdit(p.status || '');
    setRastreio(p.codigo_rastreio || '');
  };

  const salvarStatus = async () => {
    if (!detalhe) return;
    setSalvando(true);
    try {
      await api.atualizarStatus(token, detalhe.id, statusEdit, rastreio);
      setDetalhe(null);
      carregar();
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const filtroTabs = [
    ['', 'Todos'],
    ['pagamento_aprovado', 'Pagos'],
    ['em_separacao', 'Separando'],
    ['enviado', 'Enviados'],
    ['entregue', 'Entregues'],
  ];

  // Modal Detalhe
  const ModalDetalhe = () => detalhe && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto', boxSizing: 'border-box', animation: 'slideUp .25s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.1em' }}>{detalhe.numero}</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginTop: 2 }}>{detalhe.cliente}</h3>
          </div>
          {(() => { const st = getStatus(detalhe.status); return (
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
          ); })()}
        </div>

        {/* Info */}
        <div style={{ background: '#f8f7f4', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>R$ {Number(detalhe.total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#555' }}>Data</span>
            <span style={{ fontSize: 13, color: '#333' }}>{detalhe.criado_em ? new Date(detalhe.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
          </div>
          {detalhe.codigo_rastreio && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: '#555' }}>Rastreio</span>
              <span style={{ fontSize: 13, color: '#1565c0', fontWeight: 600 }}>{detalhe.codigo_rastreio}</span>
            </div>
          )}
        </div>

        {/* Itens do pedido */}
        {detalhe.itens?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '0.1em', marginBottom: 8 }}>ITENS</p>
            {detalhe.itens.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                <span style={{ color: '#333' }}>{item.nome || item.perfume} {item.tamanho && `(${item.tamanho})`}</span>
                <span style={{ color: '#555', fontWeight: 500 }}>R$ {Number(item.preco || 0).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Alterar status */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '0.1em', marginBottom: 6 }}>ALTERAR STATUS</p>
          <select value={statusEdit} onChange={e => setStatusEdit(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#333', marginBottom: 8, boxSizing: 'border-box' }}>
            <option value="aguardando_pagamento">Aguardando pagamento</option>
            <option value="pagamento_aprovado">Pagamento aprovado</option>
            <option value="em_separacao">Em separacao</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input value={rastreio} onChange={e => setRastreio(e.target.value)} placeholder="Codigo de rastreio (opcional)"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Acoes */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDetalhe(null)} style={{ flex: 0.5, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666' }}>Fechar</button>
          <button onClick={salvarStatus} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <ModalDetalhe />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Pedidos</h2>
        <span style={{ fontSize: 12, color: '#999' }}>{pedidos.length} pedidos</span>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {filtroTabs.map(([key, label]) => (
          <button key={key} onClick={() => setFiltro(key)}
            style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              border: filtro === key ? 'none' : '1.5px solid #ddd',
              background: filtro === key ? '#111' : '#fff', color: filtro === key ? '#fff' : '#555', transition: 'all .2s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ background: '#f5f5f3', borderRadius: 14, padding: 12, margin: '0 -4px' }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: '#eee', borderRadius: 12 }} />)}
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
          <p>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedidos.map(p => {
            const st = getStatus(p.status);
            return (
              <div key={p.id} onClick={() => abrirDetalhe(p)}
                style={{ display: 'flex', gap: 14, padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #eee',
                  cursor: 'pointer', transition: 'all .15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(201,168,76,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cliente}</p>
                      <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>{p.numero}</p>
                    </div>
                    <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>R$ {Number(p.total || 0).toFixed(2).replace('.', ',')}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : ''}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

function PainelEstoque({ token }) {
  const [frascos, setFrascos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({ ml_total: '', ml_vendido: '' });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const API = 'https://nicheclub-backend-production.up.railway.app';

  const carregar = () => {
    setLoading(true);
    api.estoque(token)
      .then(setFrascos).catch(() => setFrascos(DEMO_ESTOQUE))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [token]);

  const getStatus = (f) => {
    const disp = Number(f.ml_disponivel || 0);
    if (disp === 0) return { key: 'esgotado', label: 'Esgotado', bg: '#fce4ec', color: '#c62828' };
    if (disp < 20) return { key: 'baixo', label: 'Baixo Estoque', bg: '#fff3e0', color: '#e65100' };
    return { key: 'aberto', label: 'Ativo', bg: '#e8f5e9', color: '#2e7d32' };
  };

  const filtrados = frascos.filter(f => {
    const matchBusca = !busca || f.perfume?.toLowerCase().includes(busca.toLowerCase()) || f.marca?.toLowerCase().includes(busca.toLowerCase());
    const st = getStatus(f).key;
    if (filtro === 'aberto') return matchBusca && st === 'aberto';
    if (filtro === 'baixo') return matchBusca && st === 'baixo';
    if (filtro === 'esgotado') return matchBusca && st === 'esgotado';
    return matchBusca;
  });

  const abrirEditar = (f) => {
    setEditForm({ ml_total: String(f.ml_total), ml_vendido: String(f.ml_vendido) });
    setEditando(f);
    setDetalhe(null);
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
    if (!window.confirm(`Excluir frasco de "${f.perfume}"?`)) return;
    setExcluindo(f.id);
    try {
      const res = await fetch(`${API}/api/admin/frascos/${f.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setDetalhe(null);
      carregar();
    } catch(e) { alert(e.message); }
    finally { setExcluindo(null); }
  };

  // ── Modal Editar ──
  const ModalEditar = () => editando && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setEditando(null)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, boxSizing: 'border-box', animation: 'slideUp .25s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>Editar Frasco</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{editando.perfume} — {editando.marca}</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>ML TOTAL</label>
          <input type="number" value={editForm.ml_total} onChange={e => setEditForm(f => ({ ...f, ml_total: e.target.value }))}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>ML VENDIDO</label>
          <input type="number" value={editForm.ml_vendido} onChange={e => setEditForm(f => ({ ...f, ml_vendido: e.target.value }))}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Disponivel: <b style={{ color: '#c9a84c' }}>{Math.max(0, Number(editForm.ml_total) - Number(editForm.ml_vendido))}ml</b></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, boxSizing: 'border-box', animation: 'slideUp .25s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />

        <p style={{ fontSize: 11, color: '#8a6a10', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{detalhe.marca}</p>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>{detalhe.perfume}</h3>

        {/* Barra de progresso */}
        {(() => {
          const total = Number(detalhe.ml_total || 0);
          const vendido = Number(detalhe.ml_vendido || 0);
          const disp = Number(detalhe.ml_disponivel || 0);
          const pct = total > 0 ? Math.round((disp / total) * 100) : 0;
          const st = getStatus(detalhe);
          return (
            <div style={{ background: '#f8f7f4', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#555' }}>Disponivel</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{disp}ml / {total}ml</span>
              </div>
              <div style={{ height: 6, background: '#e8e4dc', borderRadius: 3, marginBottom: 8 }}>
                <div style={{ height: '100%', background: st.key === 'esgotado' ? '#c62828' : 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 3, width: `${pct}%`, transition: 'width .3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#999' }}>Vendido: {vendido}ml</span>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
              </div>
            </div>
          );
        })()}

        {/* Datas */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div><p style={{ fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>CRIADO</p><p style={{ fontSize: 13, color: '#333' }}>{detalhe.criado_em ? new Date(detalhe.criado_em).toLocaleDateString('pt-BR') : '—'}</p></div>
          {detalhe.esgotado_em && <div><p style={{ fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>ESGOTADO</p><p style={{ fontSize: 13, color: '#c62828' }}>{new Date(detalhe.esgotado_em).toLocaleDateString('pt-BR')}</p></div>}
          {detalhe.lote && <div><p style={{ fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>LOTE</p><p style={{ fontSize: 13, color: '#333' }}>{detalhe.lote}</p></div>}
        </div>

        {/* Acoes */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666', flex: 0.5 }}>Fechar</button>
          <button onClick={() => abrirEditar(detalhe)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>Editar</button>
          <button onClick={() => confirmarExcluir(detalhe)} disabled={excluindo === detalhe.id}
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
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Decants</h2>
        <button onClick={() => window.location.href = '/admin/produtos'}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}>
          + Novo Perfume
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 15 }}>&#128269;</span>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar..."
          style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {[['todos', 'Todos'], ['aberto', 'Ativos'], ['baixo', 'Baixo Estoque'], ['esgotado', 'Esgotados']].map(([key, label]) => (
          <button key={key} onClick={() => setFiltro(key)}
            style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: filtro === key ? 'none' : '1.5px solid #ddd',
              background: filtro === key ? '#111' : '#fff', color: filtro === key ? '#fff' : '#555', transition: 'all .2s' }}>
            {label}
          </button>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#999', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{frascos.length} total</span>
      </div>

      {/* Cards */}
      <div style={{ background: '#f5f5f3', borderRadius: 14, padding: 12, margin: '0 -4px' }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 90, background: '#eee', borderRadius: 12 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🧴</p>
          <p>Nenhum frasco encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map(f => {
            const disp = Number(f.ml_disponivel || 0);
            const total = Number(f.ml_total || 0);
            const pct = total > 0 ? Math.round((disp / total) * 100) : 0;
            const st = getStatus(f);
            return (
              <div key={f.id} onClick={() => setDetalhe(f)}
                style={{ display: 'flex', gap: 14, padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #eee',
                  cursor: 'pointer', transition: 'all .15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(201,168,76,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>

                {/* Foto */}
                <div style={{ width: 60, height: 75, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.foto_url
                    ? <img src={f.foto_url} alt={f.perfume} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 24, color: '#ccc' }}>🧴</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.perfume}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>{f.marca}</p>
                    </div>
                    <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
                      <span>{disp}ml disponivel</span>
                      <span>{total}ml total</span>
                    </div>
                    <div style={{ height: 4, background: '#e8e4dc', borderRadius: 2 }}>
                      <div style={{ height: '100%', background: st.key === 'esgotado' ? '#c62828' : 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: `${pct}%`, transition: 'width .3s' }} />
                    </div>
                  </div>
                </div>

                {/* Seta */}
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
              </div>
            );
          })}
        </div>
      )}
      </div>
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [showTop] = useState(false); // moved to Admin component
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
  const sentinelRef = useRef(null);

  const carregar = async (pag = 1, termo = busca, append = false) => {
    if (pag === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ pagina: pag, limite, busca: termo, todos: true });
      const res = await fetch(`${API_URL}/api/perfumes?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const lista = data.perfumes || data;
      if (append) setPerfumes(prev => [...prev, ...lista]);
      else setPerfumes(lista);
      setTotal(data.total || 0);
      setPagina(pag);
    } catch(e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { carregar(1, ''); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setBusca(buscaInput); carregar(1, buscaInput); }, 400);
    return () => clearTimeout(t);
  }, [buscaInput]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && perfumes.length < total) {
        carregar(pagina + 1, busca, true);
      }
    }, { rootMargin: '200px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [pagina, total, busca, loadingMore, perfumes.length]);

  // scroll to top moved to Admin component

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
      carregar(1, busca);
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
      carregar(1, busca);
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
          <div style={{ width: 90, height: 110, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <div style={{ background: '#f5f5f3', borderRadius: 14, padding: 12, margin: '0 -4px' }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 100, background: '#eee', borderRadius: 12 }} />)}
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
                <div style={{ width: 70, height: 85, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      </div>

      {/* Infinite scroll sentinel */}
      {perfumes.length < total && (
        <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
          {loadingMore && <div style={{ width: 24, height: 24, border: '2px solid #e8e4dc', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />}
        </div>
      )}
      {perfumes.length > 0 && perfumes.length >= total && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', padding: '1rem 0' }}>{total} perfumes carregados</p>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

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
