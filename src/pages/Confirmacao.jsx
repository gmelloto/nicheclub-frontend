import { useParams, useLocation, useNavigate } from 'react-router-dom';

export default function Confirmacao() {
  const { numero } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const pag = state?.pagamento;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h1 className="text-xl font-semibold mb-1">Pedido confirmado!</h1>
        <p className="text-gray-400 text-sm mb-6">Você receberá atualizações pelo WhatsApp e e-mail.</p>
        <div className="flex gap-2 justify-center mb-6">
          <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-medium">{numero}</span>
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">Pagamento aprovado</span>
        </div>

        {pag?.metodo === 'pix' && pag?.pix_copia_cola && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-green-800 mb-2">Pague com Pix</p>
            <p className="text-xs text-green-700 break-all font-mono mb-3">{pag.pix_copia_cola}</p>
            <button
              onClick={() => navigator.clipboard.writeText(pag.pix_copia_cola)}
              className="w-full py-2 border border-green-400 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
            >
              Copiar código Pix
            </button>
          </div>
        )}

        <button onClick={() => navigate('/')} className="w-full py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors">
          Continuar comprando
        </button>
      </div>
    </div>
  );
}
