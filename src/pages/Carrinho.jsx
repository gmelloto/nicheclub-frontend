import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { api } from '../services/api';
import './Carrinho.css';

export default function Carrinho() {
  const { items, remover, limpar, total } = useCart();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState('carrinho'); // carrinho | dados | pagamento | confirmacao
  const [metodo, setMetodo] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    nome: '', email: '', cpf: '', telefone: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const frete = 18.90;
  const totalFinal = total + frete;

  async function finalizarPedido() {
    setLoading(true);
    setErro('');
    try {
      const resultado = await api.criarPedido({
        cliente: { nome: form.nome, email: form.email, cpf: form.cpf, telefone: form.telefone },
        endereco: { cep: form.cep, rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, uf: form.uf },
        itens: items.map(i => ({ perfume_id: i.perfume_id, tamanho: i.tamanho })),
        metodo_pagamento: metodo,
      });
      setPedido(resultado);
      limpar();
      setEtapa('confirmacao');
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (etapa === 'confirmacao' && pedido) return <Confirmacao pedido={pedido} />;

  if (items.length === 0 && etapa === 'carrinho') return (
    <div className="carrinho-page">
      <div className="carrinho-inner">
        <div className="carrinho-vazio">
          <p className="gold" style={{ fontSize: '3rem', marginBottom: '1rem' }}>◈</p>
          <h2>Carrinho vazio</h2>
          <p className="muted" style={{ margin: '1rem 0 2rem' }}>Adicione fragrâncias ao seu carrinho para continuar.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '12px 32px' }}>
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="carrinho-page">
      <div className="carrinho-inner">
        <div className="checkout-steps">
          {['Carrinho', 'Dados', 'Pagamento'].map((s, i) => (
            <div key={s} className={`checkout-step ${etapa === s.toLowerCase() || (i === 0 && etapa === 'carrinho') ? 'active' : ''}`}>
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {etapa === 'carrinho' && (
              <div className="fade-in">
                <h2 style={{ marginBottom: '1.5rem' }}>Seu carrinho</h2>
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <p className="caps muted small">{item.marca}</p>
                      <p className="cart-item-nome">{item.nome}</p>
                      <p className="small muted">{item.tamanho === 'apc' ? 'APC — Frasco completo' : item.tamanho}</p>
                    </div>
                    <div className="cart-item-actions">
                      <span className="gold">R$ {Number(item.preco).toFixed(2).replace('.', ',')}</span>
                      <button className="remove-btn" onClick={() => remover(item.id)}>×</button>
                    </div>
                  </div>
                ))}
                <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => setEtapa('dados')}>
                  Continuar
                </button>
              </div>
            )}

            {etapa === 'dados' && (
              <div className="fade-in">
                <h2 style={{ marginBottom: '1.5rem' }}>Dados de entrega</h2>
                <div className="form-grid">
                  <div className="form-field full"><label>Nome completo</label><input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Maria Silva" /></div>
                  <div className="form-field full"><label>E-mail</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="maria@email.com" /></div>
                  <div className="form-field"><label>CPF</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" /></div>
                  <div className="form-field"><label>Telefone / WhatsApp</label><input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 90000-0000" /></div>
                  <div className="form-field"><label>CEP</label><input value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" /></div>
                  <div className="form-field"><label>Estado</label><input value={form.uf} onChange={e => set('uf', e.target.value)} placeholder="SP" /></div>
                  <div className="form-field full"><label>Cidade</label><input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="São Paulo" /></div>
                  <div className="form-field full"><label>Rua</label><input value={form.rua} onChange={e => set('rua', e.target.value)} placeholder="Rua das Flores" /></div>
                  <div className="form-field"><label>Número</label><input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" /></div>
                  <div className="form-field"><label>Complemento</label><input value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto 12 (opcional)" /></div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn-outline" onClick={() => setEtapa('carrinho')}>Voltar</button>
                  <button className="btn-primary" onClick={() => setEtapa('pagamento')}>Continuar</button>
                </div>
              </div>
            )}

            {etapa === 'pagamento' && (
              <div className="fade-in">
                <h2 style={{ marginBottom: '1.5rem' }}>Pagamento</h2>
                <div className="metodos-grid">
                  <button className={`metodo-btn ${metodo === 'pix' ? 'active' : ''}`} onClick={() => setMetodo('pix')}>
                    <span className="metodo-icon">⬡</span>
                    <div><p className="metodo-nome">Pix</p><p className="small muted">Aprovação imediata</p></div>
                  </button>
                  <button className={`metodo-btn ${metodo === 'cartao_credito' ? 'active' : ''}`} onClick={() => setMetodo('cartao_credito')}>
                    <span className="metodo-icon">◻</span>
                    <div><p className="metodo-nome">Cartão de crédito</p><p className="small muted">Até 12x</p></div>
                  </button>
                </div>
                {erro && <p className="erro-msg">{erro}</p>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn-outline" onClick={() => setEtapa('dados')}>Voltar</button>
                  <button className="btn-primary" onClick={finalizarPedido} disabled={loading}>
                    {loading ? 'Processando...' : 'Finalizar pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <div className="card">
              <p className="caps muted" style={{ marginBottom: '1rem' }}>Resumo</p>
              {items.map(i => (
                <div key={i.id} className="summary-line">
                  <span className="muted small">{i.nome} ({i.tamanho})</span>
                  <span className="small">R$ {Number(i.preco).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="summary-line">
                <span className="muted small">Frete</span>
                <span className="small">R$ {frete.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="divider" />
              <div className="summary-total">
                <span>Total</span>
                <span className="gold" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.3rem' }}>
                  R$ {totalFinal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Confirmacao({ pedido }) {
  return (
    <div className="carrinho-page">
      <div className="carrinho-inner">
        <div className="confirmacao-box fade-in">
          <div className="confirmacao-icon">◈</div>
          <h2>Pedido confirmado</h2>
          <p className="muted" style={{ margin: '1rem 0' }}>
            Você receberá atualizações por WhatsApp e e-mail.
          </p>
          <p className="gold caps small" style={{ marginBottom: '2rem' }}>
            {pedido.pedido?.numero}
          </p>
          {pedido.pagamento?.pix_copia_cola && (
            <div className="pix-box">
              <p className="small muted" style={{ marginBottom: '8px' }}>Código Pix (copia e cola)</p>
              <p className="pix-code">{pedido.pagamento.pix_copia_cola}</p>
            </div>
          )}
          <Link to="/" className="btn-outline" style={{ marginTop: '2rem', display: 'inline-block', width: 'auto', padding: '12px 32px' }}>
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
