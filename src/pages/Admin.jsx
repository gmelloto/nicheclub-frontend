import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import SwipeDelete from '../components/SwipeDelete.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { api } from '../services/api';
import { PainelNotas } from './AdminNotas.jsx';
import './Admin.css';

const ACORDE_CORES = {
  amadeirado: { bg: 'rgba(121,85,72,0.15)', color: '#8d6e63' },
  woody: { bg: 'rgba(121,85,72,0.15)', color: '#8d6e63' },
  floral: { bg: 'rgba(233,30,99,0.12)', color: '#e91e63' },
  frutado: { bg: 'rgba(255,87,34,0.12)', color: '#ff5722' },
  fruity: { bg: 'rgba(255,87,34,0.12)', color: '#ff5722' },
  cítrico: { bg: 'rgba(255,193,7,0.15)', color: '#f9a825' },
  citrus: { bg: 'rgba(255,193,7,0.15)', color: '#f9a825' },
  'picante quente': { bg: 'rgba(230,74,25,0.12)', color: '#e64a19' },
  spicy: { bg: 'rgba(230,74,25,0.12)', color: '#e64a19' },
  aromático: { bg: 'rgba(76,175,80,0.12)', color: '#43a047' },
  aromatic: { bg: 'rgba(76,175,80,0.12)', color: '#43a047' },
  verde: { bg: 'rgba(56,142,60,0.12)', color: '#388e3c' },
  green: { bg: 'rgba(56,142,60,0.12)', color: '#388e3c' },
  adocicado: { bg: 'rgba(244,143,177,0.2)', color: '#ec407a' },
  sweet: { bg: 'rgba(244,143,177,0.2)', color: '#ec407a' },
  oud: { bg: 'rgba(62,39,35,0.2)', color: '#795548' },
  almiscarado: { bg: 'rgba(158,158,158,0.15)', color: '#757575' },
  musky: { bg: 'rgba(158,158,158,0.15)', color: '#757575' },
  aquático: { bg: 'rgba(3,169,244,0.12)', color: '#039be5' },
  aquatic: { bg: 'rgba(3,169,244,0.12)', color: '#039be5' },
  fresco: { bg: 'rgba(0,188,212,0.12)', color: '#00acc1' },
  fresh: { bg: 'rgba(0,188,212,0.12)', color: '#00acc1' },
  balsâmico: { bg: 'rgba(121,85,72,0.12)', color: '#6d4c41' },
  terroso: { bg: 'rgba(141,110,99,0.15)', color: '#8d6e63' },
  earthy: { bg: 'rgba(141,110,99,0.15)', color: '#8d6e63' },
  oriental: { bg: 'rgba(183,28,28,0.1)', color: '#c62828' },
  powdery: { bg: 'rgba(206,147,216,0.2)', color: '#ab47bc' },
  aveludado: { bg: 'rgba(206,147,216,0.2)', color: '#ab47bc' },
  couro: { bg: 'rgba(78,52,46,0.2)', color: '#5d4037' },
  leather: { bg: 'rgba(78,52,46,0.2)', color: '#5d4037' },
  gourmand: { bg: 'rgba(255,111,0,0.12)', color: '#ef6c00' },
  vanila: { bg: 'rgba(255,183,77,0.2)', color: '#fb8c00' },
  vanilla: { bg: 'rgba(255,183,77,0.2)', color: '#fb8c00' },
  defumado: { bg: 'rgba(69,90,100,0.15)', color: '#546e7a' },
  smoky: { bg: 'rgba(69,90,100,0.15)', color: '#546e7a' },
};
const getAcordeCor = (acorde) => {
  const key = acorde?.toLowerCase().trim();
  return ACORDE_CORES[key] || { bg: 'var(--filter-bg)', color: 'var(--text3)' };
};

const TELAS_DISPONIVEIS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'estoque', label: 'Decants' },
  { key: 'perfumes', label: 'Perfumes' },
  { key: 'reservas', label: 'Reservas' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'usuarios', label: 'Usuarios' },
];

