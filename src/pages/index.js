const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { autenticar, apenasAdmin } = require('../middlewares/auth');
const estoque = require('../services/estoque');
const pedidosCtrl = require('../controllers/pedidos');
const webhooksCtrl = require('../controllers/webhooks');
const whatsapp = require('../services/whatsapp');

// ─── AUTH ────────────────────────────────────────────────────────────────────

router.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const { rows: [user] } = await db.query(
    `SELECT * FROM usuarios WHERE email=$1 AND ativo=TRUE`, [email]
  );
  if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }
  const token = jwt.sign(
    { id: user.id, nome: user.nome, papel: user.papel },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.json({ token, usuario: { id: user.id, nome: user.nome, papel: user.papel } });
});

// ─── CATÁLOGO / ESTOQUE ──────────────────────────────────────────────────────

router.get('/perfumes', async (req, res) => {
  const { pagina = 1, limite = 12, busca = '', genero = '', acorde = '' } = req.query;
  const resultado = await estoque.listarPerfumes({ pagina: Number(pagina), limite: Number(limite), busca, genero, acorde });
  res.json(resultado);
});

// Listar frascos com join em perfumes
router.get('/frascos', async (req, res) => {
  try {
    const { pagina = 1, limite = 12, busca = '', disponivel } = req.query;
    const offset = (Number(pagina) - 1) * Number(limite);
    const params = [];
    const wheres = ['f.ativo = TRUE', 'f.ml_total - f.ml_vendido > 0'];

    if (busca) {
      params.push(`%${busca.toLowerCase()}%`);
      wheres.push(`(LOWER(p.nome) LIKE $${params.length} OR LOWER(p.marca) LIKE $${params.length})`);
    }

    const where = wheres.join(' AND ');
    const countParams = [...params];
    params.push(Number(limite));
    params.push(offset);

    const { rows } = await db.query(`
      SELECT
        f.id, f.ml_total, f.ml_vendido, f.lote, f.criado_em,
        f.ml_total - f.ml_vendido AS ml_disponivel,
        p.id AS perfume_id, p.nome, p.marca, p.foto_url,
        p.genero, p.ano, p.pais, p.rating_valor, p.rating_count,
        p.familia_olfativa, p.acorde1, p.acorde2, p.acorde3, p.acorde4, p.acorde5,
        p.notas_topo, p.notas_coracao, p.notas_base,
        p.descricao, p.slug,
        json_agg(
          json_build_object('tamanho', pr.tamanho, 'preco', pr.preco, 'ml', pr.ml_quantidade)
          ORDER BY pr.ml_quantidade
        ) FILTER (WHERE pr.id IS NOT NULL) AS opcoes
      FROM frascos f
      JOIN perfumes p ON p.id = f.perfume_id AND p.ativo = TRUE
      LEFT JOIN precos pr ON pr.perfume_id = p.id
      WHERE ${where}
      GROUP BY f.id, p.id
      ORDER BY f.ml_total - f.ml_vendido DESC, p.rating_valor DESC NULLS LAST
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const { rows: [{ total }] } = await db.query(
      `SELECT COUNT(*) AS total FROM frascos f JOIN perfumes p ON p.id = f.perfume_id AND p.ativo = TRUE WHERE ${where}`,
      countParams
    );

    res.json({ frascos: rows, total: Number(total), pagina: Number(pagina), limite: Number(limite) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});



// Listar perfumes lacrados (com estoque > 0)
router.get('/lacrados', async (req, res) => {
  try {
    const { pagina = 1, limite = 12, busca = '' } = req.query;
    const offset = (Number(pagina) - 1) * Number(limite);
    const params = [];
    const wheres = ['e.ativo = TRUE', 'e.quantidade > 0', "e.tipo = 'lacrado'"];

    if (busca) {
      params.push(`%${busca.toLowerCase()}%`);
      wheres.push(`(LOWER(p.nome) LIKE $${params.length} OR LOWER(p.marca) LIKE $${params.length})`);
    }

    const where = wheres.join(' AND ');
    const countParams = [...params];
    params.push(Number(limite));
    params.push(offset);

    const { rows } = await db.query(`
      SELECT
        p.id, p.nome, p.marca, p.foto_url, p.genero, p.ano, p.pais,
        p.rating_valor, p.rating_count, p.familia_olfativa,
        p.acorde1, p.acorde2, p.acorde3, p.acorde4, p.acorde5,
        p.notas_topo, p.notas_coracao, p.notas_base, p.slug,
        SUM(e.quantidade) AS quantidade_total,
        MIN(e.preco) AS preco_min,
        STRING_AGG(DISTINCT e.ml_volume::text, ', ' ORDER BY e.ml_volume::text) AS volumes
      FROM estoque e
      JOIN perfumes p ON p.id = e.perfume_id AND p.ativo = TRUE
      WHERE ${where}
      GROUP BY p.id
      ORDER BY p.rating_valor DESC NULLS LAST
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const { rows: [{ total }] } = await db.query(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM estoque e JOIN perfumes p ON p.id = e.perfume_id AND p.ativo = TRUE
       WHERE ${where}`,
      countParams
    );

    res.json({ lacrados: rows, total: Number(total), pagina: Number(pagina), limite: Number(limite) });
  } catch(err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/perfumes/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.*,
        COALESCE(
          json_agg(
            json_build_object('tamanho', pr.tamanho, 'preco', pr.preco, 'ml_quantidade', pr.ml_quantidade)
            ORDER BY pr.ml_quantidade
          ) FILTER (WHERE pr.id IS NOT NULL), '[]'
        ) AS opcoes,
        COALESCE(SUM(f.ml_total - f.ml_vendido) FILTER (WHERE f.ativo = TRUE), 0) AS ml_disponivel,
        COALESCE(SUM(f.ml_total) FILTER (WHERE f.ativo = TRUE), 0) AS ml_total
      FROM perfumes p
      LEFT JOIN precos pr ON pr.perfume_id = p.id
      LEFT JOIN frascos f ON f.perfume_id = p.id AND f.ativo = TRUE
      WHERE p.id = $1 AND p.ativo = TRUE
      GROUP BY p.id
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ erro: 'Perfume nao encontrado.' });

    const perfume = rows[0];

    // Coleta todas as notas unicas (pode estar em PT ou EN)
    const notas = [
      ...(perfume.notas_topo    || '').split(','),
      ...(perfume.notas_coracao || '').split(','),
      ...(perfume.notas_base    || '').split(','),
    ].map(n => n.trim().toLowerCase()).filter(Boolean);

    // Busca imagens por nota_en OU nota_pt — suporta ambos os idiomas
    let notas_imagens = {};
    if (notas.length > 0) {
      const { rows: notasRows } = await db.query(
        `SELECT nota_en, nota_pt, cloudinary_url FROM notas_olfativas WHERE LOWER(nota_en) = ANY($1::text[]) OR LOWER(nota_pt) = ANY($1::text[])`,
        [notas]
      );
      for (const n of notasRows) {
        if (n.nota_en) notas_imagens[n.nota_en.toLowerCase()] = n.cloudinary_url;
        if (n.nota_pt) notas_imagens[n.nota_pt.toLowerCase()] = n.cloudinary_url;
      }
    }

    perfume.notas_imagens = notas_imagens;
    res.json(perfume);
  } catch(err) {
    res.status(500).json({ erro: err.message });
  }
});
router.post('/perfumes', autenticar, apenasAdmin, async (req, res) => {
  const { nome, marca, familia_olfativa, descricao, foto_url, precos } = req.body;
  const { rows: [p] } = await db.query(
    `INSERT INTO perfumes (nome, marca, familia_olfativa, descricao, foto_url)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [nome, marca, familia_olfativa, descricao, foto_url]
  );
  if (precos?.length) {
    for (const pr of precos) {
      await db.query(
        `INSERT INTO precos (perfume_id, tamanho, ml_quantidade, preco) VALUES ($1,$2,$3,$4)
         ON CONFLICT (perfume_id, tamanho) DO UPDATE SET preco=EXCLUDED.preco`,
        [p.id, pr.tamanho, pr.ml_quantidade, pr.preco]
      );
    }
  }
  res.status(201).json(p);
});

// Admin: adicionar frasco
router.post('/perfumes/:id/frascos', autenticar, apenasAdmin, async (req, res) => {
  const { ml_total, lote } = req.body;
  const frasco = await estoque.adicionarFrasco(req.params.id, ml_total, lote);
  res.status(201).json(frasco);
});

// Admin: listar frascos com estoque
router.get('/estoque', autenticar, async (req, res) => {
  const { rows } = await db.query(`
    SELECT f.id, f.lote, f.ml_total, f.ml_vendido,
           f.ml_total - f.ml_vendido AS ml_disponivel,
           p.nome AS perfume, p.marca
    FROM frascos f JOIN perfumes p ON p.id = f.perfume_id
    WHERE f.ativo = TRUE
    ORDER BY p.nome, f.criado_em
  `);
  res.json(rows);
});

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────


// Reserva simples — nome + telefone + tamanho ou ml avulso
router.post('/reservas', async (req, res) => {
  const { perfume_id, nome, telefone, tamanho, ml_avulso } = req.body;
  if (!perfume_id || !nome || !telefone) {
    return res.status(400).json({ erro: 'Nome, telefone e perfume são obrigatórios.' });
  }
  if (!tamanho && !ml_avulso) {
    return res.status(400).json({ erro: 'Escolha um tamanho ou quantidade avulsa.' });
  }
  try {
    // Busca perfume e preço
    const { rows: [perfume] } = await db.query('SELECT nome, marca FROM perfumes WHERE id=$1', [perfume_id]);
    if (!perfume) return res.status(404).json({ erro: 'Perfume não encontrado.' });

    let ml_quantidade, preco_total, tamanho_label;

    if (tamanho) {
      const { rows: [preco] } = await db.query(
        'SELECT ml_quantidade, preco FROM precos WHERE perfume_id=$1 AND tamanho=$2',
        [perfume_id, tamanho]
      );
      if (!preco) return res.status(400).json({ erro: 'Tamanho indisponível.' });
      ml_quantidade = Number(preco.ml_quantidade);
      preco_total = Number(preco.preco);
      tamanho_label = tamanho.toUpperCase();
    } else {
      // Busca preço por ml avulso
      const { rows: [p] } = await db.query(
        'SELECT preco_ml FROM perfumes WHERE id=$1', [perfume_id]
      );
      ml_quantidade = Number(ml_avulso);
      preco_total = ml_quantidade * (p?.preco_ml || 0);
      tamanho_label = `${ml_quantidade}ml avulso`;
    }

    // Verifica disponibilidade
    const { rows: [est] } = await db.query(
      'SELECT COALESCE(SUM(ml_total - ml_vendido),0) AS disponivel FROM frascos WHERE perfume_id=$1 AND ativo=TRUE',
      [perfume_id]
    );
    if (Number(est.disponivel) < ml_quantidade) {
      return res.status(400).json({ erro: 'Estoque insuficiente.' });
    }

    // Salva reserva
    const { rows: [reserva] } = await db.query(`
      INSERT INTO reservas (perfume_id, nome, telefone, tamanho, ml_quantidade, preco_total, status)
      VALUES ($1,$2,$3,$4,$5,$6,'pendente') RETURNING *
    `, [perfume_id, nome.trim(), telefone.replace(/\D/g,''), tamanho_label, ml_quantidade, preco_total]);

    res.json({ sucesso: true, reserva_id: reserva.id, mensagem: `Reserva confirmada! Entraremos em contato pelo WhatsApp.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Listar reservas de um perfume
router.get('/reservas/:perfume_id', async (req, res) => {
  const { rows } = await db.query(
    `SELECT nome, tamanho, ml_quantidade, criado_em FROM reservas WHERE perfume_id=$1 AND status != 'cancelada' ORDER BY criado_em DESC`,
    [req.params.perfume_id]
  );
  res.json(rows);
});


// Buscar imagem de uma nota olfativa
router.get('/notas', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT nota_en, nota_ptb, cloudinary_url, photo_url
      FROM notas_olfativas
      ORDER BY nota_ptb
    `);
    res.json(rows);
  } catch(err) {
    res.status(500).json({ erro: err.message });
  }
});


// Buscar imagem de nota olfativa
router.get('/notas', async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.json([]);

    const { rows } = await db.query(`
      SELECT nota_en, nota_ptb, cloudinary_url, photo_url
      FROM notas_olfativas
      WHERE LOWER(nota_ptb) = LOWER($1)
         OR LOWER(nota_en) = LOWER($1)
      LIMIT 1
    `, [nome.trim()]);

    res.json(rows[0] || null);
  } catch(err) {
    res.status(500).json({ erro: err.message });
  }
});

// Buscar várias notas de uma vez
router.post('/notas/batch', async (req, res) => {
  try {
    const { nomes } = req.body;
    if (!nomes?.length) return res.json([]);

    // Busca cada nota individualmente para máxima flexibilidade
    const resultados = [];
    const vistos = new Set();

    for (const nome of nomes) {
      const n = nome.toLowerCase().trim();
      const { rows } = await db.query(`
        SELECT nota_en, nota_ptb, cloudinary_url, photo_url
        FROM notas_olfativas
        WHERE LOWER(nota_ptb) = $1
           OR LOWER(nota_en) = $1
           OR LOWER(nota_ptb) LIKE $2
           OR LOWER(nota_en) LIKE $2
        ORDER BY
          CASE
            WHEN LOWER(nota_ptb) = $1 THEN 1
            WHEN LOWER(nota_en) = $1 THEN 2
            ELSE 3
          END
        LIMIT 1
      `, [n, '%' + n + '%']);

      if (rows.length > 0 && !vistos.has(rows[0].nota_en)) {
        vistos.add(rows[0].nota_en);
        resultados.push({ ...rows[0], nome_original: nome });
      }
    }

    res.json(resultados);
  } catch(err) {
    res.status(500).json({ erro: err.message });
  }
});



// ─── ADMIN: Notas Olfativas ────────────────────────────────────────────────

// Listar notas com busca e paginacao
router.get('/admin/notas', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { q = '', pagina = 1, limite = 20 } = req.query;
    const offset = (Number(pagina) - 1) * Number(limite);
    const where = q ? `WHERE LOWER(nota_en) LIKE LOWER($1) OR LOWER(nota_ptb) LIKE LOWER($1)` : '';
    const params = q ? [`%${q}%`, Number(limite), offset] : [Number(limite), offset];
    const countParams = q ? [`%${q}%`] : [];

    const { rows } = await db.query(`
      SELECT id, nota_en, nota_ptb, cloudinary_url, photo_url, link_fragrantica
      FROM notas_olfativas ${where}
      ORDER BY nota_en
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const { rows: [{ total }] } = await db.query(
      `SELECT COUNT(*) as total FROM notas_olfativas ${where}`,
      countParams
    );

    res.json({ notas: rows, total: Number(total) });
  } catch(e) { res.status(500).json({ erro: e.message }); }
});

// Buscar nota no Fragrantica e importar
router.post('/admin/notas/importar', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { nota_en, fragrantica_id } = req.body;
    if (!nota_en || !fragrantica_id) return res.status(400).json({ erro: 'nota_en e fragrantica_id obrigatorios.' });

    const axios = require('axios');
    const cloudinaryLib = require('cloudinary').v2;
    cloudinaryLib.config({ cloud_name: 'dafksmivt', api_key: '316673358534854', api_secret: 'AoaqcnONhrRieUXsI7aJQb32dJg', secure: true });

    // URL da imagem no Fragrantica
    const imgUrl = `https://fimgs.net/mdimg/sastojci/t.${fragrantica_id}.jpg`;
    const notaUrl = `https://www.fragrantica.com/notes/${nota_en.replace(/\s+/g, '-')}-${fragrantica_id}.html`;

    // Upload para Cloudinary
    const slug = nota_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let cloudinaryUrl;
    try {
      const result = await cloudinaryLib.uploader.upload(imgUrl, {
        folder: 'nicheclub/notas',
        public_id: slug,
        overwrite: false,
        resource_type: 'image',
        transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
      });
      cloudinaryUrl = result.secure_url;
    } catch(e) {
      if (e.message && e.message.includes('already exists')) {
        cloudinaryUrl = `https://res.cloudinary.com/dafksmivt/image/upload/nicheclub/notas/${slug}`;
      } else {
        return res.status(500).json({ erro: `Cloudinary: ${e.message}` });
      }
    }

    // Insere ou atualiza no banco
    const { rows: existe } = await db.query(
      'SELECT id FROM notas_olfativas WHERE LOWER(nota_en) = LOWER($1)', [nota_en]
    );

    let id;
    if (existe.length) {
      await db.query(
        'UPDATE notas_olfativas SET cloudinary_url=$1, photo_url=$2, link_fragrantica=$3 WHERE id=$4',
        [cloudinaryUrl, imgUrl, notaUrl, existe[0].id]
      );
      id = existe[0].id;
    } else {
      const { rows: [nova] } = await db.query(`
        INSERT INTO notas_olfativas (nota_en, nota_ptb, photo_url, cloudinary_url, link_fragrantica)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [nota_en, req.body.nota_ptb || nota_en, imgUrl, cloudinaryUrl, notaUrl]);
      id = nova.id;
    }

    res.json({ sucesso: true, id, cloudinary_url: cloudinaryUrl, photo_url: imgUrl });
  } catch(e) { res.status(500).json({ erro: e.message }); }
});

// Atualizar nota (traducao PT)
router.patch('/admin/notas/:id', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { nota_ptb } = req.body;
    await db.query('UPDATE notas_olfativas SET nota_ptb=$1 WHERE id=$2', [nota_ptb, req.params.id]);
    res.json({ sucesso: true });
  } catch(e) { res.status(500).json({ erro: e.message }); }
});

// Deletar nota
router.delete('/admin/notas/:id', autenticar, apenasAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM notas_olfativas WHERE id=$1', [req.params.id]);
    res.json({ sucesso: true });
  } catch(e) { res.status(500).json({ erro: e.message }); }
});

// ─── ADMIN: Busca marcas ───────────────────────────────────────────────────
router.get('/admin/marcas', autenticar, apenasAdmin, async (req, res) => {
  const { q = '' } = req.query;
  const { rows } = await db.query(`
    SELECT DISTINCT marca FROM perfumes
    WHERE marca ILIKE $1 AND ativo = TRUE
    ORDER BY marca LIMIT 8
  `, [`%${q}%`]);
  res.json(rows.map(r => r.marca));
});

// ─── ADMIN: Busca perfumes por marca ──────────────────────────────────────
router.get('/admin/busca-perfume', autenticar, apenasAdmin, async (req, res) => {
  const { marca = '', q = '' } = req.query;
  const { rows } = await db.query(`
    SELECT id, nome, marca, slug, foto_url, ano, genero
    FROM perfumes
    WHERE marca ILIKE $1 AND nome ILIKE $2 AND ativo = TRUE
    ORDER BY nome LIMIT 8
  `, [`%${marca}%`, `%${q}%`]);
  res.json(rows);
});

// ─── ADMIN: Scraping Fragrantica ───────────────────────────────────────────
router.get('/admin/fragrantica', autenticar, apenasAdmin, async (req, res) => {
  const { marca, nome } = req.query;
  if (!marca || !nome) return res.status(400).json({ erro: 'Informe marca e nome.' });

  try {
    const axios = require('axios');
    const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

    // Busca no Fragrantica
    const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(marca + ' ' + nome)}`;
    const { data: html } = await axios.get(searchUrl, { headers, timeout: 15000 });

    // Extrai primeiro resultado
    const urlMatch = html.match(/href="(\/perfume\/[^"]+\.html)"/);
    if (!urlMatch) return res.json({ encontrado: false });

    const perfumeUrl = 'https://www.fragrantica.com' + urlMatch[1];
    const { data: pHtml } = await axios.get(perfumeUrl, { headers, timeout: 15000 });

    // Dados básicos
    const nomeMatch   = pHtml.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/);
    const fotoMatch   = pHtml.match(/src="(https:\/\/fimgs\.net\/[^"]+mdimg\/perfume\/[^"]+\.jpg)"/);
    const anoMatch    = pHtml.match(/class="[^"]*year[^"]*"[^>]*>(\d{4})/);
    const ratingMatch = pHtml.match(/itemprop="ratingValue"[^>]*>([0-9.]+)/);
    const votosMatch  = pHtml.match(/itemprop="ratingCount"[^>]*>([0-9,]+)/);

    // Gênero
    let genero = null;
    if (pHtml.match(/for (women and men|unisex)/i)) genero = 'Unissex';
    else if (pHtml.match(/for (women|her)/i)) genero = 'Feminino';
    else if (pHtml.match(/for (men|him)/i)) genero = 'Masculino';

    // País (da marca)
    const paisMatch = pHtml.match(/country[^>]*>([^<]+)</i);

    // Perfumistas
    const perfumistas = [];
    const perfumistaRegex = /perfumer[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi;
    let pm;
    while ((pm = perfumistaRegex.exec(pHtml)) !== null && perfumistas.length < 2) {
      const nome_p = pm[1].trim();
      if (nome_p && !perfumistas.includes(nome_p)) perfumistas.push(nome_p);
    }
    // Fallback: buscar na seção de perfumistas
    if (perfumistas.length === 0) {
      const perfSecao = pHtml.match(/Perfumer[^<]*<\/b>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi) || [];
      for (const m of perfSecao) {
        const r = m.match(/<a[^>]*>([^<]+)<\/a>/);
        if (r && perfumistas.length < 2) {
          const nome_p = r[1].trim();
          if (!perfumistas.includes(nome_p)) perfumistas.push(nome_p);
        }
      }
    }

    // Acordes principais
    const acordes = [];
    const acordeRegex = /class="[^"]*accord-bar[^"]*"[^>]*>([^<]+)/gi;
    let am;
    while ((am = acordeRegex.exec(pHtml)) !== null && acordes.length < 5) {
      acordes.push(am[1].trim());
    }
    // Fallback
    if (acordes.length === 0) {
      const acordeAlt = pHtml.match(/vote-button-name[^>]*>([^<]+)/gi) || [];
      for (const m of acordeAlt) {
        const r = m.match(/>([^<]+)/);
        if (r && acordes.length < 5) acordes.push(r[1].trim());
      }
    }

    // Notas olfativas por camada
    let notas_topo = [], notas_coracao = [], notas_base = [];

    // Tentar extrair notas por seção (Top, Heart/Middle, Base)
    const topMatch = pHtml.match(/Top Notes?[\s\S]*?<\/div>/i);
    const midMatch = pHtml.match(/(Heart|Middle) Notes?[\s\S]*?<\/div>/i);
    const baseMatch = pHtml.match(/Base Notes?[\s\S]*?<\/div>/i);

    const extrairNotas = (secao) => {
      if (!secao) return [];
      const nomes = [];
      const re = /alt="([^"]+)"/g;
      let n;
      while ((n = re.exec(secao[0])) !== null) {
        if (n[1] && n[1] !== 'perfume' && n[1].length > 1) nomes.push(n[1].trim());
      }
      return nomes;
    };

    notas_topo = extrairNotas(topMatch);
    notas_coracao = extrairNotas(midMatch);
    notas_base = extrairNotas(baseMatch);

    // Fallback: todas as notas genéricas
    if (!notas_topo.length && !notas_coracao.length && !notas_base.length) {
      const notasMatch = pHtml.match(/class="[^"]*note-box[^"]*"[\s\S]*?alt="([^"]+)"/g) || [];
      const todasNotas = notasMatch.map(m => { const r = m.match(/alt="([^"]+)"/); return r ? r[1] : null; }).filter(Boolean);
      // Dividir em 3 partes
      const t = Math.ceil(todasNotas.length / 3);
      notas_topo = todasNotas.slice(0, t);
      notas_coracao = todasNotas.slice(t, t * 2);
      notas_base = todasNotas.slice(t * 2);
    }

    // Descrição
    const descMatch = pHtml.match(/itemprop="description"[^>]*>([\s\S]*?)<\/div>/i);
    let descricao = '';
    if (descMatch) {
      descricao = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (descricao.length > 1000) descricao = descricao.slice(0, 1000);
    }

    // Família olfativa
    const familiaMatch = pHtml.match(/Fragrance Family[^<]*<\/b>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i)
                       || pHtml.match(/olfactive[^>]*group[^>]*>([^<]+)/i)
                       || pHtml.match(/class="[^"]*group-name[^"]*"[^>]*>([^<]+)/i);

    res.json({
      encontrado: true,
      url_fragrantica: perfumeUrl,
      nome: nomeMatch?.[1]?.trim() || nome,
      marca: marca,
      foto_url: fotoMatch?.[1] || null,
      ano: anoMatch?.[1] ? Number(anoMatch[1]) : null,
      genero,
      pais: paisMatch?.[1]?.trim() || null,
      familia_olfativa: familiaMatch?.[1]?.trim() || null,
      rating_valor: ratingMatch?.[1] ? Number(ratingMatch[1]) : null,
      rating_count: votosMatch?.[1] ? Number(votosMatch[1].replace(/,/g, '')) : null,
      perfumista1: perfumistas[0] || null,
      perfumista2: perfumistas[1] || null,
      acorde1: acordes[0] || null,
      acorde2: acordes[1] || null,
      acorde3: acordes[2] || null,
      acorde4: acordes[3] || null,
      acorde5: acordes[4] || null,
      notas_topo: notas_topo.join(', ') || null,
      notas_coracao: notas_coracao.join(', ') || null,
      notas_base: notas_base.join(', ') || null,
      descricao: descricao || null,
    });
  } catch(e) {
    res.json({ encontrado: false, erro: e.message });
  }
});

