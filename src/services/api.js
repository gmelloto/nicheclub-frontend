const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

export const api = {
  login: (email, senha) => req('POST', '/auth/login', { email, senha }),
  perfumes: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req('GET', `/perfumes${q ? '?' + q : ''}`);
  },
  perfume: (id) => req('GET', `/perfumes/${id}`),
  criarPedido: (payload) => req('POST', '/pedidos', payload),
  reservar: (data) => req('POST', '/reservas', data),
  notasBatch: (nomes) => req('POST', '/notas/batch', { nomes }),
  // Admin
  adminMarcas: (q) => req('GET', `/admin/marcas?q=${encodeURIComponent(q)}`),
  adminBuscaPerfume: (marca, q) => req('GET', `/admin/busca-perfume?marca=${encodeURIComponent(marca)}&q=${encodeURIComponent(q)}`),
  adminFragrantica: (marca, nome) => req('GET', `/admin/fragrantica?marca=${encodeURIComponent(marca)}&nome=${encodeURIComponent(nome)}`),
  adminUploadFoto: (data) => req('POST', '/admin/upload-foto', data),
  adminCadastrarPerfume: (data) => req('POST', '/admin/perfumes', data),
  notas: () => req('GET', '/notas'),
  reservasPerfume: (id) => req('GET', `/reservas/${id}`),
  frascos: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req('GET', `/frascos${q ? '?' + q : ''}`);
  },
  buscarPedido: (numero) => req('GET', `/pedidos/${numero}`),
  listarPedidos: (token, status) => req('GET', `/pedidos${status ? `?status=${status}` : ''}`, null, token),
  atualizarStatus: (token, id, status, rastreio) =>
    req('PATCH', `/pedidos/${id}/status`, { status, codigo_rastreio: rastreio }, token),
  estoque: (token) => req('GET', '/estoque', null, token),
  adicionarPerfume: (token, data) => req('POST', '/perfumes', data, token),
  adicionarFrasco: (token, id, ml, lote) =>
    req('POST', `/perfumes/${id}/frascos`, { ml_total: ml, lote }, token),
  conversas: (token) => req('GET', '/whatsapp/conversas', null, token),
  mensagens: (token, id) => req('GET', `/whatsapp/conversas/${id}/mensagens`, null, token),
  enviarMensagem: (token, id, texto) =>
    req('POST', `/whatsapp/conversas/${id}/mensagens`, { texto }, token),
  broadcast: (token, mensagem, destino) =>
    req('POST', '/whatsapp/broadcast', { mensagem, destino }, token),
};
