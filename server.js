// VideiraBook — servidor
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { db, getConfig, setConfig, recalcularDatas, checklistPadrao, iso, UPLOAD_DIR } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Segredo do token: variável de ambiente ou gerado e guardado no banco
let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  SECRET = getConfig()._segredo;
  if (!SECRET) { SECRET = crypto.randomBytes(32).toString('hex'); setConfig('_segredo', SECRET); }
}

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
// Arquivos da interface (ficam na raiz do projeto; só estes são públicos)
const ESTATICOS = {
  '/css/style.css': 'style.css',
  '/js/core.js': 'core.js',
  '/js/aluno.js': 'aluno.js',
  '/js/professor.js': 'professor.js',
  '/img/logo.svg': 'logo.svg',
  '/fonts/newsreader-latin-opsz-normal.woff2': 'newsreader-latin-opsz-normal.woff2',
  '/fonts/newsreader-latin-opsz-italic.woff2': 'newsreader-latin-opsz-italic.woff2',
  '/fonts/figtree-latin-wght-normal.woff2': 'figtree-latin-wght-normal.woff2',
};
for (const [url, arq] of Object.entries(ESTATICOS)) {
  app.get(url, (req, res) => res.sendFile(path.join(__dirname, arq), { maxAge: '1h' }));
}

// ── Upload
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_MB) || 1024) * 1024 * 1024 },
});
function apagarArquivo(nome) {
  if (!nome) return;
  const p = path.join(UPLOAD_DIR, path.basename(nome));
  fs.promises.unlink(p).catch(() => {});
}
function nomeOriginal(f) {
  try { return Buffer.from(f.originalname, 'latin1').toString('utf8'); } catch { return f.originalname; }
}