// ─── ADMIN: Upload foto para Cloudinary ────────────────────────────────────
router.post('/admin/upload-foto', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { url_foto, perfume_id } = req.body;
    if (!url_foto) return res.status(400).json({ erro: 'Informe url_foto.' });

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: 'dafksmivt', api_key: '316673358534854', api_secret: 'AoaqcnONhrRieUXsI7aJQb32dJg', secure: true });

    const slug = perfume_id || Date.now().toString();
    const result = await cloudinary.uploader.upload(url_foto, {
      folder: 'nicheclub/perfumes',
      public_id: slug,
      overwrite: true,
      transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
    });

    if (perfume_id) {
      await db.query('UPDATE perfumes SET foto_url = $1 WHERE id = $2', [result.secure_url, perfume_id]);
    }

    res.json({ url: result.secure_url });
  } catch(e) {
    res.status(500).json({ erro: e.message });
  }
});

// ─── ADMIN: Cadastrar perfume completo ────────────────────────────────────
router.post('/admin/perfumes', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { nome, marca, ano, genero, pais, foto_url, url_fragrantica, rating_valor, precos, ml_inicial } = req.body;
    if (!nome || !marca) return res.status(400).json({ erro: 'Nome e marca obrigatorios.' });

    const slug = `${marca}-${nome}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Verifica se já existe
    const { rows: existe } = await db.query('SELECT id FROM perfumes WHERE slug = $1', [slug]);
    if (existe.length) return res.status(409).json({ erro: 'Perfume ja cadastrado.', id: existe[0].id });

    // Insere perfume
    const { rows: [p] } = await db.query(`
      INSERT INTO perfumes (nome, marca, slug, ano, genero, pais, foto_url, url_fragrantica, rating_valor, ativo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE) RETURNING *
    `, [nome, marca, slug, ano||null, genero||null, pais||null, foto_url||null, url_fragrantica||null, rating_valor||null]);

    // Insere precos
    if (precos?.length) {
      for (const pr of precos) {
        if (pr.preco) await db.query(
          'INSERT INTO precos (perfume_id, tamanho, ml_quantidade, preco) VALUES ($1,$2,$3,$4)',
          [p.id, pr.tamanho, pr.ml, pr.preco]
        );
      }
    }

    // Insere frasco
    if (ml_inicial) {
      await db.query(
        'INSERT INTO frascos (perfume_id, ml_total, ml_vendido, ativo) VALUES ($1,$2,0,TRUE)',
        [p.id, ml_inicial]
      );
    }

    res.json({ sucesso: true, id: p.id, perfume: p });
  } catch(e) {
    res.status(500).json({ erro: e.message });
  }
});

router.post('/pedidos', pedidosCtrl.criarPedido);
router.get('/pedidos/:numero', pedidosCtrl.buscarPedido);
router.patch('/pedidos/:id/status', autenticar, pedidosCtrl.atualizarStatus);

// Admin: listar todos os pedidos
router.get('/pedidos', autenticar, async (req, res) => {
  const { status, pagina = 1 } = req.query;
  const offset = (pagina - 1) * 20;
  const filtro = status ? `AND p.status=$3` : '';
  const params = status ? [20, offset, status] : [20, offset];
  const { rows } = await db.query(`
    SELECT p.id, p.numero, p.status, p.total, p.criado_em,
           c.nome AS cliente, c.whatsapp
    FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
    WHERE 1=1 ${filtro}
    ORDER BY p.criado_em DESC LIMIT $1 OFFSET $2
  `, params);
  res.json(rows);
});

// ─── WHATSAPP ────────────────────────────────────────────────────────────────

// Listar conversas
router.get('/whatsapp/conversas', autenticar, async (req, res) => {
  const { rows } = await db.query(`
    SELECT cw.*, c.nome AS cliente_nome,
      (SELECT conteudo FROM mensagens_whatsapp
       WHERE conversa_id=cw.id ORDER BY enviado_em DESC LIMIT 1) AS ultima_msg,
      (SELECT COUNT(*) FROM mensagens_whatsapp
       WHERE conversa_id=cw.id AND direcao='entrada'
         AND enviado_em > cw.atualizado_em) AS nao_lidas
    FROM conversas_whatsapp cw
    LEFT JOIN clientes c ON c.id = cw.cliente_id
    ORDER BY cw.atualizado_em DESC
  `);
  res.json(rows);
});

// Mensagens de uma conversa
router.get('/whatsapp/conversas/:id/mensagens', autenticar, async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM mensagens_whatsapp WHERE conversa_id=$1 ORDER BY enviado_em`,
    [req.params.id]
  );
  res.json(rows);
});

