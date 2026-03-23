import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import CartDrawer from '../components/layout/CartDrawer';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const EMOJIS = ['🟡', '🟤', '🟠', '🌸', '🟢', '⚪', '🔵', '🟣'];

export default function Catalogo() {
  const [perfumes, setPerfumes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [cartAberto, setCartAberto] = useState(false);
  const [selecionados, setSelecionados] = useState({});
  const { adicionar } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/perfumes')
      .then(r => setPerfumes(r.data))
      .catch(() => setPerfumes([]))
      .finally(() => setCarregando(false));
  }, []);

  function selecionarTamanho(perfumeId, tamanho) {
    setSelecionados(prev => ({ ...prev, [perfumeId]: tamanho }));
  }

  function adicionarAoCarrinho(perfume) {
    const tamanho = selecionados[perfume.id];
    if (!tamanho) return;
    const opcao = perfume.opcoes?.find(o => o.tamanho === tamanho);
    if (!opcao) return;
    adicionar(perfume, tamanho, Number(opcao.preco), opcao.ml);
    setSelecionados(prev => ({ ...prev, [perfume.id]: null }));
    setCartAberto(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => setCartAberto(true)} />
      <CartDrawer aberto={cartAberto} onFechar={() => setCartAberto(false)} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-2">Catálogo</h1>
          <p className="text-gray-400">Perfumes de nicho fracionados em 3ml, 5ml, 10ml, 15ml ou frasco completo</p>
        </div>

        {carregando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perfumes.map((p, i) => {
              const disponivel = Number(p.ml_disponivel);
              const total = Number(p.ml_total);
              const pct = total > 0 ? Math.round((disponivel / total) * 100) : 0;
              const sel = selecionados[p.id];
              const opcaoSel = p.opcoes?.find(o => o.tamanho === sel);

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-100 transition-colors">
                  <div
                    className="h-32 bg-gradient-to-br from-brand-50 to-purple-50 flex items-center justify-center cursor-pointer relative"
                    onClick={() => navigate(`/perfume/${p.id}`)}
                  >
                    <span className="text-5xl">{EMOJIS[i % EMOJIS.length]}</span>
                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="flex justify-between text-xs text-brand-600 mb-1">
                        <span>{disponivel.toFixed(0)}ml disponíveis</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/60 rounded-full">
                        <div
                          className="h-1.5 bg-brand-400 rounded-full transition-all"
                          style={{ width: `${100 - pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{p.marca}</p>
                    <h3 className="font-semibold mb-1 cursor-pointer hover:text-brand-600" onClick={() => navigate(`/perfume/${p.id}`)}>{p.nome}</h3>
                    <p className="text-xs text-gray-400 mb-4">{p.familia_olfativa}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.opcoes?.map(op => {
                        const mlOp = Number(op.ml);
                        const ok = disponivel >= mlOp;
                        const isSel = sel === op.tamanho;
                        return (
                          <button
                            key={op.tamanho}
                            onClick={() => ok && selecionarTamanho(p.id, op.tamanho)}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-all
                              ${!ok ? 'opacity-30 line-through cursor-not-allowed border-gray-200 text-gray-400' :
                              isSel ? 'bg-brand-50 border-brand-400 text-brand-600 font-medium' :
                              'border-gray-200 text-gray-600 hover:border-brand-300'}`}
                          >
                            {op.tamanho === 'apc' ? 'APC' : op.tamanho}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        {opcaoSel ? `R$ ${Number(opcaoSel.preco).toFixed(2).replace('.', ',')}` : 'Selecione'}
                      </span>
                      <button
                        onClick={() => adicionarAoCarrinho(p)}
                        disabled={!sel}
                        className="px-4 py-2 bg-brand-400 text-white rounded-xl text-sm font-medium hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
