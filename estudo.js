// VideiraBook — Bíblia de estudo (notas no rodapé do capítulo) e grifos no texto bíblico
// Só para quem o professor liberar. O professor sempre tem acesso.
const fs = require('fs');
const path = require('path');
const { db, DATA_DIR } = require('./db');
const BIB = require('./biblioteca');
const ms = require('./mysword');

// Capa: a que o professor enviou (fica no volume) ou a que vem dentro do módulo ("capa.jpg")
const PASTA_CAPAS = path.join(DATA_DIR, 'capas');
fs.mkdirSync(PASTA_CAPAS, { recursive: true });
const capaEnviada = cod => { const p = path.join(PASTA_CAPAS, `${String(cod).replace(/[^a-z0-9]/gi, '')}.img`); return fs.existsSync(p) ? p : null; };
function capaDoModulo(r) {
  try { const im = ms.imagem(BIB.caminho(r), 'capa.jpg'); return im && im.content ? Buffer.from(im.content) : null; } catch { return null; }
}
function temCapa(r) { return !!(capaEnviada(r.cod) || capaDoModulo(r)); }

function podeEstudo(u) {
  if (!u) return false;
  if (u.papel === 'professor') return true;
  const r = db.prepare('SELECT pode_estudo FROM usuarios WHERE id = ?').get(u.id);
  return !!(r && r.pode_estudo);
}

const CORES = ['amarelo', 'verde', 'azul', 'rosa', 'laranja'];
const versaoOk = v => String(v || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);

