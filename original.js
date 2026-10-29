// VideiraBook — texto hebraico e grego palavra por palavra (dados abertos do STEP Bible, CC BY 4.0)
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const Database = require('better-sqlite3');

const { DATA_DIR } = require('./db');
// Onde o banco pode estar: no volume (importado pelo professor ou descompactado) ou junto do app
const NO_VOLUME = path.join(DATA_DIR, 'originais', 'original.db');
const NO_APP = path.join(__dirname, 'modulos', 'originais', 'original.db');
const COMPACTADO = path.join(__dirname, 'modulos', 'originais', 'original.db.gz');
let db = null;
const st = {};
function valido(arq) {
  try { const d = new Database(arq, { readonly: true, fileMustExist: true }); const ok = ['versos', 'lexico', 'ocorr'].every(t => d.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t)); d.close(); return ok; } catch { return false; }
}
function abrir() {
  if (db) return db;
  let arq = [NO_VOLUME, NO_APP].find(f => fs.existsSync(f));
  if (!arq && fs.existsSync(COMPACTADO)) {
    // o GitHub não aceita arquivos grandes pelo site: o app traz a versão compactada e descompacta uma vez no volume
    try {
      fs.mkdirSync(path.dirname(NO_VOLUME), { recursive: true });
      const tmp = NO_VOLUME + '.tmp'; fs.writeFileSync(tmp, zlib.gunzipSync(fs.readFileSync(COMPACTADO)));
      if (valido(tmp)) { fs.renameSync(tmp, NO_VOLUME); arq = NO_VOLUME; console.log('[original] texto hebraico e grego descompactado no volume'); } else fs.unlinkSync(tmp);
    } catch (e) { console.error('[original] não foi possível descompactar:', e.message); }
  }
  if (!arq) return null;
  db = new Database(arq, { readonly: true, fileMustExist: true });
  return db;
}
// O professor pode enviar o original.db (ou original.db.gz) pela tela Módulos bíblicos
function ehOriginal(arqTemp) {
  try {
    const fd = fs.openSync(arqTemp, 'r'); const b = Buffer.alloc(2); fs.readSync(fd, b, 0, 2, 0); fs.closeSync(fd);
    if (b[0] === 0x1f && b[1] === 0x8b) { const dados = zlib.gunzipSync(fs.readFileSync(arqTemp)); fs.writeFileSync(arqTemp, dados); }
  } catch { return false; }
  return valido(arqTemp);
}
function instalar(arqTemp) {
  fs.mkdirSync(path.dirname(NO_VOLUME), { recursive: true });
  if (db) { try { db.close(); } catch {} db = null; for (const k of Object.keys(st)) delete st[k]; }
  try { fs.renameSync(arqTemp, NO_VOLUME); } catch (e) { if (e.code !== 'EXDEV') throw e; fs.copyFileSync(arqTemp, NO_VOLUME); fs.unlinkSync(arqTemp); }
  return !!abrir();
}
const CREDITOS = 'Hebraico (Códice de Leningrado, TAHOT) e grego (TAGNT, com as variantes da Nestle-Aland 28 e do Texto Recebido); léxicos TBESH/TBESG. Dados: STEP Bible — Tyndale House, Cambridge (STEPBible.org), licença CC BY 4.0.';

// ── Morfologia em português
const G_TEMPO = { P: 'presente', I: 'imperfeito', F: 'futuro', A: 'aoristo', R: 'perfeito', L: 'mais-que-perfeito', X: 'sem tempo' };
const G_VOZ = { A: 'ativa', M: 'média', P: 'passiva', E: 'média ou passiva', D: 'média depoente', O: 'passiva depoente', N: 'média ou passiva depoente', Q: 'ativa impessoal', X: '' };
const G_MODO = { I: 'indicativo', S: 'subjuntivo', O: 'optativo', M: 'imperativo', N: 'infinitivo', P: 'particípio', R: 'particípio imperativo' };
const CASO = { N: 'nominativo', G: 'genitivo', D: 'dativo', A: 'acusativo', V: 'vocativo' };
const NUM = { S: 'singular', P: 'plural' };
const GEN = { M: 'masculino', F: 'feminino', N: 'neutro' };
const G_CLASSE = { N: 'substantivo', A: 'adjetivo', T: 'artigo', P: 'pronome pessoal', R: 'pronome relativo', C: 'pronome recíproco', D: 'pronome demonstrativo',
  K: 'pronome correlativo', I: 'pronome interrogativo', X: 'pronome indefinido', Q: 'pronome correlativo ou interrogativo', F: 'pronome reflexivo', S: 'pronome possessivo',
  ADV: 'advérbio', CONJ: 'conjunção', COND: 'conjunção condicional', PREP: 'preposição', PRT: 'partícula', INJ: 'interjeição', HEB: 'palavra hebraica', ARAM: 'palavra aramaica', V: 'verbo' };
