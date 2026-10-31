// VideiraBook — leitura de módulos MySword (.bbl.mybible, .dct.mybible) e MyBible (.SQLite3)
// O arquivo é aberto só para leitura; o texto é convertido em HTML seguro na hora de mostrar.
const Database = require('better-sqlite3');

// Livros do MyBible (Android) usam numeração própria; aqui vira 1..66
const MYBIBLE_LIVROS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 190, 220, 230, 240, 250, 260, 290, 300, 310,
  330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590,
  600, 610, 620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730];

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', laquo: '«', raquo: '»', hellip: '…', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' };
const desentidade = s => String(s).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return ENT[e.toLowerCase()] ?? m;
});
const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const textoPuro = s => desentidade(String(s || '').replace(/<[^<>]*>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?»”)])/g, '$1').replace(/([«“(])\s+/g, '$1').trim();

// ── Abrir e identificar
const abertos = new Map();
function abrir(arquivo) {
  let d = abertos.get(arquivo);
  if (!d) {
    d = new Database(arquivo, { readonly: true, fileMustExist: true });
    d.function('normv', { deterministic: true }, s => norm(limparParaBusca(s)));
    d.function('normw', { deterministic: true }, s => norm(s));
    abertos.set(arquivo, d);
  }
  return d;
}
function fechar(arquivo) { colunasDic.delete(arquivo); const d = abertos.get(arquivo); if (d) { try { d.close(); } catch {} abertos.delete(arquivo); } }

function tabelas(d) { return d.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(r => r.name); }
function temTabela(ts, nome) { return ts.find(t => t.toLowerCase() === nome.toLowerCase()); }

function identificar(arquivo) {
  try {
    const fd = require('fs').openSync(arquivo, 'r'); const b = Buffer.alloc(16); require('fs').readSync(fd, b, 0, 16, 0); require('fs').closeSync(fd);
    if (b.toString('latin1') !== 'SQLite format 3\u0000') throw new Error('x');
  } catch { throw new Error('Este arquivo não é um módulo do MySword. Pode ser que o download não terminou ou que ele esteja compactado (.zip): extraia e envie o arquivo .mybible.'); }
  let d;
  try { d = new Database(arquivo, { readonly: true, fileMustExist: true }); } catch { throw new Error('O arquivo não é um módulo válido (não abriu como banco SQLite).'); }
  try {
    const ts = tabelas(d);
    const info = {};
    const det = temTabela(ts, 'Details');
    if (det) {
      const r = d.prepare(`SELECT * FROM "${det}" LIMIT 1`).get() || {};
      const v = k => { const c = Object.keys(r).find(x => x.toLowerCase() === k); return c ? r[c] : null; };
      Object.assign(info, { titulo: v('title'), sigla: v('abbreviation'), descricao: v('description'), comentarios: v('comments'), editora: v('publisher'), idioma: v('language'), autor: v('author'), estudo: /estudo|study/i.test(String(v('category') || v('type') || '')) || String(v('estudo') || '') === '1' });
    } else if (temTabela(ts, 'info')) {
      const o = {}; for (const r of d.prepare('SELECT name, value FROM info').all()) o[String(r.name).toLowerCase()] = r.value;
      Object.assign(info, { titulo: o.description, sigla: null, descricao: o.detailed_info, editora: o.origin, idioma: o.language });
    }
    let tipo = null, formato = null;
    const bib = temTabela(ts, 'Bible');
    if (bib && d.prepare(`SELECT 1 FROM "${bib}" LIMIT 1`).get()) { tipo = 'biblia'; formato = 'mysword'; }
    else if (temTabela(ts, 'verses')) { tipo = 'biblia'; formato = 'mybible'; }
    else if (temTabela(ts, 'dictionary')) {
      const cols = d.prepare('PRAGMA table_info(dictionary)').all().map(c => c.name.toLowerCase());
      tipo = 'dicionario'; formato = cols.includes('word') ? 'mysword' : 'mybible';
    } else if (temTabela(ts, 'commentary')) { tipo = 'comentario'; formato = 'mysword'; }
    else if (temTabela(ts, 'commentaries')) { tipo = 'comentario'; formato = 'mybible'; }
    else throw new Error('Não reconheci este arquivo. Envie uma Bíblia (.bbl.mybible), um dicionário (.dct.mybible) ou um comentário (.cmt.mybible) do MySword.');
    let quantos = 0;
    if (tipo === 'biblia') quantos = d.prepare(formato === 'mysword' ? `SELECT COUNT(*) n FROM "${bib}"` : 'SELECT COUNT(*) n FROM verses').get().n;
    else if (tipo === 'dicionario') quantos = d.prepare('SELECT COUNT(*) n FROM dictionary').get().n;
    else quantos = d.prepare(formato === 'mysword' ? 'SELECT COUNT(*) n FROM commentary' : 'SELECT COUNT(*) n FROM commentaries').get().n;
    const limpar = s => s ? textoPuro(s).slice(0, 400) : '';
    return { tipo, formato, quantos, titulo: limpar(info.titulo), sigla: limpar(info.sigla).slice(0, 20), descricao: limpar(info.descricao),
      comentarios: limpar(info.comentarios), editora: limpar(info.editora), autor: limpar(info.autor), estudo: !!info.estudo };
  } finally { d.close(); }
}

// ── Texto bíblico
const RE_EPIGRAFE = /^\(?\s*(salmo|cântico|canção|cantico|hino|oração|oracao|ao (mestre|regente|músico|cantor)|para o (mestre|regente|músico|cantor)|de davi|davídico|dos filhos|de asafe|de salomão|de moisés|masquil|mictão|sigaiom|shiggaion|aleluia)/i;
function limparParaBusca(s) {
  return String(s || '').replace(/<RF[^>]*>[\s\S]*?(?:<Rf>|<RF>)/g, ' ').replace(/<TS\d?>[\s\S]*?<Ts>/g, ' ')
    .replace(/<f>[\s\S]*?<\/f>|<S>[\s\S]*?<\/S>|<m>[\s\S]*?<\/m>|<n>[\s\S]*?<\/n>|<h>[\s\S]*?<\/h>/g, ' ')
    .replace(/<[^<>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');
}

// Converte um versículo MySword em { html, titulos, epigrafe, fimPar, recuo }
function versoMySword(bruto, livro0, verso) {
  let s = String(bruto || '');
  s = s.replace(/<W[^>]*>/g, '');                                   // números de Strong e morfologia
  s = s.replace(/><(?=(?:Mas|onde|E|A|Porque|Ai|nova|Se|Pois|Dois|Filipe|Ditas)\b)/g, ' ');   // defeito comum de marcação
  s = s.replace(/<RX[^>]*>/g, '');                                  // referências cruzadas
  const notas = [];
  s = s.replace(/<RF(?:\s[^>]*)?>([\s\S]*?)(?:<Rf>|<RF>)/g, (m, t) => { notas.push(textoPuro(t)); return `\u0001${notas.length - 1}\u0001`; });
  s = s.replace(/<RF(?:\s[^>]*)?>([\s\S]*)$/, (m, t) => { notas.push(textoPuro(t)); return `\u0001${notas.length - 1}\u0001`; });
  s = s.replace(/<sup>\s*(\u0001\d+\u0001)\s*<\/sup>/g, '$1');

  const titulos = []; let epigrafe = null; let corpo = ''; let pos = 0;
  for (const m of s.matchAll(/<TS\d?>([\s\S]*?)<Ts>/g)) {
    corpo += s.slice(pos, m.index); pos = m.index + m[0].length;
    const t = textoPuro(m[1].replace(/\u0001\d+\u0001/g, '')).replace(/^[|\s]+/, '');
    if (!t) continue;
    const vazio = !textoPuro(corpo.replace(/\u0001\d+\u0001/g, ''));
    if (!vazio) { corpo += ` <FI>${t.replace(/^\(\s*|\s*\)$/g, '')}<Fi> `; continue; }
    if (/^\(?\s*interlúdio\s*\)?$/i.test(t)) continue;
    if (livro0 === 18 && verso <= 1 && RE_EPIGRAFE.test(t)) epigrafe = (epigrafe ? epigrafe + ' ' : '') + t.replace(/^\(\s*|\s*\)$/g, '');
    else titulos.push(t);
  }
  corpo += s.slice(pos);
  corpo = corpo.replace(/<TS\d?>[\s\S]*$/, '');

  // Epígrafe dos Salmos escrita no começo do versículo 1
  if (livro0 === 18 && verso <= 1) {
    corpo = corpo.replace(/^\s*<b>\s*<font[^>]*>([\s\S]*?)<\/font>\.?\s*<\/b>\s*(<CL>)?/i, (m, t) => { epigrafe = textoPuro(t); return ''; });
    corpo = corpo.replace(/^\s*«([^»]{3,400})»\s*/, (m, t) => { epigrafe = textoPuro(t); return ''; });
  }

  let fimPar = false, recuo = 0;
  corpo = corpo.replace(/<CM>/g, () => { fimPar = true; return ' '; });
  corpo = corpo.replace(/<P[FI](\d)>/g, (m, n) => { recuo = Math.max(recuo, Number(n)); return ''; });

  // Marcação -> HTML próprio (tudo o que não for reconhecido some)
  const abre = { j: '<span class="jesus">', em: '<em>', b: '<b>', at: '<span class="citacao-at">' };
  const fecha = { j: '</span>', em: '</em>', b: '</b>', at: '</span>' };
  const MAPA = { '<FR>': ['+', 'j'], '<Fr>': ['-', 'j'], '<J>': ['+', 'j'], '</J>': ['-', 'j'], '<FI>': ['+', 'em'], '<Fi>': ['-', 'em'],
    '<i>': ['+', 'em'], '</i>': ['-', 'em'], '<em>': ['+', 'em'], '</em>': ['-', 'em'], '<FO>': ['+', 'at'], '<Fo>': ['-', 'at'],
    '<b>': ['+', 'b'], '</b>': ['-', 'b'], '<strong>': ['+', 'b'], '</strong>': ['-', 'b'] };
  const pilha = []; let html = '';
  for (const parte of corpo.split(/(<[^<>]*>)/)) {
    if (!parte) continue;
    if (parte[0] === '<' && parte.endsWith('>')) {
      const acao = MAPA[parte];
      if (acao && acao[0] === '+') { pilha.push(acao[1]); html += abre[acao[1]]; }
      else if (acao) { const i = pilha.lastIndexOf(acao[1]); if (i >= 0) { while (pilha.length > i) html += fecha[pilha.pop()]; } }
      else if (/^<(CL|br\s*\/?)>$/i.test(parte)) html += '<br>';
      else html += ' ';
      continue;
    }
    html += escHtml(desentidade(parte));
  }
  while (pilha.length) html += fecha[pilha.pop()];
  html = html.replace(/\u0001(\d+)\u0001/g, (m, i) => notas[i] ? `<button type="button" class="nota" data-nota="${escHtml(notas[i])}" aria-label="Nota">*</button>` : '');
  html = html.replace(/\s+/g, ' ').replace(/\s+([,.;:!?»”)])/g, '$1').replace(/([«“(])\s+/g, '$1').replace(/(<br>\s*)+$/, '').trim();
  html = html.replace(/^(<br>\s*)+/, '');
  return { html, titulos, epigrafe, fimPar, recuo };
}

function versoMyBible(bruto) {
  let s = String(bruto || '');
  const notas = [];
  s = s.replace(/<S>[\s\S]*?<\/S>|<m>[\s\S]*?<\/m>/g, '');
  s = s.replace(/<f>([\s\S]*?)<\/f>|<n>([\s\S]*?)<\/n>/g, (m, a, b) => { notas.push(textoPuro(a || b)); return `\u0001${notas.length - 1}\u0001`; });
  const titulos = [];
  s = s.replace(/<h>([\s\S]*?)<\/h>/g, (m, t) => { titulos.push(textoPuro(t)); return ''; });
  let fimPar = false;
  s = s.replace(/<pb\s*\/?>/g, () => { fimPar = true; return ' '; });
  const conv = s.replace(/<J>/g, '<FR>').replace(/<\/J>/g, '<Fr>').replace(/<t>/g, '<FO>').replace(/<\/t>/g, '<Fo>').replace(/<e>/g, '<b>').replace(/<\/e>/g, '</b>');
  const r = versoMySword(conv.replace(/\u0001(\d+)\u0001/g, (m, i) => `<RF>${escHtml(notas[i] || '')}<Rf>`), -1, 9);
  return { ...r, titulos: [...titulos, ...r.titulos], fimPar: fimPar || r.fimPar };
}

function capitulo(arquivo, formato, livro0, cap) {
  const d = abrir(arquivo);
  let linhas;
  if (formato === 'mybible') {
    linhas = d.prepare('SELECT verse AS v, text AS t FROM verses WHERE book_number = ? AND chapter = ? ORDER BY verse').all(MYBIBLE_LIVROS[livro0], cap);
  } else {
    const t = temTabela(tabelas(d), 'Bible');
    linhas = d.prepare(`SELECT Verse AS v, Scripture AS t FROM "${t}" WHERE Book = ? AND Chapter = ? ORDER BY Verse`).all(livro0 + 1, cap);
  }
  if (!linhas.length) return null;
  const versos = [], titulos = {}, fim = [], recuo = {};
  let epigrafe = null;
  for (const l of linhas) {
    const v = Number(l.v);
    const r = formato === 'mybible' ? versoMyBible(l.t) : versoMySword(l.t, livro0, v);
    if (v === 0) { epigrafe = r.epigrafe || textoPuro(r.html) || r.titulos.join(' '); continue; }
    if (r.epigrafe) epigrafe = epigrafe ? `${epigrafe} ${r.epigrafe}` : r.epigrafe;
    while (versos.length < v - 1) versos.push('');
    versos[v - 1] = r.html;
    if (r.titulos.length) titulos[v] = r.titulos.join(' · ');
    if (r.fimPar) fim.push(v);
    if (r.recuo) recuo[v] = r.recuo;
  }
  if (formato === 'mybible') {
    try {
      for (const s of d.prepare('SELECT verse, title FROM stories WHERE book_number = ? AND chapter = ? ORDER BY verse').all(MYBIBLE_LIVROS[livro0], cap)) {
        const t = textoPuro(s.title); if (t) titulos[s.verse] = titulos[s.verse] ? `${t} · ${titulos[s.verse]}` : t;
      }
    } catch { /* módulo sem títulos */ }
  }
  return { versos, titulos, epigrafe, fim, recuo };
}

// Concordância: procura uma palavra ou frase (sem diferenciar acentos e maiúsculas)
function buscar(arquivo, formato, termo, { de = 0, ate = 65, limite = 300 } = {}) {
  const d = abrir(arquivo); const q = `%${norm(termo).replace(/[%_]/g, '')}%`;
  let linhas;
  if (formato === 'mybible') {
    const nums = MYBIBLE_LIVROS.slice(de, ate + 1);
    linhas = d.prepare(`SELECT book_number AS b, chapter AS c, verse AS v, text AS t FROM verses WHERE book_number BETWEEN ? AND ? AND normv(text) LIKE ? ORDER BY book_number, chapter, verse LIMIT ?`)
      .all(nums[0], nums[nums.length - 1], q, limite + 1).map(l => ({ ...l, b: MYBIBLE_LIVROS.indexOf(l.b) + 1 }));
  } else {
    const t = temTabela(tabelas(d), 'Bible');
    linhas = d.prepare(`SELECT Book AS b, Chapter AS c, Verse AS v, Scripture AS t FROM "${t}" WHERE Book BETWEEN ? AND ? AND normv(Scripture) LIKE ? ORDER BY Book, Chapter, Verse LIMIT ?`)
      .all(de + 1, ate + 1, q, limite + 1);
  }
  return { mais: linhas.length > limite, lista: linhas.slice(0, limite).filter(l => l.v > 0).map(l => ({ l: l.b - 1, c: l.c, v: l.v, t: textoPuro(limparParaBusca(l.t)) })) };
}

// ── Dicionários
// Os dicionários variam: descobre as colunas de cada arquivo (palavra, texto e ordem)
const colunasDic = new Map();
function dicColunas(formato, arquivo) {
  if (arquivo && colunasDic.has(arquivo)) return colunasDic.get(arquivo);
  let c = formato === 'mybible' ? { w: 'topic', d: 'definition', o: 'rowid' } : { w: 'word', d: 'data', o: 'relativeorder' };
  if (arquivo) {
    try {
      const cols = abrir(arquivo).prepare('PRAGMA table_info(dictionary)').all().map(x => x.name);
      const acha = (...nomes) => cols.find(x => nomes.includes(x.toLowerCase()));
      c = { w: acha('word', 'topic', 'term', 'title') || cols[0], d: acha('data', 'definition', 'text', 'content') || cols[1] || cols[0], o: acha('relativeorder', 'order', 'ordem') || 'rowid' };
    } catch { /* usa o padrão */ }
    colunasDic.set(arquivo, c);
  }
  return c;
}
function verbetes(arquivo, formato, termo, limite = 80) {
  const d = abrir(arquivo); const c = dicColunas(formato, arquivo); const q = norm(termo).replace(/[%_]/g, '');
  if (!q) return d.prepare(`SELECT ${c.w} AS w FROM dictionary ORDER BY ${c.o} LIMIT ?`).all(limite).map(r => r.w);
  const inicio = d.prepare(`SELECT ${c.w} AS w FROM dictionary WHERE normw(${c.w}) LIKE ? ORDER BY normw(${c.w}) LIMIT ?`).all(q + '%', limite).map(r => r.w);
  if (inicio.length >= limite) return inicio;
  const meio = d.prepare(`SELECT ${c.w} AS w FROM dictionary WHERE normw(${c.w}) LIKE ? AND normw(${c.w}) NOT LIKE ? ORDER BY ${c.o} LIMIT ?`).all(`%${q}%`, q + '%', limite - inicio.length).map(r => r.w);
  return [...inicio, ...meio];
}
function verbeteBruto(arquivo, formato, palavra) {
  const d = abrir(arquivo); const c = dicColunas(formato, arquivo);
  return d.prepare(`SELECT ${c.w} AS w, ${c.d} AS d FROM dictionary WHERE ${c.w} = ? COLLATE NOCASE LIMIT 1`).get(palavra)
    || d.prepare(`SELECT ${c.w} AS w, ${c.d} AS d FROM dictionary WHERE normw(${c.w}) = ? LIMIT 1`).get(norm(palavra));
}
// Vários verbetes de uma vez (usado pela IA): só os que existem
function verbetesExatos(arquivo, formato, palavras) {
  const d = abrir(arquivo); const c = dicColunas(formato, arquivo);
  const st = d.prepare(`SELECT ${c.w} AS w, ${c.d} AS d FROM dictionary WHERE normw(${c.w}) = ? LIMIT 1`);
  const out = []; for (const p of palavras) { const r = st.get(norm(p)); if (r && !out.some(x => x.w === r.w)) out.push(r); }
  return out;
}
function verbetePorPrefixo(arquivo, formato, prefixo) {
  const d = abrir(arquivo); const c = dicColunas(formato, arquivo);
  return d.prepare(`SELECT ${c.w} AS w, ${c.d} AS d FROM dictionary WHERE normw(${c.w}) LIKE ? ORDER BY length(${c.w}) LIMIT 1`).get(norm(prefixo) + '%');
}
// ── Comentários: trechos que cobrem um versículo (ou o capítulo inteiro, com verso 0)
function comentarios(arquivo, formato, livro0, cap, verso) {
  const d = abrir(arquivo);
  if (formato === 'mybible') {
    const b = MYBIBLE_LIVROS[livro0];
    const linhas = d.prepare(`SELECT chapter_number_from AS c, verse_number_from AS de, chapter_number_to AS c2, verse_number_to AS ate, text AS t FROM commentaries
      WHERE book_number = ? AND chapter_number_from <= ? AND COALESCE(NULLIF(chapter_number_to, 0), chapter_number_from) >= ? ORDER BY chapter_number_from, verse_number_from`).all(b, cap, cap);
    return linhas.filter(l => !verso || ((l.c < cap || l.de <= verso) && ((l.c2 || l.c) > cap || (l.ate || l.de) >= verso)))
      .map(l => ({ cap: l.c, de: l.de, ate: l.ate || l.de, html: l.t }));
  }
  const linhas = verso
    ? d.prepare('SELECT chapter AS c, fromverse AS de, toverse AS ate, data AS t FROM commentary WHERE book = ? AND chapter = ? AND fromverse <= ? AND MAX(COALESCE(toverse, 0), fromverse) >= ? ORDER BY (MAX(COALESCE(toverse,0), fromverse) - fromverse), fromverse').all(livro0 + 1, cap, verso, verso)
    : d.prepare('SELECT chapter AS c, fromverse AS de, toverse AS ate, data AS t FROM commentary WHERE book = ? AND chapter = ? ORDER BY fromverse').all(livro0 + 1, cap);
  return linhas.map(l => ({ cap: l.c, de: l.de, ate: Math.max(l.ate || 0, l.de), html: l.t }));
}
function introducao(arquivo, formato, livro0) {
  if (formato === 'mybible') return [];
  const d = abrir(arquivo);
  return d.prepare('SELECT data AS t FROM commentary WHERE book = ? AND chapter = 0 ORDER BY id').all(livro0 + 1).map(l => l.t);
}
// Bíblia de estudo: todas as notas que começam no capítulo, na ordem do texto
function notasDoCapitulo(arquivo, formato, livro0, cap) {
  const d = abrir(arquivo);
  if (formato === 'mybible') {
    return d.prepare(`SELECT chapter_number_from AS c, verse_number_from AS de, chapter_number_to AS c2, verse_number_to AS ate, text AS t FROM commentaries
      WHERE book_number = ? AND chapter_number_from = ? ORDER BY verse_number_from, rowid`).all(MYBIBLE_LIVROS[livro0], cap)
      .map(l => ({ cap: l.c, capAte: l.c2 || l.c, de: l.de || 0, ate: Math.max(l.ate || 0, l.de || 0), html: l.t }));
  }
  return d.prepare('SELECT chapter AS c, fromverse AS de, toverse AS ate, data AS t FROM commentary WHERE book = ? AND chapter = ? ORDER BY fromverse, id').all(livro0 + 1, cap)
    .map(l => ({ cap: l.c, capAte: l.c, de: l.de || 0, ate: Math.max(l.ate || 0, l.de || 0), html: l.t }));
}
// Versículos de um capítulo que têm comentário (para marcar no leitor)
function versosComentados(arquivo, formato, livro0, cap) {
  const d = abrir(arquivo); const set = new Set();
  const linhas = formato === 'mybible'
    ? d.prepare('SELECT verse_number_from AS de, verse_number_to AS ate FROM commentaries WHERE book_number = ? AND chapter_number_from = ?').all(MYBIBLE_LIVROS[livro0], cap)
    : d.prepare('SELECT fromverse AS de, toverse AS ate FROM commentary WHERE book = ? AND chapter = ?').all(livro0 + 1, cap);
  for (const l of linhas) for (let v = Math.max(1, l.de || 1); v <= Math.max(l.ate || 0, l.de || 1) && v < 200; v++) set.add(v);
  return set;
}

function versoBruto(arquivo, formato, livro0, cap, verso) {
  const d = abrir(arquivo);
  if (formato === 'mybible') { const r = d.prepare('SELECT text AS t FROM verses WHERE book_number = ? AND chapter = ? AND verse = ?').get(MYBIBLE_LIVROS[livro0], cap, verso); return r ? r.t : ''; }
  const t = temTabela(tabelas(d), 'Bible');
  const r = d.prepare(`SELECT Scripture AS t FROM "${t}" WHERE Book = ? AND Chapter = ? AND Verse = ?`).get(livro0 + 1, cap, verso); return r ? r.t : '';
}

function imagem(arquivo, id) {
  const d = abrir(arquivo);
  if (!temTabela(tabelas(d), 'data')) return null;
  return d.prepare('SELECT content FROM data WHERE id = ? COLLATE NOCASE LIMIT 1').get(id);
}

// HTML do verbete com só as marcas permitidas; links de versículo viram pop-up, links de verbete abrem outro verbete
const PERMITIDAS = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'sup', 'sub', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr']);
function htmlVerbete(bruto, cod) {
  const s = String(bruto || ''); let html = ''; let emLink = null;
  for (const parte of s.split(/(<[^<>]*>)/)) {
    if (!parte) continue;
    if (!(parte[0] === '<' && parte.endsWith('>'))) { html += parte.replace(/</g, '&lt;').replace(/>/g, '&gt;'); continue; }
    const m = parte.match(/^<\s*(\/?)\s*([a-z0-9]+)([^>]*)>$/i); if (!m) { html += ' '; continue; }
    const fechando = !!m[1], tag = m[2].toLowerCase(), attrs = m[3] || '';
    if (tag === 'a') {
      if (fechando) { if (emLink) { html += emLink; emLink = null; } continue; }
      const href = (attrs.match(/href\s*=\s*['"]?([^'"\s>]+)/i) || [])[1] || '';
      let b;
      if ((b = href.match(/^#?b(\d+)\.(\d+)\.(\d+)(?:-(?:(\d+)\.(\d+)\.)?(\d+))?/))) {
        const livro = Number(b[1]) - 1, cap = Number(b[2]), ini = Number(b[3]); const fim = b[6] && (!b[5] || Number(b[5]) === cap) ? Number(b[6]) : ini;
        if (livro >= 0 && livro < 66) { html += `<a class="ref-biblia" data-livro="${livro}" data-cap="${cap}" data-ini="${ini}" data-fim="${Math.max(ini, fim)}" href="#">`; emLink = '</a>'; continue; }
      }
      if ((b = href.match(/^#?d(.+)$/))) { let alvo = b[1]; try { alvo = decodeURIComponent(alvo); } catch {}
        html += `<a class="ref-verbete" data-verbete="${escHtml(desentidade(alvo))}" href="#">`; emLink = '</a>'; continue; }
      if (/^https?:\/\//i.test(href)) { html += `<a href="${escHtml(href)}" target="_blank" rel="noopener">`; emLink = '</a>'; continue; }
      html += '<span>'; emLink = '</span>'; continue;
    }
    if (tag === 'img') {
      const src = (attrs.match(/src\s*=\s*['"]?([^'"\s>]+)/i) || [])[1] || '';
      if (/^data:/i.test(src)) continue;
      const id = src.replace(/^.*[\\/]/, '').replace(/^#?/, '');
      if (id) html += `<img src="/api/modulos/${encodeURIComponent(cod)}/imagem/${encodeURIComponent(id)}" alt="" loading="lazy">`;
      continue;
    }
    if (!PERMITIDAS.has(tag)) { html += ' '; continue; }
    const t = /^h[1-6]$/.test(tag) ? 'h4' : tag === 'strong' ? 'b' : tag;
    html += fechando ? `</${t}>` : t === 'br' || t === 'hr' ? `<${t}>` : `<${t}>`;
  }
  if (emLink) html += emLink;
  return html;
}

module.exports = { notasDoCapitulo, versoBruto, identificar, capitulo, buscar, comentarios, introducao, versosComentados, verbetes, verbeteBruto, verbetesExatos, verbetePorPrefixo, htmlVerbete, imagem, fechar, textoPuro, norm, escHtml };
