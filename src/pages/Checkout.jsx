import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Checkout() {
  const { itens, total, limpar } = useCart();
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [metodo, setMetodo] = useState('pix');
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    nome: '', email: '', cpf: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  });

  function mascaraCPF(v) {
    return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
  }
  function mascaraTel(v) {
    const d = v.replace(/\D/g,'').slice(0,11);
    return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3') : d.replace(/(\d{2})(\d{4})(\d{4})/,'($1) $2-$3');
  }
  function mascaraCEP(v) {
    return v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d{3})/,'$1-$2');
  }

  async function buscarCEP(cep) {
    const c = cep.replace(/\D/g,'');
    if (c.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const d = await r.json();
      if (!d.erro) setForm(f => ({ ...f, rua: d.logradouro, bairro: d.bairro, cidade: d.localidade, uf: d.uf }));
    } catch {}
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cpf') v = mascaraCPF(value);
    if (name === 'telefone') v = mascaraTel(value);
    if (name === 'cep') { v = mascaraCEP(value); if (v.replace(/\D/g,'').length === 8) buscarCEP(v); }
    setForm(f => ({ ...f, [name]: v }));
  }

  async function finalizar() {
    setEnviando(true);
    try {
      const { data } = await api.post('/api/pedidos', {
        cliente: { nome: form.nome, email: form.email, cpf: form.cpf, telefone: form.telefone },
        endereco: { cep: form.cep, rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, uf: form.uf },
        itens: itens.map(i => ({ perfume_id: i.perfume_id, tamanho: i.tamanho })),
        metodo_pagamento: metodo,
      });
      limpar();
      navigate(`/confirmacao/${data.pedido.numero}`, { state: { pagamento: data.pagamento } });
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao finalizar pedido.');
    } finally {
      setEnviando(false);
    }
  }

  if (itens.length === 0) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => {}} />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 mb-4">Seu carrinho está vazio.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-400 text-white rounded-xl">Ver catálogo</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartClick={() => {}} />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex gap-4 mb-8">
          {['Entrega', 'Pagamento', 'Confirmação'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${passo > i+1 ? 'bg-green-100 text-green-700' : passo === i+1 ? 'bg-brand-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {passo > i+1 ? '✓' : i+1}
              </div>
              <span className={`text-sm ${passo === i+1 ? 'text-brand-600 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200 ml-1" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {passo === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold mb-2">Dados pessoais</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">Nome completo</label><input name="nome" value={form.nome} onChange={handleChange} placeholder="Maria Silva" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">CPF</label><input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Telefone / WhatsApp</label><input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(11) 90000-0000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">E-mail</label><input name="email" value={form.email} onChange={handleChange} type="email" placeholder="maria@email.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                </div>
                <h2 className="font-semibold pt-2">Endereço de entrega</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-400 mb-1 block">CEP</label><input name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Estado</label><input name="uf" value={form.uf} onChange={handleChange} placeholder="SP" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">Cidade</label><input name="cidade" value={form.cidade} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Rua</label><input name="rua" value={form.rua} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Número</label><input name="numero" value={form.numero} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                  <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">Complemento</label><input name="complemento" value={form.complemento} onChange={handleChange} placeholder="Apto 12 (opcional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" /></div>
                </div>
                <button onClick={() => setPasso(2)} className="w-full py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors mt-2">Continuar para pagamento</button>
              </div>
            )}

            {passo === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold mb-4">Forma de pagamento</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[['pix','🔑','Pix','Aprovação imediata'],['cartao_credito','💳','Cartão','Até 12x']].map(([val,ico,label,sub]) => (
                    <button key={val} onClick={() => setMetodo(val)} className={`p-4 rounded-xl border text-left transition-all ${metodo===val ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-200'}`}>
                      <div className="text-2xl mb-1">{ico}</div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-gray-400">{sub}</div>
                    </button>
                  ))}
                </div>
                {metodo === 'pix' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 mb-4">
                    O QR Code Pix será gerado após confirmar o pedido. Válido por 30 minutos.
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setPasso(1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">← Voltar</button>
                  <button onClick={finalizar} disabled={enviando} className="flex-1 py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors">
                    {enviando ? 'Processando...' : 'Confirmar pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
            <h3 className="font-semibold mb-4">Resumo</h3>
            <div className="space-y-3 mb-4">
              {itens.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{i.nome} <span className="text-gray-400">({i.tamanho === 'apc' ? 'APC' : i.tamanho})</span></span>
                  <span>R$ {i.preco.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-gray-400 pt-2 border-t">
                <span>Frete</span><span>R$ 18,90</span>
              </div>
            </div>
            <div className="flex justify-between font-semibold pt-3 border-t">
              <span>Total</span>
              <span>R$ {(total + 18.90).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
