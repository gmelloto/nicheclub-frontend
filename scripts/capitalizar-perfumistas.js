/**
 * Script para capitalizar nomes dos perfumistas (perfumista1, perfumista2)
 *
 * Uso: TOKEN=seu_token_admin node scripts/capitalizar-perfumistas.js
 */

const BASE = 'https://nicheclub-backend-production.up.railway.app/api';
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error('Erro: defina a variável TOKEN.\nUso: TOKEN=seu_token node scripts/capitalizar-perfumistas.js');
  process.exit(1);
}

function capitalizar(nome) {
  if (!nome || !nome.trim()) return nome;
  return nome.trim().split(/\s+/).map(p =>
    p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
  ).join(' ');
}

async function main() {
  console.log('Buscando perfumes...');

  let pagina = 1;
  let todos = [];
  while (true) {
    const res = await fetch(`${BASE}/perfumes?pagina=${pagina}&limite=100`);
    const data = await res.json();
    const lista = data.perfumes || data;
    if (!lista.length) break;
    todos.push(...lista);
    if (lista.length < 100) break;
    pagina++;
  }

  console.log(`Total de perfumes: ${todos.length}`);

  let atualizados = 0;
  for (const p of todos) {
    const p1 = p.perfumista1 || '';
    const p2 = p.perfumista2 || '';
    const p1Cap = capitalizar(p1);
    const p2Cap = capitalizar(p2);

    if (p1Cap === p1 && p2Cap === p2) continue;

    const body = {};
    if (p1Cap !== p1) body.perfumista1 = p1Cap;
    if (p2Cap !== p2) body.perfumista2 = p2Cap;

    console.log(`  ${p.nome} (${p.marca})`);
    if (p1Cap !== p1) console.log(`    perfumista1: "${p1}" → "${p1Cap}"`);
    if (p2Cap !== p2) console.log(`    perfumista2: "${p2}" → "${p2Cap}"`);

    const res = await fetch(`${BASE}/admin/perfumes/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`    ERRO: ${res.status} - ${err}`);
    } else {
      atualizados++;
    }
  }

  console.log(`\nConcluído! ${atualizados} perfume(s) atualizado(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });
