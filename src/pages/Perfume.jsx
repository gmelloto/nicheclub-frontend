import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const TAMANHOS = [
  { key: 'apc',  label: 'APC +50ml', ml: 50  },
  { key: '3ml',  label: '3ml',       ml: 3   },
  { key: '5ml',  label: '5ml',       ml: 5   },
  { key: '10ml', label: '10ml',      ml: 10  },
  { key: '15ml', label: '15ml',      ml: 15  },
];

const ACORDES_COR = {
  'Floral':'#e8a0b0','Rosa':'#e87090','Amadeirado':'#c8a878','Cedro':'#b89060',
  'Oud':'#8a6030','Patchouli':'#9a7850','Oriental':'#d4884c','Adocicado':'#e8b060',
  'Baunilha':'#f0c878','Ambar':'#d4a040','Almiscarado':'#c8b8a0','Especiado':'#c87840',
  'Citrico':'#e8d040','Fresco':'#78c8d8','Aromatico':'#78b890','Verde':'#88c878',
  'Aquatico':'#60b8d8','Marinho':'#4898c8','Frutado':'#e87878','Gourmet':'#e8a060',
  'Couro':'#a07848','Defumado':'#9898a8','Terroso':'#a08868','Tropical':'#f0b040',
  'Animal':'#c8a060','Sandalo':'#d4b896','Picante Fresco':'#78c8b0',
  'Picante Quente':'#d47848','Almiscarado Suave':'#d8c8b8','Floral Branco':'#f0c8d8',
};
const corAcorde = n => ACORDES_COR[n] || '#c9a84c';

