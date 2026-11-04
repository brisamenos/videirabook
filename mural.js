// VideiraBook — rede da turma: publicações com fotos, reações, comentários, status de 24 horas e foto de perfil
// Tudo só para quem está logado. O professor pode apagar qualquer publicação, comentário ou status.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { db, UPLOAD_DIR } = require('./db');
const ACESSO = require('./acesso');

db.exec(`
CREATE TABLE IF NOT EXISTS rede_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL DEFAULT '',
  criado_em TEXT DEFAULT (datetime('now','localtime')),
  editado_em TEXT
);
CREATE TABLE IF NOT EXISTS rede_imagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES rede_posts(id) ON DELETE CASCADE,
  arquivo TEXT NOT NULL, largura INTEGER, altura INTEGER, ordem INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS rede_imagens_post ON rede_imagens (post_id);
CREATE TABLE IF NOT EXISTS rede_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL DEFAULT '', cor TEXT, arquivo TEXT,
  criado_em TEXT DEFAULT (datetime('now','localtime')),
  expira_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS rede_status_exp ON rede_status (expira_em);
CREATE TABLE IF NOT EXISTS rede_status_vistos (
  status_id INTEGER NOT NULL REFERENCES rede_status(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  visto_em TEXT DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (status_id, usuario_id)
);
CREATE TABLE IF NOT EXISTS rede_reacoes (
  alvo TEXT NOT NULL, alvo_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  criado_em TEXT DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (alvo, alvo_id, usuario_id)
);
CREATE TABLE IF NOT EXISTS rede_comentarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alvo TEXT NOT NULL, alvo_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS rede_comentarios_alvo ON rede_comentarios (alvo, alvo_id);
`);
if (!db.prepare('PRAGMA table_info(usuarios)').all().some(c => c.name === 'foto')) db.exec('ALTER TABLE usuarios ADD COLUMN foto TEXT');
// Como a pessoa aparece na rede: nome de exibição e @ (diferente do usuário de login, que fica em segredo)
if (!db.prepare('PRAGMA table_info(usuarios)').all().some(c => c.name === 'apelido')) db.exec('ALTER TABLE usuarios ADD COLUMN apelido TEXT');
if (!db.prepare('PRAGMA table_info(usuarios)').all().some(c => c.name === 'arroba')) db.exec('ALTER TABLE usuarios ADD COLUMN arroba TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS usuarios_arroba ON usuarios (arroba COLLATE NOCASE) WHERE arroba IS NOT NULL');

const TIPOS = ['curtir', 'amei', 'amem', 'haha', 'uau', 'triste'];
const EMOJI = { curtir: '👍', amei: '❤️', amem: '🙏', haha: '😂', uau: '😮', triste: '😢' };
const ALVOS = ['post', 'status'];
const CORES = ['#1E3B2C', '#7A2E3B', '#2F4F6F', '#8A5A1F', '#4B3A6B', '#2E5E5A'];
const POR_PAGINA = 15;
const MAX_IMAGENS = 6;