// ── Autenticação
function emitirToken(res, u) {
  const token = jwt.sign({ id: u.id, papel: u.papel }, SECRET, { expiresIn: '30d' });
  res.cookie('vb_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 864e5, secure: process.env.COOKIE_SECURE === '1' });
}
function auth(req, res, next) {
  try {
    const dados = jwt.verify(req.cookies.vb_token || '', SECRET);
    const u = db.prepare('SELECT id, nome, usuario, telefone, papel, ativo FROM usuarios WHERE id = ?').get(dados.id);
    if (!u || !u.ativo) return res.status(401).json({ erro: 'Sessão encerrada. Entre novamente.' });
    req.user = u;
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão encerrada. Entre novamente.' });
  }
}
function soProfessor(req, res, next) {
  if (req.user.papel !== 'professor') return res.status(403).json({ erro: 'Acesso exclusivo do professor.' });
  next();
}
const h = fn => (req, res, next) => {
  try { const r = fn(req, res, next); if (r && r.catch) r.catch(next); } catch (e) { next(e); }
};

app.post('/api/login', h((req, res) => {
  const { usuario, senha } = req.body || {};
  const u = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(String(usuario || '').trim());
  if (!u || !bcrypt.compareSync(String(senha || ''), u.senha_hash)) return res.status(400).json({ erro: 'Usuário ou senha incorretos.' });
  if (!u.ativo) return res.status(403).json({ erro: 'Seu acesso está desativado. Fale com o professor.' });
  db.prepare("UPDATE usuarios SET ultimo_acesso = datetime('now','localtime') WHERE id = ?").run(u.id);
  emitirToken(res, u);
  res.json({ ok: true, papel: u.papel });
}));
app.post('/api/logout', (req, res) => { res.clearCookie('vb_token'); res.json({ ok: true }); });

app.get('/api/me', auth, h((req, res) => {
  const cfg = getConfig(); delete cfg._segredo;
  res.json({ usuario: req.user, config: cfg });
}));
app.put('/api/me/senha', auth, h((req, res) => {
  const { atual, nova } = req.body || {};
  const u = db.prepare('SELECT senha_hash FROM usuarios WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(String(atual || ''), u.senha_hash)) return res.status(400).json({ erro: 'A senha atual não confere.' });
  if (!nova || String(nova).length < 6) return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 6 caracteres.' });
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(bcrypt.hashSync(String(nova), 10), req.user.id);
  res.json({ ok: true });
}));

// Arquivos enviados (protegidos por login)
app.get('/arquivos/:nome', auth, (req, res) => {
  const p = path.join(UPLOAD_DIR, path.basename(req.params.nome));
  if (!fs.existsSync(p)) return res.status(404).send('Arquivo não encontrado');
  res.sendFile(p);
});

// ── Regras de acesso e progresso
function hoje() { return iso(new Date()); }
function somaDias(dataIso, dias) {
  const [y, m, d] = dataIso.split('-').map(Number);
  const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() + dias); return iso(dt);
}

// Monta a visão completa de um curso para um usuário (status de cada aula)
function visaoCurso(cursoId, user) {
  const cfg = getConfig();
  const ehProf = user.papel === 'professor';
  const curso = db.prepare('SELECT * FROM cursos WHERE id = ?').get(cursoId);
  if (!curso) return null;
  const modulos = db.prepare('SELECT * FROM modulos WHERE curso_id = ? ORDER BY ordem, id').all(cursoId);
  const aulas = db.prepare(`SELECT a.id, a.modulo_id, a.ordem, a.titulo, a.subtitulo, a.texto_base, a.data_encontro,
      a.liberada, a.publicada, a.pagina_inicio, a.pagina_fim
    FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?
    ORDER BY m.ordem, m.id, a.ordem, a.id`).all(cursoId);
  const itens = db.prepare(`SELECT ci.id, ci.aula_id, ci.tipo FROM checklist_itens ci
    JOIN aulas a ON a.id = ci.aula_id JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?`).all(cursoId);
  const feitos = new Set(db.prepare('SELECT item_id FROM checklist_feitos WHERE usuario_id = ?').all(user.id).map(r => r.item_id));
  const nPre = {};
  for (const r of db.prepare(`SELECT aula_id, COUNT(*) n FROM materiais WHERE pre_estudo = 1 GROUP BY aula_id`).all()) nPre[r.aula_id] = r.n;

  const porAula = {};
  for (const it of itens) {
    const p = porAula[it.aula_id] || (porAula[it.aula_id] = { total: 0, feitos: 0, obrig: 0, obrigFeitos: 0 });
    p.total++; if (feitos.has(it.id)) p.feitos++;
    if (it.tipo !== 'encontro') { p.obrig++; if (feitos.has(it.id)) p.obrigFeitos++; }
  }
  const diasAntes = Number(cfg.dias_antes_liberar || 0);
  const sequencial = cfg.sequencial === '1';
  const hj = hoje();
  let anteriorConcluida = true;
  let semana = 0;
  const lista = [];
  for (const a of aulas) {
    if (!a.publicada && !ehProf) continue;
    semana++;
    const p = porAula[a.id] || { total: 0, feitos: 0, obrig: 0, obrigFeitos: 0 };
    const concluida = p.obrig > 0 ? p.obrigFeitos >= p.obrig : false;
    const abreEm = a.data_encontro ? somaDias(a.data_encontro, -diasAntes) : null;
    const porData = a.liberada === 1 || (abreEm && hj >= abreEm);
    let status = 'disponivel', motivo = '';
    if (!ehProf) {
      if (!porData) { status = 'bloqueada'; motivo = abreEm ? `Abre em ${abreEm.split('-').reverse().join('/')}` : 'Aguardando liberação do professor'; }
      else if (sequencial && !anteriorConcluida) { status = 'bloqueada'; motivo = 'Conclua a aula anterior para abrir esta'; }
    }
    if (status !== 'bloqueada' && concluida) status = 'concluida';
    lista.push({ ...a, semana, status, motivo, concluida, abre_em: abreEm, pre_estudo: nPre[a.id] || 0,
      progresso: p.total ? Math.round((p.feitos / p.total) * 100) : 0, itens_total: p.total, itens_feitos: p.feitos });
    anteriorConcluida = concluida;
  }
  const mods = modulos.map(m => ({ ...m, aulas: lista.filter(a => a.modulo_id === m.id) }))
    .filter(m => ehProf || m.aulas.length);
  const concluidas = lista.filter(a => a.concluida).length;
  return {
    curso, modulos: mods, aulas: lista,
    resumo: { total: lista.length, concluidas, percentual: lista.length ? Math.round((concluidas / lista.length) * 100) : 0 },
  };
}

function aulaComCurso(aulaId) {
  return db.prepare(`SELECT a.*, m.curso_id, m.titulo AS modulo_titulo, m.ordem AS modulo_ordem
    FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE a.id = ?`).get(aulaId);
}
function podeAcessar(aulaId, user) {
  const a = aulaComCurso(aulaId);
  if (!a) return { erro: 404 };
  if (user.papel === 'professor') return { aula: a };
  const v = visaoCurso(a.curso_id, user);
  const item = v.aulas.find(x => x.id === a.id);
  if (!item || !v.curso.publicado) return { erro: 404 };
  if (item.status === 'bloqueada') return { erro: 403, motivo: item.motivo };
  return { aula: a, visao: v };
}

// ── ALUNO (também usado pelo professor no modo "ver como aluno")
app.get('/api/cursos', auth, h((req, res) => {
  const ehProf = req.user.papel === 'professor';
  const cursos = db.prepare(`SELECT * FROM cursos ${ehProf ? '' : 'WHERE publicado = 1'} ORDER BY ordem, id`).all();
  res.json(cursos.map(c => {
    const v = visaoCurso(c.id, req.user);
    const proxima = v.aulas.find(a => a.status === 'disponivel') || null;
    return { ...c, resumo: v.resumo, modulos: v.modulos.length, proxima };
  }));
}));

app.get('/api/cursos/:id', auth, h((req, res) => {
  const v = visaoCurso(Number(req.params.id), req.user);
  if (!v || (!v.curso.publicado && req.user.papel !== 'professor')) return res.status(404).json({ erro: 'Curso não encontrado.' });
  res.json(v);
}));

app.get('/api/inicio', auth, h((req, res) => {
  const cfg = getConfig(); delete cfg._segredo;
  const cursos = db.prepare('SELECT id FROM cursos WHERE publicado = 1 ORDER BY ordem, id').all();
  const visoes = cursos.map(c => visaoCurso(c.id, req.user));
  const hj = hoje();
  // Próximo encontro (a partir de hoje)
  let proximoEncontro = null;
  for (const v of visoes) for (const a of v.aulas) {
    if (a.data_encontro && a.data_encontro >= hj && (!proximoEncontro || a.data_encontro < proximoEncontro.data_encontro))
      proximoEncontro = { ...a, curso_id: v.curso.id, curso_titulo: v.curso.titulo };
  }
  // Aula para continuar
  let continuar = null;
  for (const v of visoes) { const a = v.aulas.find(x => x.status === 'disponivel'); if (a) { continuar = { ...a, curso_id: v.curso.id, curso_titulo: v.curso.titulo }; break; } }
  const avisos = db.prepare('SELECT * FROM avisos ORDER BY fixado DESC, id DESC LIMIT 5').all();
  res.json({
    config: cfg, proximoEncontro, continuar, avisos,
    cursos: visoes.map(v => ({ id: v.curso.id, titulo: v.curso.titulo, descricao: v.curso.descricao, resumo: v.resumo,
      modulos: v.modulos.map(m => ({ id: m.id, titulo: m.titulo, total: m.aulas.length, concluidas: m.aulas.filter(a => a.concluida).length })) })),
  });
}));

app.get('/api/aulas/:id', auth, h((req, res) => {
  const r = podeAcessar(Number(req.params.id), req.user);
  if (r.erro) return res.status(r.erro).json({ erro: r.erro === 403 ? r.motivo : 'Aula não encontrada.' });
  const a = r.aula;
  const v = r.visao || visaoCurso(a.curso_id, req.user);
  const idx = v.aulas.findIndex(x => x.id === a.id);
  const materiais = db.prepare('SELECT * FROM materiais WHERE aula_id = ? ORDER BY pre_estudo DESC, ordem, id').all(a.id);
  const feitos = new Set(db.prepare('SELECT item_id FROM checklist_feitos WHERE usuario_id = ?').all(req.user.id).map(x => x.item_id));
  const checklist = db.prepare('SELECT * FROM checklist_itens WHERE aula_id = ? ORDER BY ordem, id').all(a.id)
    .map(i => ({ ...i, feito: feitos.has(i.id) }));
  const resp = db.prepare('SELECT * FROM quiz_respostas WHERE usuario_id = ? AND aula_id = ?').get(req.user.id, a.id);
  const perguntas = db.prepare('SELECT * FROM quiz_perguntas WHERE aula_id = ? ORDER BY ordem, id').all(a.id).map(q => {
    const o = { id: q.id, pergunta: q.pergunta, opcoes: JSON.parse(q.opcoes) };
    if (resp) { o.correta = q.correta; o.explicacao = q.explicacao; }
    return o;
  });
  const nota = db.prepare('SELECT texto, atualizado_em FROM anotacoes WHERE usuario_id = ? AND aula_id = ?').get(req.user.id, a.id);
  const curso = db.prepare('SELECT id, titulo, livro_arquivo, livro_nome FROM cursos WHERE id = ?').get(a.curso_id);
  const meta = v.aulas[idx] || {};
  res.json({
    aula: { ...a, topicos: JSON.parse(a.topicos || '[]'), reflexao: JSON.parse(a.reflexao || '[]'), semana: meta.semana, status: meta.status, concluida: meta.concluida },
    curso, materiais, checklist,
    quiz: { perguntas, resposta: resp ? { ...resp, respostas: JSON.parse(resp.respostas) } : null },
    anotacao: nota || null,
    anterior: idx > 0 ? { id: v.aulas[idx - 1].id, titulo: v.aulas[idx - 1].titulo } : null,
    proxima: idx >= 0 && idx < v.aulas.length - 1 ? { id: v.aulas[idx + 1].id, titulo: v.aulas[idx + 1].titulo, status: v.aulas[idx + 1].status } : null,
    total_aulas: v.aulas.length,
  });
}));

app.post('/api/aulas/:id/checklist/:item', auth, h((req, res) => {
  const r = podeAcessar(Number(req.params.id), req.user);
  if (r.erro) return res.status(r.erro).json({ erro: 'Aula indisponível.' });
  const item = db.prepare('SELECT * FROM checklist_itens WHERE id = ? AND aula_id = ?').get(Number(req.params.item), r.aula.id);
  if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
  if (item.tipo === 'encontro') return res.status(400).json({ erro: 'A presença no encontro é marcada pelo professor.' });
  if (item.tipo === 'quiz') return res.status(400).json({ erro: 'Este item é marcado ao enviar o questionário.' });
  const feito = !!req.body.feito;
  if (feito) db.prepare('INSERT OR IGNORE INTO checklist_feitos (usuario_id, item_id) VALUES (?, ?)').run(req.user.id, item.id);
  else db.prepare('DELETE FROM checklist_feitos WHERE usuario_id = ? AND item_id = ?').run(req.user.id, item.id);
  res.json({ ok: true });
}));

app.post('/api/aulas/:id/quiz', auth, h((req, res) => {
  const r = podeAcessar(Number(req.params.id), req.user);
  if (r.erro) return res.status(r.erro).json({ erro: 'Aula indisponível.' });
  const perguntas = db.prepare('SELECT * FROM quiz_perguntas WHERE aula_id = ? ORDER BY ordem, id').all(r.aula.id);
  const respostas = req.body.respostas || {};
  if (perguntas.some(q => respostas[q.id] === undefined)) return res.status(400).json({ erro: 'Responda todas as perguntas antes de enviar.' });
  const acertos = perguntas.filter(q => Number(respostas[q.id]) === q.correta).length;
  db.prepare(`INSERT INTO quiz_respostas (usuario_id, aula_id, respostas, acertos, total) VALUES (?,?,?,?,?)
    ON CONFLICT(usuario_id, aula_id) DO UPDATE SET respostas = excluded.respostas, acertos = excluded.acertos, total = excluded.total, feito_em = datetime('now','localtime')`)
    .run(req.user.id, r.aula.id, JSON.stringify(respostas), acertos, perguntas.length);
  for (const it of db.prepare("SELECT id FROM checklist_itens WHERE aula_id = ? AND tipo = 'quiz'").all(r.aula.id))
    db.prepare('INSERT OR IGNORE INTO checklist_feitos (usuario_id, item_id) VALUES (?, ?)').run(req.user.id, it.id);
  res.json({ ok: true, acertos, total: perguntas.length });
}));

app.delete('/api/aulas/:id/quiz', auth, h((req, res) => {
  const r = podeAcessar(Number(req.params.id), req.user);
  if (r.erro) return res.status(r.erro).json({ erro: 'Aula indisponível.' });
  db.prepare('DELETE FROM quiz_respostas WHERE usuario_id = ? AND aula_id = ?').run(req.user.id, r.aula.id);
  res.json({ ok: true });
}));

app.put('/api/aulas/:id/anotacao', auth, h((req, res) => {
  const r = podeAcessar(Number(req.params.id), req.user);
  if (r.erro) return res.status(r.erro).json({ erro: 'Aula indisponível.' });
  db.prepare(`INSERT INTO anotacoes (usuario_id, aula_id, texto) VALUES (?,?,?)
    ON CONFLICT(usuario_id, aula_id) DO UPDATE SET texto = excluded.texto, atualizado_em = datetime('now','localtime')`)
    .run(req.user.id, r.aula.id, String(req.body.texto || '').slice(0, 50000));
  res.json({ ok: true });
}));

app.get('/api/avisos', auth, h((req, res) => {
  res.json(db.prepare('SELECT * FROM avisos ORDER BY fixado DESC, id DESC').all());
}));

// ── PROFESSOR
const P = express.Router();
P.use(auth, soProfessor);

P.get('/painel', h((req, res) => {
  const alunos = db.prepare("SELECT id, nome, usuario, ativo, ultimo_acesso FROM usuarios WHERE papel = 'aluno' ORDER BY nome").all();
  const cursos = db.prepare('SELECT * FROM cursos ORDER BY ordem, id').all();
  const hj = hoje();
  const visCursos = cursos.map(c => {
    const progresso = alunos.filter(a => a.ativo).map(al => visaoCurso(c.id, { id: al.id, papel: 'aluno' }).resumo.percentual);
    const media = progresso.length ? Math.round(progresso.reduce((s, x) => s + x, 0) / progresso.length) : 0;
    const v = visaoCurso(c.id, req.user);
    const proxima = v.aulas.find(a => a.data_encontro && a.data_encontro >= hj) || null;
    return { id: c.id, titulo: c.titulo, publicado: c.publicado, aulas: v.aulas.length, modulos: v.modulos.length, media, proxima };
  });
  const atividade = db.prepare(`SELECT u.nome, ci.texto, a.titulo AS aula, a.id AS aula_id, cf.feito_em FROM checklist_feitos cf
    JOIN usuarios u ON u.id = cf.usuario_id JOIN checklist_itens ci ON ci.id = cf.item_id JOIN aulas a ON a.id = ci.aula_id
    WHERE u.papel = 'aluno' ORDER BY cf.feito_em DESC LIMIT 12`).all();
  res.json({
    alunos: { total: alunos.length, ativos: alunos.filter(a => a.ativo).length,
      acessaram7d: alunos.filter(a => a.ultimo_acesso && a.ultimo_acesso >= somaDias(hj, -7)).length },
    cursos: visCursos, atividade,
  });
}));

// Alunos
P.get('/alunos', h((req, res) => {
  const alunos = db.prepare("SELECT id, nome, usuario, telefone, ativo, criado_em, ultimo_acesso FROM usuarios WHERE papel = 'aluno' ORDER BY nome").all();
  const cursos = db.prepare('SELECT id FROM cursos ORDER BY ordem, id').all();
  res.json(alunos.map(al => {
    const resumos = cursos.map(c => visaoCurso(c.id, { id: al.id, papel: 'aluno' }).resumo);
    const total = resumos.reduce((s, r) => s + r.total, 0), conc = resumos.reduce((s, r) => s + r.concluidas, 0);
    const presencas = db.prepare('SELECT COUNT(*) n FROM presencas WHERE usuario_id = ? AND presente = 1').get(al.id).n;
    return { ...al, concluidas: conc, total, percentual: total ? Math.round(conc / total * 100) : 0, presencas };
  }));
}));
function validarUsuario(usuario) {
  return /^[a-z0-9._-]{3,40}$/i.test(usuario);
}
P.post('/alunos', h((req, res) => {
  const { nome, usuario, senha, telefone } = req.body || {};
  if (!nome || !usuario || !senha) return res.status(400).json({ erro: 'Preencha nome, usuário e senha.' });
  if (!validarUsuario(usuario)) return res.status(400).json({ erro: 'O usuário deve ter de 3 a 40 caracteres, sem espaços nem acentos (letras, números, ponto, hífen).' });
  if (String(senha).length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
  if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) return res.status(400).json({ erro: 'Já existe alguém com esse usuário.' });
  const id = db.prepare("INSERT INTO usuarios (nome, usuario, telefone, senha_hash, papel) VALUES (?,?,?,?, 'aluno')")
    .run(String(nome).trim(), String(usuario).trim().toLowerCase(), telefone || null, bcrypt.hashSync(String(senha), 10)).lastInsertRowid;
  res.json({ ok: true, id });
}));
P.put('/alunos/:id', h((req, res) => {
  const al = db.prepare("SELECT * FROM usuarios WHERE id = ? AND papel = 'aluno'").get(Number(req.params.id));
  if (!al) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  const { nome, usuario, telefone, ativo, senha } = req.body || {};
  if (usuario && usuario !== al.usuario) {
    if (!validarUsuario(usuario)) return res.status(400).json({ erro: 'Usuário inválido.' });
    if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ? AND id <> ?').get(usuario, al.id)) return res.status(400).json({ erro: 'Já existe alguém com esse usuário.' });
  }
  db.prepare('UPDATE usuarios SET nome = ?, usuario = ?, telefone = ?, ativo = ? WHERE id = ?').run(
    nome ?? al.nome, (usuario ?? al.usuario).toLowerCase(), telefone ?? al.telefone, ativo === undefined ? al.ativo : (ativo ? 1 : 0), al.id);
  if (senha) {
    if (String(senha).length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(bcrypt.hashSync(String(senha), 10), al.id);
  }
  res.json({ ok: true });
}));
P.delete('/alunos/:id', h((req, res) => {
  db.prepare("DELETE FROM usuarios WHERE id = ? AND papel = 'aluno'").run(Number(req.params.id));
  res.json({ ok: true });
}));
P.get('/alunos/:id', h((req, res) => {
  const al = db.prepare("SELECT id, nome, usuario, telefone, ativo, criado_em, ultimo_acesso FROM usuarios WHERE id = ? AND papel = 'aluno'").get(Number(req.params.id));
  if (!al) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  const cursos = db.prepare('SELECT id FROM cursos ORDER BY ordem, id').all().map(c => {
    const v = visaoCurso(c.id, { id: al.id, papel: 'aluno' });
    const quiz = {};
    for (const q of db.prepare('SELECT aula_id, acertos, total FROM quiz_respostas WHERE usuario_id = ?').all(al.id)) quiz[q.aula_id] = q;
    const pres = new Set(db.prepare('SELECT aula_id FROM presencas WHERE usuario_id = ? AND presente = 1').all(al.id).map(x => x.aula_id));
    return { curso: v.curso, resumo: v.resumo, aulas: v.aulas.map(a => ({ id: a.id, semana: a.semana, titulo: a.titulo, status: a.status, progresso: a.progresso, concluida: a.concluida, quiz: quiz[a.id] || null, presente: pres.has(a.id), data_encontro: a.data_encontro })) };
  });
  res.json({ aluno: al, cursos });
}));

// Configurações
P.get('/config', h((req, res) => { const c = getConfig(); delete c._segredo; res.json(c); }));
P.put('/config', h((req, res) => {
  const permitidas = ['nome_turma', 'dia_semana', 'horario', 'duracao_min', 'local', 'data_inicio', 'dias_antes_liberar', 'sequencial'];
  for (const k of permitidas) if (req.body[k] !== undefined) setConfig(k, req.body[k]);
  if (req.body.recalcular) for (const c of db.prepare('SELECT id FROM cursos').all()) recalcularDatas(c.id);
  res.json({ ok: true });
}));

// Cursos
P.post('/cursos', h((req, res) => {
  const { titulo, descricao } = req.body || {};
  if (!titulo) return res.status(400).json({ erro: 'Informe o título do curso.' });
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM cursos').get().m || 0) + 1;
  const id = db.prepare('INSERT INTO cursos (titulo, descricao, ordem) VALUES (?,?,?)').run(titulo, descricao || '', ordem).lastInsertRowid;
  res.json({ ok: true, id });
}));
P.put('/cursos/:id', h((req, res) => {
  const c = db.prepare('SELECT * FROM cursos WHERE id = ?').get(Number(req.params.id));
  if (!c) return res.status(404).json({ erro: 'Curso não encontrado.' });
  const { titulo, descricao, publicado } = req.body || {};
  db.prepare('UPDATE cursos SET titulo = ?, descricao = ?, publicado = ? WHERE id = ?')
    .run(titulo ?? c.titulo, descricao ?? c.descricao, publicado === undefined ? c.publicado : (publicado ? 1 : 0), c.id);
  res.json({ ok: true });
}));
P.delete('/cursos/:id', h((req, res) => {
  const id = Number(req.params.id);
  const arquivos = db.prepare(`SELECT mt.arquivo FROM materiais mt JOIN aulas a ON a.id = mt.aula_id JOIN modulos m ON m.id = a.modulo_id WHERE m.curso_id = ?`).all(id);
  const c = db.prepare('SELECT livro_arquivo FROM cursos WHERE id = ?').get(id);
  db.prepare('DELETE FROM cursos WHERE id = ?').run(id);
  arquivos.forEach(x => apagarArquivo(x.arquivo)); if (c) apagarArquivo(c.livro_arquivo);
  res.json({ ok: true });
}));
P.post('/cursos/:id/livro', upload.single('arquivo'), h((req, res) => {
  const c = db.prepare('SELECT * FROM cursos WHERE id = ?').get(Number(req.params.id));
  if (!c || !req.file) return res.status(400).json({ erro: 'Envie o arquivo PDF do livro.' });
  apagarArquivo(c.livro_arquivo);
  db.prepare('UPDATE cursos SET livro_arquivo = ?, livro_nome = ? WHERE id = ?').run(req.file.filename, nomeOriginal(req.file), c.id);
  res.json({ ok: true });
}));
P.delete('/cursos/:id/livro', h((req, res) => {
  const c = db.prepare('SELECT * FROM cursos WHERE id = ?').get(Number(req.params.id));
  if (c) { apagarArquivo(c.livro_arquivo); db.prepare('UPDATE cursos SET livro_arquivo = NULL, livro_nome = NULL WHERE id = ?').run(c.id); }
  res.json({ ok: true });
}));
P.post('/cursos/:id/liberar-todas', h((req, res) => {
  const v = req.body.liberar ? 1 : 0;
  db.prepare('UPDATE aulas SET liberada = ? WHERE modulo_id IN (SELECT id FROM modulos WHERE curso_id = ?)').run(v, Number(req.params.id));
  res.json({ ok: true });
}));
P.post('/cursos/:id/recalcular', h((req, res) => { recalcularDatas(Number(req.params.id)); res.json({ ok: true }); }));

// Módulos
P.post('/modulos', h((req, res) => {
  const { curso_id, titulo, descricao } = req.body || {};
  if (!curso_id || !titulo) return res.status(400).json({ erro: 'Informe o título do módulo.' });
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM modulos WHERE curso_id = ?').get(curso_id).m || 0) + 1;
  const id = db.prepare('INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?,?,?,?)').run(curso_id, titulo, descricao || '', ordem).lastInsertRowid;
  res.json({ ok: true, id });
}));
P.put('/modulos/:id', h((req, res) => {
  const m = db.prepare('SELECT * FROM modulos WHERE id = ?').get(Number(req.params.id));
  if (!m) return res.status(404).json({ erro: 'Módulo não encontrado.' });
  db.prepare('UPDATE modulos SET titulo = ?, descricao = ? WHERE id = ?').run(req.body.titulo ?? m.titulo, req.body.descricao ?? m.descricao, m.id);
  res.json({ ok: true });
}));
P.delete('/modulos/:id', h((req, res) => {
  const id = Number(req.params.id);
  db.prepare('SELECT mt.arquivo FROM materiais mt JOIN aulas a ON a.id = mt.aula_id WHERE a.modulo_id = ?').all(id).forEach(x => apagarArquivo(x.arquivo));
  db.prepare('DELETE FROM modulos WHERE id = ?').run(id);
  res.json({ ok: true });
}));
// Reordenar: { tipo: 'modulo'|'aula', id, direcao: -1|1 }
P.post('/reordenar', h((req, res) => {
  const { tipo, id, direcao } = req.body || {};
  if (tipo === 'modulo') {
    const m = db.prepare('SELECT * FROM modulos WHERE id = ?').get(id);
    const irmaos = db.prepare('SELECT id FROM modulos WHERE curso_id = ? ORDER BY ordem, id').all(m.curso_id).map(x => x.id);
    const i = irmaos.indexOf(id), j = i + direcao;
    if (j < 0 || j >= irmaos.length) return res.json({ ok: true });
    [irmaos[i], irmaos[j]] = [irmaos[j], irmaos[i]];
    const up = db.prepare('UPDATE modulos SET ordem = ? WHERE id = ?');
    db.transaction(() => irmaos.forEach((x, k) => up.run(k + 1, x)))();
  } else {
    const a = db.prepare('SELECT * FROM aulas WHERE id = ?').get(id);
    const irmaos = db.prepare('SELECT id FROM aulas WHERE modulo_id = ? ORDER BY ordem, id').all(a.modulo_id).map(x => x.id);
    const i = irmaos.indexOf(id), j = i + direcao;
    if (j < 0 || j >= irmaos.length) return res.json({ ok: true });
    [irmaos[i], irmaos[j]] = [irmaos[j], irmaos[i]];
    const up = db.prepare('UPDATE aulas SET ordem = ? WHERE id = ?');
    db.transaction(() => irmaos.forEach((x, k) => up.run(k + 1, x)))();
  }
  res.json({ ok: true });
}));

// Aulas
P.post('/aulas', h((req, res) => {
  const { modulo_id, titulo } = req.body || {};
  if (!modulo_id || !titulo) return res.status(400).json({ erro: 'Informe o título da aula.' });
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM aulas WHERE modulo_id = ?').get(modulo_id).m || 0) + 1;
  const id = db.prepare("INSERT INTO aulas (modulo_id, ordem, titulo, topicos, reflexao, conteudo_html, publicada) VALUES (?,?,?, '[]', '[]', '', 0)")
    .run(modulo_id, ordem, titulo).lastInsertRowid;
  checklistPadrao(id, null, null, false);
  res.json({ ok: true, id });
}));
P.get('/aulas/:id', h((req, res) => {
  const a = aulaComCurso(Number(req.params.id));
  if (!a) return res.status(404).json({ erro: 'Aula não encontrada.' });
  const materiais = db.prepare('SELECT * FROM materiais WHERE aula_id = ? ORDER BY pre_estudo DESC, ordem, id').all(a.id);
  const checklist = db.prepare('SELECT * FROM checklist_itens WHERE aula_id = ? ORDER BY ordem, id').all(a.id);
  const quiz = db.prepare('SELECT * FROM quiz_perguntas WHERE aula_id = ? ORDER BY ordem, id').all(a.id).map(q => ({ ...q, opcoes: JSON.parse(q.opcoes) }));
  const alunos = db.prepare("SELECT id, nome FROM usuarios WHERE papel = 'aluno' AND ativo = 1 ORDER BY nome").all();
  const pres = new Set(db.prepare('SELECT usuario_id FROM presencas WHERE aula_id = ? AND presente = 1').all(a.id).map(x => x.usuario_id));
  const itensIds = checklist.map(c => c.id);
  const progresso = alunos.map(al => {
    const feitos = itensIds.length ? db.prepare(`SELECT COUNT(*) n FROM checklist_feitos WHERE usuario_id = ? AND item_id IN (${itensIds.join(',')})`).get(al.id).n : 0;
    const q = db.prepare('SELECT acertos, total FROM quiz_respostas WHERE usuario_id = ? AND aula_id = ?').get(al.id, a.id);
    return { ...al, presente: pres.has(al.id), feitos, total: itensIds.length, quiz: q || null };
  });
  const modulos = db.prepare('SELECT id, titulo FROM modulos WHERE curso_id = ? ORDER BY ordem').all(a.curso_id);
  res.json({ aula: { ...a, topicos: JSON.parse(a.topicos || '[]'), reflexao: JSON.parse(a.reflexao || '[]') }, materiais, checklist, quiz, alunos: progresso, modulos });
}));
P.put('/aulas/:id', h((req, res) => {
  const a = db.prepare('SELECT * FROM aulas WHERE id = ?').get(Number(req.params.id));
  if (!a) return res.status(404).json({ erro: 'Aula não encontrada.' });
  const b = req.body || {};
  const campos = ['titulo', 'subtitulo', 'objetivo', 'texto_base', 'conteudo_html', 'aplicacao', 'pagina_inicio', 'pagina_fim', 'data_encontro', 'liberada', 'publicada', 'modulo_id'];
  const novo = { ...a };
  for (const k of campos) if (b[k] !== undefined) novo[k] = b[k];
  if (b.topicos !== undefined) novo.topicos = JSON.stringify(b.topicos);
  if (b.reflexao !== undefined) novo.reflexao = JSON.stringify(b.reflexao);
  for (const k of ['pagina_inicio', 'pagina_fim']) novo[k] = novo[k] === '' || novo[k] === null ? null : Number(novo[k]);
  novo.liberada = novo.liberada ? 1 : 0; novo.publicada = novo.publicada ? 1 : 0;
  db.prepare(`UPDATE aulas SET titulo=?, subtitulo=?, objetivo=?, texto_base=?, topicos=?, conteudo_html=?, aplicacao=?, reflexao=?,
    pagina_inicio=?, pagina_fim=?, data_encontro=?, liberada=?, publicada=?, modulo_id=? WHERE id=?`).run(
    novo.titulo, novo.subtitulo, novo.objetivo, novo.texto_base, novo.topicos, novo.conteudo_html, novo.aplicacao, novo.reflexao,
    novo.pagina_inicio, novo.pagina_fim, novo.data_encontro || null, novo.liberada, novo.publicada, novo.modulo_id, a.id);
  // mantém o texto do item de leitura em dia com as páginas
  if (novo.pagina_inicio) {
    const txt = `Ler as páginas ${novo.pagina_inicio} a ${novo.pagina_fim || novo.pagina_inicio} do livro-texto`;
    const it = db.prepare("SELECT id FROM checklist_itens WHERE aula_id = ? AND tipo = 'leitura'").get(a.id);
    if (it) db.prepare('UPDATE checklist_itens SET texto = ? WHERE id = ?').run(txt, it.id);
    else db.prepare("INSERT INTO checklist_itens (aula_id, texto, tipo, ordem) VALUES (?, ?, 'leitura', 5)").run(a.id, txt);
  }
  res.json({ ok: true });
}));
P.delete('/aulas/:id', h((req, res) => {
  const id = Number(req.params.id);
  db.prepare('SELECT arquivo FROM materiais WHERE aula_id = ?').all(id).forEach(x => apagarArquivo(x.arquivo));
  db.prepare('DELETE FROM aulas WHERE id = ?').run(id);
  res.json({ ok: true });
}));

// Materiais (vídeo, pdf, texto, link, áudio)
const ROTULO = { video: 'Assistir', pdf: 'Ler', texto: 'Ler', link: 'Acessar', audio: 'Ouvir' };
P.post('/aulas/:id/materiais', upload.single('arquivo'), h((req, res) => {
  const aulaId = Number(req.params.id);
  const b = req.body || {};
  if (!b.titulo || !b.tipo) { if (req.file) apagarArquivo(req.file.filename); return res.status(400).json({ erro: 'Informe tipo e título do material.' }); }
  if (!req.file && !b.url && !b.conteudo) return res.status(400).json({ erro: 'Envie um arquivo, cole um link ou escreva o texto.' });
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM materiais WHERE aula_id = ?').get(aulaId).m || 0) + 1;
  const pre = b.pre_estudo === '1' || b.pre_estudo === 'true' || b.pre_estudo === true ? 1 : 0;
  const id = db.prepare(`INSERT INTO materiais (aula_id, tipo, titulo, descricao, url, arquivo, arquivo_nome, conteudo, pre_estudo, ordem)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(aulaId, b.tipo, b.titulo, b.descricao || '', b.url || null,
    req.file ? req.file.filename : null, req.file ? nomeOriginal(req.file) : null, b.conteudo || null, pre, ordem).lastInsertRowid;
  if (b.no_checklist !== '0') {
    const txt = `${ROTULO[b.tipo] || 'Ver'}${pre ? ' (pré-estudo)' : ''}: ${b.titulo}`;
    db.prepare("INSERT INTO checklist_itens (aula_id, texto, tipo, material_id, ordem) VALUES (?, ?, 'material', ?, ?)").run(aulaId, txt, id, pre ? 1 : 11);
  }
  res.json({ ok: true, id });
}));
P.put('/materiais/:id', upload.single('arquivo'), h((req, res) => {
  const m = db.prepare('SELECT * FROM materiais WHERE id = ?').get(Number(req.params.id));
  if (!m) return res.status(404).json({ erro: 'Material não encontrado.' });
  const b = req.body || {};
  let arquivo = m.arquivo, nome = m.arquivo_nome;
  if (req.file) { apagarArquivo(m.arquivo); arquivo = req.file.filename; nome = nomeOriginal(req.file); }
  const pre = b.pre_estudo === undefined ? m.pre_estudo : (b.pre_estudo === '1' || b.pre_estudo === 'true' || b.pre_estudo === true ? 1 : 0);
  db.prepare('UPDATE materiais SET tipo=?, titulo=?, descricao=?, url=?, arquivo=?, arquivo_nome=?, conteudo=?, pre_estudo=? WHERE id=?').run(
    b.tipo ?? m.tipo, b.titulo ?? m.titulo, b.descricao ?? m.descricao, b.url ?? m.url, arquivo, nome, b.conteudo ?? m.conteudo, pre, m.id);
  const tipo = b.tipo ?? m.tipo, titulo = b.titulo ?? m.titulo;
  db.prepare('UPDATE checklist_itens SET texto = ? WHERE material_id = ?').run(`${ROTULO[tipo] || 'Ver'}${pre ? ' (pré-estudo)' : ''}: ${titulo}`, m.id);
  res.json({ ok: true });
}));
P.delete('/materiais/:id', h((req, res) => {
  const m = db.prepare('SELECT * FROM materiais WHERE id = ?').get(Number(req.params.id));
  if (m) { apagarArquivo(m.arquivo); db.prepare('DELETE FROM materiais WHERE id = ?').run(m.id); }
  res.json({ ok: true });
}));

// Checklist
P.post('/aulas/:id/checklist', h((req, res) => {
  const { texto } = req.body || {};
  if (!texto) return res.status(400).json({ erro: 'Escreva o item do checklist.' });
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM checklist_itens WHERE aula_id = ?').get(Number(req.params.id)).m || 0) + 1;
  db.prepare("INSERT INTO checklist_itens (aula_id, texto, tipo, ordem) VALUES (?, ?, 'manual', ?)").run(Number(req.params.id), texto, ordem);
  res.json({ ok: true });
}));
P.put('/checklist/:id', h((req, res) => {
  db.prepare('UPDATE checklist_itens SET texto = ? WHERE id = ?').run(req.body.texto, Number(req.params.id));
  res.json({ ok: true });
}));
P.delete('/checklist/:id', h((req, res) => {
  db.prepare('DELETE FROM checklist_itens WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
}));
P.post('/checklist/:id/mover', h((req, res) => {
  const it = db.prepare('SELECT * FROM checklist_itens WHERE id = ?').get(Number(req.params.id));
  if (!it) return res.status(404).json({ erro: 'Item não encontrado.' });
  const ids = db.prepare('SELECT id FROM checklist_itens WHERE aula_id = ? ORDER BY ordem, id').all(it.aula_id).map(x => x.id);
  const i = ids.indexOf(it.id), j = i + Number(req.body.direcao);
  if (j >= 0 && j < ids.length) {
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const up = db.prepare('UPDATE checklist_itens SET ordem = ? WHERE id = ?');
    db.transaction(() => ids.forEach((x, k) => up.run(k + 1, x)))();
  }
  res.json({ ok: true });
}));

// Questionário
function garantirItemQuiz(aulaId) {
  const tem = db.prepare('SELECT COUNT(*) n FROM quiz_perguntas WHERE aula_id = ?').get(aulaId).n;
  const it = db.prepare("SELECT id FROM checklist_itens WHERE aula_id = ? AND tipo = 'quiz'").get(aulaId);
  if (tem && !it) db.prepare("INSERT INTO checklist_itens (aula_id, texto, tipo, ordem) VALUES (?, 'Fazer o questionário da aula', 'quiz', 90)").run(aulaId);
  if (!tem && it) db.prepare('DELETE FROM checklist_itens WHERE id = ?').run(it.id);
}
P.post('/aulas/:id/quiz', h((req, res) => {
  const aulaId = Number(req.params.id);
  const { pergunta, opcoes, correta, explicacao } = req.body || {};
  const ops = (opcoes || []).map(s => String(s).trim()).filter(Boolean);
  if (!pergunta || ops.length < 2) return res.status(400).json({ erro: 'Escreva a pergunta e pelo menos duas opções.' });
  if (correta === undefined || correta < 0 || correta >= ops.length) return res.status(400).json({ erro: 'Marque qual opção é a correta.' });
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM quiz_perguntas WHERE aula_id = ?').get(aulaId).m || 0) + 1;
  db.prepare('INSERT INTO quiz_perguntas (aula_id, pergunta, opcoes, correta, explicacao, ordem) VALUES (?,?,?,?,?,?)')
    .run(aulaId, pergunta, JSON.stringify(ops), Number(correta), explicacao || '', ordem);
  garantirItemQuiz(aulaId);
  res.json({ ok: true });
}));
P.put('/quiz/:id', h((req, res) => {
  const q = db.prepare('SELECT * FROM quiz_perguntas WHERE id = ?').get(Number(req.params.id));
  if (!q) return res.status(404).json({ erro: 'Pergunta não encontrada.' });
  const { pergunta, opcoes, correta, explicacao } = req.body || {};
  const ops = (opcoes || JSON.parse(q.opcoes)).map(s => String(s).trim()).filter(Boolean);
  db.prepare('UPDATE quiz_perguntas SET pergunta = ?, opcoes = ?, correta = ?, explicacao = ? WHERE id = ?')
    .run(pergunta ?? q.pergunta, JSON.stringify(ops), Number(correta ?? q.correta), explicacao ?? q.explicacao, q.id);
  res.json({ ok: true });
}));
P.delete('/quiz/:id', h((req, res) => {
  const q = db.prepare('SELECT * FROM quiz_perguntas WHERE id = ?').get(Number(req.params.id));
  if (q) { db.prepare('DELETE FROM quiz_perguntas WHERE id = ?').run(q.id); garantirItemQuiz(q.aula_id); }
  res.json({ ok: true });
}));

// Presença no encontro
P.put('/aulas/:id/presenca', h((req, res) => {
  const aulaId = Number(req.params.id);
  const { usuario_id, presente } = req.body || {};
  const itens = db.prepare("SELECT id FROM checklist_itens WHERE aula_id = ? AND tipo = 'encontro'").all(aulaId);
  if (presente) {
    db.prepare('INSERT OR REPLACE INTO presencas (usuario_id, aula_id, presente) VALUES (?, ?, 1)').run(usuario_id, aulaId);
    itens.forEach(it => db.prepare('INSERT OR IGNORE INTO checklist_feitos (usuario_id, item_id) VALUES (?, ?)').run(usuario_id, it.id));
  } else {
    db.prepare('DELETE FROM presencas WHERE usuario_id = ? AND aula_id = ?').run(usuario_id, aulaId);
    itens.forEach(it => db.prepare('DELETE FROM checklist_feitos WHERE usuario_id = ? AND item_id = ?').run(usuario_id, it.id));
  }
  res.json({ ok: true });
}));

// Avisos
P.post('/avisos', h((req, res) => {
  const { titulo, texto, fixado } = req.body || {};
  if (!titulo) return res.status(400).json({ erro: 'Informe o título do aviso.' });
  db.prepare('INSERT INTO avisos (titulo, texto, fixado) VALUES (?,?,?)').run(titulo, texto || '', fixado ? 1 : 0);
  res.json({ ok: true });
}));
P.put('/avisos/:id', h((req, res) => {
  const a = db.prepare('SELECT * FROM avisos WHERE id = ?').get(Number(req.params.id));
  if (!a) return res.status(404).json({ erro: 'Aviso não encontrado.' });
  const { titulo, texto, fixado } = req.body || {};
  db.prepare('UPDATE avisos SET titulo = ?, texto = ?, fixado = ? WHERE id = ?').run(titulo ?? a.titulo, texto ?? a.texto, fixado === undefined ? a.fixado : (fixado ? 1 : 0), a.id);
  res.json({ ok: true });
}));
P.delete('/avisos/:id', h((req, res) => { db.prepare('DELETE FROM avisos WHERE id = ?').run(Number(req.params.id)); res.json({ ok: true }); }));

app.use('/api/admin', P);

// SPA
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return res.status(404).json({ erro: 'Rota não encontrada.' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Erros
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ erro: 'Arquivo grande demais para envio.' });
  console.error(err);
  res.status(500).json({ erro: 'Algo deu errado no servidor. Tente de novo.' });
});

app.listen(PORT, () => console.log(`[VideiraBook] rodando em http://localhost:${PORT}`));
