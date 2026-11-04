// VideiraBook — contas, matrícula por curso, notificações (no app e no celular) e versículo do dia
// Quem se inscreve sozinho tem acesso ao mural, ao versículo do dia e às Bíblias.
// O curso só abre quando o professor libera (matrícula); aí a pessoa recebe uma notificação.
const { db, getConfig, setConfig } = require('./db');

db.exec(`
CREATE TABLE IF NOT EXISTS matriculas (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  criado_em TEXT DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (usuario_id, curso_id)
);
CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, texto TEXT NOT NULL, link TEXT,
  ator_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  chave TEXT,
  lida INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS notificacoes_usuario ON notificacoes (usuario_id, id);
CREATE TABLE IF NOT EXISTS push_aparelhos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
`);
const colunas = db.prepare('PRAGMA table_info(usuarios)').all().map(c => c.name);
if (!colunas.includes('email')) db.exec('ALTER TABLE usuarios ADD COLUMN email TEXT');
if (!colunas.includes('origem')) db.exec("ALTER TABLE usuarios ADD COLUMN origem TEXT NOT NULL DEFAULT 'professor'");
if (!colunas.includes('notif_prefs')) db.exec('ALTER TABLE usuarios ADD COLUMN notif_prefs TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email ON usuarios (email COLLATE NOCASE) WHERE email IS NOT NULL');

// Quem já era aluno antes desta mudança continua com acesso a todos os cursos (feito uma vez só)
if (getConfig().matriculas_iniciais !== '1') {
  db.prepare(`INSERT OR IGNORE INTO matriculas (usuario_id, curso_id)
    SELECT u.id, c.id FROM usuarios u CROSS JOIN cursos c WHERE u.papel = 'aluno'`).run();
  setConfig('matriculas_iniciais', '1');
}

const ehProf = u => u && u.papel === 'professor';
function temMatricula(user, cursoId) {
  if (ehProf(user)) return true;
  return !!db.prepare('SELECT 1 FROM matriculas WHERE usuario_id = ? AND curso_id = ?').get(user.id, cursoId);
}
const totalMatriculas = user => ehProf(user) ? db.prepare('SELECT COUNT(*) n FROM cursos').get().n
  : db.prepare('SELECT COUNT(*) n FROM matriculas WHERE usuario_id = ?').get(user.id).n;

// ── Preferências de notificação (o que cada pessoa quer receber)
const PREFS = {
  reacoes: 'Reações nas minhas publicações e status',
  comentarios: 'Comentários nas minhas publicações e status',
  professor: 'Publicações e avisos do professor',
  cursos: 'Cursos e aulas liberados para mim',
};
const TIPO_PREF = { reacao: 'reacoes', comentario: 'comentarios', professor_post: 'professor', aviso: 'professor', curso: 'cursos' };
function prefsDe(usuarioId) {
  let p = {}; try { p = JSON.parse(db.prepare('SELECT notif_prefs FROM usuarios WHERE id = ?').get(usuarioId).notif_prefs || '{}'); } catch { p = {}; }
  const o = {}; for (const k of Object.keys(PREFS)) o[k] = p[k] !== false; o.celular = p.celular !== false; return o;
}

// ── Notificação no celular (Web Push). As chaves são criadas uma vez e ficam guardadas no banco.
let webpush = null;
try {
  webpush = require('web-push');
  let pub = getConfig()._vapid_pub, priv = getConfig()._vapid_priv;
  if (!pub || !priv) { const k = webpush.generateVAPIDKeys(); pub = k.publicKey; priv = k.privateKey; setConfig('_vapid_pub', pub); setConfig('_vapid_priv', priv); }
  webpush.setVapidDetails(process.env.PUSH_CONTATO || 'mailto:contato@videirabook.app', pub, priv);
} catch (e) { webpush = null; console.warn('[VideiraBook] notificações no celular desligadas:', e.message); }

