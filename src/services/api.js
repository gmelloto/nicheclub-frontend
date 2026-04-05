const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('nc_token');
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
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
  lacrados: (params) => req('GET', '/lacrados?' + new URLSearchParams(params).toString()),
  // Admin - Notas
  adminNotas: (q, pagina) => req('GET', `/admin/notas?q=${encodeURIComponent(q||'')}&pagina=${pagina||1}&limite=20`),
  adminNotasImportar: (data) => req('POST', '/admin/notas/importar', data),
  adminNotasAtualizar: (id, data) => req('PATCH', `/admin/notas/${id}`, data),
  adminNotasDeletar: (id) => req('DELETE', `/admin/notas/${id}`),
  adminNotasFixImages: () => req('POST', '/admin/notas/fix-images'),
  // Admin - Produtos
  adminMarcas: (q) => req('GET', `/admin/marcas?q=${encodeURIComponent(q)}`),
  adminBuscaPerfume: (marca, q) => req('GET', `/admin/busca-perfume?marca=${encodeURIComponent(marca)}&q=${encodeURIComponent(q)}`),
  adminFragrantica: (marca, nome) => req('GET', `/admin/fragrantica?marca=${encodeURIComponent(marca)}&nome=${encodeURIComponent(nome)}`),
  adminUploadFoto: (data) => req('POST', '/admin/upload-foto', data),
  adminCadastrarPerfume: (data, token) => req('POST', '/admin/perfumes', data, token),
  notas: () => req('GET', '/notas'),
  reservasPerfume: (id) => req('GET', `/reservas/${id}`),
  frascos: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req('GET', `/frascos${q ? '?' + q : ''}`);
  },
  buscarPedido: (numero) => req('GET', `/pedidos/${numero}`),
  scrapeFragrantica: (url) => req('GET', `/admin/scrape-fragrantica?url=${encodeURIComponent(url)}`),
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
