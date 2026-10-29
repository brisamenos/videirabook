// VideiraBook — Bíblias e dicionários instalados (os que vêm com o app e os que o professor importa)
const path = require('path');
const fs = require('fs');
const { db, getConfig, DATA_DIR } = require('./db');
const ms = require('./mysword');

const PASTA_EMBUTIDOS = path.join(__dirname, 'modulos', 'biblias');
const PASTA_DADOS = path.join(DATA_DIR, 'modulos');
fs.mkdirSync(PASTA_DADOS, { recursive: true });

// Os que vêm junto com o app
const EMBUTIDOS = [
  { cod: 'ara', arquivo: 'ARA.bbl.mybible', sigla: 'ARA', titulo: 'Almeida Revista e Atualizada', creditos: '© Sociedade Bíblica do Brasil', ordem: 1 },
  { cod: 'acf', arquivo: 'ACF.bbl.mybible', sigla: 'ACF', titulo: 'Almeida Corrigida Fiel', creditos: '© 2011 Sociedade Bíblica Trinitariana do Brasil', ordem: 2 },
  { cod: 'nvi', arquivo: 'NVI.bbl.mybible', sigla: 'NVI', titulo: 'Nova Versão Internacional', creditos: '© Biblica, Inc.', ordem: 3 },
  { cod: 'nvt', arquivo: 'NVT.bbl.mybible', sigla: 'NVT', titulo: 'Nova Versão Transformadora', creditos: '© Editora Mundo Cristão', ordem: 4 },
  { cod: 'kjf', arquivo: 'KJF.bbl.mybible', sigla: 'KJF', titulo: 'King James Fiel 1611', creditos: '© Bíblia King James Fiel 1611', ordem: 5 },
  { cod: 'alm', arquivo: 'biblia.json', sigla: 'Almeida', titulo: 'Almeida 1819', creditos: 'Domínio público', ordem: 6, formato: 'json' },
];
function caminho(r) {
  const [onde, nome] = String(r.arquivo).split(':');
  if (onde === 'dados') return path.join(PASTA_DADOS, path.basename(nome));
  const p = path.join(PASTA_EMBUTIDOS, path.basename(nome));
  return fs.existsSync(p) ? p : path.join(__dirname, path.basename(nome));
}
(function registrarEmbutidos() {
  const ins = db.prepare(`INSERT OR IGNORE INTO biblioteca (cod, tipo, formato, arquivo, sigla, titulo, creditos, ordem, embutido, tamanho)
    VALUES (?, 'biblia', ?, ?, ?, ?, ?, ?, 1, ?)`);
  for (const e of EMBUTIDOS) {
    const r = { arquivo: `embutido:${e.arquivo}` }; const p = caminho(r);
    if (!fs.existsSync(p)) continue;
    ins.run(e.cod, e.formato || 'mysword', r.arquivo, e.sigla, e.titulo, e.creditos, e.ordem, fs.statSync(p).size);
  }
})();

const porCod = cod => db.prepare('SELECT * FROM biblioteca WHERE cod = ?').get(cod);
function listar(tipo, { todos = false } = {}) {
  return db.prepare(`SELECT * FROM biblioteca WHERE tipo = ? ${todos ? '' : 'AND ativo = 1'} ORDER BY ordem, id`).all(tipo);
}
function padrao() {
  const c = getConfig().biblia_padrao; const ativas = listar('biblia');
  return (ativas.find(b => b.cod === c) || ativas[0] || {}).cod || 'alm';
}
function biblia(cod) {
  const r = porCod(cod);
  if (r && r.tipo === 'biblia' && r.ativo && fs.existsSync(caminho(r))) return r;
  const p = porCod(padrao()); return p && fs.existsSync(caminho(p)) ? p : null;
}

// Almeida 1819 em JSON (texto simples, itálico entre colchetes)
let ALM = null;
const almeida = r => (ALM ||= JSON.parse(fs.readFileSync(caminho(r), 'utf8')));
const htmlSimples = t => ms.escHtml(t).replace(/\[([^\]]+)\]/g, '<em>$1</em>');