function nomeCasoNumGen(s) {
  const m = String(s || '').match(/^([NGDAV])([SP])([MFN])?$/); if (!m) return '';
  return [CASO[m[1]], NUM[m[2]], GEN[m[3]]].filter(Boolean).join(', ');
}
function morfGrego(cod) {
  const p = String(cod || '').split('-'); const classe = p[0];
  if (classe === 'V') {
    const m = (p[1] || '').match(/^(2?)([PIFARLX])([AMPEDONQX])([ISOMNPR])$/);
    if (!m) return 'verbo';
    let s = `verbo, ${m[1] ? 'segundo ' : ''}${G_TEMPO[m[2]]}, voz ${G_VOZ[m[3]]}, ${G_MODO[m[4]]}`.replace('voz , ', '');
    if (p[2]) { const pn = p[2].match(/^([123])([SP])$/); s += pn ? `, ${pn[1]}ª pessoa do ${NUM[pn[2]]}` : `, ${nomeCasoNumGen(p[2])}`; }
    return s;
  }
  if (classe === 'PRT' && p[1] === 'N') return 'partícula de negação';
  if (classe === 'PRT' && p[1] === 'I') return 'partícula interrogativa';
  const nome = G_CLASSE[classe] || classe.toLowerCase();
  if (!p[1]) return nome;
  const pess = p[1].match(/^([123])([NGDAV])([SP])$/);
  if (pess) return `${nome}, ${pess[1]}ª pessoa, ${CASO[pess[2]]}, ${NUM[pess[3]]}`;
  const resto = nomeCasoNumGen(p[1]);
  return [nome, resto, p[2] === 'T' ? 'título' : p[2] === 'L' ? 'lugar' : p[2] === 'P' ? 'pessoa' : p[2] === 'C' ? 'comparativo' : p[2] === 'S' ? 'superlativo' : ''].filter(Boolean).join(', ');
}
const H_TRONCO = { q: 'qal', N: 'nifal', p: 'piel', P: 'pual', h: 'hifil', H: 'hofal', t: 'hitpael', o: 'polel', O: 'polal', r: 'hitpolel', m: 'poel', M: 'poal',
  k: 'palel', K: 'pulal', Q: 'qal passivo', l: 'pilpel', L: 'polpal', f: 'hitpalpel', D: 'nitpael', j: 'pealal', i: 'pilel', u: 'hotpaal', c: 'tiftil', v: 'hishtafel', w: 'nitpaal', y: 'yiphil', z: 'hitpoel' };
const H_TIPO = { p: 'perfeito', q: 'perfeito consecutivo', i: 'imperfeito', w: 'imperfeito consecutivo', h: 'coortativo', j: 'jussivo', v: 'imperativo',
  r: 'particípio ativo', s: 'particípio passivo', a: 'infinitivo absoluto', c: 'infinitivo construto' };
const H_GEN = { m: 'masculino', f: 'feminino', b: 'comum', c: 'comum' };
const H_NUM = { s: 'singular', p: 'plural', d: 'dual' };
const H_EST = { a: 'absoluto', c: 'construto', d: 'determinado' };
function morfHebraico(cod) {
  const c = String(cod || '');
  if (!c) return '';
  const g = x => H_GEN[x], n = x => H_NUM[x], e = x => H_EST[x] && `estado ${H_EST[x]}`, p = x => '123'.includes(x || '_') ? `${x}ª pessoa` : '';
  const junta = (...a) => a.filter(Boolean).join(', ');
  switch (c[0]) {
    case 'V': {
      const tipo = c[2];
      if ('rs'.includes(tipo)) return junta('verbo', H_TRONCO[c[1]], H_TIPO[tipo], g(c[3]), n(c[4]), e(c[5]));
      if ('ac'.includes(tipo)) return junta('verbo', H_TRONCO[c[1]], H_TIPO[tipo]);
      return junta('verbo', H_TRONCO[c[1]], H_TIPO[tipo], p(c[3]), g(c[4]), n(c[5]));
    }
    case 'N': return junta(c[1] === 'p' ? 'nome próprio' : c[1] === 'g' ? 'substantivo gentílico' : 'substantivo', g(c[2]), n(c[3]), e(c[4]));
    case 'A': return junta({ o: 'numeral ordinal', c: 'numeral cardinal', g: 'adjetivo gentílico' }[c[1]] || 'adjetivo', g(c[2]), n(c[3]), e(c[4]));
    case 'P': return c[1] === 'p' ? junta('pronome pessoal', p(c[2]), g(c[3]), n(c[4]))
      : junta({ d: 'pronome demonstrativo', i: 'pronome interrogativo', r: 'pronome relativo', f: 'pronome indefinido' }[c[1]] || 'pronome', g(c[2]), n(c[3]));
    case 'S': return junta(c[1] === 'd' ? 'sufixo direcional' : c[1] === 'h' ? 'he paragógico' : c[1] === 'n' ? 'nun paragógico' : 'sufixo pronominal', p(c[2]), g(c[3]), n(c[4]));
    case 'C': return 'conjunção';
    case 'D': return 'advérbio';
    case 'R': return c[1] === 'd' ? 'preposição com artigo' : 'preposição';
    case 'T': return { a: 'partícula afirmativa', d: 'artigo definido', e: 'partícula exortativa', i: 'partícula interrogativa', j: 'interjeição', m: 'partícula demonstrativa', n: 'partícula de negação', o: 'marcador de objeto direto', r: 'partícula relativa', c: 'partícula condicional' }[c[1]] || 'partícula';
    default: return c;
  }
}

