import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

const STATUS_OPTIONS = ['pagamento_aprovado','em_separacao','enviado','entregue','cancelado'];
const STATUS_LABEL = { aguardando_pagamento:'Aguardando pag.', pagamento_aprovado:'Pago', em_separacao:'Em separação', enviado:'Enviado', entregue:'Entregue', cancelado:'Cancelado' };
const COR = { aguardando_pagamento:'bg-amber-50 text-amber-700', pagamento_aprovado:'bg-green-50 text-green-700', em_separacao:'bg-blue-50 text-blue-700', enviado:'bg-purple-50 text-purple-700', entregue:'bg-green-100 text-green-800', cancelado:'bg-red-50 text-red-600' };

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [rastreio, setRastreio] = useState('');

  useEffect(() => { api.get('/api/pedidos').then(r => setPedidos(r.data)).catch(() => {}); }, []);

  async function atualizarStatus() {
    await api.patch(`/api/pedidos/${selecionado.id}/status`, { status: novoStatus, codigo_rastreio: rastreio });
    setSelecionado(null);
    api.get('/api/pedidos').then(r => setPedidos(r.data));
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Pedidos</h1>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-3">Número</th>
              <th className="text-left px-5 py-3">Cliente</th>
              <th className="text-left px-5 py-3">WhatsApp</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Ação</th>
            </tr></thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-brand-600">{p.numero}</td>
                  <td className="px-5 py-3">{p.cliente}</td>
                  <td className="px-5 py-3 text-gray-400">{p.whatsapp || '—'}</td>
                  <td className="px-5 py-3 text-center">R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${COR[p.status]}`}>{STATUS_LABEL[p.status]}</span></td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => { setSelecionado(p); setNovoStatus(p.status); setRastreio(''); }} className="text-xs text-brand-600 hover:underline">Atualizar</button>
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">Nenhum pedido ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selecionado && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-semibold mb-1">Atualizar pedido</h2>
            <p className="text-xs text-gray-400 mb-4">{selecionado.numero}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Novo status</label>
                <select value={novoStatus} onChange={e => setNovoStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              {novoStatus === 'enviado' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Código de rastreio</label>
                  <input value={rastreio} onChange={e => setRastreio(e.target.value)} placeholder="BR123456789" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              )}
              <div className="bg-brand-50 rounded-lg p-3 text-xs text-brand-600">
                O cliente será notificado automaticamente pelo WhatsApp.
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setSelecionado(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm">Cancelar</button>
                <button onClick={atualizarStatus} className="flex-1 py-2 bg-brand-400 text-white rounded-xl text-sm font-medium">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