function capitulo(cod, livro0, cap) {
  const r = biblia(cod); if (!r) return null;
  let c;
  if (r.formato === 'json') {
    const b = almeida(r); const v = b.livros[livro0] && b.livros[livro0][cap - 1]; if (!v) return null;
    const titulos = {};
    if (b.titulos) v.forEach((_, i) => { const t = b.titulos[`${livro0}.${cap}.${i + 1}`]; if (t) titulos[i + 1] = t; });
    c = { versos: v.map(htmlSimples), titulos, epigrafe: null, fim: [], recuo: {} };
  } else c = ms.capitulo(caminho(r), r.formato, livro0, cap);
  if (!c) return null;
  return { cod: r.cod, versao: r.titulo, sigla: r.sigla, licenca: r.creditos || '', ...c };
}
// Texto simples de um trecho (para a IA e para citar)
function trecho(cod, livro0, cap, ini, fim) {
  const c = capitulo(cod, livro0, cap); if (!c) return null;
  const de = ini || 1, ate = fim || c.versos.length;
  return { ...c, linhas: c.versos.map((h, i) => [i + 1, ms.textoPuro(h.replace(/<button[^>]*>\*<\/button>/g, ''))]).filter(([n]) => n >= de && n <= ate) };
}
function buscar(cod, termo, opcoes) {
  const r = biblia(cod); if (!r) return { lista: [], mais: false };
  if (r.formato === 'json') {
    const b = almeida(r); const q = ms.norm(termo); const lista = []; const { de = 0, ate = 65, limite = 300 } = opcoes || {};
    for (let l = de; l <= ate; l++) b.livros[l].forEach((C, c) => C.forEach((t, v) => {
      if (lista.length <= limite && ms.norm(t).includes(q)) lista.push({ l, c: c + 1, v: v + 1, t: t.replace(/[[\]]/g, '') });
    }));
    return { cod: r.cod, sigla: r.sigla, mais: lista.length > limite, lista: lista.slice(0, limite) };
  }
  return { cod: r.cod, sigla: r.sigla, ...ms.buscar(caminho(r), r.formato, termo, opcoes) };
}

// Dicionários
function dicionario(cod) {
  const r = porCod(cod);
  return r && r.tipo === 'dicionario' && r.ativo && fs.existsSync(caminho(r)) ? r : null;
}
function verbetes(cod, termo) { const r = dicionario(cod); return r ? ms.verbetes(caminho(r), r.formato, termo) : []; }
function verbete(cod, palavra) {
  const r = dicionario(cod); if (!r) return null;
  const v = ms.verbeteBruto(caminho(r), r.formato, palavra); if (!v) return null;
  return { palavra: v.w, html: ms.htmlVerbete(v.d, r.cod), dicionario: r.titulo, sigla: r.sigla, creditos: r.creditos || '' };
}
function imagem(cod, id) { const r = dicionario(cod); return r ? ms.imagem(caminho(r), id) : null; }

// Importar um arquivo enviado pelo professor
function slug(s) { return ms.norm(s).replace(/[^a-z0-9]+/g, '').slice(0, 16); }
function importar(arquivoTemp, nomeOriginal) {
  const info = ms.identificar(arquivoTemp);
  const base = (nomeOriginal || 'modulo').replace(/\.(bbl|dct|cmt)?\.?mybible$|\.sqlite3?$/i, '').replace(/\.(bbl|dct)$/i, '');
  let sigla = (info.sigla || base).replace(/_s$/i, '').slice(0, 20) || 'Módulo';
  let cod = slug(sigla) || 'mod'; const raiz = cod; let n = 2;
  while (porCod(cod)) cod = `${raiz}${n++}`;
  const destino = `${cod}-${Date.now()}.mybible`;
  fs.renameSync(arquivoTemp, path.join(PASTA_DADOS, destino));
  const ordem = (db.prepare('SELECT MAX(ordem) m FROM biblioteca WHERE tipo = ?').get(info.tipo).m || 0) + 1;
  const titulo = info.titulo && !/^©/.test(info.titulo) ? info.titulo : (info.descricao || base);
  const creditos = info.editora || (/©/.test(info.titulo) ? info.titulo : '') || (/©/.test(info.comentarios) ? info.comentarios.slice(0, 160) : '');
  const id = db.prepare(`INSERT INTO biblioteca (cod, tipo, formato, arquivo, sigla, titulo, creditos, descricao, ordem, tamanho)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(cod, info.tipo, info.formato, `dados:${destino}`, sigla, titulo.slice(0, 120), creditos.slice(0, 200),
    (info.descricao || '').slice(0, 400), ordem, fs.statSync(path.join(PASTA_DADOS, destino)).size).lastInsertRowid;
  return { id, cod, ...info };
}
function remover(cod) {
  const r = porCod(cod); if (!r) return false;
  if (r.embutido) throw new Error('Os módulos que vêm com o app não podem ser apagados; desative se não quiser usar.');
  const p = caminho(r); ms.fechar(p); fs.promises.unlink(p).catch(() => {});
  db.prepare('DELETE FROM biblioteca WHERE id = ?').run(r.id);
  return true;
}

module.exports = { listar, padrao, porCod, capitulo, trecho, buscar, verbetes, verbete, imagem, importar, remover, dicionario, caminho, PASTA_DADOS };