// ── Português alinhado pelos números de Strong (Bíblia com Strong, ex.: ARA)
function alinharPortugues(textoBruto) {
  const mapa = {};
  if (!textoBruto) return mapa;
  let s = String(textoBruto).replace(/<RF[^>]*>[\s\S]*?(?:<Rf>|<RF>)/g, '').replace(/<TS\d?>[\s\S]*?<Ts>/g, '').replace(/^\s*>?\s*«[^»]*»/, '');
  let ultimo = 0; let palavra = '';
  for (const m of s.matchAll(/<W([HG])(\d+)[a-z]?>/g)) {
    const trecho = s.slice(ultimo, m.index).replace(/<[^>]*>/g, ' ').replace(/[«»“”"(),.;:!?]/g, ' ').replace(/\s+/g, ' ').trim();
    if (trecho) palavra = trecho;
    ultimo = m.index + m[0].length;
    const n = Number(m[2]);
    if ((m[1] === 'H' && n >= 8800 && n <= 8999) || (m[1] === 'G' && n >= 5500 && n <= 5999)) continue;   // códigos de tempo verbal
    const k = `${m[1]}${n}`;
    if (k === 'H853' || k === 'G3588') continue;   // marcador de objeto e artigo
    if (palavra && !(mapa[k] || []).includes(palavra)) (mapa[k] ||= []).push(palavra);
  }
  return mapa;
}

const prep = (k, sql) => (st[k] ||= abrir().prepare(sql));
const chaveExt = (s, suf) => { const m = String(s).match(/^([HG])(\d+)$/); return m ? `${m[1]}${m[2].padStart(4, '0')}${suf || ''}` : s; };
function lexico(strong, suf) {
  if (!abrir()) return null;
  const q = prep('lex', 'SELECT * FROM lexico WHERE s = ?');
  return (suf && q.get(chaveExt(strong, suf))) || q.get(chaveExt(strong, '')) || q.get(strong) || null;
}
function verso(l, c, v, brutoComStrong) {
  if (!abrir()) return null;
  const r = prep('verso', 'SELECT dados FROM versos WHERE l = ? AND c = ? AND v = ?').get(l, c, v);
  if (!r) return null;
  const pt = alinharPortugues(brutoComStrong);
  const conta = prep('conta', 'SELECT COUNT(*) n FROM ocorr WHERE s = ?');
  const palavras = JSON.parse(zlib.inflateSync(r.dados).toString('utf8')).map(([o, t, g, s, suf, m, ed]) => {
    const lx = lexico(s, suf) || {};
    return { o, t, g: g.replace(/[<>]/g, ''), s, suf, m, morf: ed === 'H' ? morfHebraico(m) : morfGrego(m), ed, lema: lx.lema || '', lemaT: lx.translit ? lx.translit.replace(/\./g, '') : '', sentido: lx.gloss || '',
      pt: (pt[s] || []).join(' / '), ocorr: s ? conta.get(s).n : 0 };
  });
  return { lingua: l < 39 ? 'hebraico' : 'grego', palavras, creditos: CREDITOS };
}
function ocorrencias(strong, limite = 300) {
  if (!abrir()) return { total: 0, lista: [] };
  const total = prep('conta', 'SELECT COUNT(*) n FROM ocorr WHERE s = ?').get(strong).n;
  return { total, lista: prep('ocorr', 'SELECT l, c, v FROM ocorr WHERE s = ? ORDER BY l, c, v LIMIT ?').all(strong, limite) };
}
const disponivel = () => !!abrir();
module.exports = { ehOriginal, instalar, verso, lexico, ocorrencias, disponivel, morfGrego, morfHebraico, alinharPortugues, CREDITOS };
