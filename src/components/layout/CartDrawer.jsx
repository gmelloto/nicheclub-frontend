import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ aberto, onFechar }) {
  const { itens, remover, total } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {aberto && <div className="fixed inset-0 bg-black/30 z-40" onClick={onFechar} />}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transform transition-transform duration-300 ${aberto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold">Carrinho</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {itens.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Carrinho vazio</p>
          ) : itens.map(item => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium">{item.nome}</p>
                <p className="text-xs text-gray-400">{item.marca} · {item.tamanho === 'apc' ? 'APC 50ml' : item.tamanho}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                <button onClick={() => remover(item.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
              </div>
            </div>
          ))}
        </div>
        {itens.length > 0 && (
          <div className="p-6 border-t">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total</span>
              <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button
              onClick={() => { onFechar(); navigate('/checkout'); }}
              className="w-full py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