function enviarPush(usuarioId, dados) {
  if (!webpush) return;
  const aparelhos = db.prepare('SELECT * FROM push_aparelhos WHERE usuario_id = ?').all(usuarioId);
  const corpo = JSON.stringify(dados);
  for (const a of aparelhos) {
    webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, corpo, { TTL: 86400 })
      .catch(e => { if (e && (e.statusCode === 404 || e.statusCode === 410)) db.prepare('DELETE FROM push_aparelhos WHERE id = ?').run(a.id); });
  }
}

// Cria a notificação (respeitando as preferências da pessoa). "chave" evita repetir a mesma coisa (ex.: trocou de reação).
function notificar(usuarioId, { tipo, texto, link = null, atorId = null, chave = null, titulo = 'VideiraBook' }) {
  if (!usuarioId || usuarioId === atorId) return;
  const prefs = prefsDe(usuarioId);
  if (TIPO_PREF[tipo] && prefs[TIPO_PREF[tipo]] === false) return;
  if (chave) db.prepare('DELETE FROM notificacoes WHERE usuario_id = ? AND chave = ?').run(usuarioId, chave);
  db.prepare('INSERT INTO notificacoes (usuario_id, tipo, texto, link, ator_id, chave) VALUES (?,?,?,?,?,?)').run(usuarioId, tipo, texto, link, atorId, chave);
  // guarda só as 200 mais recentes de cada pessoa
  db.prepare('DELETE FROM notificacoes WHERE usuario_id = ? AND id NOT IN (SELECT id FROM notificacoes WHERE usuario_id = ? ORDER BY id DESC LIMIT 200)').run(usuarioId, usuarioId);
  if (prefs.celular) enviarPush(usuarioId, { titulo, texto, link: link || '#/inicio', tag: chave || undefined });
}
function desfazer(chave) { if (chave) db.prepare('DELETE FROM notificacoes WHERE chave = ?').run(chave); }
// Avisa todos do mesmo espaço (igrejaId nulo = espaço principal do admin; cada igreja só avisa os seus)
function notificarTodos(dados, exceto, igrejaId = null) {
  for (const u of db.prepare('SELECT id FROM usuarios WHERE ativo = 1 AND id <> ? AND igreja_id IS ?').all(exceto || 0, igrejaId || null)) notificar(u.id, dados);
}
const nomeDe = id => { const u = db.prepare('SELECT nome, apelido FROM usuarios WHERE id = ?').get(id); return u ? (u.apelido || u.nome) : 'Alguém'; };

