import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    api.get('/api/pedidos').then(r => setPedidos(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Pedidos hoje', val: pedidos.filter(p => new Date(p.criado_em).toDateString() === new Date().toDateString()).length },
    { label: 'Aguardando pagamento', val: pedidos.filter(p => p.status === 'aguardando_pagamento').length },
    { label: 'Em separação', val: pedidos.filter(p => p.status === 'em_separacao').length },
    { label: 'Enviados', val: pedidos.filter(p => p.status === 'enviado').length },
  ];

  const STATUS = { aguardando_pagamento:'Aguardando pag.', pagamento_aprovado:'Pago ✓', em_separacao:'Em separação', enviado:'Enviado', entregue:'Entregue', cancelado:'Cancelado' };
  const COR = { aguardando_pagamento:'bg-amber-50 text-amber-700', pagamento_aprovado:'bg-green-50 text-green-700', em_separacao:'bg-blue-50 text-blue-700', enviado:'bg-purple-50 text-purple-700', entregue:'bg-green-100 text-green-800', cancelado:'bg-red-50 text-red-600' };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="text-2xl font-semibold">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 font-medium text-sm">Pedidos recentes</div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 border-b border-gray-50">
              <th className="text-left px-5 py-3">Número</th>
              <th className="text-left px-5 py-3">Cliente</th>
              <th className="text-left px-5 py-3">Total</th>
              <th className="text-left px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {pedidos.slice(0,10).map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-brand-600">{p.numero}</td>
                  <td className="px-5 py-3">{p.cliente}</td>
                  <td className="px-5 py-3">R$ {Number(p.total).toFixed(2).replace('.', ',')}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs ${COR[p.status]}`}>{STATUS[p.status]}</span></td>
                </tr>
              ))}
              {pedidos.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">Nenhum pedido ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
