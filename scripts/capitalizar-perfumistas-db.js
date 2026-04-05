/**
 * Script para capitalizar nomes dos perfumistas direto no PostgreSQL
 *
 * Uso: DATABASE_URL=postgresql://... node scripts/capitalizar-perfumistas-db.js
 */

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Erro: defina DATABASE_URL.\nUso: DATABASE_URL=postgresql://... node scripts/capitalizar-perfumistas-db.js');
  process.exit(1);
}

async function main() {
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  await client.connect();
  console.log('Conectado ao banco.\n');

  // Buscar perfumistas atuais
  const { rows } = await client.query(
    `SELECT id, nome, marca, perfumista1, perfumista2 FROM perfumes WHERE perfumista1 IS NOT NULL OR perfumista2 IS NOT NULL`
  );

  console.log(`Perfumes com perfumista: ${rows.length}\n`);

  function capitalizar(nome) {
    if (!nome || !nome.trim()) return nome;
    return nome.trim().split(/\s+/).map(p =>
      p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    ).join(' ');
  }

  let count = 0;
  for (const r of rows) {
    const p1 = r.perfumista1 || '';
    const p2 = r.perfumista2 || '';
    const p1Cap = capitalizar(p1);
    const p2Cap = capitalizar(p2);

    if (p1Cap === p1 && p2Cap === p2) continue;

    await client.query(
      `UPDATE perfumes SET perfumista1 = $1, perfumista2 = $2 WHERE id = $3`,
      [p1Cap || null, p2Cap || null, r.id]
    );

    console.log(`  ${r.nome} (${r.marca})`);
    if (p1Cap !== p1) console.log(`    perfumista1: "${p1}" → "${p1Cap}"`);
    if (p2Cap !== p2) console.log(`    perfumista2: "${p2}" → "${p2Cap}"`);
    count++;
  }

  console.log(`\nConcluído! ${count} perfume(s) atualizado(s).`);
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
