import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/index.jsx';
import { api } from '../services/api';

const TAMANHOS = [
  { key: 'apc', label: 'APC', ml: 50 },
  { key: '3ml', label: '3ml', ml: 3 },
  { key: '5ml', label: '5ml', ml: 5 },
  { key: '10ml', label: '10ml', ml: 10 },
  { key: '15ml', label: '15ml', ml: 15 },
];

const S = {
  bg: '#ffffff', bg2: '#f8f7f4', border: '#e8e4dc',
  text: '#0d0b07', text2: '#5a5550', text3: '#9a9080',
  gold: '#8a6a10', goldLight: '#c9a84c',
};

const Label = ({ children }) => (
  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.text3, marginBottom: 6 }}>{children}</p>
);

const Input = ({ style, ...props }) => (
  <input style={{ width: '100%', padding: '10px 12px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, color: S.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', ...style }} {...props} />
);

export default function AdminProdutos() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Step: 'marca' | 'perfume' | 'form'
  const [step, setStep] = useState('marca');

  // Marca
  const [marcaInput, setMarcaInput] = useState('');
  const [marcaSugestoes, setMarcaSugestoes] = useState([]);
  const [marcaSel, setMarcaSel] = useState('');

  // Perfume
  const [perfumeInput, setPerfumeInput] = useState('');
  const [perfumeSugestoes, setPerfumeSugestoes] = useState([]);
  const [perfumeSel, setPerfumeSel] = useState(null);

  // Formulario
  const [form, setForm] = useState({ nome: '', marca: '', ano: '', genero: '', pais: '', foto_url: '', url_fragrantica: '', rating_valor: '', ml_inicial: '' });
  const [precos, setPrecos] = useState(TAMANHOS.map(t => ({ ...t, preco: '' })));
  const [fotoPreview, setFotoPreview] = useState('');
  const [uploadando, setUploadando] = useState(false);
  const [buscandoFrag, setBuscandoFrag] = useState(false);
  const [linkFrag, setLinkFrag] = useState('');
  const [buscandoLink, setBuscandoLink] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const fileRef = useRef();

  useEffect(() => { if (!token) navigate('/admin/login', { state: { from: '/admin/produtos' } }); }, [token]);

  // Busca marcas
  useEffect(() => {
    if (!marcaInput || marcaInput === marcaSel) { setMarcaSugestoes([]); return; }
    const t = setTimeout(() => {
      api.adminMarcas(marcaInput).then(setMarcaSugestoes).catch(() => {});
    }, 250);
  const preencherPeloLink = async () => {
    if (!linkFrag || !linkFrag.includes('fragrantica.com/perfume/')) {
      setMsg({ tipo: 'erro', texto: 'Informe um link valido do Fragrantica.' });
      return;
    }
    setBuscandoLink(true);
    setMsg({ tipo: '', texto: '' });
    try {
      const d = await api.scrapeFragrantica(linkFrag);
      if (d.encontrado) {
        setForm(prev => ({
          ...prev,
          nome: d.nome || prev.nome,
          marca: d.marca || prev.marca,
          ano: d.ano || prev.ano,
          genero: d.genero === 'Feminino' ? 'women' : d.genero === 'Masculino' ? 'men' : d.genero === 'Unissex' ? 'unisex' : prev.genero,
          foto_url: d.foto_url || prev.foto_url,
          url_fragrantica: linkFrag,
          rating_valor: d.rating_valor || prev.rating_valor,
        }));
        if (d.foto_url) setFotoPreview(d.foto_url);
        setMsg({ tipo: 'ok', texto: 'Dados preenchidos com sucesso!' });
      } else {
        setMsg({ tipo: 'aviso', texto: 'Nao foi possivel extrair os dados. Preencha manualmente.' });
      }
    } catch(e) {
      setMsg({ tipo: 'erro', texto: 'Erro ao buscar dados do Fragrantica.' });
    } finally {
      setBuscandoLink(false);
    }
  };

  return () => clearTimeout(t);
  }, [marcaInput]);

  // Busca perfumes
  useEffect(() => {
    if (!marcaSel || !perfumeInput) { setPerfumeSugestoes([]); return; }
    const t = setTimeout(() => {
      api.adminBuscaPerfume(marcaSel, perfumeInput).then(setPerfumeSugestoes).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [perfumeInput, marcaSel]);

  const selecionarMarca = (m) => {
    setMarcaSel(m); setMarcaInput(m); setMarcaSugestoes([]);
    setStep('perfume'); setPerfumeInput(''); setPerfumeSel(null);
  };

  const selecionarPerfume = (p) => {
    setPerfumeSel(p); setPerfumeInput(p.nome); setPerfumeSugestoes([]);
    setForm({ nome: p.nome, marca: p.marca, ano: p.ano || '', genero: p.genero || '', pais: p.pais || '', foto_url: p.foto_url || '', url_fragrantica: '', rating_valor: '', ml_inicial: '' });
    setFotoPreview(p.foto_url || '');
    setStep('form');
  };

  const buscarNovo = async () => {
    if (!marcaSel || !perfumeInput) return;
    setBuscandoFrag(true); setMsg({ tipo: '', texto: '' });
    try {
      const d = await api.adminFragrantica(marcaSel, perfumeInput);
      if (d.encontrado) {
        setForm({ nome: d.nome || perfumeInput, marca: marcaSel, ano: d.ano || '', genero: '', pais: '', foto_url: d.foto_url || '', url_fragrantica: d.url_fragrantica || '', rating_valor: d.rating_valor || '', ml_inicial: '' });
        setFotoPreview(d.foto_url || '');
        setMsg({ tipo: 'ok', texto: 'Dados encontrados no Fragrantica!' });
      } else {
        setForm({ nome: perfumeInput, marca: marcaSel, ano: '', genero: '', pais: '', foto_url: '', url_fragrantica: '', rating_valor: '', ml_inicial: '' });
        setMsg({ tipo: 'aviso', texto: 'Nao encontrado no Fragrantica. Preencha manualmente.' });
      }
      setStep('form');
    } catch(e) {
      setMsg({ tipo: 'erro', texto: 'Erro ao buscar no Fragrantica.' });
      setStep('form');
    } finally {
      setBuscandoFrag(false);
    }
  };

  const uploadFoto = async (file) => {
    setUploadando(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        setFotoPreview(base64);
        // Upload para Cloudinary via backend
        const res = await api.adminUploadFoto({ url_foto: base64, perfume_id: perfumeSel?.id });
        setForm(f => ({ ...f, foto_url: res.url }));
        setFotoPreview(res.url);
        setUploadando(false);
      };
      reader.readAsDataURL(file);
    } catch(e) {
      setMsg({ tipo: 'erro', texto: 'Erro ao fazer upload da foto.' });
      setUploadando(false);
    }
  };

  const salvar = async () => {
    if (!form.nome || !form.marca) return setMsg({ tipo: 'erro', texto: 'Nome e marca sao obrigatorios.' });
    setSalvando(true); setMsg({ tipo: '', texto: '' });
    try {
      const res = await api.adminCadastrarPerfume({
        ...form,
        precos: precos.filter(p => p.preco),
        ml_inicial: form.ml_inicial ? Number(form.ml_inicial) : null,
      });
      setMsg({ tipo: 'ok', texto: `Perfume cadastrado com sucesso!` });
      setTimeout(() => {
        setStep('marca'); setMarcaInput(''); setMarcaSel(''); setPerfumeInput(''); setPerfumeSel(null);
        setForm({ nome: '', marca: '', ano: '', genero: '', pais: '', foto_url: '', url_fragrantica: '', rating_valor: '', ml_inicial: '' });
        setPrecos(TAMANHOS.map(t => ({ ...t, preco: '' }))); setFotoPreview(''); setMsg({ tipo: '', texto: '' });
      }, 2000);
    } catch(e) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao salvar.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.text3, fontSize: 13 }}>&#8592; Admin</button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: S.text }}>Cadastrar Produto</h1>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
          {[['marca', '1. Marca'], ['perfume', '2. Perfume'], ['form', '3. Dados']].map(([s, label]) => (
            <div key={s} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: step === s ? S.goldLight : S.bg2,
              color: step === s ? '#0d0b07' : S.text3,
              border: `1px solid ${step === s ? S.goldLight : S.border}` }}>
              {label}
            </div>
          ))}
        </div>

        {/* STEP 1: Marca */}
        {(step === 'marca' || step === 'perfume') && (
          <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' }}>
            <Label>Marca</Label>
            <div style={{ position: 'relative' }}>
              <Input
                value={marcaInput}
                onChange={e => { setMarcaInput(e.target.value); setMarcaSel(''); }}
                placeholder="Ex: Maison Francis Kurkdjian"
                onKeyDown={e => e.key === 'Enter' && marcaInput && selecionarMarca(marcaInput)}
              />
              {marcaSugestoes.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {marcaSugestoes.map(m => (
                    <button key={m} onClick={() => selecionarMarca(m)}
                      style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: S.text, borderBottom: `1px solid ${S.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = S.bg2}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >{m}</button>
                  ))}
                </div>
              )}
            </div>
            {marcaSel && <p style={{ fontSize: 12, color: S.gold, marginTop: 6 }}>&#10003; {marcaSel} selecionada</p>}
          </div>
        )}

        {/* STEP 2: Perfume */}
        {step === 'perfume' && (
          <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' }}>
            <Label>Nome do Perfume</Label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Input
                value={perfumeInput}
                onChange={e => { setPerfumeInput(e.target.value); setPerfumeSel(null); }}
                placeholder="Ex: Baccarat Rouge 540"
                autoFocus
              />
              {perfumeSugestoes.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {perfumeSugestoes.map(p => (
                    <button key={p.id} onClick={() => selecionarPerfume(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${S.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = S.bg2}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {p.foto_url && <img src={p.foto_url} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, border: `1px solid ${S.border}` }} />}
                      <div>
                        <p style={{ fontSize: 13, color: S.text, fontWeight: 500 }}>{p.nome}</p>
                        <p style={{ fontSize: 11, color: S.text3 }}>{p.marca} {p.ano ? `· ${p.ano}` : ''}</p>
                      </div>
                    </button>
                  ))}
                  <button onClick={buscarNovo}
                    style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: S.gold, fontStyle: 'italic' }}>
                    Nao encontrei — buscar no Fragrantica
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={buscarNovo} disabled={!perfumeInput || buscandoFrag}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#0d0b07', opacity: buscandoFrag ? 0.7 : 1 }}>
                {buscandoFrag ? 'Buscando...' : '🔍 Buscar no Fragrantica'}
              </button>
              {perfumeInput && (
                <button onClick={() => { setForm(f => ({ ...f, nome: perfumeInput, marca: marcaSel })); setStep('form'); }}
                  style={{ padding: '10px 16px', background: S.bg, border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2 }}>
                  Preencher manualmente
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Formulario */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Foto */}
            <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
              <Label>Foto do Produto</Label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Preview */}
                <div style={{ width: 120, height: 120, border: `2px dashed ${S.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', background: '#fff' }}
                  onClick={() => fileRef.current?.click()} style2={{ cursor: 'pointer' }}>
                  {fotoPreview
                    ? <img src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 32, color: S.text3 }}>&#128247;</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <button onClick={() => fileRef.current?.click()} disabled={uploadando}
                    style={{ display: 'block', width: '100%', padding: '10px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2, marginBottom: 8 }}>
                    {uploadando ? 'Enviando...' : '&#128190; Escolher arquivo'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFoto(e.target.files[0])} />
                  <Label>Ou cole uma URL</Label>
                  <Input value={form.foto_url} onChange={e => { setForm(f => ({ ...f, foto_url: e.target.value })); setFotoPreview(e.target.value); }}
                    placeholder="https://..." style={{ fontSize: 12 }} />
                </div>
              </div>
            </div>

            {/* Link Fragrantica */}
            <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
              <Label>Preencher pelo Link do Fragrantica</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={linkFrag}
                  onChange={e => setLinkFrag(e.target.value)}
                  placeholder="https://www.fragrantica.com/perfume/..."
                  style={{ flex: 1 }}
                />
                <button
                  onClick={preencherPeloLink}
                  disabled={buscandoLink || !linkFrag}
                  style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#0d0b07', opacity: buscandoLink ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                  {buscandoLink ? 'Buscando...' : '⚡ Auto-preencher'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: S.text3, marginTop: 6 }}>Cole o link do Fragrantica e clique em Auto-preencher para preencher os dados automaticamente.</p>
            </div>

            {/* Dados basicos */}
            <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
              <Label>Dados Basicos</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do perfume" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Label>Marca *</Label>
                  <Input value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} placeholder="Marca" />
                </div>
                <div>
                  <Label>Ano</Label>
                  <Input value={form.ano} onChange={e => setForm(f => ({ ...f, ano: e.target.value }))} placeholder="2020" type="number" />
                </div>
                <div>
                  <Label>Genero</Label>
                  <select value={form.genero} onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, color: S.text, fontSize: 13, outline: 'none' }}>
                    <option value="">Selecione</option>
                    <option value="unisex">Unissex</option>
                    <option value="women">Feminino</option>
                    <option value="men">Masculino</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Label>Pais de Origem</Label>
                  <Input value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} placeholder="Ex: Franca" />
                </div>
                <div>
                  <Label>ML do Frasco</Label>
                  <Input value={form.ml_inicial} onChange={e => setForm(f => ({ ...f, ml_inicial: e.target.value }))} placeholder="Ex: 100" type="number" />
                </div>
              </div>
            </div>

            {/* Precos */}
            <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
              <Label>Precos por Tamanho</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {precos.map((t, i) => (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 60, fontSize: 13, color: S.text2, fontWeight: 500 }}>{t.label}</span>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: S.text3 }}>R$</span>
                      <input type="number" value={t.preco} onChange={e => setPrecos(p => p.map((x, j) => j === i ? { ...x, preco: e.target.value } : x))}
                        placeholder="0,00"
                        style={{ width: '100%', padding: '8px 12px 8px 32px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, color: S.text, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Msg */}
            {msg.texto && (
              <div style={{ padding: '12px 16px', borderRadius: 4, fontSize: 13, fontWeight: 500,
                background: msg.tipo === 'ok' ? '#f0faf0' : msg.tipo === 'aviso' ? '#fffbf0' : '#fff0f0',
                color: msg.tipo === 'ok' ? '#2a7a2a' : msg.tipo === 'aviso' ? '#8a6a10' : '#c0392b',
                border: `1px solid ${msg.tipo === 'ok' ? '#b0e0b0' : msg.tipo === 'aviso' ? '#e8d840' : '#f0b0b0'}` }}>
                {msg.texto}
              </div>
            )}

            {/* Botoes */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('perfume')} style={{ padding: '12px 20px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2 }}>
                &#8592; Voltar
              </button>
              <button onClick={salvar} disabled={salvando}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07', letterSpacing: '0.08em', opacity: salvando ? 0.7 : 1 }}>
                {salvando ? 'Salvando...' : 'Cadastrar Produto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