module.exports = function (app, P, auth, h, upload) {
  const so = (req, res, next) => podeEstudo(req.user) ? next() : res.status(403).json({ erro: 'A Bíblia de estudo não está liberada para você. Fale com o professor.' });

  // Módulos de estudo disponíveis
  app.get('/api/estudo', auth, so, h((req, res) => {
    res.json(BIB.listar('comentario', { estudo: true }).map(r => ({ cod: r.cod, sigla: r.sigla, titulo: r.titulo, creditos: r.creditos || '' })));
  }));
  // Notas de um capítulo
  app.get('/api/estudo/:cod/:livro/:cap', auth, so, h((req, res) => {
    const l = Number(req.params.livro), c = Number(req.params.cap);
    if (!(l >= 0 && l < 66) || !(c >= 1)) return res.status(400).json({ erro: 'Referência inválida.' });
    const r = BIB.notasEstudo(req.params.cod, l, c);
    if (!r) return res.status(404).json({ erro: 'Bíblia de estudo não encontrada.' });
    res.set('Cache-Control', 'private, max-age=3600');
    res.json(r);
  }));

  // Capa da Bíblia de estudo (prateleira)
  app.get('/api/estudo/:cod/capa', auth, so, h((req, res) => {
    const r = BIB.porCod(req.params.cod);
    if (!r || !r.estudo) return res.status(404).end();
    const enviada = capaEnviada(r.cod);
    const b = enviada ? fs.readFileSync(enviada) : capaDoModulo(r);
    if (!b) return res.status(404).end();
    const tipo = b[0] === 0x89 ? 'image/png' : b[0] === 0x52 ? 'image/webp' : 'image/jpeg';
    res.set({ 'Content-Type': tipo, 'Cache-Control': 'private, max-age=600' }).send(b);
  }));
  // Quais versículos do capítulo têm nota em cada Bíblia de estudo (para o sinal de "nota em outra Bíblia")
  app.get('/api/estudo-marcas/:livro/:cap', auth, so, h((req, res) => {
    const l = Number(req.params.livro), c = Number(req.params.cap); const out = {};
    for (const r of BIB.listar('comentario', { estudo: true })) {
      // só o versículo onde a nota começa (uma nota de 1.1-31 não marca o capítulo inteiro)
      try { const vs = [...new Set(ms.notasDoCapitulo(BIB.caminho(r), r.formato, l, c).filter(n => !/^\s*<h3/i.test(n.html)).map(n => Math.max(1, n.de || 1)))]; if (vs.length) out[r.cod] = vs; } catch {}
    }
    res.set('Cache-Control', 'private, max-age=600'); res.json(out);
  }));

  // ── Grifos
  app.get('/api/grifos/:versao/:livro/:cap', auth, so, h((req, res) => {
    res.json(db.prepare('SELECT id, verso, ini, fim, cor FROM grifos WHERE usuario_id = ? AND versao = ? AND livro = ? AND cap = ? ORDER BY verso, ini')
      .all(req.user.id, versaoOk(req.params.versao), Number(req.params.livro), Number(req.params.cap)));
  }));
  // Todos os meus grifos (lista)
  app.get('/api/grifos', auth, so, h((req, res) => {
    res.json(db.prepare('SELECT id, versao, livro, cap, verso, ini, fim, cor, criado_em FROM grifos WHERE usuario_id = ? ORDER BY livro, cap, verso, ini LIMIT 5000').all(req.user.id));
  }));
  // Marcar um trecho. Trechos que se sobrepõem no mesmo versículo são juntados com a nova cor.
  app.post('/api/grifos', auth, so, h((req, res) => {
    const b = req.body || {};
    const versao = versaoOk(b.versao), livro = Number(b.livro), cap = Number(b.cap), verso = Number(b.verso);
    let ini = Math.max(0, Math.floor(Number(b.ini))), fim = Math.floor(Number(b.fim));
    const cor = CORES.includes(b.cor) ? b.cor : 'amarelo';
    if (!versao || !(livro >= 0 && livro < 66) || !(cap >= 1) || !(verso >= 1) || !(fim > ini) || fim - ini > 5000) return res.status(400).json({ erro: 'Trecho inválido.' });
    const r = db.transaction(() => {
      const sobre = db.prepare('SELECT id, ini, fim, cor FROM grifos WHERE usuario_id = ? AND versao = ? AND livro = ? AND cap = ? AND verso = ? AND ini <= ? AND fim >= ?')
        .all(req.user.id, versao, livro, cap, verso, fim, ini);
      const del = db.prepare('DELETE FROM grifos WHERE id = ?');
      const ins = db.prepare('INSERT INTO grifos (usuario_id, versao, livro, cap, verso, ini, fim, cor) VALUES (?,?,?,?,?,?,?,?)');
      for (const g of sobre) {
        del.run(g.id);
        // Partes do grifo antigo que ficam fora do novo continuam com a cor antiga
        if (g.cor !== cor) {
          if (g.ini < ini) ins.run(req.user.id, versao, livro, cap, verso, g.ini, ini, g.cor);
          if (g.fim > fim) ins.run(req.user.id, versao, livro, cap, verso, fim, g.fim, g.cor);
        } else { ini = Math.min(ini, g.ini); fim = Math.max(fim, g.fim); }
      }
      return ins.run(req.user.id, versao, livro, cap, verso, ini, fim, cor).lastInsertRowid;
    })();
    res.json({ ok: true, id: r });
  }));
  app.put('/api/grifos/:id', auth, so, h((req, res) => {
    const cor = CORES.includes(req.body && req.body.cor) ? req.body.cor : null;
    if (!cor) return res.status(400).json({ erro: 'Cor inválida.' });
    db.prepare('UPDATE grifos SET cor = ? WHERE id = ? AND usuario_id = ?').run(cor, Number(req.params.id), req.user.id);
    res.json({ ok: true });
  }));
  app.delete('/api/grifos/:id', auth, so, h((req, res) => {
    db.prepare('DELETE FROM grifos WHERE id = ? AND usuario_id = ?').run(Number(req.params.id), req.user.id);
    res.json({ ok: true });
  }));

  // ── Marcadores: um por versão (Bíblia comum ou de estudo), para cada pessoa
  app.get('/api/marcadores', auth, h((req, res) => {
    res.json(db.prepare('SELECT versao, livro, cap, verso, atualizado_em FROM marcadores WHERE usuario_id = ? ORDER BY atualizado_em DESC').all(req.user.id));
  }));
  app.put('/api/marcadores/:versao', auth, h((req, res) => {
    const b = req.body || {}; const livro = Number(b.livro), cap = Number(b.cap), verso = Math.max(0, Number(b.verso) || 0);
    if (!(livro >= 0 && livro < 66) || !(cap >= 1)) return res.status(400).json({ erro: 'Referência inválida.' });
    db.prepare(`INSERT INTO marcadores (usuario_id, versao, livro, cap, verso, atualizado_em) VALUES (?,?,?,?,?, datetime('now','localtime'))
      ON CONFLICT(usuario_id, versao) DO UPDATE SET livro = excluded.livro, cap = excluded.cap, verso = excluded.verso, atualizado_em = excluded.atualizado_em`)
      .run(req.user.id, versaoOk(req.params.versao), livro, cap, verso);
    res.json({ ok: true });
  }));
  app.delete('/api/marcadores/:versao', auth, h((req, res) => {
    db.prepare('DELETE FROM marcadores WHERE usuario_id = ? AND versao = ?').run(req.user.id, versaoOk(req.params.versao));
    res.json({ ok: true });
  }));

  // ── Professor: capa enviada para uma Bíblia de estudo
  if (upload) P.post('/estudo/modulos/:cod/capa', upload.single('capa'), h((req, res) => {
    const r = BIB.porCod(req.params.cod);
    if (!req.file) return res.status(400).json({ erro: 'Escolha a imagem da capa.' });
    const okTipo = /^image\/(jpeg|png|webp)$/.test(req.file.mimetype || '');
    if (!r || !r.estudo || !okTipo) { fs.promises.unlink(req.file.path).catch(() => {}); return res.status(400).json({ erro: okTipo ? 'Bíblia de estudo não encontrada.' : 'Envie uma imagem JPG, PNG ou WEBP.' }); }
    const destino = path.join(PASTA_CAPAS, `${r.cod.replace(/[^a-z0-9]/gi, '')}.img`);
    try { fs.renameSync(req.file.path, destino); } catch { fs.copyFileSync(req.file.path, destino); fs.unlinkSync(req.file.path); }
    res.json({ ok: true });
  }));
  P.delete('/estudo/modulos/:cod/capa', h((req, res) => {
    const p = capaEnviada(req.params.cod); if (p) fs.unlinkSync(p);
    res.json({ ok: true });
  }));

  // ── Professor: quem pode usar e quais módulos são Bíblia de estudo
  P.get('/estudo', h((req, res) => {
    res.json({
      modulos: db.prepare("SELECT * FROM biblioteca WHERE tipo = 'comentario' ORDER BY estudo DESC, ordem, id").all()
        .map(m => ({ cod: m.cod, sigla: m.sigla, titulo: m.titulo, estudo: m.estudo, ativo: m.ativo, base: m.estudo ? (BIB.baseDoEstudo(m) || {}).cod || '' : '', capa: m.estudo ? temCapa(m) : false, capaEnviada: !!capaEnviada(m.cod) })),
      biblias: BIB.listar('biblia').map(b => ({ cod: b.cod, sigla: b.sigla, titulo: b.titulo })),
      usuarios: db.prepare("SELECT id, nome, usuario, pode_estudo, ativo FROM usuarios WHERE papel = 'aluno' ORDER BY nome").all(),
    });
  }));
  P.put('/estudo/usuarios/:id', h((req, res) => {
    db.prepare("UPDATE usuarios SET pode_estudo = ? WHERE id = ? AND papel = 'aluno'").run(req.body && req.body.pode_estudo ? 1 : 0, Number(req.params.id));
    res.json({ ok: true });
  }));
  P.put('/estudo/modulos/:cod', h((req, res) => {
    const b = req.body || {}; const atual = db.prepare("SELECT * FROM biblioteca WHERE cod = ? AND tipo = 'comentario'").get(String(req.params.cod));
    if (!atual) return res.status(404).json({ erro: 'Comentário não encontrado.' });
    const base = b.base !== undefined ? String(b.base || '').slice(0, 20) : atual.base;
    const r = db.prepare("UPDATE biblioteca SET estudo = ?, base = ? WHERE id = ?").run(b.estudo === undefined ? atual.estudo : (b.estudo ? 1 : 0), base, atual.id);
    if (!r.changes) return res.status(404).json({ erro: 'Comentário não encontrado.' });
    res.json({ ok: true });
  }));
};
module.exports.podeEstudo = podeEstudo;
module.exports.temCapa = temCapa;