// Imagens: só arquivos de imagem, até 15 MB cada (o aparelho já reduz antes de enviar)
const enviarImagem = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' })[file.mimetype] || '.jpg';
      cb(null, `rede-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024, files: MAX_IMAGENS },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif|heic|heif)$/.test(file.mimetype)),
});
const apagar = nome => { if (nome) fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(nome))).catch(() => {}); };
const limpaTexto = (t, n) => String(t || '').replace(/\r\n?/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim().slice(0, n);
// Quem modera o mural do seu espaço: o admin interno no espaço principal, a administração em cada igreja
const ehProf = u => (u.papel === 'professor' && !u.igreja_id) || u.papel === 'pastor';
// Cada igreja só vê o próprio mural (o espaço principal é igreja_id nulo)
const ESPACO = 'u.igreja_id IS ?';
const esp = u => u.igreja_id || null;
const mesmoEspaco = (uid, eu) => { const r = db.prepare('SELECT igreja_id FROM usuarios WHERE id = ?').get(uid); return !!r && (r.igreja_id || null) === esp(eu); };
const urlArq = a => a ? `/arquivos/${encodeURIComponent(a)}` : null;
const pessoa = r => ({ id: r.uid, nome: r.uapelido || r.unome, arroba: r.uarroba || null, papel: r.upapel, foto: urlArq(r.ufoto) });
const COLS_P = 'u.id AS uid, u.nome AS unome, u.apelido AS uapelido, u.arroba AS uarroba, u.papel AS upapel, u.foto AS ufoto';

// Reações e comentários de vários alvos de uma vez
function reacoes(alvo, ids, eu) {
  const out = {}; if (!ids.length) return out;
  for (const id of ids) out[id] = { total: 0, tipos: {}, minha: null };
  const q = `SELECT alvo_id, tipo, usuario_id FROM rede_reacoes WHERE alvo = ? AND alvo_id IN (${ids.map(() => '?').join(',')})`;
  for (const r of db.prepare(q).all(alvo, ...ids)) {
    const o = out[r.alvo_id]; o.total++; o.tipos[r.tipo] = (o.tipos[r.tipo] || 0) + 1;
    if (r.usuario_id === eu) o.minha = r.tipo;
  }
  return out;
}
function comentariosDe(alvo, id, limite = 0) {
  const lista = db.prepare(`SELECT c.id, c.texto, c.criado_em, ${COLS_P} FROM rede_comentarios c JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.alvo = ? AND c.alvo_id = ? ORDER BY c.id ${limite ? 'DESC LIMIT ' + Number(limite) : ''}`).all(alvo, id);
  if (limite) lista.reverse();
  return lista.map(c => ({ id: c.id, texto: c.texto, criado_em: c.criado_em, autor: pessoa(c) }));
}
function totalComentarios(alvo, ids) {
  const out = {}; if (!ids.length) return out;
  for (const r of db.prepare(`SELECT alvo_id, COUNT(*) n FROM rede_comentarios WHERE alvo = ? AND alvo_id IN (${ids.map(() => '?').join(',')}) GROUP BY alvo_id`).all(alvo, ...ids))
    out[r.alvo_id] = r.n;
  return out;
}
function montarPosts(linhas, eu) {
  const ids = linhas.map(p => p.id);
  const imgs = {};
  if (ids.length) for (const i of db.prepare(`SELECT * FROM rede_imagens WHERE post_id IN (${ids.map(() => '?').join(',')}) ORDER BY ordem, id`).all(...ids))
    (imgs[i.post_id] = imgs[i.post_id] || []).push({ url: urlArq(i.arquivo), largura: i.largura, altura: i.altura });
  const rs = reacoes('post', ids, eu.id), nc = totalComentarios('post', ids);
  return linhas.map(p => ({
    id: p.id, texto: p.texto, criado_em: p.criado_em, editado_em: p.editado_em, autor: pessoa(p), informativo: !!p.fixado,
    imagens: imgs[p.id] || [], reacoes: rs[p.id], comentarios_total: nc[p.id] || 0,
    comentarios: (nc[p.id] || 0) ? comentariosDe('post', p.id, 2) : [],
    pode_editar: p.uid === eu.id, pode_apagar: p.uid === eu.id || ehProf(eu),
  }));
}
// O alvo existe e pode ser visto? (status vencido não recebe mais reação nem comentário)
function alvoExiste(alvo, id, eu) {
  const r = alvo === 'post' ? db.prepare('SELECT usuario_id FROM rede_posts WHERE id = ?').get(id)
    : db.prepare("SELECT usuario_id FROM rede_status WHERE id = ? AND expira_em > datetime('now','localtime')").get(id);
  return r && (!eu || mesmoEspaco(r.usuario_id, eu)) ? r : null;
}
// Status vencidos: apaga a imagem e o registro (roda de vez em quando)
let ultimaFaxina = 0;
function faxina() {
  if (Date.now() - ultimaFaxina < 10 * 60e3) return; ultimaFaxina = Date.now();
  const velhos = db.prepare("SELECT id, arquivo FROM rede_status WHERE expira_em <= datetime('now','localtime')").all();
  for (const s of velhos) {
    apagar(s.arquivo);
    db.prepare("DELETE FROM rede_reacoes WHERE alvo = 'status' AND alvo_id = ?").run(s.id);
    db.prepare("DELETE FROM rede_comentarios WHERE alvo = 'status' AND alvo_id = ?").run(s.id);
    db.prepare('DELETE FROM rede_status WHERE id = ?').run(s.id);
  }
}

module.exports = function (app, P, auth, h) {
  const recebe = campo => (req, res, next) => enviarImagem.array(campo, MAX_IMAGENS)(req, res, e => {
    if (!e) return next();
    if (e.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ erro: 'Uma das imagens é grande demais (máximo de 15 MB).' });
    if (e.code === 'LIMIT_FILE_COUNT' || e.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ erro: `Escolha no máximo ${MAX_IMAGENS} imagens.` });
    next(e);
  });
  const dims = (req, i) => { try { const d = JSON.parse(req.body.dimensoes || '[]')[i] || {}; return [Number(d.l) || null, Number(d.a) || null]; } catch { return [null, null]; } };

  // ── Publicações
  app.get('/api/rede/feed', auth, h((req, res) => {
    const antes = Number(req.query.antes) || 0;
    const linhas = db.prepare(`SELECT p.*, ${COLS_P} FROM rede_posts p JOIN usuarios u ON u.id = p.usuario_id
      WHERE ${ESPACO} ${antes ? 'AND p.id < ?' : ''} ORDER BY p.id DESC LIMIT ${POR_PAGINA + 1}`).all(esp(req.user), ...(antes ? [antes] : []));
    const mais = linhas.length > POR_PAGINA;
    res.json({ posts: montarPosts(linhas.slice(0, POR_PAGINA), req.user), mais });
  }));
  // Quantas publicações novas chegaram depois da última que a pessoa já vê
  app.get('/api/rede/novos', auth, h((req, res) => {
    const depois = Number(req.query.depois) || 0;
    res.json({ novos: db.prepare(`SELECT COUNT(*) n FROM rede_posts p JOIN usuarios u ON u.id = p.usuario_id WHERE p.id > ? AND p.usuario_id <> ? AND ${ESPACO}`).get(depois, req.user.id, esp(req.user)).n });
  }));
  // Mural de informações da igreja: informativos e cartazes que a administração publicou
  app.get('/api/rede/informativos', auth, h((req, res) => {
    const linhas = db.prepare(`SELECT p.*, ${COLS_P} FROM rede_posts p JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.fixado = 1 AND ${ESPACO} ORDER BY p.id DESC LIMIT 40`).all(esp(req.user));
    res.json(montarPosts(linhas, req.user));
  }));
  app.get('/api/rede/posts/:id', auth, h((req, res) => {
    const p = db.prepare(`SELECT p.*, ${COLS_P} FROM rede_posts p JOIN usuarios u ON u.id = p.usuario_id WHERE p.id = ?`).get(Number(req.params.id));
    if (!p || !mesmoEspaco(p.uid, req.user)) return res.status(404).json({ erro: 'Esta publicação foi apagada.' });
    res.json(montarPosts([p], req.user)[0]);
  }));
  app.post('/api/rede/posts', auth, recebe('imagens'), h((req, res) => {
    const texto = limpaTexto(req.body.texto, 5000), arqs = req.files || [];
    if (!texto && !arqs.length) return res.status(400).json({ erro: 'Escreva algo ou escolha uma foto para publicar.' });
    const id = db.transaction(() => {
      const pid = db.prepare('INSERT INTO rede_posts (usuario_id, texto, fixado) VALUES (?, ?, ?)').run(req.user.id, texto, req.user.papel === 'pastor' && req.body.informativo === '1' ? 1 : 0).lastInsertRowid;
      arqs.forEach((f, i) => { const [l, a] = dims(req, i); db.prepare('INSERT INTO rede_imagens (post_id, arquivo, largura, altura, ordem) VALUES (?,?,?,?,?)').run(pid, f.filename, l, a, i); });
      return pid;
    })();
    const p = db.prepare(`SELECT p.*, ${COLS_P} FROM rede_posts p JOIN usuarios u ON u.id = p.usuario_id WHERE p.id = ?`).get(id);
    if (ehProf(req.user)) ACESSO.notificarTodos({ tipo: 'professor_post', texto: `${ACESSO.nomeDe(req.user.id)} publicou ${p.fixado ? 'um informativo' : 'no mural'}${texto ? `: "${texto.slice(0, 90)}${texto.length > 90 ? '…' : ''}"` : ' uma foto'}`, link: `#/post/${id}`, atorId: req.user.id, chave: `post-${id}`, titulo: req.user.igreja_id ? (p.fixado ? 'Informativo da igreja' : 'Nova publicação da igreja') : 'Nova publicação do professor' }, req.user.id, esp(req.user));
    res.json(montarPosts([p], req.user)[0]);
  }));
  app.put('/api/rede/posts/:id', auth, h((req, res) => {
    const p = db.prepare('SELECT * FROM rede_posts WHERE id = ?').get(Number(req.params.id));
    if (!p) return res.status(404).json({ erro: 'Esta publicação foi apagada.' });
    if (p.usuario_id !== req.user.id) return res.status(403).json({ erro: 'Só quem publicou pode editar.' });
    const texto = limpaTexto(req.body.texto, 5000);
    if (req.body.informativo !== undefined && req.user.papel === 'pastor') db.prepare('UPDATE rede_posts SET fixado = ? WHERE id = ?').run(req.body.informativo ? 1 : 0, p.id);
    const temImg = db.prepare('SELECT 1 FROM rede_imagens WHERE post_id = ?').get(p.id);
    if (!texto && !temImg) return res.status(400).json({ erro: 'A publicação não pode ficar vazia.' });
    db.prepare("UPDATE rede_posts SET texto = ?, editado_em = datetime('now','localtime') WHERE id = ?").run(texto, p.id);
    res.json({ ok: true, texto });
  }));
  app.delete('/api/rede/posts/:id', auth, h((req, res) => {
    const p = db.prepare('SELECT * FROM rede_posts WHERE id = ?').get(Number(req.params.id));
    if (!p) return res.json({ ok: true });
    if (p.usuario_id !== req.user.id && !(ehProf(req.user) && mesmoEspaco(p.usuario_id, req.user))) return res.status(403).json({ erro: 'Você não pode apagar esta publicação.' });
    for (const i of db.prepare('SELECT arquivo FROM rede_imagens WHERE post_id = ?').all(p.id)) apagar(i.arquivo);
    db.transaction(() => {
      db.prepare("DELETE FROM rede_reacoes WHERE alvo = 'post' AND alvo_id = ?").run(p.id);
      db.prepare("DELETE FROM rede_comentarios WHERE alvo = 'post' AND alvo_id = ?").run(p.id);
      db.prepare('DELETE FROM rede_posts WHERE id = ?').run(p.id);
    })();
    db.prepare("DELETE FROM notificacoes WHERE link = ?").run(`#/post/${p.id}`);
    res.json({ ok: true });
  }));

  // ── Reações (publicação ou status). tipo vazio = tirar a reação
  app.post('/api/rede/reacao', auth, h((req, res) => {
    const { alvo, id, tipo } = req.body || {};
    if (!ALVOS.includes(alvo)) return res.status(400).json({ erro: 'Reação inválida.' });
    if (!alvoExiste(alvo, Number(id), req.user)) return res.status(404).json({ erro: alvo === 'post' ? 'Esta publicação foi apagada.' : 'Este status já saiu do ar.' });
    if (tipo && !TIPOS.includes(tipo)) return res.status(400).json({ erro: 'Reação inválida.' });
    if (tipo) db.prepare(`INSERT INTO rede_reacoes (alvo, alvo_id, usuario_id, tipo) VALUES (?,?,?,?)
      ON CONFLICT(alvo, alvo_id, usuario_id) DO UPDATE SET tipo = excluded.tipo, criado_em = datetime('now','localtime')`).run(alvo, Number(id), req.user.id, tipo);
    else db.prepare('DELETE FROM rede_reacoes WHERE alvo = ? AND alvo_id = ? AND usuario_id = ?').run(alvo, Number(id), req.user.id);
    const dono = alvoExiste(alvo, Number(id), req.user).usuario_id, chave = `reacao-${alvo}-${id}-${req.user.id}`;
    if (tipo) ACESSO.notificar(dono, { tipo: 'reacao', texto: `${ACESSO.nomeDe(req.user.id)} reagiu ${EMOJI[tipo]} ${alvo === 'post' ? 'à sua publicação' : 'ao seu status'}`, link: alvo === 'post' ? `#/post/${id}` : '#/inicio', atorId: req.user.id, chave, titulo: 'Nova reação' });
    else ACESSO.desfazer(chave);
    res.json(reacoes(alvo, [Number(id)], req.user.id)[Number(id)]);
  }));
  // Quem reagiu
  app.get('/api/rede/reacoes/:alvo/:id', auth, h((req, res) => {
    if (!ALVOS.includes(req.params.alvo)) return res.status(400).json({ erro: 'Inválido.' });
    if (!alvoExiste(req.params.alvo, Number(req.params.id), req.user)) return res.json([]);
    res.json(db.prepare(`SELECT r.tipo, ${COLS_P} FROM rede_reacoes r JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.alvo = ? AND r.alvo_id = ? ORDER BY r.criado_em DESC`).all(req.params.alvo, Number(req.params.id)).map(r => ({ tipo: r.tipo, pessoa: pessoa(r) })));
  }));

  // ── Comentários
  app.get('/api/rede/comentarios/:alvo/:id', auth, h((req, res) => {
    if (!ALVOS.includes(req.params.alvo)) return res.status(400).json({ erro: 'Inválido.' });
    if (!alvoExiste(req.params.alvo, Number(req.params.id), req.user)) return res.json([]);
    res.json(comentariosDe(req.params.alvo, Number(req.params.id)).map(c => ({ ...c, pode_apagar: c.autor.id === req.user.id || ehProf(req.user) })));
  }));
  app.post('/api/rede/comentarios/:alvo/:id', auth, h((req, res) => {
    const alvo = req.params.alvo, id = Number(req.params.id);
    if (!ALVOS.includes(alvo)) return res.status(400).json({ erro: 'Inválido.' });
    if (!alvoExiste(alvo, id, req.user)) return res.status(404).json({ erro: alvo === 'post' ? 'Esta publicação foi apagada.' : 'Este status já saiu do ar.' });
    const texto = limpaTexto(req.body && req.body.texto, 2000);
    if (!texto) return res.status(400).json({ erro: 'Escreva o comentário.' });
    const cid = db.prepare('INSERT INTO rede_comentarios (alvo, alvo_id, usuario_id, texto) VALUES (?,?,?,?)').run(alvo, id, req.user.id, texto).lastInsertRowid;
    const dono = alvoExiste(alvo, id, req.user).usuario_id, quem = ACESSO.nomeDe(req.user.id), trechoC = texto.length > 80 ? texto.slice(0, 80) + '…' : texto;
    const linkC = alvo === 'post' ? `#/post/${id}` : '#/inicio';
    ACESSO.notificar(dono, { tipo: 'comentario', texto: `${quem} comentou ${alvo === 'post' ? 'na sua publicação' : 'no seu status'}: "${trechoC}"`, link: linkC, atorId: req.user.id, chave: `coment-${cid}`, titulo: 'Novo comentário' });
    for (const o of db.prepare('SELECT DISTINCT usuario_id FROM rede_comentarios WHERE alvo = ? AND alvo_id = ? AND usuario_id NOT IN (?, ?)').all(alvo, id, req.user.id, dono))
      ACESSO.notificar(o.usuario_id, { tipo: 'comentario', texto: `${quem} também comentou ${alvo === 'post' ? `na publicação de ${ACESSO.nomeDe(dono)}` : `no status de ${ACESSO.nomeDe(dono)}`}: "${trechoC}"`, link: linkC, atorId: req.user.id, chave: `coment-${cid}`, titulo: 'Novo comentário' });
    const c = db.prepare(`SELECT c.id, c.texto, c.criado_em, ${COLS_P} FROM rede_comentarios c JOIN usuarios u ON u.id = c.usuario_id WHERE c.id = ?`).get(cid);
    res.json({ id: c.id, texto: c.texto, criado_em: c.criado_em, autor: pessoa(c), pode_apagar: true,
      total: db.prepare('SELECT COUNT(*) n FROM rede_comentarios WHERE alvo = ? AND alvo_id = ?').get(alvo, id).n });
  }));
  app.delete('/api/rede/comentarios/:cid', auth, h((req, res) => {
    const c = db.prepare('SELECT * FROM rede_comentarios WHERE id = ?').get(Number(req.params.cid));
    if (!c) return res.json({ ok: true });
    if (c.usuario_id !== req.user.id && !(ehProf(req.user) && mesmoEspaco(c.usuario_id, req.user))) return res.status(403).json({ erro: 'Você não pode apagar este comentário.' });
    db.prepare('DELETE FROM rede_comentarios WHERE id = ?').run(c.id);
    ACESSO.desfazer(`coment-${c.id}`);
    res.json({ ok: true, total: db.prepare('SELECT COUNT(*) n FROM rede_comentarios WHERE alvo = ? AND alvo_id = ?').get(c.alvo, c.alvo_id).n });
  }));

  // ── Status (somem depois de 24 horas)
  app.get('/api/rede/status', auth, h((req, res) => {
    faxina();
    const linhas = db.prepare(`SELECT s.*, ${COLS_P}, (SELECT 1 FROM rede_status_vistos v WHERE v.status_id = s.id AND v.usuario_id = ?) AS visto
      FROM rede_status s JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.expira_em > datetime('now','localtime') AND ${ESPACO} ORDER BY s.id`).all(req.user.id, esp(req.user));
    const ids = linhas.map(s => s.id);
    const rs = reacoes('status', ids, req.user.id), nc = totalComentarios('status', ids);
    const vistos = {};
    if (ids.length) for (const r of db.prepare(`SELECT status_id, COUNT(*) n FROM rede_status_vistos WHERE status_id IN (${ids.map(() => '?').join(',')}) AND usuario_id <> ? GROUP BY status_id`).all(...ids, req.user.id)) vistos[r.status_id] = r.n;
    const grupos = new Map();
    for (const s of linhas) {
      if (!grupos.has(s.uid)) grupos.set(s.uid, { pessoa: pessoa(s), itens: [] });
      grupos.get(s.uid).itens.push({ id: s.id, texto: s.texto, cor: s.cor, imagem: urlArq(s.arquivo), criado_em: s.criado_em, expira_em: s.expira_em,
        visto: s.uid === req.user.id || !!s.visto, reacoes: rs[s.id], comentarios_total: nc[s.id] || 0,
        vistos: s.uid === req.user.id ? (vistos[s.id] || 0) : undefined,
        pode_apagar: s.uid === req.user.id || ehProf(req.user) });
    }
    // os meus primeiro; depois quem tem status ainda não visto; depois os mais recentes
    const lista = [...grupos.values()].map(g => ({ ...g, novos: g.itens.some(i => !i.visto), ultimo: g.itens[g.itens.length - 1].id }));
    lista.sort((a, b) => (b.pessoa.id === req.user.id) - (a.pessoa.id === req.user.id) || (b.novos - a.novos) || (b.ultimo - a.ultimo));
    res.json({ grupos: lista, cores: CORES });
  }));
  app.post('/api/rede/status', auth, recebe('imagem'), h((req, res) => {
    const texto = limpaTexto(req.body.texto, 700), arq = (req.files || [])[0];
    if (!texto && !arq) return res.status(400).json({ erro: 'Escreva um texto ou escolha uma foto para o status.' });
    const cor = CORES.includes(req.body.cor) ? req.body.cor : CORES[0];
    const id = db.prepare(`INSERT INTO rede_status (usuario_id, texto, cor, arquivo, expira_em) VALUES (?,?,?,?, datetime('now','localtime','+24 hours'))`)
      .run(req.user.id, texto, cor, arq ? arq.filename : null).lastInsertRowid;
    res.json({ ok: true, id });
  }));
  app.post('/api/rede/status/:id/visto', auth, h((req, res) => {
    const s = db.prepare('SELECT usuario_id FROM rede_status WHERE id = ?').get(Number(req.params.id));
    if (s && s.usuario_id !== req.user.id && mesmoEspaco(s.usuario_id, req.user)) db.prepare('INSERT OR IGNORE INTO rede_status_vistos (status_id, usuario_id) VALUES (?, ?)').run(Number(req.params.id), req.user.id);
    res.json({ ok: true });
  }));
  // Quem viu o meu status (só o dono)
  app.get('/api/rede/status/:id/vistos', auth, h((req, res) => {
    const s = db.prepare('SELECT usuario_id FROM rede_status WHERE id = ?').get(Number(req.params.id));
    if (!s || s.usuario_id !== req.user.id) return res.status(403).json({ erro: 'Só quem postou o status vê quem visualizou.' });
    res.json(db.prepare(`SELECT v.visto_em, ${COLS_P}, (SELECT tipo FROM rede_reacoes r WHERE r.alvo = 'status' AND r.alvo_id = v.status_id AND r.usuario_id = u.id) AS tipo
      FROM rede_status_vistos v JOIN usuarios u ON u.id = v.usuario_id WHERE v.status_id = ? ORDER BY v.visto_em DESC`).all(Number(req.params.id))
      .map(r => ({ visto_em: r.visto_em, tipo: r.tipo, pessoa: pessoa(r) })));
  }));
  app.delete('/api/rede/status/:id', auth, h((req, res) => {
    const s = db.prepare('SELECT * FROM rede_status WHERE id = ?').get(Number(req.params.id));
    if (!s) return res.json({ ok: true });
    if (s.usuario_id !== req.user.id && !(ehProf(req.user) && mesmoEspaco(s.usuario_id, req.user))) return res.status(403).json({ erro: 'Você não pode apagar este status.' });
    apagar(s.arquivo);
    db.transaction(() => {
      db.prepare("DELETE FROM rede_reacoes WHERE alvo = 'status' AND alvo_id = ?").run(s.id);
      db.prepare("DELETE FROM rede_comentarios WHERE alvo = 'status' AND alvo_id = ?").run(s.id);
      db.prepare('DELETE FROM rede_status WHERE id = ?').run(s.id);
    })();
    res.json({ ok: true });
  }));

  // ── Nome de exibição e @
  app.put('/api/me/perfil', auth, h((req, res) => {
    const b = req.body || {};
    const apelido = String(b.apelido || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    let arroba = String(b.arroba || '').trim().replace(/^@+/, '').toLowerCase();
    if (apelido && apelido.length < 2) return res.status(400).json({ erro: 'O nome de exibição precisa ter pelo menos 2 letras.', campo: 'apelido' });
    if (arroba && !/^[a-z0-9._]{3,20}$/.test(arroba)) return res.status(400).json({ erro: 'O @ pode ter de 3 a 20 caracteres: letras sem acento, números, ponto e sublinhado.', campo: 'arroba' });
    if (arroba && db.prepare('SELECT 1 FROM usuarios WHERE arroba = ? COLLATE NOCASE AND id <> ?').get(arroba, req.user.id)) return res.status(400).json({ erro: `O @${arroba} já está em uso. Escolha outro.`, campo: 'arroba' });
    db.prepare('UPDATE usuarios SET apelido = ?, arroba = ? WHERE id = ?').run(apelido || null, arroba || null, req.user.id);
    res.json({ ok: true, apelido: apelido || null, arroba: arroba || null });
  }));

  // ── Foto de perfil
  app.put('/api/me/foto', auth, recebe('foto'), h((req, res) => {
    const arq = (req.files || [])[0];
    if (!arq) return res.status(400).json({ erro: 'Escolha uma imagem (JPG, PNG ou WebP).' });
    const antiga = db.prepare('SELECT foto FROM usuarios WHERE id = ?').get(req.user.id).foto;
    db.prepare('UPDATE usuarios SET foto = ? WHERE id = ?').run(arq.filename, req.user.id);
    apagar(antiga);
    res.json({ ok: true, foto: urlArq(arq.filename) });
  }));
  app.delete('/api/me/foto', auth, h((req, res) => {
    const antiga = db.prepare('SELECT foto FROM usuarios WHERE id = ?').get(req.user.id).foto;
    db.prepare('UPDATE usuarios SET foto = NULL WHERE id = ?').run(req.user.id);
    apagar(antiga);
    res.json({ ok: true });
  }));
};
module.exports.urlFoto = urlArq;