export default function Admin() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();

  const temPermissao = (tela) => {
    if (!usuario) return false;
    if (usuario.papel === 'admin') return true;
    if (usuario.permissoes?.includes('*')) return true;
    return usuario.permissoes?.includes(tela) || false;
  };

  const [aba, setAba] = useState(() => {
    if (!usuario) return 'dashboard';
    if (usuario.papel === 'admin') return 'dashboard';
    const primeira = TELAS_DISPONIVEIS.find(t => usuario.permissoes?.includes(t.key));
    return primeira?.key || 'dashboard';
  });
  const [maisAberto, setMaisAberto] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [secaoAberta, setSecaoAberta] = useState({ gerenciamento: true, cadastros: true });
  const [dark, setDark] = useState(() => localStorage.getItem('nc_admin_theme') === 'dark');

  const toggleTheme = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem('nc_admin_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
    return () => { document.body.removeAttribute('data-admin'); document.body.removeAttribute('data-theme'); };
  }, [dark]);

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

  const abaLabels = { dashboard: 'Dashboard', pedidos: 'Pedidos', estoque: 'Decants', perfumes: 'Perfumes', reservas: 'Reservas', whatsapp: 'WhatsApp', cadastrar: 'Cadastrar Produto', notas: 'Notas Olfativas', usuarios: 'Usuarios' };

  const toggleSecao = (s) => setSecaoAberta(prev => ({ ...prev, [s]: !prev[s] }));

  const bottomTabs = [
    { key: 'dashboard', label: 'Home', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    )},
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
    { key: 'reservas', label: 'Reservas', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M9 16l2 2 4-4" />
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
      {/* Sidebar desktop - dark modern */}
      <div className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        {/* Logo + collapse toggle */}
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <img src="/images/logo/logo-icon.png" alt="Niche Club" style={{ height: 40, borderRadius: 10, objectFit: 'contain' }} />
            {sidebarOpen && <span className="admin-brand-text">Niche Club</span>}
          </div>
          <button className="admin-collapse-btn" onClick={() => setSidebarOpen(v => !v)} title={sidebarOpen ? 'Colapsar menu' : 'Expandir menu'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform .3s' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {/* Dashboard */}
          {temPermissao('dashboard') && <button className={`admin-sidebar-item ${aba === 'dashboard' ? 'active' : ''}`} onClick={() => selecionarAba('dashboard')} title={!sidebarOpen ? 'Dashboard' : undefined}>
            <span className="admin-sidebar-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
              </svg>
            </span>
            {sidebarOpen && <span className="admin-sidebar-label">Dashboard</span>}
          </button>}

          {/* Gerenciamento */}
          {sidebarOpen ? (
            <>
              <button className="admin-sidebar-section" onClick={() => toggleSecao('gerenciamento')}>
                <span className="admin-sidebar-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </span>
                <span className="admin-sidebar-label">Gerenciamento</span>
                <svg className={`admin-section-arrow ${secaoAberta.gerenciamento ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {secaoAberta.gerenciamento && (
                <div className="admin-sidebar-subitems">
                  {[
                    { key: 'estoque', label: 'Decants' },
                    { key: 'pedidos', label: 'Pedidos' },
                    { key: 'reservas', label: 'Reservas' },
                    { key: 'whatsapp', label: 'WhatsApp' },
                  ].filter(item => temPermissao(item.key)).map(item => (
                    <button key={item.key} className={`admin-sidebar-subitem ${aba === item.key ? 'active' : ''}`} onClick={() => selecionarAba(item.key)}>
                      <span className="admin-sidebar-icon">
                        {bottomTabs.find(t => t.key === item.key)?.icon}
                      </span>
                      <span className="admin-sidebar-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Cadastros */}
              <button className="admin-sidebar-section" onClick={() => toggleSecao('cadastros')}>
                <span className="admin-sidebar-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </span>
                <span className="admin-sidebar-label">Cadastros</span>
                <svg className={`admin-section-arrow ${secaoAberta.cadastros ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {secaoAberta.cadastros && (
                <div className="admin-sidebar-subitems">
                  {temPermissao('perfumes') && <button className={`admin-sidebar-subitem ${aba === 'perfumes' ? 'active' : ''}`} onClick={() => selecionarAba('perfumes')}>
                    <span className="admin-sidebar-icon">
                      {bottomTabs.find(t => t.key === 'perfumes')?.icon}
                    </span>
                    <span className="admin-sidebar-label">Perfumes</span>
                  </button>}
                  {temPermissao('perfumes') && <button className={`admin-sidebar-subitem ${aba === 'notas' ? 'active' : ''}`} onClick={() => selecionarAba('notas')}>
                    <span className="admin-sidebar-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4 0-8-2-8-6 0-6 8-14 8-14s8 8 8 14c0 4-4 6-8 6z"/></svg>
                    </span>
                    <span className="admin-sidebar-label">Notas Olfativas</span>
                  </button>}
                  {temPermissao('usuarios') && <button className={`admin-sidebar-subitem ${aba === 'usuarios' ? 'active' : ''}`} onClick={() => selecionarAba('usuarios')}>
                    <span className="admin-sidebar-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    </span>
                    <span className="admin-sidebar-label">Usuarios</span>
                  </button>}
                </div>
              )}
            </>
          ) : (
            /* Collapsed mode: flat icons only (skip dashboard, already shown above) */
            <>
              {bottomTabs.filter(tab => tab.key !== 'dashboard').map(tab => (
                <button key={tab.key} className={`admin-sidebar-item ${aba === tab.key ? 'active' : ''}`} onClick={() => selecionarAba(tab.key)} title={abaLabels[tab.key]}>
                  <span className="admin-sidebar-icon">{tab.icon}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Bottom links */}
        <div className="admin-sidebar-extra">
          <div className="admin-sidebar-divider" />
          <button className="admin-sidebar-item" onClick={toggleTheme} title={!sidebarOpen ? (dark ? 'Modo claro' : 'Modo escuro') : undefined}>
            <span className="admin-sidebar-icon">
              {dark ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </span>
            {sidebarOpen && <span className="admin-sidebar-label">{dark ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>
          <button className="admin-sidebar-item" onClick={() => navigate('/')} title={!sidebarOpen ? 'Ver Loja' : undefined}>
            <span className="admin-sidebar-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </span>
            {sidebarOpen && <span className="admin-sidebar-label">Ver Loja</span>}
          </button>
        </div>
      </div>
      <div className="admin-content" style={{ paddingBottom: 80 }}>
        {aba === 'dashboard' && <PainelDashboard />}
        {aba === 'pedidos' && <PainelPedidos token={token} />}
        {aba === 'estoque' && <PainelEstoque token={token} />}
        {aba === 'perfumes' && <PainelPerfumes token={token} />}
        {aba === 'reservas' && <PainelReservas token={token} />}
        {aba === 'whatsapp' && <PainelWhatsApp token={token} />}
        {aba === 'usuarios' && <PainelUsuarios token={token} />}
        {aba === 'notas' && <PainelNotas token={token} />}
      </div>

      {/* Menu "Mais" overlay */}
      {maisAberto && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9997 }} onClick={() => setMaisAberto(false)}>
          <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 340,
            background: 'var(--card-bg)', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', padding: 8, animation: 'slideUp .2s ease' }}
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

function PainelDashboard() {
  const saudacao = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{saudacao()}</h1>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pedidos', valor: '—', cor: '#1565c0', bg: 'rgba(21,101,192,0.08)', iconBg: 'rgba(21,101,192,0.15)', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
          )},
          { label: 'Reservas', valor: '—', cor: '#e65100', bg: 'rgba(230,81,0,0.06)', iconBg: 'rgba(230,81,0,0.15)', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          )},
          { label: 'Perfumes', valor: '—', cor: '#2e7d32', bg: 'rgba(46,125,50,0.06)', iconBg: 'rgba(46,125,50,0.15)', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M10 4h4v4h-4z"/><path d="M9 8V6a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          )},
          { label: 'Faturamento', valor: '—', cor: '#7b1fa2', bg: 'rgba(123,31,162,0.06)', iconBg: 'rgba(123,31,162,0.15)', icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><path d="M12 18V6"/></svg>
          )},
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, border: '1px solid var(--card-border)', boxShadow: '0 1px 4px var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ padding: 12, background: card.iconBg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: card.cor, margin: '2px 0 0' }}>{card.valor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--filter-bg)', borderRadius: 16, padding: 40, textAlign: 'center', color: 'var(--text3)', border: '1px solid var(--card-border)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
          <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#666', marginBottom: 4 }}>Em breve</p>
        <p style={{ fontSize: 13 }}>Os dashboards e gráficos serão implementados aqui.</p>
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
    aguardando_pagamento: { label: 'Aguardando', bg: 'var(--filter-bg)', color: 'var(--text3)' },
    pagamento_aprovado: { label: 'Pago', bg: '#e8f5e9', color: '#2e7d32' },
    em_separacao: { label: 'Separando', bg: '#fff3e0', color: '#e65100' },
    enviado: { label: 'Enviado', bg: '#e3f2fd', color: '#1565c0' },
    entregue: { label: 'Entregue', bg: '#e8f5e9', color: '#2e7d32' },
    cancelado: { label: 'Cancelado', bg: '#fce4ec', color: '#c62828' },
  };

  const getStatus = (s) => statusMap[s] || { label: s, bg: 'var(--filter-bg)', color: 'var(--text3)' };

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
      const atualizado = { ...detalhe, status: statusEdit, codigo_rastreio: rastreio };
      setPedidos(prev => prev.map(p => p.id === detalhe.id ? atualizado : p));
      setDetalhe(atualizado);
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
  const modalDetalhe = detalhe && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9998 }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.1em' }}>{detalhe.numero}</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{detalhe.cliente}</h3>
          </div>
          {(() => { const st = getStatus(detalhe.status); return (
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
          ); })()}
        </div>

        {/* Info */}
        <div style={{ background: 'var(--filter-bg)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>R$ {Number(detalhe.total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Data</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.criado_em ? new Date(detalhe.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
          </div>
          {detalhe.codigo_rastreio && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Rastreio</span>
              <span style={{ fontSize: 13, color: '#1565c0', fontWeight: 600 }}>{detalhe.codigo_rastreio}</span>
            </div>
          )}
        </div>

        {/* Itens do pedido */}
        {detalhe.itens?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 8 }}>ITENS</p>
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
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 6 }}>ALTERAR STATUS</p>
          <select value={statusEdit} onChange={e => setStatusEdit(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)', marginBottom: 8, boxSizing: 'border-box' }}>
            <option value="aguardando_pagamento">Aguardando pagamento</option>
            <option value="pagamento_aprovado">Pagamento aprovado</option>
            <option value="em_separacao">Em separacao</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input value={rastreio} onChange={e => setRastreio(e.target.value)} placeholder="Codigo de rastreio (opcional)"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Acoes */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDetalhe(null)} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Fechar</button>
          <button onClick={salvarStatus} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">

      {modalDetalhe}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>Pedidos</h1>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>{pedidos.length}</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 6 }}>Gerencie pedidos e atualize status de entrega</p>
      </div>

      {/* Filtros com contagem */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, background: 'var(--filter-bg)', borderRadius: 14, padding: 6 }}>
        {filtroTabs.map(([key, label]) => {
          const count = key === '' ? pedidos.length : pedidos.filter(p => p.status === key).length;
          return (
            <button key={key} onClick={() => setFiltro(key)}
              style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6, border: 'none',
                background: filtro === key ? 'var(--filter-active)' : 'transparent', color: filtro === key ? 'var(--filter-active-text)' : 'var(--filter-text)',
                boxShadow: filtro === key ? '0 1px 3px var(--filter-shadow)' : 'none', transition: 'all .2s' }}>
              {label}
              <span style={{ fontSize: 11, opacity: 0.6 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="admin-card-list">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--bg3)', borderRadius: 12 }} />)}
        </div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text3)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
          <p>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedidos.map(p => {
            const st = getStatus(p.status);
            return (
              <div key={p.id} onClick={() => abrirDetalhe(p)} className="admin-card">

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cliente}</p>
                      <p style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>{p.numero}</p>
                    </div>
                    <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>R$ {Number(p.total || 0).toFixed(2).replace('.', ',')}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : ''}</span>
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
  const [editForm, setEditForm] = useState({ ml_total: '', ml_vendido: '', lote: '' });
  const [salvando, setSalvando] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [novoForm, setNovoForm] = useState({ perfume_id: '', ml_total: '', lote: '' });
  const [perfumes, setPerfumes] = useState([]);
  const [buscaPerfume, setBuscaPerfume] = useState('');

  const carregar = () => {
    setLoading(true);
    api.estoque(token)
      .then(setFrascos).catch(() => setFrascos([]))
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

  // ── Editar ──
  const abrirEditar = (f) => {
    setEditForm({ ml_total: String(f.ml_total), ml_vendido: String(f.ml_vendido), lote: f.lote || '' });
    setEditando(f);
    setDetalhe(null);
  };

  const salvarEdicao = async () => {
    setSalvando(true);
    try {
      await api.editarFrasco(token, editando.id, {
        ml_total: Number(editForm.ml_total),
        ml_vendido: Number(editForm.ml_vendido),
      });
      const mlTotal = Number(editForm.ml_total);
      const mlVendido = Number(editForm.ml_vendido);
      const atualizado = { ...editando, ml_total: mlTotal, ml_vendido: mlVendido, ml_disponivel: mlTotal - mlVendido };
      setFrascos(prev => prev.map(f => f.id === editando.id ? atualizado : f));
      setDetalhe(atualizado);
      setEditando(null);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  // ── Excluir ──
  const confirmarExcluir = async (f) => {
    try {
      await api.deletarFrasco(token, f.id);
      setFrascos(prev => prev.filter(x => x.id !== f.id));
      setDetalhe(null);
    } catch(e) { alert(e.message); }
  };

  // ── Novo Frasco ──
  const abrirNovo = () => {
    setNovoAberto(true);
    setNovoForm({ perfume_id: '', ml_total: '', lote: '' });
    setBuscaPerfume('');
    api.listarPerfumesSimples(token).then(data => {
      setPerfumes(data.perfumes || data || []);
    }).catch(() => setPerfumes([]));
  };

  const salvarNovo = async () => {
    if (!novoForm.perfume_id || !novoForm.ml_total) return alert('Selecione o perfume e informe o ML total.');
    setSalvando(true);
    try {
      await api.adicionarFrasco(token, novoForm.perfume_id, Number(novoForm.ml_total), novoForm.lote || null);
      setNovoAberto(false);
      api.estoque(token).then(setFrascos).catch(() => {});
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const perfumesFiltrados = perfumes.filter(p =>
    !buscaPerfume || p.nome?.toLowerCase().includes(buscaPerfume.toLowerCase()) || p.marca?.toLowerCase().includes(buscaPerfume.toLowerCase())
  );

  // ── Modal Novo Frasco ──
  const modalNovo = novoAberto && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && setNovoAberto(false)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Novo Frasco</h3>

        {/* Busca perfume */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>PERFUME</label>
          <input value={buscaPerfume} onChange={e => setBuscaPerfume(e.target.value)} placeholder="Buscar perfume..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', marginBottom: 8 }} />
          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
            {perfumesFiltrados.slice(0, 30).map(p => (
              <div key={p.id} onClick={() => { setNovoForm(f => ({ ...f, perfume_id: p.id })); setBuscaPerfume(p.nome + ' — ' + p.marca); }}
                style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                  background: novoForm.perfume_id === p.id ? 'rgba(201,169,110,0.1)' : '#fff',
                  display: 'flex', alignItems: 'center', gap: 10 }}
                onMouseEnter={e => e.currentTarget.style.background = novoForm.perfume_id === p.id ? 'rgba(201,169,110,0.15)' : '#f8f7f4'}
                onMouseLeave={e => e.currentTarget.style.background = novoForm.perfume_id === p.id ? 'rgba(201,169,110,0.1)' : '#fff'}>
                {p.foto_url && <img src={p.foto_url} alt="" style={{ width: 32, height: 40, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }} />}
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)' }}>{p.nome}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>{p.marca}</p>
                </div>
              </div>
            ))}
            {perfumesFiltrados.length === 0 && <p style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Nenhum perfume encontrado</p>}
          </div>
        </div>

        {/* ML Total + Lote */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>ML TOTAL</label>
            <input type="number" value={novoForm.ml_total} onChange={e => setNovoForm(f => ({ ...f, ml_total: e.target.value }))} placeholder="Ex: 100"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>LOTE (opcional)</label>
            <input value={novoForm.lote} onChange={e => setNovoForm(f => ({ ...f, lote: e.target.value }))} placeholder="Ex: L001"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setNovoAberto(false)} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={salvarNovo} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Adicionar Frasco'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Editar ──
  const modalEditar = editando && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && setEditando(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Editar Frasco</h3>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>{editando.perfume} — {editando.marca}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>ML TOTAL</label>
            <input type="number" value={editForm.ml_total} onChange={e => setEditForm(f => ({ ...f, ml_total: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>ML VENDIDO</label>
            <input type="number" value={editForm.ml_vendido} onChange={e => setEditForm(f => ({ ...f, ml_vendido: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Disponivel: <b style={{ color: '#c9a84c' }}>{Math.max(0, Number(editForm.ml_total) - Number(editForm.ml_vendido))}ml</b></p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditando(null)} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Detalhe ──
  const modalDetalhe = detalhe && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9998 }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
          {detalhe.foto_url && (
            <img src={detalhe.foto_url} alt={detalhe.perfume} style={{ width: 56, height: 70, borderRadius: 8, objectFit: 'contain', flexShrink: 0, background: '#fff' }} />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{detalhe.marca}</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{detalhe.perfume}</h3>
          </div>
        </div>

        {/* Barra de progresso */}
        {(() => {
          const total = Number(detalhe.ml_total || 0);
          const vendido = Number(detalhe.ml_vendido || 0);
          const disp = Number(detalhe.ml_disponivel || 0);
          const pct = total > 0 ? Math.round((disp / total) * 100) : 0;
          const st = getStatus(detalhe);
          return (
            <div className="admin-info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>Disponivel</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{disp}ml / {total}ml</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 8 }}>
                <div style={{ height: '100%', background: st.key === 'esgotado' ? 'var(--danger-text)' : 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 3, width: `${pct}%`, transition: 'width .3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>Vendido: {vendido}ml</span>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
              </div>
            </div>
          );
        })()}

        {/* Info */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em' }}>CRIADO</p><p style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.criado_em ? new Date(detalhe.criado_em).toLocaleDateString('pt-BR') : '—'}</p></div>
          {detalhe.esgotado_em && <div><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em' }}>ESGOTADO</p><p style={{ fontSize: 13, color: 'var(--danger-text)' }}>{new Date(detalhe.esgotado_em).toLocaleDateString('pt-BR')}</p></div>}
          {detalhe.lote && <div><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em' }}>LOTE</p><p style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.lote}</p></div>}
        </div>

        {/* Acoes */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => confirmarExcluir(detalhe)} style={{ padding: '12px', background: 'var(--danger-bg)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--danger-text)', fontWeight: 600 }}>Excluir</button>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)', flex: 0.5 }}>Fechar</button>
          <button onClick={() => abrirEditar(detalhe)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>Editar</button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">

      {modalNovo}
      {modalEditar}
      {modalDetalhe}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>Decants</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 6 }}>Controle de frascos e disponibilidade de ML</p>
        </div>
        <button onClick={abrirNovo}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}>
          + Novo Frasco
        </button>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar perfume ou marca..." className="admin-search" />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', background: 'var(--filter-bg)', borderRadius: 14, padding: 6 }}>
        {[['todos', 'Todos'], ['aberto', 'Ativos'], ['baixo', 'Baixo Estoque'], ['esgotado', 'Esgotados']].map(([key, label]) => {
          const count = key === 'todos' ? frascos.length : frascos.filter(f => getStatus(f).key === key).length;
          return (
            <button key={key} onClick={() => setFiltro(key)}
              style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6, border: 'none',
                background: filtro === key ? 'var(--filter-active)' : 'transparent', color: filtro === key ? 'var(--filter-active-text)' : 'var(--filter-text)',
                boxShadow: filtro === key ? '0 1px 3px var(--filter-shadow)' : 'none', transition: 'all .2s' }}>
              {label}
              {count > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="admin-card-list">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 90, background: 'var(--bg3)', borderRadius: 12 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text3)' }}>
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
              <SwipeDelete key={f.id} onDelete={() => confirmarExcluir(f)}>
                <div onClick={() => setDetalhe(f)} className="admin-card">

                  {/* Foto */}
                  <div className="admin-card-thumb">
                    {f.foto_url
                      ? <img src={f.foto_url} alt={f.perfume} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: 20, color: '#ccc' }}>🧴</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{f.perfume}</p>
                      <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0' }}>{f.marca}{f.lote ? ` · Lote ${f.lote}` : ''}</p>

                    {/* Barra de progresso */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>
                        <span>{disp}ml disponivel</span>
                        <span>{total}ml total</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                        <div style={{ height: '100%', background: st.key === 'esgotado' ? '#c62828' : 'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius: 2, width: `${pct}%`, transition: 'width .3s' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
                </div>
              </SwipeDelete>
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
  const [fixSocial, setFixSocial] = useState(false);
  const [fixSocialResult, setFixSocialResult] = useState(null);
  const [fixData, setFixData] = useState(false);
  const [fixDataResult, setFixDataResult] = useState(null);

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
      const atualizado = { ...editando, ...editForm };
      setPerfumes(prev => prev.map(x => x.id === editando.id ? atualizado : x));
      setDetalhe(atualizado);
      setEditando(null);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const excluir = async (p) => {
    setExcluindo(p.id);
    try {
      const res = await fetch(`${API_URL}/api/admin/perfumes/${p.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setPerfumes(prev => prev.filter(x => x.id !== p.id));
      setTotal(prev => prev - 1);
      setDetalhe(null);
    } catch(e) { alert(e.message); }
    finally { setExcluindo(null); }
  };

  const inp = (key) => ({
    value: editForm[key] || '',
    onChange: e => setEditForm(f => ({ ...f, [key]: e.target.value })),
    style: { width: '100%', padding: '8px 12px', border: '1px solid var(--input-border)', borderRadius: 4, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: 'var(--input-text)', background: 'var(--input-bg)' }
  });

  // ── Modal Editar ──
  const modalEditar = editando && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && setEditando(null)}>
      <div className="admin-modal-sheet" style={{ maxHeight: '90vh', overflowX: 'hidden' }}>
        <div className="admin-modal-handle" />
        <h3 style={{ marginBottom: 16, color: 'var(--text)', fontSize: 18, fontWeight: 700 }}>Editar Perfume</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOME</label><input {...inp('nome')} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>MARCA</label><input {...inp('marca')} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>ANO</label><input {...inp('ano')} type="number" /></div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>GENERO</label>
              <select value={editForm.genero || ''} onChange={e => setEditForm(f => ({ ...f, genero: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--input-border)', borderRadius: 4, fontSize: 13, outline: 'none', color: 'var(--input-text)', background: 'var(--input-bg)', boxSizing: 'border-box' }}>
                <option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Compartilhável">Compartilhável</option>
              </select>
            </div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>PAIS</label><input {...inp('pais')} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>FAMILIA</label><input {...inp('familia_olfativa')} /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>RATING</label><input {...inp('rating_valor')} type="number" step="0.01" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>VOTOS</label><input {...inp('rating_count')} type="number" /></div>
          </div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>ACORDES</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            <input {...inp('acorde1')} placeholder="1" /><input {...inp('acorde2')} placeholder="2" /><input {...inp('acorde3')} placeholder="3" />
            <input {...inp('acorde4')} placeholder="4" /><input {...inp('acorde5')} placeholder="5" />
          </div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOTAS TOPO</label><input {...inp('notas_topo')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOTAS CORACAO</label><input {...inp('notas_coracao')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOTAS BASE</label><input {...inp('notas_base')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>URL FOTO</label><input {...inp('foto_url')} /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>DESCRICAO</label>
            <textarea value={editForm.descricao || ''} onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--input-border)', borderRadius: 4, fontSize: 13, outline: 'none', color: 'var(--input-text)', background: 'var(--input-bg)', minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>PRECOS DECANT</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 6 }}>
            {TAMANHOS.map(t => (
              <div key={t.key}><label style={{ fontSize: 10, color: '#aaa', display: 'block', marginBottom: 2 }}>{t.label}</label><input type="number" step="0.01" placeholder="R$" {...inp(`preco_${t.key}`)} /></div>
            ))}
          </div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>PRECO LACRADO</label><input type="number" step="0.01" placeholder="R$" {...inp('preco_lacrado')} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)', cursor: 'pointer', flexShrink: 0 }}>
            <input type="checkbox" checked={editForm.ativo !== false} onChange={e => setEditForm(f => ({ ...f, ativo: e.target.checked }))} style={{ width: 18, height: 18, flexShrink: 0 }} />
            Ativo no catalogo
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, position: 'sticky', bottom: 0, background: 'var(--card-bg)', paddingTop: 12 }}>
          <button onClick={() => setEditando(null)} style={{ flex: 1, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Detalhe ──
  const modalDetalhe = detalhe && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9998 }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />

        {/* Foto + info */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 90, height: 110, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {detalhe.foto_url
              ? <img src={detalhe.foto_url} alt={detalhe.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 32, color: '#ccc' }}>🧴</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: '#8a6a10', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{detalhe.marca}</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 6px', color: 'var(--text)' }}>{detalhe.nome}</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 12, color: 'var(--text3)' }}>
              {detalhe.genero && <span>{detalhe.genero}</span>}
              {detalhe.ano && <span>· {detalhe.ano}</span>}
              {detalhe.pais && <span>· {detalhe.pais}</span>}
            </div>
            {detalhe.rating_valor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{Number(detalhe.rating_valor).toFixed(1)}</span>
                <span style={{ color: '#c9a84c', fontSize: 12 }}>★</span>
                {detalhe.rating_count && <span style={{ fontSize: 11, color: 'var(--text3)' }}>({Number(detalhe.rating_count).toLocaleString()})</span>}
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
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, letterSpacing: '0.1em' }}>ACORDES</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[detalhe.acorde1, detalhe.acorde2, detalhe.acorde3, detalhe.acorde4, detalhe.acorde5].filter(Boolean).map(a => (
                <span key={a} style={{ padding: '4px 12px', background: getAcordeCor(a).bg, borderRadius: 20, fontSize: 12, color: getAcordeCor(a).color, fontWeight: 500 }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {(detalhe.notas_topo || detalhe.notas_coracao || detalhe.notas_base) && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, letterSpacing: '0.1em' }}>NOTAS</p>
            {detalhe.notas_topo && <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}><b style={{ color: '#c9a84c' }}>Topo:</b> {detalhe.notas_topo}</p>}
            {detalhe.notas_coracao && <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}><b style={{ color: '#c9a84c' }}>Coracao:</b> {detalhe.notas_coracao}</p>}
            {detalhe.notas_base && <p style={{ fontSize: 12, color: 'var(--text2)' }}><b style={{ color: '#c9a84c' }}>Base:</b> {detalhe.notas_base}</p>}
          </div>
        )}

        {/* Descricao */}
        {detalhe.descricao && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 4, letterSpacing: '0.1em' }}>DESCRICAO</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{detalhe.descricao}</p>
          </div>
        )}

        {/* Familia + Perfumistas */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {detalhe.familia_olfativa && (
            <div><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)' }}>FAMILIA</p><p style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.familia_olfativa}</p></div>
          )}
          {detalhe.perfumista1 && (
            <div><p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)' }}>PERFUMISTA</p><p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic' }}>{[detalhe.perfumista1, detalhe.perfumista2].filter(Boolean).join(', ')}</p></div>
          )}
        </div>

        {/* Acoes */}
        <div style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 0, background: 'var(--card-bg)', paddingTop: 12 }}>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)', flex: 0.5 }}>Fechar</button>
          <button onClick={() => abrirEditar(detalhe)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>Editar</button>
          <button onClick={() => excluir(detalhe)} disabled={excluindo === detalhe.id}
            style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--danger-text)' }}>
            {excluindo === detalhe.id ? '...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">

      {modalEditar}
      {modalDetalhe}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Produtos</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={async () => {
            if (fixSocial) return;
            setFixSocial(true); setFixSocialResult(null);
            try {
              const resp = await fetch(`${API_URL}/api/admin/perfumes/fix-social`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{}',
              });
              const data = await resp.json();
              setFixSocialResult({ running: true, processados: 0, total: 0, mensagem: data.mensagem });
              const poll = setInterval(async () => {
                try {
                  const r = await fetch(`${API_URL}/api/admin/perfumes/fix-social`, { headers: { Authorization: `Bearer ${token}` } });
                  const status = await r.json();
                  setFixSocialResult(status);
                  if (!status.running) { clearInterval(poll); setFixSocial(false); }
                } catch { clearInterval(poll); setFixSocial(false); }
              }, 3000);
            } catch(e) { setFixSocialResult({ erro: e.message }); setFixSocial(false); }
          }} disabled={fixSocial}
            style={{ padding: '10px 14px', background: '#111', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: fixSocial ? 'not-allowed' : 'pointer', color: '#fff', opacity: fixSocial ? 0.7 : 1 }}>
            {fixSocial ? 'Buscando...' : 'Fotos Social'}
          </button>
          <button onClick={async () => {
            if (fixData) return;
            setFixData(true); setFixDataResult(null);
            try {
              const resp = await fetch(`${API_URL}/api/admin/perfumes/fix-data`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{}',
              });
              const data = await resp.json();
              setFixDataResult({ running: true, processados: 0, total: 0, mensagem: data.mensagem });
              const poll = setInterval(async () => {
                try {
                  const r = await fetch(`${API_URL}/api/admin/perfumes/fix-data`, { headers: { Authorization: `Bearer ${token}` } });
                  const status = await r.json();
                  setFixDataResult(status);
                  if (!status.running) { clearInterval(poll); setFixData(false); if (status.atualizados > 0) carregar(1, busca); }
                } catch { clearInterval(poll); setFixData(false); }
              }, 3000);
            } catch(e) { setFixDataResult({ erro: e.message }); setFixData(false); }
          }} disabled={fixData}
            style={{ padding: '10px 14px', background: '#111', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: fixData ? 'not-allowed' : 'pointer', color: '#fff', opacity: fixData ? 0.7 : 1 }}>
            {fixData ? 'Buscando...' : 'Acordes'}
          </button>
          <button onClick={() => window.location.href = '/admin/produtos'}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}>
            + Novo Produto
          </button>
        </div>
      </div>

      {/* Resultado fix-social */}
      {fixSocialResult && (
        <div style={{ background: fixSocialResult.erro ? '#fce4ec' : fixSocialResult.running ? '#fff3e0' : '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
          {fixSocialResult.erro ? (
            <span style={{ color: '#c62828' }}>Erro: {fixSocialResult.erro}</span>
          ) : fixSocialResult.running ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #e8e4dc', borderTop: '2px solid #e65100', borderRadius: '50%', animation: 'spin .6s linear infinite', flexShrink: 0 }} />
              <span style={{ color: '#e65100', fontWeight: 600 }}>Buscando... {fixSocialResult.processados || 0}/{fixSocialResult.total || '?'} — {fixSocialResult.atualizados || 0} atualizados</span>
            </div>
          ) : (
            <div>
              <span style={{ color: '#2e7d32', fontWeight: 600 }}>Concluído! {fixSocialResult.atualizados || 0} fotos sociais carregadas ({fixSocialResult.processados || 0} processados)</span>
              {fixSocialResult.erros?.length > 0 && (
                <details style={{ marginTop: 6, fontSize: 12, color: 'var(--text3)' }}>
                  <summary style={{ cursor: 'pointer' }}>{fixSocialResult.erros.length} erros</summary>
                  {fixSocialResult.erros.map((e, i) => <p key={i}>{e.nome}: {e.erro}</p>)}
                </details>
              )}
              <button onClick={() => setFixSocialResult(null)} style={{ marginTop: 6, background: 'none', border: 'none', fontSize: 12, color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }}>Fechar</button>
            </div>
          )}
        </div>
      )}

      {/* Resultado fix-data */}
      {fixDataResult && (
        <div style={{ background: fixDataResult.erro ? '#fce4ec' : fixDataResult.running ? '#fff3e0' : '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
          {fixDataResult.erro ? (
            <span style={{ color: '#c62828' }}>Erro: {fixDataResult.erro}</span>
          ) : fixDataResult.running ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #e8e4dc', borderTop: '2px solid #e65100', borderRadius: '50%', animation: 'spin .6s linear infinite', flexShrink: 0 }} />
              <span style={{ color: '#e65100', fontWeight: 600 }}>Enriquecendo... {fixDataResult.processados || 0}/{fixDataResult.total || '?'} — {fixDataResult.atualizados || 0} atualizados</span>
            </div>
          ) : (
            <div>
              <span style={{ color: '#2e7d32', fontWeight: 600 }}>Concluído! {fixDataResult.atualizados || 0} perfumes enriquecidos ({fixDataResult.processados || 0} processados)</span>
              {fixDataResult.erros?.length > 0 && (
                <details style={{ marginTop: 6, fontSize: 12, color: 'var(--text3)' }}>
                  <summary style={{ cursor: 'pointer' }}>{fixDataResult.erros.length} erros</summary>
                  {fixDataResult.erros.map((e, i) => <p key={i}>{e.nome}: {e.erro}</p>)}
                </details>
              )}
              <button onClick={() => setFixDataResult(null)} style={{ marginTop: 6, background: 'none', border: 'none', fontSize: 12, color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }}>Fechar</button>
            </div>
          )}
        </div>
      )}

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 15 }}>&#128269;</span>
        <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)} placeholder="Buscar..." className="admin-search" />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', background: 'var(--filter-bg)', borderRadius: 14, padding: 6 }}>
        {[['todos', 'Todos'], ['ativos', 'Ativos'], ['inativos', 'Inativos']].map(([key, label]) => (
          <button key={key} onClick={() => setFiltro(key)}
            style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: 'none',
              background: filtro === key ? 'var(--filter-active)' : 'transparent', color: filtro === key ? 'var(--filter-active-text)' : 'var(--filter-text)',
              boxShadow: filtro === key ? '0 1px 3px var(--filter-shadow)' : 'none', transition: 'all .2s' }}>
            {label}
          </button>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--text3)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{total} total</span>
      </div>

      {/* Cards */}
      <div className="admin-card-list">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 100, background: 'var(--bg3)', borderRadius: 12 }} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text3)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p>Nenhum perfume encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map(p => {
            const acordes = [p.acorde1, p.acorde2, p.acorde3].filter(Boolean);
            return (
              <SwipeDelete key={p.id} onDelete={() => excluir(p)}>
                <div onClick={() => setDetalhe(p)} className="admin-card">

                  {/* Foto */}
                  <div className="admin-card-thumb">
                    {p.foto_url
                      ? <img src={p.foto_url} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: 28, color: '#ccc' }}>🧴</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</p>
                        <p style={{ fontSize: 12, color: 'var(--text3)' }}>{p.marca}</p>
                      </div>
                      <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: p.ativo !== false ? '#e8f5e9' : '#fce4ec',
                        color: p.ativo !== false ? '#2e7d32' : '#c62828' }}>
                        {p.ativo !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6, fontSize: 12, color: 'var(--text3)' }}>
                      {p.genero && <span>{p.genero}</span>}
                      {p.ano && <span>· {p.ano}</span>}
                      {p.rating_valor && <span>· <span style={{ color: '#c9a84c' }}>★</span> {Number(p.rating_valor).toFixed(1)}</span>}
                    </div>

                    {acordes.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {acordes.map(a => { const c = getAcordeCor(a); return (
                          <span key={a} style={{ padding: '2px 8px', background: c.bg, borderRadius: 12, fontSize: 10, color: c.color, fontWeight: 500 }}>{a}</span>
                        ); })}
                      </div>
                    )}
                  </div>

                  <div className="admin-card-arrow">›</div>
                </div>
              </SwipeDelete>
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

    </div>
  );
}

function formatarTelefone(tel) {
  if (!tel) return '';
  const d = tel.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return tel;
}

function mascaraTelefone(valor) {
  let d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length > 6) d = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  else if (d.length > 2) d = `(${d.slice(0,2)}) ${d.slice(2)}`;
  else if (d.length > 0) d = `(${d}`;
  return d;
}

function PainelReservas({ token }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [statusEdit, setStatusEdit] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setLoading(true);
    api.listarReservas(token, filtro || undefined)
      .then(setReservas).catch(() => setReservas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [token, filtro]);

  const statusMap = {
    pendente: { label: 'Pendente', bg: '#fff3e0', color: '#e65100' },
    confirmada: { label: 'Confirmada', bg: '#e8f5e9', color: '#2e7d32' },
    separando: { label: 'Separando', bg: '#e3f2fd', color: '#1565c0' },
    pronta: { label: 'Pronta', bg: '#ede7f6', color: '#4527a0' },
    entregue: { label: 'Entregue', bg: '#e8f5e9', color: '#1b5e20' },
    cancelada: { label: 'Cancelada', bg: '#fce4ec', color: '#c62828' },
  };

  const getStatus = (s) => statusMap[s] || { label: s, bg: 'var(--filter-bg)', color: 'var(--text3)' };

  const abrirDetalhe = (r) => {
    setDetalhe(r);
    setStatusEdit(r.status || '');
  };

  const salvarStatus = async () => {
    if (!detalhe) return;
    setSalvando(true);
    try {
      await api.atualizarReservaStatus(token, detalhe.id, statusEdit);
      const atualizado = { ...detalhe, status: statusEdit };
      setReservas(prev => prev.map(r => r.id === detalhe.id ? atualizado : r));
      setDetalhe(atualizado);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const deletarReserva = async (id) => {
    try {
      await api.deletarReserva(token, id);
      setReservas(prev => prev.filter(r => r.id !== id));
      setDetalhe(null);
    } catch(e) { alert(e.message); }
  };

  const filtroTabs = [
    ['', 'Todas'],
    ['pendente', 'Pendentes'],
    ['confirmada', 'Confirmadas'],
    ['separando', 'Separando'],
    ['pronta', 'Prontas'],
    ['entregue', 'Entregues'],
    ['cancelada', 'Canceladas'],
  ];

  const modalDetalhe = detalhe && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9998 }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
          {detalhe.foto_url && (
            <img src={detalhe.foto_url} alt={detalhe.perfume_nome} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.1em' }}>{detalhe.marca}</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{detalhe.perfume_nome}</h3>
          </div>
          {(() => { const st = getStatus(detalhe.status); return (
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
          ); })()}
        </div>

        <div style={{ background: 'var(--filter-bg)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Cliente</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{detalhe.nome}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Telefone</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{formatarTelefone(detalhe.telefone)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Tamanho</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.tamanho || `${detalhe.ml_quantidade}ml (avulso)`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Valor</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>R$ {Number(detalhe.preco_total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Data</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.criado_em ? new Date(detalhe.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 6 }}>ALTERAR STATUS</p>
          <select value={statusEdit} onChange={e => setStatusEdit(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)', boxSizing: 'border-box' }}>
            <option value="pendente">Pendente</option>
            <option value="confirmada">Confirmada</option>
            <option value="separando">Separando</option>
            <option value="pronta">Pronta</option>
            <option value="entregue">Entregue</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => deletarReserva(detalhe.id)} style={{ padding: '12px', background: 'var(--danger-bg)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--danger-text)', fontWeight: 600 }}>Excluir</button>
          <button onClick={() => setDetalhe(null)} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Fechar</button>
          <button onClick={salvarStatus} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">

      {modalDetalhe}

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>Reservas</h1>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>{reservas.length}</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 6 }}>Gerencie reservas de clientes e atualize status</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, background: 'var(--filter-bg)', borderRadius: 14, padding: 6 }}>
        {filtroTabs.map(([key, label]) => {
          const count = key === '' ? reservas.length : reservas.filter(r => r.status === key).length;
          return (
            <button key={key} onClick={() => setFiltro(key)}
              style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6, border: 'none',
                background: filtro === key ? 'var(--filter-active)' : 'transparent', color: filtro === key ? 'var(--filter-active-text)' : 'var(--filter-text)',
                boxShadow: filtro === key ? '0 1px 3px var(--filter-shadow)' : 'none', transition: 'all .2s' }}>
              {label}
              {count > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      <div className="admin-card-list">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--bg3)', borderRadius: 12 }} />)}
        </div>
      ) : reservas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text3)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📅</p>
          <p>Nenhuma reserva encontrada</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservas.map(r => {
            const st = getStatus(r.status);
            return (
              <SwipeDelete key={r.id} onDelete={() => deletarReserva(r.id)}>
              <div onClick={() => abrirDetalhe(r)} className="admin-card">

                {r.foto_url && (
                  <div className="admin-card-thumb"><img src={r.foto_url} alt={r.perfume_nome} /></div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nome}</p>
                    <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, letterSpacing: '0.05em', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.marca}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.perfume_nome}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f0ede8', color: '#5a5550' }}>{r.tamanho || `${r.ml_quantidade}ml`}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{r.criado_em ? new Date(r.criado_em).toLocaleDateString('pt-BR') : ''}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>R$ {Number(r.preco_total || 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
              </div>
              </SwipeDelete>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

function PainelUsuarios({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [novoForm, setNovoForm] = useState({ nome: '', email: '', senha: '', papel: 'atendente', permissoes: [] });
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', papel: '', ativo: true, permissoes: [] });
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaAberto, setSenhaAberto] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setLoading(true);
    api.listarUsuarios(token).then(setUsuarios).catch(() => setUsuarios([])).finally(() => setLoading(false));
  };
  useEffect(() => { carregar(); }, [token]);

  const papelMap = {
    admin: { label: 'Admin', bg: 'rgba(123,31,162,0.1)', color: '#7b1fa2' },
    atendente: { label: 'Atendente', bg: 'rgba(21,101,192,0.1)', color: '#1565c0' },
  };
  const getPapel = (p) => papelMap[p] || { label: p, bg: 'var(--badge-bg)', color: 'var(--badge-text)' };

  const salvarNovo = async () => {
    if (!novoForm.nome || !novoForm.email || !novoForm.senha) return alert('Preencha todos os campos.');
    if (novoForm.senha.length < 6) return alert('Senha deve ter no mínimo 6 caracteres.');
    setSalvando(true);
    try {
      const novo = await api.criarUsuario(token, novoForm);
      setUsuarios(prev => [novo, ...prev]);
      setNovoAberto(false);
      setNovoForm({ nome: '', email: '', senha: '', papel: 'atendente', permissoes: [] });
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const abrirEditar = (u) => {
    setEditForm({ nome: u.nome, email: u.email, papel: u.papel, ativo: u.ativo, permissoes: u.permissoes || [] });
    setEditando(u);
    setDetalhe(null);
  };

  const salvarEdicao = async () => {
    setSalvando(true);
    try {
      const atualizado = await api.atualizarUsuario(token, editando.id, editForm);
      setUsuarios(prev => prev.map(u => u.id === editando.id ? atualizado : u));
      setDetalhe(atualizado);
      setEditando(null);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const salvarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) return alert('Senha deve ter no mínimo 6 caracteres.');
    setSalvando(true);
    try {
      await api.alterarSenhaUsuario(token, senhaAberto.id, novaSenha);
      setSenhaAberto(null);
      setNovaSenha('');
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const excluir = async (u) => {
    try {
      await api.deletarUsuario(token, u.id);
      setUsuarios(prev => prev.filter(x => x.id !== u.id));
      setDetalhe(null);
    } catch(e) { alert(e.message); }
  };

  // ── Modal Novo ──
  const modalNovo = novoAberto && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && setNovoAberto(false)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Novo Usuário</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOME</label>
            <input value={novoForm.nome} onChange={e => setNovoForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>EMAIL</label>
            <input type="email" value={novoForm.email} onChange={e => setNovoForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>SENHA</label>
            <input type="password" value={novoForm.senha} onChange={e => setNovoForm(f => ({ ...f, senha: e.target.value }))} placeholder="Mínimo 6 caracteres"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>PAPEL</label>
            <select value={novoForm.papel} onChange={e => setNovoForm(f => ({ ...f, papel: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }}>
              <option value="atendente">Atendente</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {novoForm.papel === 'atendente' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>PERMISSOES DE ACESSO</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TELAS_DISPONIVEIS.map(t => {
                  const ativo = (novoForm.permissoes || []).includes(t.key);
                  return (
                    <button key={t.key} type="button" onClick={() => setNovoForm(f => ({ ...f, permissoes: ativo ? (f.permissoes || []).filter(p => p !== t.key) : [...(f.permissoes || []), t.key] }))}
                      style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .2s',
                        background: ativo ? 'rgba(201,169,110,0.15)' : 'var(--filter-bg)', color: ativo ? '#c9a84c' : 'var(--text3)' }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Admin tem acesso total. Atendente acessa apenas as telas selecionadas.</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setNovoAberto(false)} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={salvarNovo} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Editar ──
  const modalEditar = editando && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && setEditando(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Editar Usuário</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOME</label>
            <input value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>EMAIL</label>
            <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>PAPEL</label>
              <select value={editForm.papel} onChange={e => setEditForm(f => ({ ...f, papel: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }}>
                <option value="atendente">Atendente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>STATUS</label>
              <select value={editForm.ativo ? 'true' : 'false'} onChange={e => setEditForm(f => ({ ...f, ativo: e.target.value === 'true' }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
          {editForm.papel === 'atendente' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>PERMISSOES DE ACESSO</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TELAS_DISPONIVEIS.map(t => {
                  const ativo = (editForm.permissoes || []).includes(t.key);
                  return (
                    <button key={t.key} type="button" onClick={() => setEditForm(f => ({ ...f, permissoes: ativo ? (f.permissoes || []).filter(p => p !== t.key) : [...(f.permissoes || []), t.key] }))}
                      style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .2s',
                        background: ativo ? 'rgba(201,169,110,0.15)' : 'var(--filter-bg)', color: ativo ? '#c9a84c' : 'var(--text3)' }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditando(null)} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Senha ──
  const modalSenha = senhaAberto && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && setSenhaAberto(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Alterar Senha</h3>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>{senhaAberto.nome} — {senhaAberto.email}</p>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 4 }}>NOVA SENHA</label>
          <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', background: 'var(--input-bg)', color: 'var(--input-text)' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setSenhaAberto(null); setNovaSenha(''); }} style={{ flex: 0.5, padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={salvarSenha} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Detalhe ──
  const modalDetalhe = detalhe && createPortal(
    <div className="admin-modal-overlay" style={{ zIndex: 9998 }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div className="admin-modal-sheet">
        <div className="admin-modal-handle" />

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#c9a84c', flexShrink: 0 }}>
            {detalhe.nome?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{detalhe.nome}</h3>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>{detalhe.email}</p>
          </div>
          {(() => { const p = getPapel(detalhe.papel); return (
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.bg, color: p.color, flexShrink: 0 }}>{p.label}</span>
          ); })()}
        </div>

        <div style={{ background: 'var(--filter-bg)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>Status</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: detalhe.ativo ? '#2e7d32' : '#c62828' }}>{detalhe.ativo ? 'Ativo' : 'Inativo'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text3)' }}>Criado em</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{detalhe.criado_em ? new Date(detalhe.criado_em).toLocaleDateString('pt-BR') : '—'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => excluir(detalhe)} style={{ padding: '12px', background: 'var(--danger-bg)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--danger-text)', fontWeight: 600 }}>Excluir</button>
          <button onClick={() => { setSenhaAberto(detalhe); setDetalhe(null); setNovaSenha(''); }} style={{ padding: '12px 16px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Alterar Senha</button>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: 'var(--filter-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text2)' }}>Fechar</button>
          <button onClick={() => abrirEditar(detalhe)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>Editar</button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div className="fade-in">

      {modalNovo}
      {modalEditar}
      {modalSenha}
      {modalDetalhe}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>Usuarios</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 6 }}>Gerencie acessos ao painel administrativo</p>
        </div>
        <button onClick={() => { setNovoAberto(true); setNovoForm({ nome: '', email: '', senha: '', papel: 'atendente', permissoes: [] }); }}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', boxShadow: '0 2px 8px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Novo Usuário
        </button>
      </div>

      <div className="admin-card-list">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 72, background: 'var(--bg3)', borderRadius: 12 }} />)}
        </div>
      ) : usuarios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text3)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8, opacity: 0.4 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>Nenhum usuário cadastrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {usuarios.map(u => {
            const p = getPapel(u.papel);
            return (
              <SwipeDelete key={u.id} onDelete={() => excluir(u)}>
                <div onClick={() => setDetalhe(u)} className="admin-card">

                  <div className="admin-card-avatar">
                    {u.nome?.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.nome}</p>
                      {!u.ativo && <span style={{ padding: '1px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600, background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>Inativo</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0' }}>{u.email}</p>
                  </div>

                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.bg, color: p.color, flexShrink: 0 }}>{p.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'var(--text3)', fontSize: 18 }}>›</div>
                </div>
              </SwipeDelete>
            );
          })}
        </div>
      )}
      </div>
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
