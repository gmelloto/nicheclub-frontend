import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

export default function AdminWhatsApp() {
  const [conversas, setConversas] = useState([]);
  const [ativa, setAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [broadcast, setBroadcast] = useState('');

  useEffect(() => { api.get('/api/whatsapp/conversas').then(r => setConversas(r.data)).catch(() => {}); }, []);

  async function abrirConversa(c) {
    setAtiva(c);
    const { data } = await api.get(`/api/whatsapp/conversas/${c.id}/mensagens`);
    setMensagens(data);
  }

  async function enviar() {
    if (!texto.trim() || !ativa) return;
    await api.post(`/api/whatsapp/conversas/${ativa.id}/mensagens`, { texto });
    setTexto('');
    const { data } = await api.get(`/api/whatsapp/conversas/${ativa.id}/mensagens`);
    setMensagens(data);
  }

  async function enviarBroadcast() {
    if (!broadcast.trim()) return;
    await api.post('/api/whatsapp/broadcast', { mensagem: broadcast, destino: 'grupo_ofertas' });
    setBroadcast('');
    alert('Mensagem enviada!');
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">WhatsApp</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 text-sm font-medium">Conversas</div>
            {conversas.length === 0 ? (
              <p className="p-4 text-xs text-gray-400">Nenhuma conversa ainda.</p>
            ) : conversas.map(c => (
              <div key={c.id} onClick={() => abrirConversa(c)} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${ativa?.id === c.id ? 'bg-brand-50' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600">
                    {(c.cliente_nome || c.telefone).slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.cliente_nome || c.telefone}</p>
                    {c.nao_lidas > 0 && <span className="text-xs bg-brand-400 text-white px-1.5 rounded-full">{c.nao_lidas}</span>}
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate pl-10">{c.ultima_msg}</p>
              </div>
            ))}
          </div>

          <div className="col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-gray-100 flex flex-col" style={{ height: '360px' }}>
              {ativa ? (
                <>
                  <div className="p-4 border-b border-gray-100 text-sm font-medium">{ativa.cliente_nome || ativa.telefone}</div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {mensagens.map(m => (
                      <div key={m.id} className={`flex ${m.direcao === 'saida' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.direcao === 'saida' ? 'bg-brand-400 text-white' : m.enviado_por === 'bot' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800'}`}>
                          {m.conteudo}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-3">
                    <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === 'Enter' && enviar()} placeholder="Digite uma mensagem..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                    <button onClick={enviar} className="px-4 py-2 bg-brand-400 text-white rounded-xl text-sm hover:bg-brand-600">Enviar</button>
                  </div>
                </>
              ) : <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Selecione uma conversa</div>}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-medium text-sm mb-3">Enviar oferta para o grupo</h3>
              <textarea value={broadcast} onChange={e => setBroadcast(e.target.value)} placeholder="Digite sua mensagem de oferta..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:outline-none focus:border-brand-400 mb-3" />
              <button onClick={enviarBroadcast} className="px-5 py-2 bg-brand-400 text-white rounded-xl text-sm font-medium hover:bg-brand-600">Enviar para o grupo</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