const NOTAS_EN_PT = {
  'amber': 'Âmbar', 'ambergris': 'Âmbar Cinza', 'apple': 'Maçã', 'apricot': 'Damasco',
  'basil': 'Manjericão', 'bay leaf': 'Louro', 'benzoin': 'Benjoim', 'bergamot': 'Bergamota',
  'birch': 'Bétula', 'bitter almond': 'Amêndoa Amarga', 'black currant': 'Groselha Negra',
  'black pepper': 'Pimenta Preta', 'blackberry': 'Amora', 'blood orange': 'Laranja Sanguínea',
  'blueberry': 'Mirtilo', 'cacao': 'Cacau', 'caramel': 'Caramelo', 'cardamom': 'Cardamomo',
  'carnation': 'Cravo', 'cashmere': 'Cashmere', 'cashmere wood': 'Madeira de Cashmere',
  'cassis': 'Cassis', 'cedar': 'Cedro', 'cedarwood': 'Madeira de Cedro',
  'cherry': 'Cereja', 'cherry blossom': 'Flor de Cerejeira', 'cinnamon': 'Canela',
  'citron': 'Cidra', 'clove': 'Cravo-da-Índia', 'cloves': 'Cravo-da-Índia',
  'cocoa': 'Cacau', 'coconut': 'Coco', 'coffee': 'Café', 'coriander': 'Coentro',
  'cotton': 'Algodão', 'cypress': 'Cipreste', 'elemi': 'Elemi',
  'fig': 'Figo', 'fir': 'Abeto', 'frankincense': 'Olíbano', 'freesia': 'Frésia',
  'galbanum': 'Gálbano', 'gardenia': 'Gardênia', 'geranium': 'Gerânio',
  'ginger': 'Gengibre', 'grapefruit': 'Toranja', 'green apple': 'Maçã Verde',
  'green tea': 'Chá Verde', 'guaiac wood': 'Guaiaco', 'hazelnut': 'Avelã',
  'heliotrope': 'Heliotrópio', 'honey': 'Mel', 'honeysuckle': 'Madressilva',
  'hyacinth': 'Jacinto', 'incense': 'Incenso', 'iris': 'Íris', 'ivy': 'Hera',
  'jasmine': 'Jasmim', 'juniper': 'Zimbro', 'juniper berries': 'Bagas de Zimbro',
  'labdanum': 'Ládano', 'lavender': 'Lavanda', 'leather': 'Couro',
  'lemon': 'Limão', 'lemon verbena': 'Verbena', 'licorice': 'Alcaçuz',
  'lily': 'Lírio', 'lily of the valley': 'Lírio do Vale', 'lime': 'Lima',
  'linden': 'Tília', 'linden blossom': 'Flor de Tília',
  'magnolia': 'Magnólia', 'mandarin': 'Mandarina', 'mandarin orange': 'Tangerina',
  'mango': 'Manga', 'maple': 'Bordo', 'marigold': 'Calêndula',
  'mint': 'Menta', 'moss': 'Musgo', 'musk': 'Almíscar', 'white musk': 'Almíscar Branco',
  'myrrh': 'Mirra', 'neroli': 'Neroli', 'nutmeg': 'Noz-Moscada',
  'oak': 'Carvalho', 'oakmoss': 'Musgo de Carvalho', 'olive': 'Oliva',
  'orange': 'Laranja', 'orange blossom': 'Flor de Laranjeira',
  'orchid': 'Orquídea', 'orris': 'Orris', 'orris root': 'Raiz de Íris',
  'osmanthus': 'Osmanto', 'oud': 'Oud', 'agarwood': 'Oud',
  'papyrus': 'Papiro', 'passion fruit': 'Maracujá', 'patchouli': 'Patchouli',
  'peach': 'Pêssego', 'pear': 'Pera', 'peony': 'Peônia',
  'pepper': 'Pimenta', 'peppermint': 'Hortelã-Pimenta',
  'petitgrain': 'Petitgrain', 'pine': 'Pinho', 'pink pepper': 'Pimenta Rosa',
  'pistachio': 'Pistache', 'plum': 'Ameixa', 'pomegranate': 'Romã',
  'praline': 'Praliné', 'quince': 'Marmelo',
  'raspberry': 'Framboesa', 'rose': 'Rosa', 'rosemary': 'Alecrim',
  'rosewood': 'Pau-Rosa', 'rum': 'Rum',
  'saffron': 'Açafrão', 'sage': 'Sálvia', 'sandalwood': 'Sândalo',
  'sea salt': 'Sal Marinho', 'sesame': 'Gergelim', 'smoke': 'Fumaça',
  'spearmint': 'Hortelã', 'star anise': 'Anis Estrelado',
  'strawberry': 'Morango', 'sugar': 'Açúcar', 'suede': 'Camurça',
  'tangerine': 'Tangerina', 'tea': 'Chá', 'thyme': 'Tomilho',
  'tobacco': 'Tabaco', 'toffee': 'Toffee', 'tonka bean': 'Fava Tonka',
  'tuberose': 'Tuberosa', 'tulip': 'Tulipa', 'turmeric': 'Açafrão-da-Terra',
  'vanilla': 'Baunilha', 'vetiver': 'Vetiver', 'violet': 'Violeta',
  'violet leaf': 'Folha de Violeta', 'water lily': 'Nenúfar',
  'watermelon': 'Melancia', 'wheat': 'Trigo', 'white tea': 'Chá Branco',
  'wisteria': 'Glicínia', 'ylang-ylang': 'Ylang-Ylang',
  'yuzu': 'Yuzu', 'woodsy notes': 'Notas Amadeiradas', 'woody notes': 'Notas Amadeiradas',
  'powdery notes': 'Notas Empoadas', 'floral notes': 'Notas Florais',
  'fresh notes': 'Notas Frescas', 'sweet notes': 'Notas Doces',
  'spicy notes': 'Notas Picantes', 'earthy notes': 'Notas Terrosas',
  'green notes': 'Notas Verdes', 'fruity notes': 'Notas Frutadas',
  'citrus': 'Cítrico', 'woody': 'Amadeirado', 'musky': 'Almiscarado',
  'powdery': 'Empoado', 'floral': 'Floral', 'fresh': 'Fresco',
  'sweet': 'Doce', 'spicy': 'Picante', 'earthy': 'Terroso',
  'aquatic': 'Aquático', 'aromatic': 'Aromático', 'gourmand': 'Gourmet',
  'balsamic': 'Balsâmico', 'ozonic': 'Ozônico', 'marine': 'Marinho',
  'white flowers': 'Flores Brancas', 'tropical fruits': 'Frutas Tropicais',
  'dried fruits': 'Frutas Secas', 'red fruits': 'Frutas Vermelhas',
  'dark chocolate': 'Chocolate Amargo', 'milk chocolate': 'Chocolate ao Leite',
  'white chocolate': 'Chocolate Branco', 'chocolate': 'Chocolate',
  'almond': 'Amêndoa', 'anise': 'Anis', 'bamboo': 'Bambu',
  'birch leaf': 'Folha de Bétula', 'black tea': 'Chá Preto',
  'champaca': 'Champaca', 'davana': 'Davana', 'driftwood': 'Madeira Flutuante',
  'eucalyptus': 'Eucalipto', 'frangipani': 'Jasmim-Manga',
  'green cardamom': 'Cardamomo Verde', 'hemp': 'Cânhamo',
  'immortelle': 'Immortelle', 'jasmine sambac': 'Jasmim Sambac',
  'lemongrass': 'Capim-Limão', 'lotus': 'Lótus', 'mimosa': 'Mimosa',
  'myrtle': 'Murta', 'narcissus': 'Narciso', 'opoponax': 'Opoponax',
  'palmarosa': 'Palmarosa', 'plumeria': 'Plumeria', 'poppy': 'Papoula',
  'resins': 'Resinas', 'rhubarb': 'Ruibarbo', 'rice': 'Arroz',
  'sea notes': 'Notas Marinhas', 'seaweed': 'Alga Marinha',
  'teak': 'Teca', 'teak wood': 'Madeira de Teca', 'tiare flower': 'Flor de Tiaré',
  'virginia cedar': 'Cedro da Virgínia', 'white cedar': 'Cedro Branco',
  'white pepper': 'Pimenta Branca', 'wild strawberry': 'Morango Silvestre',
  'birch tar': 'Alcatrão de Bétula', 'castoreum': 'Castóreo',
  'civet': 'Algália', 'ambrette': 'Ambrette', 'ambroxan': 'Ambroxan',
  'iso e super': 'Iso E Super', 'cashmeran': 'Cashmeran',
};

