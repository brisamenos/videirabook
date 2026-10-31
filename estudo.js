// VideiraBook — Bíblia de estudo (notas no rodapé do capítulo) e grifos no texto bíblico
// Só para quem o professor liberar. O professor sempre tem acesso.
const { db } = require('./db');
const BIB = require('./biblioteca');

function podeEstudo(u) {
  if (!u) return false;
  if (u.papel === 'professor') return true;
  const r = db.prepare('SELECT pode_estudo FROM usuarios WHERE id = ?').get(u.id);
  return !!(r && r.pode_estudo);
}

const CORES = ['amarelo', 'verde', 'azul', 'rosa', 'laranja'];
const versaoOk = v => String(v || '').replace(/[^a-z0-9]/gi, '').slice(0, 20);

module.exports = function (app, P, auth, h) {
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

  // ── Professor: quem pode usar e quais módulos são Bíblia de estudo
  P.get('/estudo', h((req, res) => {
    res.json({
      modulos: db.prepare("SELECT cod, sigla, titulo, estudo, ativo, base FROM biblioteca WHERE tipo = 'comentario' ORDER BY estudo DESC, ordem, id").all()
        .map(m => ({ ...m, base: m.estudo ? (BIB.baseDoEstudo(m) || {}).cod || '' : '' })),
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
