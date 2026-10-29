// VideiraBook — banco de dados (SQLite)
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'videirabook.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE COLLATE NOCASE,
  telefone TEXT,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL DEFAULT 'aluno',
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT DEFAULT (datetime('now','localtime')),
  ultimo_acesso TEXT
);
CREATE TABLE IF NOT EXISTS config (chave TEXT PRIMARY KEY, valor TEXT);
CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  livro_arquivo TEXT,
  livro_nome TEXT,
  publicado INTEGER NOT NULL DEFAULT 1,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS modulos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  objetivo TEXT,
  texto_base TEXT,
  topicos TEXT,
  conteudo_html TEXT,
  aplicacao TEXT,
  reflexao TEXT,
  pagina_inicio INTEGER,
  pagina_fim INTEGER,
  data_encontro TEXT,
  liberada INTEGER NOT NULL DEFAULT 0,
  publicada INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS materiais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url TEXT,
  arquivo TEXT,
  arquivo_nome TEXT,
  conteudo TEXT,
  pre_estudo INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS checklist_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'manual',
  material_id INTEGER REFERENCES materiais(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS checklist_feitos (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES checklist_itens(id) ON DELETE CASCADE,
  feito_em TEXT DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (usuario_id, item_id)
);
CREATE TABLE IF NOT EXISTS quiz_perguntas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes TEXT NOT NULL,
  correta INTEGER NOT NULL,
  explicacao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quiz_respostas (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  respostas TEXT NOT NULL,
  acertos INTEGER NOT NULL,
  total INTEGER NOT NULL,
  feito_em TEXT DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (usuario_id, aula_id)
);
CREATE TABLE IF NOT EXISTS anotacoes (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  texto TEXT,
  atualizado_em TEXT DEFAULT (datetime('now','localtime')),
  PRIMARY KEY (usuario_id, aula_id)
);
CREATE TABLE IF NOT EXISTS presencas (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  presente INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (usuario_id, aula_id)
);
CREATE TABLE IF NOT EXISTS avisos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  texto TEXT,
  fixado INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS inscricoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cargo TEXT,
  igreja TEXT,
  aluno_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
`);

// ── Configurações padrão
const cfgPadrao = {
  nome_turma: 'Escola Bíblica — Turma 2026',
  dia_semana: '4',          // 0=domingo ... 6=sábado
  horario: '19:30',
  duracao_min: '90',
  local: 'Templo sede',
  data_inicio: '',
  dias_antes_liberar: '7',  // aula abre X dias antes do encontro (pré-estudo)
  sequencial: '1',          // aluno precisa concluir a anterior para abrir a próxima
  inscricoes_abertas: '1',  // página pública /inscricao aceita novas inscrições
};
const insCfg = db.prepare('INSERT OR IGNORE INTO config (chave, valor) VALUES (?, ?)');
for (const [k, v] of Object.entries(cfgPadrao)) insCfg.run(k, v);

function getConfig() {
  const o = {};
  for (const r of db.prepare('SELECT chave, valor FROM config').all()) o[r.chave] = r.valor;
  return o;
}
function setConfig(k, v) {
  db.prepare('INSERT INTO config (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(k, String(v ?? ''));
}

// ── Datas
function proximoDiaSemana(diaSemana, base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const delta = (Number(diaSemana) - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + delta);
  return d;
}
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function recalcularDatas(cursoId) {
  const cfg = getConfig();
  if (!cfg.data_inicio) return;
  const [y, m, d] = cfg.data_inicio.split('-').map(Number);
  const inicio = new Date(y, m - 1, d);
  const aulas = db.prepare(`SELECT a.id FROM aulas a JOIN modulos mo ON mo.id = a.modulo_id
    WHERE mo.curso_id = ? ORDER BY mo.ordem, a.ordem`).all(cursoId);
  const up = db.prepare('UPDATE aulas SET data_encontro = ? WHERE id = ?');
  db.transaction(() => {
    aulas.forEach((a, i) => {
      const dt = new Date(inicio); dt.setDate(dt.getDate() + i * 7);
      up.run(iso(dt), a.id);
    });
  })();
}

// ── Itens padrão do checklist de uma aula
function checklistPadrao(aulaId, pIni, pFim, temQuiz) {
  const ins = db.prepare('INSERT INTO checklist_itens (aula_id, texto, tipo, ordem) VALUES (?, ?, ?, ?)');
  let o = 10;
  if (pIni) ins.run(aulaId, `Ler as páginas ${pIni} a ${pFim} do livro-texto`, 'leitura', o++);
  ins.run(aulaId, 'Ler a explicação da aula', 'manual', o++);
  ins.run(aulaId, 'Meditar e memorizar o texto-base', 'manual', o++);
  ins.run(aulaId, 'Responder às perguntas de reflexão nas anotações', 'manual', o++);
  if (temQuiz) ins.run(aulaId, 'Fazer o questionário da aula', 'quiz', o++);
  ins.run(aulaId, 'Participar do encontro semanal', 'encontro', o++);
}

// ── Textos completos das aulas (pasta teologia/aula-01.html … aula-26.html)
const CONTEUDO_DIR = path.join(__dirname, 'teologia');
const CONTEUDO_VERSAO = '2';
function textoCompleto(n, reserva) {
  try {
    const f = path.join(CONTEUDO_DIR, `aula-${String(n).padStart(2, '0')}.html`);
    const t = fs.readFileSync(f, 'utf8').trim();
    if (t) return t;
  } catch (_) { /* arquivo ausente: usa o texto resumido */ }
  return (reserva || '').trim();
}

// ── Seed inicial
function seed() {
  const temUsuarios = db.prepare('SELECT COUNT(*) n FROM usuarios').get().n;
  if (!temUsuarios) {
    const usuario = process.env.PROFESSOR_USUARIO || 'professor';
    const senha = process.env.PROFESSOR_SENHA || 'videira123';
    db.prepare('INSERT INTO usuarios (nome, usuario, senha_hash, papel) VALUES (?, ?, ?, ?)')
      .run(process.env.PROFESSOR_NOME || 'Professor', usuario, bcrypt.hashSync(senha, 10), 'professor');
    console.log(`[VideiraBook] Professor criado → usuário: ${usuario} / senha: ${senha}`);
  }
  const temCurso = db.prepare('SELECT COUNT(*) n FROM cursos').get().n;
  if (temCurso) return;

  const cur = require('./curriculo');
  if (!getConfig().data_inicio) setConfig('data_inicio', iso(proximoDiaSemana(getConfig().dia_semana)));

  db.transaction(() => {
    const cursoId = db.prepare('INSERT INTO cursos (titulo, descricao, ordem) VALUES (?, ?, 1)')
      .run(cur.curso.titulo, cur.curso.descricao).lastInsertRowid;
    const insMod = db.prepare('INSERT INTO modulos (curso_id, titulo, descricao, ordem) VALUES (?, ?, ?, ?)');
    const insAula = db.prepare(`INSERT INTO aulas (modulo_id, ordem, titulo, subtitulo, objetivo, texto_base, topicos,
      conteudo_html, aplicacao, reflexao, pagina_inicio, pagina_fim) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const insQ = db.prepare('INSERT INTO quiz_perguntas (aula_id, pergunta, opcoes, correta, explicacao, ordem) VALUES (?,?,?,?,?,?)');
    let n = 0;
    cur.modulos.forEach((m, mi) => {
      const modId = insMod.run(cursoId, m.titulo, m.descricao, mi + 1).lastInsertRowid;
      m.aulas.forEach((a, ai) => {
        const aulaId = insAula.run(modId, ai + 1, a.t, a.s, a.obj, a.base, JSON.stringify(a.top || []),
          textoCompleto(++n, a.html), a.app, JSON.stringify(a.ref || []), a.p[0], a.p[1]).lastInsertRowid;
        (a.quiz || []).forEach((q, qi) => insQ.run(aulaId, q[0], JSON.stringify(q[1]), q[2], q[3] || '', qi + 1));
        checklistPadrao(aulaId, a.p[0], a.p[1], (a.quiz || []).length > 0);
      });
    });
    recalcularDatas(cursoId);
    setConfig('conteudo_versao', CONTEUDO_VERSAO);
    db.prepare('INSERT INTO avisos (titulo, texto, fixado) VALUES (?, ?, 1)').run(
      'Bem-vindo ao VideiraBook',
      'Aqui você encontra cada aula do nosso estudo de Teologia Sistemática Pentecostal. Antes de cada encontro, assista ao pré-estudo, leia as páginas indicadas e marque o checklist. “Eu sou a videira, vós, as varas” (Jo 15.5).'
    );
  })();
  console.log('[VideiraBook] Grade curricular inicial importada (10 módulos, 26 aulas).');
}
seed();