// Enviar mensagem manual (atendente)
router.post('/whatsapp/conversas/:id/mensagens', autenticar, async (req, res) => {
  const { texto } = req.body;
  const { rows: [conversa] } = await db.query(
    `SELECT * FROM conversas_whatsapp WHERE id=$1`, [req.params.id]
  );
  if (!conversa) return res.status(404).json({ erro: 'Conversa não encontrada.' });

  await whatsapp.enviarTexto(conversa.telefone, texto);

  const { rows: [msg] } = await db.query(
    `INSERT INTO mensagens_whatsapp (conversa_id, direcao, conteudo, enviado_por)
     VALUES ($1,'saida',$2,$3) RETURNING *`,
    [conversa.id, texto, req.usuario.nome]
  );

  // Marca conversa como em atendimento
  await db.query(
    `UPDATE conversas_whatsapp SET status='atendimento', atendente_id=$1 WHERE id=$2`,
    [req.usuario.id, conversa.id]
  );

  res.status(201).json(msg);
});

// Enviar broadcast / oferta
router.post('/whatsapp/broadcast', autenticar, async (req, res) => {
  const { mensagem, destino, agendado_para } = req.body;

  const { rows: [bc] } = await db.query(
    `INSERT INTO broadcasts (mensagem, destino, agendado_para, criado_por)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [mensagem, destino, agendado_para || null, req.usuario.id]
  );

  // Se não agendado, envia agora
  if (!agendado_para) {
    await whatsapp.enviarGrupo(destino, mensagem);
    await db.query(
      `UPDATE broadcasts SET enviado_em=NOW(), total_enviados=1 WHERE id=$1`, [bc.id]
    );
  }

  res.status(201).json(bc);
});

// ─── WEBHOOKS ────────────────────────────────────────────────────────────────

router.post('/webhook/pagseguro', webhooksCtrl.webhookPagSeguro);
router.post('/webhook/whatsapp', webhooksCtrl.webhookWhatsApp);

module.exports = router;