function traduzirNota(nota) {
  const traduzida = NOTAS_EN_PT[nota.toLowerCase().trim()] || nota;
  return traduzida.charAt(0).toUpperCase() + traduzida.slice(1);
}

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfume, setPerfume]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [reservas, setReservas]   = useState([]);
  const [selecionado, setSel]     = useState(null);
  const [mlAvulso, setMlAvulso]   = useState('');
  const [nome, setNome]           = useState('');
  const [telefone, setTelefone]   = useState('');
  const [salvando, setSalvando]   = useState(false);
  const [msg, setMsg]             = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.perfume(id)
      .then(p => {
        setPerfume(p);
        return api.reservasPerfume(p.id).catch(() => []);
      })
      .then(r => setReservas(r || []))
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}>
      <div style={{ width:32, height:32, border:'2px solid #e8e4dc', borderTop:'2px solid #c9a84c', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!perfume) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}>
      <p style={{ color:'#9a9080' }}>Perfume nao encontrado.</p>
    </div>
  );

  const disponivel  = Number(perfume.ml_disponivel || 0);
  const totalMl     = Number(perfume.ml_total || 0);
  const pct         = totalMl > 0 ? Math.min(100, Math.round((disponivel / totalMl) * 100)) : 0;
  const esgotado    = disponivel === 0;
  const opcaoSel    = perfume.opcoes?.find(o => o.tamanho === selecionado);
  const precoPorMl  = opcaoSel ? (Number(opcaoSel.preco) / Number(opcaoSel.ml_quantidade || 1)).toFixed(2) : null;
  const totalAvulso = mlAvulso && precoPorMl ? (Number(mlAvulso) * Number(precoPorMl)).toFixed(2) : null;
  const acordes     = [perfume.acorde1, perfume.acorde2, perfume.acorde3, perfume.acorde4, perfume.acorde5].filter(Boolean);
  const topoNotas   = (perfume.notas_topo    || '').split(',').map(n => n.trim()).filter(Boolean);
  const coracaoNotas= (perfume.notas_coracao || '').split(',').map(n => n.trim()).filter(Boolean);
  const baseNotas   = (perfume.notas_base    || '').split(',').map(n => n.trim()).filter(Boolean);
  const notasImgs   = perfume.notas_imagens  || {};

  const imgNota = nota => {
    const r = notasImgs[nota.toLowerCase().trim()];
    const label = traduzirNota(nota);
    if (!r) return { img: null, label };
    if (typeof r === 'string') return { img: r, label };
    return { img: r.img || r.cloudinary_url || null, label: r.ptb ? traduzirNota(r.ptb) : label };
  };

  const reservar = async () => {
    if (!nome || !telefone)           return setMsg('Preencha nome e telefone.');
    if (!selecionado && !mlAvulso)    return setMsg('Escolha um tamanho ou quantidade.');
    setSalvando(true); setMsg('');
    try {
      const res = await api.reservar({ perfume_id: perfume.id, nome, telefone, tamanho: selecionado || null, ml_avulso: mlAvulso ? Number(mlAvulso) : null });
      setMsg(res.mensagem || 'Reserva confirmada!');
      setNome(''); setTelefone(''); setSel(null); setMlAvulso('');
      api.reservasPerfume(perfume.id).then(r => setReservas(r || [])).catch(() => {});
    } catch(e) { setMsg(e.message || 'Erro ao reservar.'); }
    finally { setSalvando(false); }
  };

  const Piramide = () => {
    if (!topoNotas.length && !coracaoNotas.length && !baseNotas.length) return null;
    return (
      <div style={{ background:'#f8f7f4', border:'1px solid #e8e4dc', borderRadius:4, padding:'1.25rem', marginTop:'1rem' }}>
        <h3 style={{ fontFamily:"'Inter', sans-serif", fontSize:'0.95rem', fontWeight:700, marginBottom:'1rem', color:'rgb(138, 106, 16)', textTransform:'uppercase', letterSpacing:'0.15em' }}>Pirâmide Olfativa</h3>
        {topoNotas.length > 0 && (
          <div style={{ marginBottom:'1rem' }}>
            <p style={{ fontFamily:"'Inter', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:8 }}>Topo</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {topoNotas.map(n => { const r=imgNota(n); return <NotaBadge key={n} nota={r.label} img={r.img} />; })}
            </div>
          </div>
        )}
        {coracaoNotas.length > 0 && (
          <div style={{ marginBottom:'1rem' }}>
            <p style={{ fontFamily:"'Inter', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:8 }}>Coracao</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {coracaoNotas.map(n => { const r=imgNota(n); return <NotaBadge key={n} nota={r.label} img={r.img} />; })}
            </div>
          </div>
        )}
        {baseNotas.length > 0 && (
          <div>
            <p style={{ fontFamily:"'Inter', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:8 }}>Base</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {baseNotas.map(n => { const r=imgNota(n); return <NotaBadge key={n} nota={r.label} img={r.img} />; })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight:'100vh', background:'#fff', color:'#0d0b07' }}>
      <style>{`
        .pg { display:grid; grid-template-columns:1fr 1fr; gap:2rem; max-width:1280px; margin:0 auto; padding:1.5rem 2rem 3rem; align-items:start; }
        @media(max-width:860px){ .pg{ grid-template-columns:1fr; padding:1rem; gap:1rem; } }
      `}</style>

      {/* Voltar */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0.75rem 2rem' }}>
        <button onClick={() => navigate(-1)}
          style={{ fontSize:13, color:'#9a9080', background:'none', border:'none', cursor:'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color='#c9a84c'}
          onMouseLeave={e => e.currentTarget.style.color='#9a9080'}
        >&#8592; Voltar</button>
      </div>

      {/* Header */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 2rem 1rem', borderBottom:'1px solid #e8e4dc' }}>
        <p style={{ fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:4, fontWeight:600 }}>{perfume.marca}</p>
        <h1 style={{ fontSize:'clamp(1.6rem,3vw,2.8rem)', fontWeight:700, lineHeight:1.1, marginBottom:8, letterSpacing:'-0.02em', color:'#111' }}>{perfume.nome}</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', fontSize:12, color:'#111' }}>
          {perfume.genero    && <span>{perfume.genero}</span>}
          {perfume.ano       && <><span style={{color:'#e8e4dc'}}>|</span><span>{perfume.ano}</span></>}
          {perfume.pais      && <><span style={{color:'#e8e4dc'}}>|</span><span>{perfume.pais}</span></>}
          {perfume.perfumista1 && <><span style={{color:'#e8e4dc'}}>|</span><span style={{fontStyle:'italic'}}>{perfume.perfumista1}</span></>}
          {perfume.perfumista2 && <><span style={{color:'#e8e4dc'}}>|</span><span style={{fontStyle:'italic'}}>{perfume.perfumista2}</span></>}
        </div>
      </div>

      {/* Grid */}
      <div className="pg">

        {/* ESQUERDA: foto + acordes + piramide */}
        <div>
          {/* Foto + acordes */}
          <div style={{ border:'1px solid #e8e4dc', borderRadius:4, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', height:380 }}>
            <div style={{ background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', borderRight:'1px solid #e8e4dc' }}>
              <img src={perfume.foto_url || '/frasco.jpeg'} alt={perfume.nome}
                style={{ width:'100%', height:'100%', objectFit:'contain', padding:12 }} />
            </div>
            <div style={{ background:'#f8f7f4', padding:'1rem', display:'flex', flexDirection:'column', gap:5 }}>
              <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8a6a10', marginBottom:6, fontWeight:600 }}>Acordes</p>
              {acordes.map(a => (
                <div key={a} style={{ height:24, borderRadius:3, background:corAcorde(a), display:'flex', alignItems:'center', paddingLeft:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'rgba(0,0,0,0.65)', whiteSpace:'nowrap' }}>{a}</span>
                </div>
              ))}
              {perfume.rating_valor && (
                <div style={{ marginTop:'auto', paddingTop:8, borderTop:'1px solid #e8e4dc' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:16, fontWeight:700 }}>{Number(perfume.rating_valor).toFixed(2)}</span>
                    <div>{[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:10, color: s <= Math.round(perfume.rating_valor) ? '#c9a84c' : '#e8e4dc' }}>&#9733;</span>)}</div>
                  </div>
                  <p style={{ fontSize:10, color:'#9a9080' }}>({perfume.rating_count?.toLocaleString()} av.)</p>
                </div>
              )}
            </div>
          </div>

          {/* Piramide */}
          <Piramide />
        </div>

        {/* DIREITA: disponibilidade + reserva */}
        <div>
          {perfume.descricao && <p style={{ fontSize:14, color:'#5a5550', lineHeight:1.8, marginBottom:'1rem' }}>{perfume.descricao}</p>}

          {/* Disponibilidade */}
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:6 }}>Disponibilidade</p>
          <div style={{ background:'#f8f7f4', border:'1px solid #e8e4dc', borderRadius:4, padding:'0.85rem 1.25rem', marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: esgotado ? '#c0392b' : '#c9a84c' }} />
                <span style={{ fontSize:13, fontWeight:600, color: esgotado ? '#c0392b' : '#0d0b07' }}>{esgotado ? 'Esgotado' : 'Disponivel'}</span>
              </div>
              <span style={{ fontSize:13, color:'#8a6a10', fontWeight:600 }}>{disponivel}ml de {totalMl}ml</span>
            </div>
            <div style={{ height:4, background:'#e8e4dc', borderRadius:2 }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#c9a84c,#e8c870)', borderRadius:2, width:`${100-pct}%` }} />
            </div>
          </div>

          {/* Opcoes */}
          <p style={{ fontFamily:"'Inter', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:8 }}>Escolha sua opcao</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:'1rem' }}>
            {TAMANHOS.map(t => {
              const op = perfume.opcoes?.find(o => o.tamanho === t.key);
              if (!op) return null;
              const disp = disponivel >= t.ml;
              const sel  = selecionado === t.key;
              return (
                <button key={t.key}
                  onClick={() => { if (disp) { setSel(t.key); setMlAvulso(''); } }}
                  disabled={!disp}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'0.75rem 1rem', borderRadius:4,
                    border: sel ? '1px solid #c9a84c' : '1px solid #e8e4dc',
                    background: sel ? '#fdf8ee' : '#fff',
                    cursor: disp ? 'pointer' : 'not-allowed', opacity: disp ? 1 : 0.45, transition:'all 0.2s' }}
                  onMouseEnter={e => { if (disp && !sel) e.currentTarget.style.borderColor='#c9a84c'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor='#e8e4dc'; }}
                >
                  <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                    border:`2px solid ${sel ? '#c9a84c' : '#e8e4dc'}`,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {sel && <div style={{ width:8, height:8, borderRadius:'50%', background:'#c9a84c' }} />}
                  </div>
                  <span style={{ flex:1, fontSize:14, color:'#0d0b07', fontWeight: sel ? 600 : 400, textAlign:'left' }}>
                    {t.label}{!disp && <span style={{ fontSize:11, color:'#9a9080', marginLeft:8 }}>indisponivel</span>}
                  </span>
                  <span style={{ fontSize:14, color: sel ? '#8a6a10' : '#5a5550', fontWeight:600 }}>
                    R$ {Number(op.preco).toFixed(2).replace('.',',')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Avulsa */}
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:6 }}>Ou quantidade avulsa</p>
          <div style={{ background:'#f8f7f4', border:'1px solid #e8e4dc', borderRadius:4, padding:'0.75rem 1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:12 }}>
            <input type="number" min="1" max={disponivel} placeholder="Quantos ml"
              value={mlAvulso} onChange={e => { setMlAvulso(e.target.value); setSel(null); }}
              style={{ width:120, background:'#fff', border:'1px solid #e8e4dc', borderRadius:4, padding:'8px 12px', fontSize:14, color:'#0d0b07', outline:'none' }}
            />
            {mlAvulso && precoPorMl
              ? <span style={{ fontSize:13, color:'#5a5550' }}>x R$ {precoPorMl}/ml = <strong style={{ color:'#8a6a10' }}>R$ {totalAvulso}</strong></span>
              : <span style={{ fontSize:12, color:'#9a9080' }}>x preco/ml</span>
            }
          </div>

          {/* Nome e telefone */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'0.75rem' }}>
            <div>
              <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#9a9080', marginBottom:4 }}>Seu nome</label>
              <input placeholder="Ex: Joao Silva" value={nome} onChange={e => setNome(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', background:'#fff', border:'1px solid #e8e4dc', borderRadius:4, color:'#0d0b07', fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'#9a9080', marginBottom:4 }}>WhatsApp</label>
              <input placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', background:'#fff', border:'1px solid #e8e4dc', borderRadius:4, color:'#0d0b07', fontSize:13, outline:'none' }} />
            </div>
          </div>

          {msg && <p style={{ fontSize:13, color: msg.includes('confirmad') ? '#2a7a2a' : '#c0392b', marginBottom:'0.75rem', fontWeight:500 }}>{msg}</p>}

          <button onClick={reservar} disabled={salvando || esgotado}
            style={{ width:'100%', padding:'14px', borderRadius:4,
              background: esgotado ? '#f8f7f4' : 'linear-gradient(135deg,#c9a84c,#e8c870)',
              border: `1px solid ${esgotado ? '#e8e4dc' : '#c9a84c'}`,
              cursor: esgotado ? 'not-allowed' : 'pointer',
              fontSize:13, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
              color: esgotado ? '#9a9080' : '#0d0b07', transition:'all 0.2s', opacity: salvando ? 0.7 : 1 }}>
            {salvando ? 'Reservando...' : esgotado ? 'Esgotado' : 'Reservar'}
          </button>

          {reservas.length > 0 && (
            <div style={{ marginTop:'1.5rem' }}>
              <p style={{ fontFamily:"'Inter', sans-serif", fontSize:11, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#8a6a10', marginBottom:8 }}>Reservas ({reservas.length})</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {reservas.map((r,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.65rem 1rem', background:'#f8f7f4', border:'1px solid #e8e4dc', borderRadius:4 }}>
                    <span style={{ fontSize:14 }}>{r.nome}</span>
                    <span style={{ fontSize:13, color:'#8a6a10', fontWeight:600 }}>{r.tamanho}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotaBadge({ nota, img }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, width:68 }}>
      <div style={{ width:52, height:52, borderRadius:8, overflow:'hidden', border:'1px solid #e0d8c8', background:'#f0ede8', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {img
          ? <img src={img} alt={nota} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          : null
        }
        <span style={{ fontSize:20, display: img ? 'none' : 'flex' }}>&#127807;</span>
      </div>
      <span style={{ fontSize:10, color:'#4a4440', textAlign:'center', lineHeight:1.3, fontWeight:500 }}>{nota}</span>
    </div>
  );
}