// ── Versículo do dia (um por dia, na Bíblia padrão do app)
const VERSICULOS = [
  [42, 3, 16], [18, 23, 1, 3], [44, 8, 28], [49, 4, 13], [23, 29, 11], [19, 3, 5, 6], [22, 41, 10], [5, 1, 9], [39, 11, 28, 29], [18, 46, 1],
  [44, 12, 2], [47, 2, 20], [57, 11, 1], [42, 14, 6], [39, 6, 33], [18, 119, 105], [22, 40, 31], [45, 13, 4, 7], [48, 2, 8, 9], [61, 1, 9],
  [18, 37, 4, 5], [42, 15, 5], [44, 5, 8], [49, 4, 6, 7], [24, 3, 22, 23], [43, 1, 8], [54, 3, 16, 17], [18, 27, 1], [39, 5, 14, 16], [46, 5, 17],
  [44, 10, 9], [18, 91, 1, 2], [19, 16, 3], [22, 26, 3], [47, 5, 22, 23], [58, 1, 5], [42, 11, 25], [18, 34, 8], [39, 28, 19, 20], [44, 6, 23],
  [5, 24, 15], [18, 16, 11], [42, 8, 32], [50, 3, 23], [59, 5, 7], [45, 10, 13], [23, 33, 3], [42, 10, 10], [18, 46, 10], [49, 4, 19],
  [57, 4, 16], [19, 22, 6], [44, 15, 13], [65, 21, 4], [18, 121, 1, 2], [42, 16, 33], [47, 6, 9], [45, 15, 58], [22, 53, 5], [61, 4, 19],
  [3, 6, 24, 26], [39, 22, 37, 39], [18, 139, 23, 24], [44, 12, 12], [42, 13, 34, 35], [46, 4, 16, 17], [32, 6, 8], [18, 103, 1, 2], [49, 3, 13, 14], [43, 2, 42],
  [19, 18, 10], [42, 1, 12], [57, 12, 1, 2], [18, 51, 10], [24, 3, 25], [44, 3, 23, 24], [39, 7, 7], [22, 43, 2], [47, 6, 2], [58, 4, 8],
  [18, 32, 8], [42, 20, 29], [50, 3, 2], [19, 4, 23], [45, 16, 14], [22, 55, 8, 9], [44, 15, 4], [53, 4, 12], [18, 62, 1, 2], [41, 10, 27],
  [42, 4, 24], [35, 3, 17], [49, 1, 6], [18, 145, 18], [44, 1, 16], [39, 5, 9], [57, 13, 5, 6], [18, 100, 4, 5], [22, 12, 2], [61, 3, 1],
];
let cacheVerso = { dia: '', dados: null };
function versiculoDoDia() {
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: process.env.TZ || 'America/Fortaleza' });
  if (cacheVerso.dia === hoje && cacheVerso.dados) return cacheVerso.dados;
  const n = Math.floor(Date.parse(hoje + 'T00:00:00Z') / 864e5);
  const [livro, cap, ini, fim] = VERSICULOS[n % VERSICULOS.length];
  const BIB = require('./biblioteca');
  const cod = BIB.padrao();
  let t = null; try { t = BIB.trecho(cod, livro, cap, ini, fim || ini); } catch { t = null; }
  if (!t || !t.linhas || !t.linhas.length) return null;
  const r = BIB.porCod(cod) || {};
  const dados = { livro, cap, ini, fim: fim || ini, texto: t.linhas.map(l => l[1]).join(' ').replace(/\s+/g, ' ').trim(), versao: r.sigla || cod, cod };
  cacheVerso = { dia: hoje, dados };
  return dados;
}