// ── Atualiza bancos já existentes com os textos completos.
// Só troca o texto das aulas que ainda estão com o resumo original (não mexe no que o professor editou).
function atualizarConteudo() {
  if ((getConfig().conteudo_versao || '1') >= CONTEUDO_VERSAO) return;
  const cur = require('./curriculo');
  const originais = [];
  cur.modulos.forEach(m => m.aulas.forEach(a => originais.push({ titulo: a.t, html: a.html.trim() })));
  const upd = db.prepare('UPDATE aulas SET conteudo_html = ? WHERE id = ?');
  let trocadas = 0;
  db.transaction(() => {
    const aulas = db.prepare('SELECT id, titulo, conteudo_html FROM aulas').all();
    originais.forEach((o, i) => {
      const novo = textoCompleto(i + 1, '');
      if (!novo) return;
      aulas.filter(a => a.titulo === o.titulo && (a.conteudo_html || '').trim() === o.html)
        .forEach(a => { upd.run(novo, a.id); trocadas++; });
    });
    setConfig('conteudo_versao', CONTEUDO_VERSAO);
  })();
  if (trocadas) console.log(`[VideiraBook] Textos completos aplicados em ${trocadas} aula(s).`);
}
atualizarConteudo();

module.exports = { db, getConfig, setConfig, recalcularDatas, checklistPadrao, iso, UPLOAD_DIR, DATA_DIR };
