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
CREATE TABLE IF NOT EXISTS biblioteca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cod TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,              -- biblia | dicionario
  formato TEXT NOT NULL,           -- mysword | mybible | json
  arquivo TEXT NOT NULL,           -- embutido:NOME ou dados:NOME
  sigla TEXT NOT NULL,
  titulo TEXT NOT NULL,
  creditos TEXT,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 99,
  ativo INTEGER NOT NULL DEFAULT 1,
  embutido INTEGER NOT NULL DEFAULT 0,
  tamanho INTEGER,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS frases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  autor TEXT NOT NULL,
  frase TEXT NOT NULL,
  fonte TEXT,
  ativo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sermoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT 'Novo sermão',
  tipo TEXT NOT NULL,
  referencia TEXT, livro INTEGER, cap INTEGER, ini INTEGER, fim INTEGER,
  tema TEXT, publico TEXT, ocasiao TEXT, duracao INTEGER, formato TEXT, versao TEXT,
  dicionarios TEXT, palavras TEXT, observacoes TEXT,
  conteudo TEXT NOT NULL DEFAULT '',
  chat TEXT NOT NULL DEFAULT '[]',
  fontes TEXT NOT NULL DEFAULT '{}',
  criado_em TEXT DEFAULT (datetime('now','localtime')),
  atualizado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS ia_cache (
  chave TEXT PRIMARY KEY, texto TEXT NOT NULL, criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS ia_uso (
  usuario_id INTEGER NOT NULL, dia TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (usuario_id, dia)
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

// Colunas novas em bancos antigos
if (!db.prepare('PRAGMA table_info(usuarios)').all().some(c => c.name === 'pode_ia')) db.exec('ALTER TABLE usuarios ADD COLUMN pode_ia INTEGER NOT NULL DEFAULT 0');
// Bíblia de estudo: módulos marcados como "estudo" e alunos liberados pelo professor
if (!db.prepare('PRAGMA table_info(usuarios)').all().some(c => c.name === 'pode_estudo')) db.exec('ALTER TABLE usuarios ADD COLUMN pode_estudo INTEGER NOT NULL DEFAULT 0');
if (!db.prepare('PRAGMA table_info(biblioteca)').all().some(c => c.name === 'estudo')) db.exec('ALTER TABLE biblioteca ADD COLUMN estudo INTEGER NOT NULL DEFAULT 0');
// Grifos: trechos marcados por cada pessoa (posição em caracteres dentro do texto do versículo)
db.exec(`CREATE TABLE IF NOT EXISTS grifos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  versao TEXT NOT NULL, livro INTEGER NOT NULL, cap INTEGER NOT NULL, verso INTEGER NOT NULL,
  ini INTEGER NOT NULL, fim INTEGER NOT NULL, cor TEXT NOT NULL DEFAULT 'amarelo',
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS grifos_cap ON grifos (usuario_id, versao, livro, cap);`);

// Frases iniciais de homens de Deus (o professor pode editar, desativar e acrescentar)
if (!db.prepare('SELECT COUNT(*) n FROM frases').get().n) {
  const ins = db.prepare('INSERT INTO frases (autor, frase, fonte) VALUES (?,?,?)');
  [
    ['Agostinho de Hipona', 'Tu nos fizeste para ti, e inquieto está o nosso coração enquanto não repousa em ti.', 'Confissões, livro I'],
    ['Martinho Lutero', 'Minha consciência está cativa à Palavra de Deus.', 'Dieta de Worms, 1521'],
    ['Richard Baxter', 'Preguei como quem nunca tem certeza de pregar outra vez, e como um moribundo a moribundos.', 'Love Breathing Thanks and Praise'],
    ['William Carey', 'Espere grandes coisas de Deus; empreenda grandes coisas para Deus.', 'Sermão em Nottingham, 1792'],
    ['John Wesley', 'Dá-me cem pregadores que nada temam senão o pecado e nada desejem senão a Deus, e eu abalarei as portas do inferno.', 'Carta a Alexander Mather, 1790'],
    ['Jim Elliot', 'Não é tolo quem dá o que não pode reter para ganhar o que não pode perder.', 'Diário, 1949'],
    ['Dietrich Bonhoeffer', 'Quando Cristo chama um homem, ele o chama para vir e morrer.', 'Discipulado'],
    ['A. W. Tozer', 'O que vem à nossa mente quando pensamos em Deus é o que há de mais importante a nosso respeito.', 'O Conhecimento do Santo'],
    ['C. S. Lewis', 'Creio no cristianismo como creio que o sol nasceu: não apenas porque o vejo, mas porque por meio dele vejo todas as outras coisas.', 'O peso da glória'],
    ['John Piper', 'Deus é mais glorificado em nós quando estamos mais satisfeitos nele.', 'Em busca de Deus'],
    ['Charles H. Spurgeon', 'Defender a Bíblia? Eu preferiria defender um leão. Solte-o, e ele se defenderá sozinho.', 'Atribuída (sermões)'],
    ['Hudson Taylor', 'A obra de Deus, feita à maneira de Deus, nunca carecerá dos recursos de Deus.', 'Atribuída'],
  ].forEach(f => ins.run(...f));
}

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
  biblia_padrao: 'ara',     // versão que abre primeiro para quem nunca escolheu
  ia_ativa: '0',            // ferramenta de sermões ligada
  ia_modelo: 'gpt-6.1-sol', // modelo da OpenAI
  ia_limite_dia: '15',      // gerações/ajustes por pessoa por dia
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
