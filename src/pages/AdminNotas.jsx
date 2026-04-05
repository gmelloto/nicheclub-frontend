import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/index.jsx';
import { api } from '../services/api';

const FRAGRANTICA_BASE = 'https://www.fragrantica.com/notes/';

export default function AdminNotas() {
  const { token } = useAuth();
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
  const [editPtb, setEditPtb] = useState('');
  const [salvando, setSalvando] = useState(false);

  const sentinelRef = useRef(null);

  useEffect(() => { if (!token) navigate('/admin/login', { state: { from: '/admin/notas' } }); }, [token]);

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
      await api.adminNotasAtualizar(detalhe.id, { nota_ptb: editPtb });
      setNotas(n => n.map(x => x.id === detalhe.id ? { ...x, nota_ptb: editPtb } : x));
      setDetalhe(null);
    } catch(e) { alert(e.message); }
    finally { setSalvando(false); }
  };

  const deletar = async () => {
    if (!detalhe || !confirm(`Deletar "${detalhe.nota_en}"?`)) return;
    await api.adminNotasDeletar(detalhe.id);
    setDetalhe(null);
    carregar(1, busca);
  };

  // ── Modal Adicionar ──
  const ModalAdicionar = () => modal && createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setModal(false)}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', padding: '1.25rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', animation: 'slideUp .25s ease' }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12 }}>Adicionar Nota</h3>

        <div style={{ background: '#fffbf0', border: '1px solid #e8d840', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#8a6a10' }}>
          Acesse <a href={FRAGRANTICA_BASE} target="_blank" rel="noreferrer" style={{ color: '#8a6a10', fontWeight: 600 }}>fragrantica.com/notes</a> e copie o ID da URL.<br />
          Ex: .../notes/<b>Bergamot-75</b>.html → ID = <b>75</b>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>NOME EM INGLES *</label>
            <input value={form.nota_en} onChange={e => setForm(f => ({ ...f, nota_en: e.target.value }))} placeholder="Ex: Bergamot"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>NOME EM PORTUGUES</label>
            <input value={form.nota_ptb} onChange={e => setForm(f => ({ ...f, nota_ptb: e.target.value }))} placeholder="Ex: Bergamota"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>ID FRAGRANTICA *</label>
            <input value={form.fragrantica_id} onChange={e => setForm(f => ({ ...f, fragrantica_id: e.target.value.replace(/\D/g, '') }))} placeholder="Ex: 75" type="number"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
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
          <button onClick={() => setModal(false)} style={{ flex: 0.5, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666' }}>Cancelar</button>
          <button onClick={importar} disabled={importando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07', opacity: importando ? 0.7 : 1 }}>
            {importando ? 'Importando...' : 'Importar'}
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

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 12, overflow: 'hidden', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e8e4dc' }}>
            {detalhe.cloudinary_url
              ? <img src={detalhe.cloudinary_url} alt={detalhe.nota_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 32 }}>🌿</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 2 }}>{detalhe.nota_en}</h3>
            <p style={{ fontSize: 14, color: '#888' }}>{detalhe.nota_ptb || '—'}</p>
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: detalhe.cloudinary_url ? '#e8f5e9' : '#fce4ec',
              color: detalhe.cloudinary_url ? '#2e7d32' : '#c62828' }}>
              {detalhe.cloudinary_url ? 'Com imagem' : 'Sem imagem'}
            </span>
          </div>
        </div>

        {/* Editar traducao */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4 }}>NOME EM PORTUGUES</label>
          <input value={editPtb} onChange={e => setEditPtb(e.target.value)} placeholder="Traducao em portugues"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {detalhe.link_fragrantica && (
          <a href={detalhe.link_fragrantica} target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#c9a84c', marginBottom: 16 }}>
            Ver no Fragrantica →
          </a>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDetalhe(null)} style={{ padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#666', flex: 0.4 }}>Fechar</button>
          <button onClick={salvarEdicao} disabled={salvando} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0d0b07' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={deletar} style={{ padding: '12px 16px', background: '#fce4ec', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#c62828' }}>Excluir</button>
        </div>
      </div>
    </div>
  , document.body);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <ModalAdicionar />
      <ModalDetalhe />

      {/* Header */}
      <div style={{ padding: '1rem', paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 13 }}>← Admin</button>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', fontFamily: "'Inter', sans-serif" }}>Notas</h1>
            <span style={{ fontSize: 11, color: '#999', background: '#f0f0f0', padding: '2px 8px', borderRadius: 10 }}>{total}</span>
          </div>
          <button onClick={() => setModal(true)}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07' }}>
            + Adicionar
          </button>
        </div>

        {/* Busca */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 15 }}>🔍</span>
          <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)} placeholder="Buscar nota..."
            style={{ width: '100%', padding: '12px 16px 12px 42px', border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 1rem 2rem' }}>
        <div style={{ background: '#f5f5f3', borderRadius: 14, padding: 12 }}>
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
                <div key={nota.id} onClick={() => { setDetalhe(nota); setEditPtb(nota.nota_ptb || nota.nota_en); }}
                  style={{ display: 'flex', gap: 12, padding: 12, background: '#fff', borderRadius: 12, border: '1px solid #eee',
                    cursor: 'pointer', transition: 'all .15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', alignItems: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; }}>

                  {/* Foto */}
                  <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e8e4dc' }}>
                    {nota.cloudinary_url
                      ? <img src={nota.cloudinary_url} alt={nota.nota_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 20 }}>🌿</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nota.nota_en}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>{nota.nota_ptb && nota.nota_ptb !== nota.nota_en ? nota.nota_ptb : '—'}</p>
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: nota.cloudinary_url ? '#2e7d32' : '#ccc' }} />

                  <div style={{ flexShrink: 0, color: '#ccc', fontSize: 18 }}>›</div>
                </div>
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
    </div>
  );
}
