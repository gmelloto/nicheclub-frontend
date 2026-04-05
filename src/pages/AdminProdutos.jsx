import { useState, useRef } from 'react';
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

const Msg = ({ tipo, texto }) => {
  if (!texto) return null;
  const cores = {
    ok: { bg: '#f0faf0', color: '#2a7a2a', border: '#b0e0b0' },
    aviso: { bg: '#fffbf0', color: '#8a6a10', border: '#e8d840' },
    erro: { bg: '#fff0f0', color: '#c0392b', border: '#f0b0b0' },
  };
  const c = cores[tipo] || cores.aviso;
  return (
    <div style={{ padding: '12px 16px', borderRadius: 4, fontSize: 13, fontWeight: 500, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {texto}
    </div>
  );
};

// ─── STEP: escolha do metodo ───────────────────────────────────────────────
function StepEscolha({ onFragrantica, onManual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: 14, color: S.text2, marginBottom: 8 }}>Como deseja cadastrar o produto?</p>

      <button onClick={onFragrantica} style={{
        padding: '2rem', background: S.bg2, border: `2px solid ${S.goldLight}`,
        borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#f5f0e8'}
        onMouseLeave={e => e.currentTarget.style.background = S.bg2}
      >
        <p style={{ fontSize: 18, marginBottom: 6 }}>⚡ Carregar pelo Fragrantica</p>
        <p style={{ fontSize: 13, color: S.text2 }}>Cole o link do Fragrantica e os dados serão preenchidos automaticamente.</p>
        <p style={{ fontSize: 11, color: S.text3, marginTop: 8 }}>Requer servidor local rodando</p>
      </button>

      <button onClick={onManual} style={{
        padding: '2rem', background: S.bg2, border: `1px solid ${S.border}`,
        borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#f5f0e8'}
        onMouseLeave={e => e.currentTarget.style.background = S.bg2}
      >
        <p style={{ fontSize: 18, marginBottom: 6 }}>✏️ Preencher manualmente</p>
        <p style={{ fontSize: 13, color: S.text2 }}>Digite os dados do produto um por um.</p>
      </button>
    </div>
  );
}

// ─── STEP: carregar pelo Fragrantica ──────────────────────────────────────
function StepFragrantica({ onPreview, onVoltar, token }) {
  const [linkFrag, setLinkFrag] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const carregar = async () => {
    if (!linkFrag || !linkFrag.match(/fragrantica\.com(\.br)?\/perfume\//)) {
      return setMsg({ tipo: 'erro', texto: 'Cole um link válido do Fragrantica. Ex: https://www.fragrantica.com.br/perfume/Marca/Nome-12345.html' });
    }
    setCarregando(true);
    setMsg({ tipo: '', texto: '' });
    try {
      // Extrair marca e nome da URL: /perfume/Marca/Nome-ID.html
      const match = linkFrag.match(/fragrantica\.com(?:\.br)?\/perfume\/([^/]+)\/([^/]+?)(?:-\d+)?\.html/);
      if (!match) throw new Error('URL inválida. Use o formato: fragrantica.com.br/perfume/Marca/Nome.html');

      const marca = decodeURIComponent(match[1]).replace(/-/g, ' ');
      const nome = decodeURIComponent(match[2]).replace(/-/g, ' ');

      const d = await api.adminFragrantica(marca, nome);

      if (!d.encontrado) throw new Error('Perfume não encontrado no Fragrantica.');

      onPreview({
        sucesso: true,
        dados: {
          nome: d.nome || nome,
          marca: d.marca || marca,
          foto_url: d.foto_url || '',
          ano: d.ano || null,
          genero: d.genero || '',
          pais: d.pais || '',
          rating_valor: d.rating_valor || null,
          rating_count: d.rating_count || null,
          acorde1: d.acorde1 || '', acorde2: d.acorde2 || '', acorde3: d.acorde3 || '',
          acorde4: d.acorde4 || '', acorde5: d.acorde5 || '',
          notas_topo: d.notas_topo || '', notas_coracao: d.notas_coracao || '', notas_base: d.notas_base || '',
          perfumista1: d.perfumista1 || '', perfumista2: d.perfumista2 || '',
          familia_olfativa: d.familia_olfativa || '', descricao: d.descricao || '',
        },
        slug: d.slug || null,
        atualizado: d.atualizado || false,
      });
    } catch(e) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao carregar dados.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Link do Fragrantica */}
      <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
        <Label>Link do Fragrantica</Label>
        <p style={{ fontSize: 11, color: S.text3, marginBottom: 8 }}>
          Cole a URL completa do perfume no Fragrantica.
        </p>
        <Input
          value={linkFrag}
          onChange={e => setLinkFrag(e.target.value)}
          placeholder="https://www.fragrantica.com.br/perfume/Marca/Nome-12345.html"
        />
      </div>

      <Msg {...msg} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onVoltar} style={{ padding: '12px 20px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2 }}>
          ← Voltar
        </button>
        <button onClick={carregar} disabled={carregando || !linkFrag} style={{
          flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)',
          border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700,
          cursor: carregando ? 'not-allowed' : 'pointer', color: '#0d0b07',
          opacity: carregando || !linkFrag ? 0.6 : 1,
        }}>
          {carregando ? '⏳ Carregando...' : '⚡ Carregar dados'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP: preview dos dados ───────────────────────────────────────────────
function StepPreview({ resultado, onConfirmar, onVoltar, onEditar }) {
  const d = resultado.dados;
  const [precos, setPrecos] = useState(TAMANHOS.map(t => ({ ...t, preco: '' })));
  const [ml_inicial, setMlInicial] = useState('100');
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const confirmar = async () => {
    setSalvando(true);
    setMsg({ tipo: '', texto: '' });
    try {
      await onConfirmar(resultado, precos, ml_inicial);
    } catch(e) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao salvar.' });
      setSalvando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Card de preview */}
      <div style={{ background: S.bg2, border: `2px solid ${S.goldLight}`, borderRadius: 12, padding: '1.5rem' }}>
        <p style={{ fontSize: 11, color: S.gold, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          ✅ Dados carregados do Fragrantica
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'start' }}>
          {/* Foto */}
          {d?.foto_url && (
            <img src={d.foto_url} alt={d.nome} style={{ width: 100, height: 120, objectFit: 'contain', background: '#fff', borderRadius: 8, border: `1px solid ${S.border}` }} />
          )}

          <div>
            <p style={{ fontSize: 11, color: S.text3, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{d?.marca}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: S.text, marginBottom: 4 }}>{d?.nome}</p>
            <p style={{ fontSize: 12, color: S.text2, marginBottom: 4 }}>
              {d?.genero} {d?.ano ? `· ${d.ano}` : ''} {d?.pais ? `· ${d.pais}` : ''}
              {d?.rating_valor ? ` · ⭐ ${d.rating_valor}${d?.rating_count ? ` (${d.rating_count.toLocaleString()} votos)` : ''}` : ''}
            </p>
            {d?.familia_olfativa && <p style={{ fontSize: 11, color: S.text3, marginBottom: 4 }}>Família: {d.familia_olfativa}</p>}
            {(d?.perfumista1 || d?.perfumista2) && (
              <p style={{ fontSize: 11, color: S.text3, fontStyle: 'italic', marginBottom: 8 }}>
                {[d.perfumista1, d.perfumista2].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Acordes */}
            {d?.acorde1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[d.acorde1, d.acorde2, d.acorde3, d.acorde4, d.acorde5].filter(Boolean).map(a => (
                  <span key={a} style={{ padding: '3px 10px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 20, fontSize: 11, color: S.text2 }}>{a}</span>
                ))}
              </div>
            )}

            {/* Notas */}
            {d?.notas_topo && <p style={{ fontSize: 11, color: S.text3 }}><b>Topo:</b> {d.notas_topo}</p>}
            {d?.notas_coracao && <p style={{ fontSize: 11, color: S.text3 }}><b>Coração:</b> {d.notas_coracao}</p>}
            {d?.notas_base && <p style={{ fontSize: 11, color: S.text3 }}><b>Base:</b> {d.notas_base}</p>}

            {/* Descrição */}
            {d?.descricao && <p style={{ fontSize: 11, color: S.text3, marginTop: 8 }}>{d.descricao.slice(0, 200)}{d.descricao.length > 200 ? '...' : ''}</p>}
          </div>
        </div>

        {resultado.atualizado && (
          <p style={{ fontSize: 12, color: '#8a6a10', marginTop: 12, padding: '8px 12px', background: '#fffbf0', borderRadius: 4, border: '1px solid #e8d840' }}>
            ⚠️ Este perfume ja existe no banco e foi atualizado automaticamente.
          </p>
        )}
      </div>

      {/* Precos */}
      <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
        <Label>Precos por Tamanho (opcional)</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {precos.map((t, i) => (
            <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 50, fontSize: 13, color: S.text2, fontWeight: 500 }}>{t.label}</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: S.text3 }}>R$</span>
                <input type="number" value={t.preco}
                  onChange={e => setPrecos(p => p.map((x, j) => j === i ? { ...x, preco: e.target.value } : x))}
                  placeholder="0,00"
                  style={{ width: '100%', padding: '8px 12px 8px 32px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, color: S.text, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Label>ML do Frasco</Label>
          <Input value={ml_inicial} onChange={e => setMlInicial(e.target.value)} placeholder="Ex: 100" type="number" style={{ maxWidth: 150 }} />
        </div>
      </div>

      <Msg {...msg} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onVoltar} style={{ padding: '12px 20px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2 }}>
          ← Voltar
        </button>
        <button onClick={confirmar} disabled={salvando} style={{
          flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)',
          border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 700,
          cursor: salvando ? 'not-allowed' : 'pointer', color: '#0d0b07',
          opacity: salvando ? 0.7 : 1,
        }}>
          {salvando ? 'Salvando...' : '✅ Confirmar e Cadastrar'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP: formulario manual ───────────────────────────────────────────────
function StepManual({ onVoltar, onSalvo }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ nome: '', marca: '', ano: '', genero: '', pais: '', foto_url: '', url_fragrantica: '', rating_valor: '', ml_inicial: '' });
  const [precos, setPrecos] = useState(TAMANHOS.map(t => ({ ...t, preco: '' })));
  const [fotoPreview, setFotoPreview] = useState('');
  const [uploadando, setUploadando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const fileRef = useRef();

  const uploadFoto = async (file) => {
    setUploadando(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        setFotoPreview(base64);
        const res = await api.adminUploadFoto({ url_foto: base64 });
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
      await api.adminCadastrarPerfume({
        ...form,
        precos: precos.filter(p => p.preco).map(p => ({ tamanho: p.key, preco: Number(p.preco), ml: p.ml })),
        ml_inicial: form.ml_inicial ? Number(form.ml_inicial) : null,
      });
      onSalvo();
    } catch(e) {
      setMsg({ tipo: 'erro', texto: e.message || 'Erro ao salvar.' });
      setSalvando(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Foto */}
      <div style={{ background: S.bg2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '1.5rem' }}>
        <Label>Foto do Produto</Label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ width: 120, height: 120, border: `2px dashed ${S.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', background: '#fff', cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}>
            {fotoPreview
              ? <img src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 32, color: S.text3 }}>📷</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploadando}
              style={{ display: 'block', width: '100%', padding: '10px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2, marginBottom: 8 }}>
              {uploadando ? 'Enviando...' : '💾 Escolher arquivo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadFoto(e.target.files[0])} />
            <Label>Ou cole uma URL</Label>
            <Input value={form.foto_url} onChange={e => { setForm(f => ({ ...f, foto_url: e.target.value })); setFotoPreview(e.target.value); }} placeholder="https://..." style={{ fontSize: 12 }} />
          </div>
        </div>
      </div>

      {/* Dados */}
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
              <option value="Unissex">Unissex</option>
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
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
              <span style={{ width: 50, fontSize: 13, color: S.text2, fontWeight: 500 }}>{t.label}</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: S.text3 }}>R$</span>
                <input type="number" value={t.preco}
                  onChange={e => setPrecos(p => p.map((x, j) => j === i ? { ...x, preco: e.target.value } : x))}
                  placeholder="0,00"
                  style={{ width: '100%', padding: '8px 12px 8px 32px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, color: S.text, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Msg {...msg} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onVoltar} style={{ padding: '12px 20px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2 }}>
          ← Voltar
        </button>
        <button onClick={salvar} disabled={salvando} style={{
          flex: 1, padding: '12px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)',
          border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700,
          cursor: salvando ? 'not-allowed' : 'pointer', color: '#0d0b07', opacity: salvando ? 0.7 : 1,
        }}>
          {salvando ? 'Salvando...' : 'Cadastrar Produto'}
        </button>
      </div>
    </div>
  );
}

// ─── STEP: sucesso ─────────────────────────────────────────────────────────
function StepSucesso({ mensagem, onNovo, onAdmin }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🎉</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: S.text, marginBottom: 8 }}>{mensagem || 'Produto cadastrado!'}</p>
      <p style={{ fontSize: 14, color: S.text2, marginBottom: 32 }}>O perfume ja esta disponivel no catalogo.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onNovo} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#c9a84c,#e8c870)', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0d0b07' }}>
          + Cadastrar outro
        </button>
        <button onClick={onAdmin} style={{ padding: '12px 24px', background: '#fff', border: `1px solid ${S.border}`, borderRadius: 4, fontSize: 13, cursor: 'pointer', color: S.text2 }}>
          ← Voltar ao Admin
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
export default function AdminProdutos() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // step: 'escolha' | 'fragrantica' | 'preview' | 'manual' | 'sucesso'
  const [step, setStep] = useState('escolha');
  const [resultado, setResultado] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  if (!token) { navigate('/admin/login'); return null; }

  const confirmarECadastrar = async (resultado, precos, ml_inicial) => {
    const d = resultado.dados;
    const precosFormatados = (precos || []).filter(p => p.preco).map(p => ({ tamanho: p.key, preco: Number(p.preco), ml: p.ml }));
    const payload = {
      nome: d.nome,
      marca: d.marca,
      ano: d.ano,
      genero: d.genero,
      pais: d.pais || '',
      foto_url: d.foto_url || '',
      url_fragrantica: resultado.slug ? `https://nicheclub-frontend.vercel.app/perfume/${resultado.slug}` : '',
      rating_valor: d.rating_valor || '',
      rating_count: d.rating_count || '',
      familia_olfativa: d.familia_olfativa || '',
      perfumista1: d.perfumista1 || '',
      perfumista2: d.perfumista2 || '',
      acorde1: d.acorde1 || '', acorde2: d.acorde2 || '', acorde3: d.acorde3 || '',
      acorde4: d.acorde4 || '', acorde5: d.acorde5 || '',
      notas_topo: d.notas_topo || '',
      notas_coracao: d.notas_coracao || '',
      notas_base: d.notas_base || '',
      descricao: d.descricao || '',
      ml_inicial: ml_inicial ? Number(ml_inicial) : null,
    };
    if (precosFormatados.length > 0) payload.precos = precosFormatados;
    await api.adminCadastrarPerfume(payload);
    setMensagemSucesso(resultado.atualizado ? 'Perfume atualizado com sucesso!' : 'Perfume cadastrado com sucesso!');
    setStep('sucesso');
  };

  const titulos = {
    escolha: 'Cadastrar Produto',
    fragrantica: 'Carregar pelo Fragrantica',
    preview: 'Confirmar Dados',
    manual: 'Preencher Manualmente',
    sucesso: 'Produto Cadastrado',
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, padding: '1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.text3, fontSize: 13 }}>← Admin</button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: S.text }}>{titulos[step]}</h1>
        </div>

        {step === 'escolha' && (
          <StepEscolha
            onFragrantica={() => setStep('fragrantica')}
            onManual={() => setStep('manual')}
          />
        )}

        {step === 'fragrantica' && (
          <StepFragrantica
            onPreview={r => { setResultado(r); setStep('preview'); }}
            onVoltar={() => setStep('escolha')}
            token={token}
          />
        )}

        {step === 'preview' && resultado && (
          <StepPreview
            resultado={resultado}
            onConfirmar={confirmarECadastrar}
            onVoltar={() => setStep('fragrantica')}
          />
        )}

        {step === 'manual' && (
          <StepManual
            onVoltar={() => setStep('escolha')}
            onSalvo={() => { setMensagemSucesso('Perfume cadastrado com sucesso!'); setStep('sucesso'); }}
          />
        )}

        {step === 'sucesso' && (
          <StepSucesso
            mensagem={mensagemSucesso}
            onNovo={() => { setStep('escolha'); setResultado(null); }}
            onAdmin={() => navigate('/admin')}
          />
        )}

      </div>
    </div>
  );
}
