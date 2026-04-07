import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/index.jsx';
import { api } from '../services/api';
import SwipeDelete from '../components/SwipeDelete.jsx';

const FRAGRANTICA_BASE = 'https://www.fragrantica.com/notes/';

export function PainelNotas({ token: tokenProp }) {
  const { token: authToken } = useAuth();
  const token = tokenProp || authToken;
  const navigate = useNavigate();

  const [notas, setNotas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal adicionar
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nota_en: '', nota_ptb: '', fragrantica_id: '' });
  const [preview, setPreview] = useState('');
  const [importando, setImportando] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  // Detalhe / editar
  const [detalhe, setDetalhe] = useState(null);
  const [editForm, setEditForm] = useState({ nota_en: '', nota_ptb: '', fragrantica_id: '' });
  const [salvando, setSalvando] = useState(false);
  const [importandoImg, setImportandoImg] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);
  const [fixando, setFixando] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  const sentinelRef = useRef(null);

  useEffect(() => { if (!token) navigate('/admin/login', { state: { from: '/admin/notas' } }); }, [token]);

  // Marcar body como admin para CSS global
  useEffect(() => {
    document.body.setAttribute('data-admin', 'true');
    return () => document.body.removeAttribute('data-admin');
  }, []);

  const carregar = useCallback(async (p = 1, q = busca, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { notas: n, total: t } = await api.adminNotas(q, p);
      if (append) setNotas(prev => [...prev, ...n]);
      else setNotas(n);
      setTotal(t); setPagina(p);
    } catch(e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [busca]);

  useEffect(() => { carregar(1, busca); }, [busca]);

  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput), 350);
    return () => clearTimeout(t);
  }, [buscaInput]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore && notas.length < total) {
        carregar(pagina + 1, busca, true);
      }
    }, { rootMargin: '200px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [pagina, total, busca, loadingMore, notas.length]);

  // Preview imagem ao digitar ID
  useEffect(() => {
    setPreview(form.fragrantica_id ? `https://fimgs.net/mdimg/sastojci/t.${form.fragrantica_id}.jpg` : '');
  }, [form.fragrantica_id]);

  const importar = async () => {
    if (!form.nota_en || !form.fragrantica_id) return setMsg({ tipo: 'erro', texto: 'Preencha o nome e o ID.' });
    setImportando(true); setMsg({ tipo: '', texto: '' });
    try {
      await api.adminNotasImportar({ nota_en: form.nota_en, nota_ptb: form.nota_ptb || form.nota_en, fragrantica_id: form.fragrantica_id });
      setMsg({ tipo: 'ok', texto: `"${form.nota_en}" importada!` });
      setTimeout(() => { setModal(false); setForm({ nota_en: '', nota_ptb: '', fragrantica_id: '' }); setPreview(''); setMsg({ tipo: '', texto: '' }); carregar(1); }, 1200);
    } catch(e) { setMsg({ tipo: 'erro', texto: e.message || 'Erro ao importar.' }); }
    finally { setImportando(false); }
  };

  const salvarEdicao = async () => {
    if (!detalhe) return;
    setSalvando(true);
    try {
      const body = { nota_en: editForm.nota_en, nota_ptb: editForm.nota_ptb };
      const res = await api.adminNotasAtualizar(detalhe.id, body);
      setNotas(n => n.map(x => x.id === detalhe.id ? { ...x, nota_en: editForm.nota_en, nota_ptb: editForm.nota_ptb } : x));
      setDetalhe(null);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const importarImagem = async () => {
    if (!detalhe || !editForm.fragrantica_id) return alert('Preencha o ID do Fragrantica.');
    setImportandoImg(true);
    try {
      const res = await api.adminNotasAtualizar(detalhe.id, {
        nota_en: editForm.nota_en,
        nota_ptb: editForm.nota_ptb,
        fragrantica_id: editForm.fragrantica_id,
      });
      setNotas(n => n.map(x => x.id === detalhe.id ? { ...x, nota_en: editForm.nota_en, nota_ptb: editForm.nota_ptb, cloudinary_url: res.cloudinary_url || x.cloudinary_url } : x));
      setDetalhe(null);
      carregar(1, busca);
    } catch(e) { alert(e.message); }
    finally { setImportandoImg(false); }
  };

  const deletar = async () => {
    if (!detalhe || !confirm(`Deletar "${detalhe.nota_en}"?`)) return;
    await api.adminNotasDeletar(detalhe.id);
    setDetalhe(null);
    carregar(1, busca);
  };

  // ── Modal Adicionar (renderizado inline) ──
  const modalAdicionarJSX = modal && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setModal(false)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', animation: 'slideUp .25s ease', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>Adicionar Nota</h3>

        <div style={{ background: '#fffbf0', border: '1px solid #e8d840', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#8a6a10' }}>
          Acesse <a href={FRAGRANTICA_BASE} target="_blank" rel="noreferrer" style={{ color: '#8a6a10', fontWeight: 600 }}>fragrantica.com/notes</a> e copie o ID da URL.<br />
          Ex: .../notes/<b>Bergamot-75</b>.html → ID = <b>75</b>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>NOME EM INGLES *</label>
            <input value={form.nota_en} onChange={e => setForm(f => ({ ...f, nota_en: e.target.value }))} placeholder="Ex: Bergamot"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>NOME EM PORTUGUES</label>
            <input value={form.nota_ptb} onChange={e => setForm(f => ({ ...f, nota_ptb: e.target.value }))} placeholder="Ex: Bergamota"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>ID FRAGRANTICA *</label>
            <input value={form.fragrantica_id} onChange={e => setForm(f => ({ ...f, fragrantica_id: e.target.value.replace(/\D/g, '') }))} placeholder="Ex: 75" type="number"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', fontFamily: "'Inter', sans-serif" }} />
          </div>

          {preview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8f7f4', borderRadius: 8 }}>
              <img src={preview} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e8e4dc' }}
                onError={e => { e.target.style.display='none'; }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>Preview</p>
                <p style={{ fontSize: 11, color: '#999' }}>ID: {form.fragrantica_id}</p>
              </div>
            </div>
          )}

          {msg.texto && (
            <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 13,
              background: msg.tipo === 'ok' ? '#e8f5e9' : '#fce4ec',
              color: msg.tipo === 'ok' ? '#2e7d32' : '#c62828' }}>
              {msg.texto}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => setModal(false)} style={{ flex: 0.5, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666', fontFamily: "'Inter', sans-serif" }}>Cancelar</button>
          <button onClick={importar} disabled={importando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07', fontFamily: "'Inter', sans-serif", opacity: importando ? 0.7 : 1 }}>
            {importando ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  , document.body);

  // ── Modal Detalhe (renderizado inline) ──
  const editPreviewUrl = editForm.fragrantica_id ? `https://fimgs.net/mdimg/sastojci/t.${editForm.fragrantica_id}.jpg` : '';

  const modalDetalheJSX = detalhe && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setDetalhe(null)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', animation: 'slideUp .25s ease', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* Foto + status */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e8e4dc' }}>
            {detalhe.cloudinary_url
              ? <img src={detalhe.cloudinary_url} alt={detalhe.nota_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 32 }}>🌿</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>{detalhe.nota_ptb || detalhe.nota_en}</h3>
            <p style={{ fontSize: 13, color: '#888' }}>{detalhe.nota_en}</p>
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: detalhe.cloudinary_url ? '#e8f5e9' : '#fce4ec',
              color: detalhe.cloudinary_url ? '#2e7d32' : '#c62828' }}>
              {detalhe.cloudinary_url ? 'Com imagem' : 'Sem imagem'}
            </span>
          </div>
        </div>

        {/* Campos editaveis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>NOME EM INGLES</label>
            <input value={editForm.nota_en} onChange={e => setEditForm(f => ({ ...f, nota_en: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>NOME EM PORTUGUES</label>
            <input value={editForm.nota_ptb} onChange={e => setEditForm(f => ({ ...f, nota_ptb: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', fontFamily: "'Inter', sans-serif" }} />
          </div>
        </div>

        {/* Importar imagem */}
        <div style={{ background: '#f8f7f4', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>ID FRAGRANTICA (para importar/atualizar imagem)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={editForm.fragrantica_id} onChange={e => setEditForm(f => ({ ...f, fragrantica_id: e.target.value.replace(/\D/g, '') }))}
              placeholder="Ex: 75" type="number"
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111', fontFamily: "'Inter', sans-serif" }} />
            <button onClick={importarImagem} disabled={importandoImg || !editForm.fragrantica_id}
              style={{ padding: '10px 16px', background: editForm.fragrantica_id ? '#111' : '#ddd', border: 'none', borderRadius: 8, cursor: editForm.fragrantica_id ? 'pointer' : 'not-allowed',
                fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', opacity: importandoImg ? 0.7 : 1, fontFamily: "'Inter', sans-serif" }}>
              {importandoImg ? 'Salvando...' : 'Salvar Imagem'}
            </button>
          </div>
          {editPreviewUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <img src={editPreviewUrl} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e8e4dc' }}
                onError={e => { e.target.style.display='none'; }} />
              <span style={{ fontSize: 11, color: '#999' }}>Preview ID {editForm.fragrantica_id}</span>
            </div>
          )}
        </div>

        {detalhe.link_fragrantica && (
          <a href={detalhe.link_fragrantica} target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#c9a84c', marginBottom: 16 }}>
            Ver no Fragrantica →
          </a>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666', flex: 0.4 }}>Fechar</button>
          <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07', fontFamily: "'Inter', sans-serif" }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={deletar} style={{ padding: '12px 16px', background: '#fce4ec', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#c62828', fontFamily: "'Inter', sans-serif" }}>Excluir</button>
        </div>
      </div>
    </div>
  , document.body);

  const bottomTabs = [
    { key: 'pedidos', label: 'Pedidos', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg> },
    { key: 'perfumes', label: 'Perfumes', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M10 4h4v4h-4z"/><path d="M9 8V6a1 1 0 011-1h4a1 1 0 011 1v2"/><path d="M12 12v5"/></svg> },
    { key: 'estoque', label: 'Decants', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8l2 4v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6l2-4z"/><path d="M6 6h12"/><path d="M10 10v6"/><path d="M14 10v6"/></svg> },
    { key: 'whatsapp', label: 'Chat', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 70 }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {modalAdicionarJSX}
      {modalDetalheJSX}

      {/* Header */}
      <div style={{ padding: '1rem', paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', fontFamily: "'Inter', sans-serif" }}>Notas</h1>
            <span style={{ fontSize: 11, color: '#999', background: '#f0f0f0', padding: '2px 8px', borderRadius: 10 }}>{total}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={async () => {
              if (fixando) return;
              const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
              const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
              setFixando(true); setFixResult(null);
              try {
                // Iniciar processamento em background
                const resp = await fetch(`${BASE}/api/admin/notas/fix-images`, { method: 'POST', headers, body: '{}' });
                const text = await resp.text();
                let data;
                try { data = JSON.parse(text); } catch { throw new Error('Backend retornou resposta inválida. Verifique se o deploy foi concluído.'); }
                if (!resp.ok) throw new Error(data.erro || 'Erro no servidor');
                setFixResult({ running: true, verificadas: 0, total: 0, mensagem: data.mensagem || 'Processando...' });

                // Polling do status a cada 3 segundos
                const poll = setInterval(async () => {
                  try {
                    const r = await fetch(`${BASE}/api/admin/notas/fix-images`, { headers });
                    const status = await r.json();
                    setFixResult(status);
                    if (!status.running) {
                      clearInterval(poll);
                      setFixando(false);
                      if (status.corrigidas > 0) carregar(1, busca);
                    }
                  } catch(e) { clearInterval(poll); setFixando(false); }
                }, 3000);
              } catch(e) { setFixResult({ erro: e.message }); setFixando(false); }
            }} disabled={fixando}
              style={{ padding: '10px 14px', background: '#111', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: fixando ? 'not-allowed' : 'pointer', color: '#fff', opacity: fixando ? 0.7 : 1, fontFamily: "'Inter', sans-serif" }}>
              {fixando ? 'Verificando...' : 'Corrigir Imagens'}
            </button>
            <button onClick={() => setModal(true)}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07' }}>
              + Adicionar
            </button>
          </div>
        </div>

        {/* Resultado fix images */}
        {fixResult && (
          <div style={{ background: fixResult.erro ? '#fce4ec' : fixResult.running ? '#fff3e0' : '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
            {fixResult.erro ? (
              <span style={{ color: '#c62828' }}>Erro: {fixResult.erro}</span>
            ) : fixResult.running ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, border: '2px solid #e8e4dc', borderTop: '2px solid #e65100', borderRadius: '50%', animation: 'spin .6s linear infinite', flexShrink: 0 }} />
                <span style={{ color: '#e65100', fontWeight: 600 }}>
                  Verificando... {fixResult.verificadas || 0}/{fixResult.total || '?'} — {fixResult.corrigidas || 0} corrigidas
                </span>
              </div>
            ) : (
              <div>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>
                  Concluído! {fixResult.corrigidas || 0} corrigidas de {fixResult.quebradas || 0} quebradas ({fixResult.verificadas || 0} verificadas)
                </span>
                {fixResult.erros?.length > 0 && (
                  <details style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                    <summary style={{ cursor: 'pointer' }}>{fixResult.erros.length} erros</summary>
                    {fixResult.erros.map((e, i) => <p key={i}>{e.nota}: {e.erro}</p>)}
                  </details>
                )}
                <button onClick={() => setFixResult(null)} style={{ marginTop: 6, background: 'none', border: 'none', fontSize: 12, color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>Fechar</button>
              </div>
            )}
          </div>
        )}

        {/* Busca */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 15 }}>&#128269;</span>
          <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)} placeholder="Buscar..."
            style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 1rem 2rem' }}>
        <div style={{ background: '#f5f5f3', borderRadius: 14, padding: 12, margin: '0 -4px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 64, background: '#eee', borderRadius: 12 }} />)}
            </div>
          ) : notas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🌿</p>
              <p>Nenhuma nota encontrada</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notas.map(nota => (
                <SwipeDelete key={nota.id} onDelete={async () => {
                  await api.adminNotasDeletar(nota.id);
                  setNotas(n => n.filter(x => x.id !== nota.id));
                  setTotal(t => t - 1);
                }}>
                  <div onClick={() => { setDetalhe(nota); setEditForm({ nota_en: nota.nota_en || '', nota_ptb: nota.nota_ptb || '', fragrantica_id: '' }); }}
                    style={{ display: 'flex', gap: 14, padding: 14, background: '#fff', borderRadius: 12, border: '1px solid #eee',
                      cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', alignItems: 'center' }}>

                    {/* Foto */}
                    <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                      {nota.cloudinary_url
                        ? <img src={nota.cloudinary_url} alt={nota.nota_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 22 }}>🌿</span>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nota.nota_ptb || nota.nota_en}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>{nota.nota_en}</p>
                    </div>

                    {/* Status */}
                    <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: nota.cloudinary_url ? '#2e7d32' : '#ccc' }} />

                    <div style={{ flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
                  </div>
                </SwipeDelete>
              ))}
            </div>
          )}
        </div>

        {/* Infinite scroll sentinel */}
        {notas.length < total && (
          <div ref={sentinelRef} style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
            {loadingMore && <div style={{ width: 24, height: 24, border: '2px solid #e8e4dc', borderTop: '2px solid #c9a84c', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />}
          </div>
        )}
        {notas.length > 0 && notas.length >= total && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', padding: '1rem 0' }}>{total} notas carregadas</p>
        )}
      </div>

      {/* Menu Mais popup */}
      {maisAberto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9997 }} onClick={() => setMaisAberto(false)}>
          <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 340,
            background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', padding: 8, animation: 'slideUp .2s ease' }}
            onClick={e => e.stopPropagation()}>
            {[
              { label: 'Cadastrar Produto', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>, onClick: () => { setMaisAberto(false); navigate('/admin/produtos'); }},
              { label: 'Notas Olfativas', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4 0-8-2-8-6 0-6 8-14 8-14s8 8 8 14c0 4-4 6-8 6z"/></svg>, onClick: () => { setMaisAberto(false); navigate('/admin/notas'); }},
              { label: 'Ver Loja', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>, onClick: () => { setMaisAberto(false); navigate('/'); }},
            ].map((op, i) => (
              <button key={i} onClick={op.onClick}
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#333', borderRadius: 8, fontFamily: "'Inter', sans-serif" }}>
                <span style={{ color: '#c9a84c' }}>{op.icon}</span>
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999, background: '#fff', borderTop: '1px solid #e8e4dc',
        padding: '6px 0 max(6px, env(safe-area-inset-bottom))', justifyContent: 'space-around', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        {bottomTabs.map(tab => (
          <button key={tab.key} onClick={() => navigate('/admin', { state: { aba: tab.key } })}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 12px', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, color: '#999', WebkitTapHighlightColor: 'transparent' }}>
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
        <button onClick={() => setMaisAberto(v => !v)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 12px', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: maisAberto ? 700 : 500, color: maisAberto ? '#111' : '#999', WebkitTapHighlightColor: 'transparent' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={maisAberto ? '#c9a84c' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span>Mais</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminNotas() { return <PainelNotas />; }
