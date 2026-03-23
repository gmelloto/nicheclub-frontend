import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

export default function AdminEstoque() {
  const [frascos, setFrascos] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ perfume_id: '', ml_total: '', lote: '' });
  const [perfumes, setPerfumes] = useState([]);

  useEffect(() => {
    api.get('/api/estoque').then(r => setFrascos(r.data)).catch(() => {});
    api.get('/api/perfumes').then(r => setPerfumes(r.data)).catch(() => {});
  }, []);

  async function adicionarFrasco(e) {
    e.preventDefault();
    await api.post(`/api/perfumes/${form.perfume_id}/frascos`, { ml_total: form.ml_total, lote: form.lote });
    setModal(false);
    api.get('/api/estoque').then(r => setFrascos(r.data));
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Controle de estoque</h1>
          <button onClick={() => setModal(true)} className="px-4 py-2 bg-brand-400 text-white rounded-xl text-sm font-medium hover:bg-brand-600">+ Novo frasco</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-3">Perfume</th>
              <th className="text-left px-5 py-3">Marca</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Vendido</th>
              <th className="px-5 py-3 w-40">Disponível</th>
              <th className="px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {frascos.map(f => {
                const pct = Math.round((Number(f.ml_vendido) / Number(f.ml_total)) * 100);
                const cls = pct >= 80 ? 'bg-red-50 text-red-600' : pct >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700';
                const label = pct >= 80 ? 'Crítico' : pct >= 60 ? 'Atenção' : 'OK';
                return (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{f.perfume}</td>
                    <td className="px-5 py-3 text-gray-400">{f.marca}</td>
                    <td className="px-5 py-3 text-center">{f.ml_total}ml</td>
                    <td className="px-5 py-3 text-center">{f.ml_vendido}ml</td>
                    <td className="px-5 py-3">
                      <div className="h-1.5 bg-gray-100 rounded-full mb-1">
                        <div className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-brand-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs text-gray-400 text-center">{f.ml_disponivel}ml restantes</div>
                    </td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-semibold mb-4">Adicionar frasco</h2>
            <form onSubmit={adicionarFrasco} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Perfume</label>
                <select value={form.perfume_id} onChange={e => setForm(f => ({...f, perfume_id: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required>
                  <option value="">Selecione...</option>
                  {perfumes.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.marca}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">ML total do frasco</label>
                <input type="number" value={form.ml_total} onChange={e => setForm(f => ({...f, ml_total: e.target.value}))} placeholder="100" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Lote (opcional)</label>
                <input value={form.lote} onChange={e => setForm(f => ({...f, lote: e.target.value}))} placeholder="LOTE-001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-brand-400 text-white rounded-xl text-sm font-medium">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
