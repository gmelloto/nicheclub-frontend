import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/index.jsx';
import { api } from '../services/api';

const S = {
  bg: '#ffffff', bg2: '#f8f7f4', border: '#e8e4dc',
  text: '#0d0b07', text2: '#5a5550', text3: '#9a9080',
  gold: '#8a6a10', goldLight: '#c9a84c',
};

const FRAGRANTICA_BASE = 'https://www.fragrantica.com/notes/';

export default function AdminNotas() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [notas, setNotas]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [pagina, setPagina]         = useState(1);
  const [busca, setBusca]           = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [loading, setLoading]       = useState(false);

  // Modal adicionar
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState({ nota_en: '', nota_ptb: '', fragrantica_id: '' });
  const [preview, setPreview]       = useState('');
  const [importando, setImportando] = useState(false);
  const [msg, setMsg]               = useState({ tipo: '', texto: '' });

  // Editar traducao
  const [editando, setEditando]     = useState(null);
  const [editPtb, setEditPtb]       = useState('');

  useEffect(() => { if (!token) navigate('/admin/login', { state: { from: '/admin/notas' } }); }, [token]);

  const carregar = useCallback(async (p = 1, q = busca) => {
    setLoading(true);
    try {
      const { notas: n, total: t } = await api.adminNotas(q, p);
      setNotas(n); setTotal(t); setPagina(p);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [busca]);

  useEffect(() => { carregar(1, busca); }, [busca]);

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput), 350);
    return () => clearTimeout(t);
  }, [buscaInput]);

  // Preview imagem ao digitar ID
  useEffect(() => {
    if (form.fragrantica_id) {
      setPreview(`https://fimgs.net/mdimg/sastojci/t.${form.fragrantica_id}.jpg`);
    } else {
      setPreview('');
    }
  }, [form.fragrantica_id]);

  const importar = async () => {
    if (!form.nota_en || !form.fragrantica_id) return setMsg({ tipo: 'erro', texto: 'Preencha o nome e o ID do Fragrantica.' });
    setImportando(true); setMsg({ tipo: '', texto: '' });
    try {
      await api.adminNotasImportar({ nota_en: form.nota_en, nota_ptb: form.nota_ptb || form.nota_en, fragrantica_id: form.fragrantica_id });
      setMsg({ tipo: 'ok', texto: `Nota "${form.nota_en}" importada com sucesso!` });
      setTimeout(() => { setModal(false); setForm({ nota_en: '', nota_ptb: '', fragrantica_id: '' }); setPreview(''); setMsg({ tipo: '', texto: '' }); carregar(1); }, 1500);
    } catch(e) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao importar.' });
    } finally { setImportando(false); }
  };

  const salvarEdicao = async (id) => {
    await api.adminNotasAtualizar(id, { nota_ptb: editPtb });
    setNotas(n => n.map(x => x.id === id ? { ...x, nota_ptb: editPtb } : x));
    setEditando(null);
  };

  const deletar = async (id, nome) => {
    if (!confirm(`Deletar "${nome}"?`)) return;
    await api.adminNotasDeletar(id);
    carregar(pagina);
  };

  const totalPags = Math.ceil(total / 20);

  return (
    <div style={{ minHeight: '100vh', background: S.bg }}>

      {/* Header */}
      <div style={{ background: '#0d0b07', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '0 1rem', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '8px 0' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,224,0.5)', fontSize: 13 }}>&#8592; Admin</button>
          <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: 15, letterSpacing: '0.05em' }}>Notas Olfativas</span>
          <span style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{total} notas</span>
        </div>
        <button onClick={() => setModal(true)}
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', letterSpacing: '0.08em', marginBottom: 8 }}>
          + Adicionar Nota
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Busca */}
        <input value={buscaInput} onChange={e => setBuscaInput(e.target.value)}
          placeholder="Buscar por nome (EN ou PT)..."
          style={{ width: '100%', padding: '10px 16px', background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 14, color: S.text, outline: 'none', boxSizing: 'border-box', marginBottom: '1.5rem' }}
        />

        {/* Tabela */}
        <div style={{ border: `1px solid ${S.border}`, borderRadius: 8, overflow: 'hidden', overflowX: 'auto' }}>
          {/* Header tabela */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 1fr 80px', background: '#0d0b07', padding: '10px 16px', gap: 12, minWidth: 540 }}>
            {['Foto', 'Nome EN', 'Nome PT', 'Cloudinary', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: S.text3 }}>Carregando...</div>
          ) : notas.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: S.text3 }}>Nenhuma nota encontrada.</div>
          ) : notas.map((nota, i) => (
            <div key={nota.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 1fr 80px', padding: '10px 16px', gap: 12, alignItems: 'center', background: i % 2 === 0 ? '#fff' : S.bg2, borderTop: `1px solid ${S.border}`, minWidth: 540 }}>

              {/* Foto */}
              <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', border: `1px solid ${S.border}`, background: S.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {nota.cloudinary_url
                  ? <img src={nota.cloudinary_url} alt={nota.nota_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                  : <span style={{ fontSize: 16 }}>&#127807;</span>
                }
              </div>

              {/* Nome EN */}
              <span style={{ fontSize: 13, color: S.text, fontWeight: 500 }}>{nota.nota_en}</span>

              {/* Nome PT — editavel */}
              {editando === nota.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input value={editPtb} onChange={e => setEditPtb(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') salvarEdicao(nota.id); if (e.key === 'Escape') setEditando(null); }}
                    style={{ flex: 1, padding: '4px 8px', border: `1px solid ${S.goldLight}`, borderRadius: 3, fontSize: 12, outline: 'none', color: S.text }} />
                  <button onClick={() => salvarEdicao(nota.id)} style={{ padding: '4px 8px', background: S.goldLight, border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#0d0b07' }}>OK</button>
                  <button onClick={() => setEditando(null)} style={{ padding: '4px 6px', background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 3, cursor: 'pointer', fontSize: 11, color: S.text3 }}>X</button>
                </div>
              ) : (
                <span onClick={() => { setEditando(nota.id); setEditPtb(nota.nota_ptb || nota.nota_en); }}
                  title="Clique para editar"
                  style={{ fontSize: 13, color: nota.nota_ptb !== nota.nota_en ? S.text : S.text3, cursor: 'pointer', borderBottom: `1px dashed ${S.border}` }}>
                  {nota.nota_ptb || '—'}
                </span>
              )}

              {/* URL Cloudinary */}
              <span style={{ fontSize: 11, color: nota.cloudinary_url ? '#2a7a2a' : '#c0392b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nota.cloudinary_url ? '&#10003; OK' : '&#10007; Sem imagem'}
              </span>

              {/* Acoes */}
              <div style={{ display: 'flex', gap: 4 }}>
                {nota.link_fragrantica && (
                  <a href={nota.link_fragrantica} target="_blank" rel="noreferrer"
                    style={{ padding: '4px 6px', background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 3, fontSize: 11, color: S.gold, textDecoration: 'none' }}
                    title="Ver no Fragrantica">&#128279;</a>
                )}
                <button onClick={() => deletar(nota.id, nota.nota_en)}
                  style={{ padding: '4px 6px', background: '#fff0f0', border: '1px solid #f0b0b0', borderRadius: 3, cursor: 'pointer', fontSize: 11, color: '#c0392b' }}
                  title="Deletar">&#128465;</button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginacao */}
        {totalPags > 1 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => carregar(pagina - 1)} disabled={pagina === 1}
              style={{ padding: '6px 12px', background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 4, cursor: pagina === 1 ? 'not-allowed' : 'pointer', opacity: pagina === 1 ? 0.4 : 1, fontSize: 13 }}>
              &#8592;
            </button>
            {Array.from({ length: Math.min(5, totalPags) }, (_, i) => {
              const p = Math.max(1, Math.min(pagina - 2, totalPags - 4)) + i;
              return (
                <button key={p} onClick={() => carregar(p)}
                  style={{ padding: '6px 12px', background: p === pagina ? S.goldLight : S.bg2, border: `1px solid ${p === pagina ? S.goldLight : S.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: p === pagina ? 700 : 400, color: p === pagina ? '#0d0b07' : S.text }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => carregar(pagina + 1)} disabled={pagina === totalPags}
              style={{ padding: '6px 12px', background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 4, cursor: pagina === totalPags ? 'not-allowed' : 'pointer', opacity: pagina === totalPags ? 0.4 : 1, fontSize: 13 }}>
              &#8594;
            </button>
          </div>
        )}
      </div>

      {/* Modal Adicionar */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '2rem', width: 480, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: S.text }}>Adicionar Nota Olfativa</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: S.text3 }}>&#10005;</button>
            </div>

            {/* Instrucao */}
            <div style={{ background: '#fffbf0', border: '1px solid #e8d840', borderRadius: 4, padding: '10px 12px', marginBottom: '1rem', fontSize: 12, color: '#8a6a10' }}>
              Acesse <a href={FRAGRANTICA_BASE} target="_blank" rel="noreferrer" style={{ color: S.gold, fontWeight: 600 }}>fragrantica.com/notes</a>, encontre a nota e copie o ID da URL.<br />
              Ex: fragrantica.com/notes/<strong>Bergamot-75</strong>.html → ID = <strong>75</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.text3, marginBottom: 4 }}>Nome em Inglês *</label>
                <input value={form.nota_en} onChange={e => setForm(f => ({ ...f, nota_en: e.target.value }))}
                  placeholder="Ex: Bergamot"
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, color: S.text, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.text3, marginBottom: 4 }}>Nome em Português</label>
                <input value={form.nota_ptb} onChange={e => setForm(f => ({ ...f, nota_ptb: e.target.value }))}
                  placeholder="Ex: Bergamota (deixe vazio para usar EN)"
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, color: S.text, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: S.text3, marginBottom: 4 }}>ID do Fragrantica *</label>
                <input value={form.fragrantica_id} onChange={e => setForm(f => ({ ...f, fragrantica_id: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Ex: 75"
                  type="number"
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, color: S.text, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Preview da imagem */}
              {preview && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: S.bg2, borderRadius: 4, border: `1px solid ${S.border}` }}>
                  <img src={preview} alt="preview"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: `1px solid ${S.border}` }}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                  <span style={{ display: 'none', fontSize: 11, color: '#c0392b' }}>Imagem nao encontrada. Verifique o ID.</span>
                  <div>
                    <p style={{ fontSize: 12, color: S.text, fontWeight: 600 }}>Preview da imagem</p>
                    <p style={{ fontSize: 11, color: S.text3 }}>fimgs.net/mdimg/sastojci/t.{form.fragrantica_id}.jpg</p>
                  </div>
                </div>
              )}

              {msg.texto && (
                <div style={{ padding: '10px 12px', borderRadius: 4, fontSize: 13,
                  background: msg.tipo === 'ok' ? '#f0faf0' : '#fff0f0',
                  color: msg.tipo === 'ok' ? '#2a7a2a' : '#c0392b',
                  border: `1px solid ${msg.tipo === 'ok' ? '#b0e0b0' : '#f0b0b0'}` }}>
                  {msg.texto}
                </div>
              )}

              <button onClick={importar} disabled={importando}
                style={{ padding: '12px', background: importando ? S.bg2 : 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: importando ? 'not-allowed' : 'pointer', color: importando ? S.text3 : '#0d0b07', letterSpacing: '0.08em', opacity: importando ? 0.7 : 1 }}>
                {importando ? 'Importando...' : 'Importar do Fragrantica'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
