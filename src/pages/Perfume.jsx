import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import CartDrawer from '../components/layout/CartDrawer';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Perfume() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState(null);
  const [tamanho, setTamanho] = useState(null);
  const [cartAberto, setCartAberto] = useState(false);
  const { adicionar } = useCart();

  useEffect(() => {
    api.get(`/api/perfumes/${id}`).then(r => setPerfume(r.data)).catch(() => navigate('/'));
  }, [id]);

  if (!perfume) return null;

  const opcaoSel = perfume.opcoes?.find(o => o.tamanho === tamanho);

  function handleAdicionar() {
    if (!opcaoSel) return;
    adicionar(perfume, tamanho, Number(opcaoSel.preco), opcaoSel.ml);
    setCartAberto(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => setCartAberto(true)} />
      <CartDrawer aberto={cartAberto} onFechar={() => setCartAberto(false)} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600 mb-8 flex items-center gap-2">
          ← Voltar ao catálogo
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="h-64 md:h-auto bg-gradient-to-br from-brand-50 to-purple-50 flex items-center justify-center">
              <span className="text-8xl">🌸</span>
            </div>

            <div className="p-8">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{perfume.marca}</p>
              <h1 className="text-2xl font-semibold mb-1">{perfume.nome}</h1>
              <p className="text-sm text-gray-400 mb-4">{perfume.familia_olfativa}</p>
              {perfume.descricao && <p className="text-sm text-gray-600 leading-relaxed mb-6">{perfume.descricao}</p>}

              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Escolha o tamanho</p>
                <div className="grid grid-cols-3 gap-2">
                  {perfume.opcoes?.map(op => {
                    const isSel = tamanho === op.tamanho;
                    return (
                      <button
                        key={op.tamanho}
                        onClick={() => setTamanho(op.tamanho)}
                        className={`p-3 rounded-xl border text-center transition-all ${isSel ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-200'}`}
                      >
                        <p className="font-medium text-sm">{op.tamanho === 'apc' ? 'APC' : op.tamanho}</p>
                        <p className="text-xs text-gray-400">{op.tamanho === 'apc' ? '50ml' : op.ml + 'ml'}</p>
                        <p className="text-sm font-semibold text-brand-600 mt-1">R$ {Number(op.preco).toFixed(2).replace('.', ',')}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleAdicionar}
                disabled={!tamanho}
                className="w-full py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {opcaoSel ? `Adicionar por R$ ${Number(opcaoSel.preco).toFixed(2).replace('.', ',')}` : 'Selecione um tamanho'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