module.exports = function (app, P, auth, h) {
  // ── Versículo do dia
  app.get('/api/versiculo-do-dia', auth, h((req, res) => {
    const v = versiculoDoDia();
    if (!v) return res.status(404).json({ erro: 'Nenhuma Bíblia instalada.' });
    res.set('Cache-Control', 'private, max-age=1800').json(v);
  }));

  // ── Notificações
  app.get('/api/notificacoes', auth, h((req, res) => {
    const lista = db.prepare(`SELECT n.id, n.tipo, n.texto, n.link, n.lida, n.criado_em, u.id AS aid, u.nome AS anome, u.apelido AS aapelido, u.foto AS afoto
      FROM notificacoes n LEFT JOIN usuarios u ON u.id = n.ator_id WHERE n.usuario_id = ? ORDER BY n.id DESC LIMIT 60`).all(req.user.id);
    res.json({
      nao_lidas: db.prepare('SELECT COUNT(*) n FROM notificacoes WHERE usuario_id = ? AND lida = 0').get(req.user.id).n,
      lista: lista.map(n => ({ id: n.id, tipo: n.tipo, texto: n.texto, link: n.link, lida: !!n.lida, criado_em: n.criado_em,
        ator: n.aid ? { id: n.aid, nome: n.aapelido || n.anome, foto: n.afoto ? `/arquivos/${encodeURIComponent(n.afoto)}` : null } : null })),
    });
  }));
  app.get('/api/notificacoes/contagem', auth, h((req, res) => {
    res.json({ nao_lidas: db.prepare('SELECT COUNT(*) n FROM notificacoes WHERE usuario_id = ? AND lida = 0').get(req.user.id).n });
  }));
  app.post('/api/notificacoes/lidas', auth, h((req, res) => {
    const id = Number((req.body || {}).id) || 0;
    if (id) db.prepare('UPDATE notificacoes SET lida = 1 WHERE id = ? AND usuario_id = ?').run(id, req.user.id);
    else db.prepare('UPDATE notificacoes SET lida = 1 WHERE usuario_id = ?').run(req.user.id);
    res.json({ ok: true });
  }));
  app.get('/api/notificacoes/preferencias', auth, h((req, res) => {
    const rot = req.user.igreja_id ? { reacoes: PREFS.reacoes, comentarios: PREFS.comentarios, professor: 'Publicações e informativos da liderança da igreja' } : PREFS;
    res.json({ prefs: prefsDe(req.user.id), rotulos: rot, celular_disponivel: !!webpush, chave: webpush ? getConfig()._vapid_pub : null,
      aparelhos: db.prepare('SELECT COUNT(*) n FROM push_aparelhos WHERE usuario_id = ?').get(req.user.id).n });
  }));
  app.put('/api/notificacoes/preferencias', auth, h((req, res) => {
    const atual = prefsDe(req.user.id), b = req.body || {};
    for (const k of [...Object.keys(PREFS), 'celular']) if (typeof b[k] === 'boolean') atual[k] = b[k];
    db.prepare('UPDATE usuarios SET notif_prefs = ? WHERE id = ?').run(JSON.stringify(atual), req.user.id);
    res.json({ ok: true, prefs: atual });
  }));
  // Aparelho que aceitou receber notificações
  app.post('/api/push/aparelho', auth, h((req, res) => {
    const s = (req.body || {}).inscricao || {};
    if (!s.endpoint || !s.keys || !s.keys.p256dh || !s.keys.auth) return res.status(400).json({ erro: 'Inscrição inválida.' });
    db.prepare(`INSERT INTO push_aparelhos (usuario_id, endpoint, p256dh, auth) VALUES (?,?,?,?)
      ON CONFLICT(endpoint) DO UPDATE SET usuario_id = excluded.usuario_id, p256dh = excluded.p256dh, auth = excluded.auth`).run(req.user.id, s.endpoint, s.keys.p256dh, s.keys.auth);
    res.json({ ok: true });
  }));
  app.delete('/api/push/aparelho', auth, h((req, res) => {
    const ep = (req.body || {}).endpoint;
    if (ep) db.prepare('DELETE FROM push_aparelhos WHERE endpoint = ? AND usuario_id = ?').run(ep, req.user.id);
    res.json({ ok: true });
  }));
  app.post('/api/push/teste', auth, h((req, res) => {
    enviarPush(req.user.id, { titulo: 'VideiraBook', texto: 'Pronto! As notificações estão chegando neste aparelho.', link: '#/inicio', tag: 'teste' });
    res.json({ ok: true });
  }));

  // ── Professor: liberar ou tirar um curso de alguém
  P.post('/alunos/:id/matriculas/:curso', h((req, res) => {
    const u = db.prepare("SELECT id FROM usuarios WHERE id = ? AND papel = 'aluno'").get(Number(req.params.id));
    const c = db.prepare('SELECT id, titulo FROM cursos WHERE id = ?').get(Number(req.params.curso));
    if (!u || !c) return res.status(404).json({ erro: 'Aluno ou curso não encontrado.' });
    const novo = db.prepare('INSERT OR IGNORE INTO matriculas (usuario_id, curso_id) VALUES (?, ?)').run(u.id, c.id).changes;
    if (novo) notificar(u.id, { tipo: 'curso', texto: `O professor liberou o curso "${c.titulo}" para você. Bons estudos!`, link: '#/jornada', atorId: req.user.id, chave: `curso-${c.id}`, titulo: 'Curso liberado' });
    res.json({ ok: true });
  }));
  P.delete('/alunos/:id/matriculas/:curso', h((req, res) => {
    db.prepare('DELETE FROM matriculas WHERE usuario_id = ? AND curso_id = ?').run(Number(req.params.id), Number(req.params.curso));
    res.json({ ok: true });
  }));
};
Object.assign(module.exports, { temMatricula, totalMatriculas, notificar, notificarTodos, desfazer, nomeDe });
