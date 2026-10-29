// VideiraBook — ferramenta de sermões com IA (OpenAI), liberada pelo professor
const { db, getConfig, setConfig } = require('./db');
const BIB = require('./biblioteca');
const ms = require('./mysword');

const NOMES = ['Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis',
  '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias', 'Ester', 'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias',
  'Lamentações', 'Ezequiel', 'Daniel', 'Oseias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miqueias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu',
  'Zacarias', 'Malaquias', 'Mateus', 'Marcos', 'Lucas', 'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios',
  'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago',
  '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João', 'Judas', 'Apocalipse'];
const TIPOS = {
  textual: ['Textual', 'As divisões principais saem diretamente das frases ou palavras do próprio texto base, na ordem em que aparecem. O tema nasce do texto e cada ponto é sustentado por ele.'],
  tematico: ['Temático', 'O tema dirige o sermão. Cada divisão desenvolve um aspecto do tema, apoiada em textos de diferentes partes da Bíblia, sempre respeitando o contexto de cada texto usado.'],
  historico: ['Histórico (narrativo)', 'Narre o acontecimento ou a vida do personagem com vivacidade e precisão, em ordem cronológica, e tire lições espirituais e práticas de cada cena. Não acrescente à narrativa detalhes que não estão no texto bíblico; deixe claro o que o texto diz e o que é aplicação.'],
  expositivo: ['Expositivo', 'Exponha a passagem versículo por versículo (ou bloco por bloco), explicando o sentido original, as palavras-chave e a ligação com o contexto do livro. A ideia central do sermão é a ideia central do texto, e as divisões seguem a estrutura da própria passagem. Aplique ao fim de cada bloco.'],
};
const PARADAS = new Set('para pelo pela pelos pelas como mais mas que quem qual quais quando onde entre sobre sob desde até contra este esta estes estas esse essa esses essas aquele aquela aqueles aquelas isto isso aquilo seu sua seus suas meu minha meus minhas teu tua teus tuas nosso nossa nossos nossas vosso vossa vossos vossas lhe lhes eles elas ele ela nós vós você vocês todo toda todos todas cada outro outra outros outras muito muita muitos muitas pois porque porém então assim também ainda já não nem sim seja sejam será serão foram eram estava estavam está estão tinha tinham fosse fossem havia haverá disse diz dizer dizendo fazer feito fez faz porém sendo tendo tem têm tenho tens hoje agora depois antes sempre nunca aqui ali lá eis tão tanto tanta grande grandes'.split(' '));

const BASE = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const hojeStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const chave = () => getConfig()._openai_chave || '';
function iaPronta() { const c = getConfig(); return c.ia_ativa === '1' && !!c._openai_chave; }
function podeIA(u) {
  if (!u || !iaPronta()) return false;
  if (u.papel === 'professor') return true;
  const r = db.prepare('SELECT pode_ia FROM usuarios WHERE id = ?').get(u.id);
  return !!(r && r.pode_ia);
}
function uso(u) {
  const lim = Math.max(1, Number(getConfig().ia_limite_dia) || 15);
  const r = db.prepare('SELECT n FROM ia_uso WHERE usuario_id = ? AND dia = ?').get(u.id, hojeStr());
  return { usados: r ? r.n : 0, limite: u.papel === 'professor' ? null : lim };
}
function contarUso(u) {
  db.prepare('INSERT INTO ia_uso (usuario_id, dia, n) VALUES (?, ?, 1) ON CONFLICT(usuario_id, dia) DO UPDATE SET n = n + 1').run(u.id, hojeStr());
}

// ── OpenAI (Chat Completions com streaming)
function erroOpenAI(status, msg) {
  const e = new Error(
    status === 401 ? 'A chave da OpenAI foi recusada. Confira a chave no painel do professor.'
      : status === 429 ? 'A conta da OpenAI está sem saldo ou recebeu pedidos demais. Confira o faturamento em platform.openai.com ou tente em alguns minutos.'
        : status === 404 ? `O modelo escolhido não está disponível para esta chave. Escolha outro modelo no painel. (${msg || 'não encontrado'})`
          : status === 400 ? `A OpenAI recusou o pedido: ${msg || 'pedido inválido'}`
            : `A OpenAI não respondeu agora (erro ${status}). Tente de novo em instantes.`);
  e.status = status === 401 || status === 404 || status === 400 ? 400 : 502; return e;
}
async function* openai(messages, signal) {
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST', signal,
    headers: { Authorization: `Bearer ${chave()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: getConfig().ia_modelo || 'gpt-6.1-sol', messages, stream: true }),
  });
  if (!r.ok) { let m = ''; try { const j = await r.json(); m = j.error && j.error.message; } catch {} throw erroOpenAI(r.status, m); }
  const dec = new TextDecoder(); let buf = '';
  for await (const pedaco of r.body) {
    buf += dec.decode(pedaco, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const linha = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!linha.startsWith('data:')) continue;
      const dado = linha.slice(5).trim(); if (dado === '[DONE]') return;
      try { const j = JSON.parse(dado); const t = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (t) yield t; } catch { /* linha incompleta */ }
    }
  }
}
// Envia o texto para o navegador aos pedaços; devolve o texto completo
async function transmitir(req, res, messages) {
  const ctrl = new AbortController(); res.on('close', () => { if (!res.writableEnded) ctrl.abort(); });
  const sinal = AbortSignal.any ? AbortSignal.any([ctrl.signal, AbortSignal.timeout(300000)]) : ctrl.signal;
  const it = openai(messages, sinal);
  let primeiro;
  try { primeiro = await it.next(); } catch (e) {
    if (e.name === 'AbortError' || e.name === 'TimeoutError') { res.status(504).json({ erro: 'A IA demorou demais para responder. Tente de novo.' }); return null; }
    res.status(e.status || 502).json({ erro: e.message.startsWith('A ') ? e.message : 'Não foi possível falar com a OpenAI. Confira a internet do servidor.' }); return null;
  }
  res.set({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
  res.flushHeaders && res.flushHeaders();
  let texto = '';
  if (!primeiro.done) { texto += primeiro.value; res.write(primeiro.value); }
  try { for await (const t of it) { texto += t; res.write(t); } }
  catch (e) { if (!res.writableEnded) res.write(`\n\u0000ERRO:${e.name === 'TimeoutError' ? 'A resposta foi interrompida por demorar demais.' : 'A resposta foi interrompida.'}`); }
  res.end();
  return ctrl.signal.aborted ? null : texto;   // quem pediu fechou a página: não salva resposta pela metade
}

// ── Material de pesquisa: texto bíblico real do módulo, verbetes do dicionário e frases cadastradas
const indices = new Map();
BIB.aoRemover.push(cod => indices.delete(cod));
function indiceDic(cod) {
  const r = BIB.dicionario(cod); if (!r) return null;
  if (!indices.has(cod)) {
    const m = new Map();
    for (const w of ms.verbetes(BIB.caminho(r), r.formato, '', 100000)) { const k = ms.norm(w); if (!m.has(k)) m.set(k, w); }
    indices.set(cod, m);
  }
  return indices.get(cod);
}
function textoVerbete(cod, palavra) {
  const v = BIB.verbete(cod, palavra); if (!v) return null;
  let t = ms.textoPuro(v.html.replace(/<\/p>/g, '\n'));
  const veja = t.match(/^Veja\s+(.{2,60})\.?$/i);
  if (veja) { const alvo = BIB.verbete(cod, veja[1].replace(/\.$/, '')); if (alvo) return { palavra: alvo.palavra, texto: ms.textoPuro(alvo.html), dic: v.sigla }; }
  return { palavra: v.palavra, texto: t, dic: v.sigla };
}
function candidatos(texto) {
  const out = new Set();
  for (const w of ms.textoPuro(texto).split(/[^\p{L}-]+/u)) {
    const n = ms.norm(w); if (n.length < 4 || PARADAS.has(n)) continue;
    out.add(n); if (n.endsWith('oes')) out.add(n.slice(0, -3) + 'ao'); else if (n.endsWith('s')) out.add(n.slice(0, -1));
  }
  return [...out];
}
function montarMaterial(s) {
  const partes = []; const fontes = { versao: null, verbetes: [], frases: 0 };
  let textoBase = '';
  if (s.livro !== null && s.livro !== undefined && s.cap) {
    const t = BIB.trecho(s.versao, s.livro, s.cap, s.ini || 0, s.fim || 0);
    if (t) {
      fontes.versao = `${t.sigla} — ${t.versao}`;
      textoBase = t.linhas.map(x => x[1]).join(' ');
      partes.push(`## Texto base: ${s.referencia} (${t.sigla} — ${t.versao})\n${t.epigrafe && (!s.ini || s.ini === 1) ? `[Epígrafe] ${t.epigrafe}\n` : ''}${t.linhas.map(([n, x]) => `${n} ${x}`).join('\n')}`);
      if (s.ini) {
        const cap = BIB.trecho(s.versao, s.livro, s.cap, 1, 0);
        if (cap && cap.linhas.length <= 90) partes.push(`## Capítulo ${s.cap} inteiro (para o contexto)\n${cap.linhas.map(([n, x]) => `${n} ${x}`).join('\n')}`);
      }
    }
  }
  // Verbetes
  const dics = (() => { try { return JSON.parse(s.dicionarios || '[]'); } catch { return []; } })().filter(c => BIB.dicionario(c));
  const pedidas = String(s.palavras || '').split(/[,;\n]+/).map(x => x.trim()).filter(Boolean).slice(0, 6);
  const verbetes = [];
  for (const cod of dics) {
    const idx = indiceDic(cod); if (!idx) continue;
    const pega = w => { if (verbetes.length >= 9 || verbetes.some(v => ms.norm(v.palavra) === ms.norm(w))) return; const v = textoVerbete(cod, w); if (v && v.texto.length > 40) verbetes.push(v); };
    pedidas.forEach(p => { const k = idx.get(ms.norm(p)); if (k) pega(k); });
    if (s.livro !== null && s.livro !== undefined) {
      // verbete do livro bíblico (autor, data, destinatários, propósito)
      const nome = ms.norm(NOMES[s.livro]).replace(/^[123]\s+/, '');
      const quer = s.livro >= 39 && s.livro <= 42 ? /evangelho/ : s.livro >= 44 && s.livro <= 64 ? /epistola|carta/ : /livro/;
      const k = [...idx.keys()].filter(x => x.startsWith(nome)).map(x => ({ x, p: (quer.test(x) ? 0 : /livro|epistola|evangelho|carta/.test(x) ? 1 : 2) * 1000 + x.length }))
        .sort((a, b) => a.p - b.p)[0];
      if (k) pega(idx.get(k.x));
    }
    const auto = candidatos(`${textoBase} ${s.tema || ''}`).map(c => idx.get(c)).filter(Boolean);
    const ricos = [...new Set(auto)].map(w => ({ w, n: (textoVerbete(cod, w) || { texto: '' }).texto.length })).filter(x => x.n > 300).sort((a, b) => b.n - a.n).slice(0, 5);
    ricos.forEach(x => pega(x.w));
  }
  if (verbetes.length) {
    partes.push(`## Verbetes de dicionário bíblico (use como fonte para contexto histórico, cultural e termos originais)\n${verbetes.map(v => `### ${v.palavra} (${v.dic})\n${v.texto.slice(0, 2400)}${v.texto.length > 2400 ? '…' : ''}`).join('\n\n')}`);
    fontes.verbetes = verbetes.map(v => ({ palavra: v.palavra, dic: v.dic }));
  }
  // Comentários bíblicos importados que tratam do texto base
  const cmts = (() => { try { return JSON.parse(s.dicionarios || '[]'); } catch { return []; } })().filter(c => BIB.comentario(c));
  fontes.comentarios = [];
  if (cmts.length && s.livro !== null && s.livro !== undefined && s.cap) {
    const de = s.ini || 1, ate = s.fim || s.ini || 999;
    const blocos = [];
    for (const m of BIB.comentariosDoVerso(s.livro, s.cap, 0, { cods: cmts, html: false }).slice(0, 4)) {
      const trechos = m.trechos.filter(t => !t.de || (t.de <= ate && (t.ate || t.de) >= de)).sort((a, b) => ((a.ate || a.de) - a.de) - ((b.ate || b.de) - b.de));
      // trecho longo: pega a parte que fala do versículo pedido
      const recorte = t => {
        if (t.texto.length <= 3000 || !s.ini) return t.texto;
        let pos = -1, melhor = 99;   // a citação do capítulo mais próxima do versículo pedido
        for (const m of t.texto.matchAll(/(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/g)) {
          const c = Number(m[1]), a = Number(m[2]), b = Number(m[3]) || a;
          if (c !== s.cap || (a === t.de && b === t.ate)) continue;
          const dist = s.ini >= a && s.ini <= b ? 0 : Math.min(Math.abs(s.ini - a), Math.abs(s.ini - b));
          if (dist < melhor) { melhor = dist; pos = m.index; if (!dist) break; }
        }
        if (melhor > 6) pos = -1;
        if (pos < 0) return t.texto.slice(0, 3000);
        const i = Math.max(0, pos - 300); return (i ? '… ' : '') + t.texto.slice(i, i + 3000);
      };
      let texto = ''; for (const t of trechos) { if (texto.length > 3800) break; texto += `[${NOMES[s.livro]} ${t.ref}] ${recorte(t)}\n`; }
      if (texto.trim()) { blocos.push(`### ${m.titulo}${m.creditos ? ` (${m.creditos})` : ''}\n${texto.slice(0, 4000)}`); fontes.comentarios.push({ cod: m.cod, titulo: m.titulo }); }
    }
    if (blocos.length) partes.push(`## Comentários bíblicos sobre o texto (cite o comentarista pelo nome da obra ou do autor quando usar uma ideia dele)\n${blocos.join('\n\n')}`);
  }
  const frases = db.prepare('SELECT autor, frase, fonte FROM frases WHERE ativo = 1 ORDER BY id LIMIT 80').all();
  if (frases.length) partes.push(`## Frases autorizadas de homens de Deus (só estas podem ser citadas)\n${frases.map(f => `- "${f.frase}" — ${f.autor}${f.fonte ? ` (${f.fonte})` : ''}`).join('\n')}`);
  fontes.frases = frases.length;
  return { texto: partes.join('\n\n'), fontes };
}

function sistema(s) {
  const tipo = TIPOS[s.tipo] || TIPOS.textual;
  const min = Number(s.duracao) || 40;
  const completo = s.formato === 'completo';
  return `Você é um assistente de homilética e exegese bíblica a serviço de pregadores de tradição evangélica pentecostal. Escreva sempre em português do Brasil, com linguagem clara, reverente e pregável.

REGRAS DE FIDELIDADE (obrigatórias):
1. O texto bíblico base está no material abaixo, na versão indicada. Ao citar o texto base entre aspas, copie as palavras exatamente como estão. Nunca invente nem parafraseie um versículo entre aspas.
2. Para outros textos bíblicos, escreva só a referência, sem transcrever o versículo (o aplicativo mostra o texto quando o pregador toca na referência). Use apenas referências que você tem certeza de que existem e dizem o que você afirma. Use abreviações em português com ponto entre capítulo e versículo, por exemplo: Jo 3.16; Rm 5.8; 1 Co 13.4-7; Sl 23.1.
3. Palavras hebraicas ou gregas: use somente as que aparecem nos verbetes fornecidos ou termos amplamente conhecidos cujo sentido você conhece com segurança (como ágape ou charis). Na dúvida, não use.
4. Dados históricos, culturais e geográficos: baseie-se nos verbetes fornecidos e no próprio texto. Não invente datas, números, costumes ou lendas. Se algo for incerto, omita.
5. Citações de homens de Deus: use somente frases da lista "Frases autorizadas", palavra por palavra, com o nome do autor. No máximo duas. Se nenhuma combinar com a mensagem, não use nenhuma. Nunca atribua uma frase a alguém fora da lista.
6. Interprete o texto no seu contexto histórico, literário e gramatical antes de aplicar. Não espiritualize o que o texto não autoriza. Diferencie o que o texto diz do que é aplicação.
7. Doutrina: fidelidade à ortodoxia cristã e à teologia pentecostal clássica (salvação pela graça mediante a fé, santificação, batismo no Espírito Santo, dons espirituais, volta de Cristo), sem extremismos, legalismo ou promessas de prosperidade.
8. Comentários bíblicos: quando o material trouxer comentários, você pode usar as ideias deles dizendo de qual obra ou autor vieram (ex.: "como observa o comentário A Mensagem de Rute"). Não atribua a um comentarista o que não está no trecho fornecido.

TIPO DE SERMÃO: ${tipo[0]}. ${tipo[1]}

EXTENSÃO: pregável em cerca de ${min} minutos. ${completo ? `Escreva o sermão completo em texto corrido, pronto para ser lido, com cerca de ${Math.round(min * 110)} palavras.` : `Escreva um esboço detalhado (tópicos com frases completas e notas para o pregador), com cerca de ${Math.round(min * 45)} palavras.`}

FORMATO DA RESPOSTA (Markdown, exatamente nesta ordem):
# Título do sermão
**Texto base:** referência · **Tipo:** ${tipo[0]}
## Ideia central
(uma frase)
## Introdução
## Contexto
(histórico e literário)
## ${s.tipo === 'expositivo' ? 'Exposição do texto' : 'Explicação do texto'}
## Esboço
(divisões numeradas em romanos — I., II., III. — cada uma com subtópicos e referências de apoio)
## Ilustração
## Aplicações
(lista)
## Conclusão e apelo
## Leitura complementar
(lista de referências bíblicas relacionadas, para a concordância)

Não escreva nada antes do título nem depois da leitura complementar.`;
}
function pedido(s) {
  return [`Tipo: ${(TIPOS[s.tipo] || TIPOS.textual)[0]}`, s.referencia && `Texto base: ${s.referencia}`, s.tema && `Tema: ${s.tema}`, s.publico && `Público: ${s.publico}`,
    s.ocasiao && `Ocasião: ${s.ocasiao}`, `Duração: ${s.duracao || 40} minutos`, `Formato: ${s.formato === 'completo' ? 'sermão completo' : 'esboço detalhado'}`,
    s.observacoes && `Observações do pregador: ${s.observacoes}`].filter(Boolean).join('\n');
}
const tituloDe = t => ((String(t).match(/^#\s+(.+)$/m) || [])[1] || '').replace(/[*_#]/g, '').trim().slice(0, 140);

module.exports = function rotas(app, P, auth, h) {
  // Disponibilidade para o usuário logado
  const soIA = (req, res, next) => podeIA(req.user) ? next() : res.status(403).json({ erro: 'A ferramenta de sermões não está liberada para você. Fale com o professor.' });
  const meu = (req, res) => {
    const s = db.prepare('SELECT * FROM sermoes WHERE id = ? AND usuario_id = ?').get(Number(req.params.id), req.user.id);
    if (!s) res.status(404).json({ erro: 'Sermão não encontrado.' });
    return s;
  };
  const limite = (req, res) => {
    const u = uso(req.user);
    if (u.limite && u.usados >= u.limite) { res.status(429).json({ erro: `Você já usou os ${u.limite} pedidos de hoje. Amanhã o limite renova.` }); return false; }
    return true;
  };

  app.get('/api/sermoes', auth, soIA, h((req, res) => {
    res.json({ uso: uso(req.user), lista: db.prepare('SELECT id, titulo, tipo, referencia, tema, atualizado_em FROM sermoes WHERE usuario_id = ? ORDER BY atualizado_em DESC').all(req.user.id) });
  }));
  app.post('/api/sermoes', auth, soIA, h((req, res) => {
    const b = req.body || {}; const t = (v, n) => String(v ?? '').trim().slice(0, n);
    if (!TIPOS[b.tipo]) return res.status(400).json({ erro: 'Escolha o tipo de sermão.' });
    const temRef = Number.isInteger(b.livro) && b.livro >= 0 && b.livro < 66 && Number(b.cap) > 0;
    if (b.tipo !== 'tematico' && !temRef) return res.status(400).json({ erro: 'Informe o texto bíblico base (ex.: Jo 3.16-21).' });
    if (b.tipo === 'tematico' && !t(b.tema, 200) && !temRef) return res.status(400).json({ erro: 'Informe o tema do sermão.' });
    const dics = Array.isArray(b.dicionarios) ? b.dicionarios.filter(c => BIB.dicionario(c) || BIB.comentario(c)).slice(0, 8) : [];
    const id = db.prepare(`INSERT INTO sermoes (usuario_id, titulo, tipo, referencia, livro, cap, ini, fim, tema, publico, ocasiao, duracao, formato, versao, dicionarios, palavras, observacoes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(req.user.id, t(b.tema, 140) || t(b.referencia, 60) || 'Novo sermão', b.tipo, temRef ? t(b.referencia, 60) : null,
      temRef ? b.livro : null, temRef ? Number(b.cap) : null, temRef ? Number(b.ini) || null : null, temRef ? Number(b.fim) || Number(b.ini) || null : null,
      t(b.tema, 200), t(b.publico, 80), t(b.ocasiao, 80), Math.max(10, Math.min(90, Number(b.duracao) || 40)), b.formato === 'completo' ? 'completo' : 'esboco',
      t(b.versao, 20) || BIB.padrao(), JSON.stringify(dics), t(b.palavras, 200), t(b.observacoes, 1500)).lastInsertRowid;
    res.json({ ok: true, id });
  }));
  app.get('/api/sermoes/:id', auth, soIA, h((req, res) => {
    const s = meu(req, res); if (!s) return;
    res.json({ ...s, chat: JSON.parse(s.chat || '[]'), fontes: JSON.parse(s.fontes || '{}'), dicionarios: JSON.parse(s.dicionarios || '[]'), uso: uso(req.user) });
  }));
  app.put('/api/sermoes/:id', auth, soIA, h((req, res) => {
    const s = meu(req, res); if (!s) return;
    const b = req.body || {};
    const conteudo = b.conteudo !== undefined ? String(b.conteudo).slice(0, 200000) : s.conteudo;
    const titulo = String(b.titulo ?? '').trim().slice(0, 140) || tituloDe(conteudo) || s.titulo;
    db.prepare("UPDATE sermoes SET titulo = ?, conteudo = ?, atualizado_em = datetime('now','localtime') WHERE id = ?").run(titulo, conteudo, s.id);
    res.json({ ok: true });
  }));
  app.delete('/api/sermoes/:id', auth, soIA, h((req, res) => {
    const s = meu(req, res); if (!s) return;
    db.prepare('DELETE FROM sermoes WHERE id = ?').run(s.id); res.json({ ok: true });
  }));
  // Gerar o sermão (resposta chega aos pedaços)
  app.post('/api/sermoes/:id/gerar', auth, soIA, async (req, res, next) => {
    try {
      const s = meu(req, res); if (!s || !limite(req, res)) return;
      const mat = montarMaterial(s);
      const texto = await transmitir(req, res, [
        { role: 'system', content: sistema(s) },
        { role: 'user', content: `${pedido(s)}\n\n# MATERIAL DE PESQUISA\n\n${mat.texto || '(sem material adicional)'}\n\nEscreva o sermão.` },
      ]);
      if (texto) contarUso(req.user);
      if (texto && texto.trim().length > 50) {
        db.prepare("UPDATE sermoes SET conteudo = ?, titulo = ?, fontes = ?, chat = '[]', atualizado_em = datetime('now','localtime') WHERE id = ?")
          .run(texto.trim(), tituloDe(texto) || s.titulo, JSON.stringify(mat.fontes), s.id);
      }
    } catch (e) { if (!res.headersSent) next(e); else res.end(); }
  });
  // Conversa para ajustar o sermão
  app.post('/api/sermoes/:id/chat', auth, soIA, async (req, res, next) => {
    try {
      const s = meu(req, res); if (!s) return;
      const msg = String((req.body || {}).mensagem || '').trim().slice(0, 2000);
      if (!msg) return res.status(400).json({ erro: 'Escreva o que você quer mudar.' });
      if (!limite(req, res)) return;
      const hist = JSON.parse(s.chat || '[]');
      const mat = montarMaterial(s);
      const texto = await transmitir(req, res, [
        { role: 'system', content: `${sistema(s)}\n\nAJUSTES: o pregador vai pedir mudanças ou fazer perguntas sobre o sermão. Se o pedido for uma mudança no sermão, responda APENAS com o sermão completo revisado, começando pela linha "# Título" e mantendo o formato. Se for uma pergunta ou comentário, responda em poucas linhas, sem reescrever o sermão e sem começar com "#". As regras de fidelidade continuam valendo.` },
        { role: 'user', content: `${pedido(s)}\n\n# MATERIAL DE PESQUISA\n\n${mat.texto || '(sem material adicional)'}` },
        { role: 'assistant', content: s.conteudo || '(ainda sem sermão)' },
        ...hist.slice(-8).map(m => ({ role: m.papel === 'eu' ? 'user' : 'assistant', content: m.texto })),
        { role: 'user', content: msg },
      ]);
      if (texto === null) return;
      contarUso(req.user);
      const novo = texto.trim();
      if (/^#\s/.test(novo) && novo.length > 200) {
        hist.push({ papel: 'eu', texto: msg }, { papel: 'ia', texto: 'Pronto, atualizei o sermão com esse ajuste.' });
        db.prepare("UPDATE sermoes SET conteudo = ?, titulo = ?, chat = ?, atualizado_em = datetime('now','localtime') WHERE id = ?").run(novo, tituloDe(novo) || s.titulo, JSON.stringify(hist.slice(-30)), s.id);
      } else if (novo) {
        hist.push({ papel: 'eu', texto: msg }, { papel: 'ia', texto: novo });
        db.prepare("UPDATE sermoes SET chat = ?, atualizado_em = datetime('now','localtime') WHERE id = ?").run(JSON.stringify(hist.slice(-30)), s.id);
      }
    } catch (e) { if (!res.headersSent) next(e); else res.end(); }
  });

  // ── Professor: chave, modelo, liberação e frases
  P.get('/ia', h((req, res) => {
    const c = getConfig(); const k = c._openai_chave || '';
    res.json({ ativa: c.ia_ativa === '1', modelo: c.ia_modelo || 'gpt-6.1-sol', limite: Number(c.ia_limite_dia) || 15, tem_chave: !!k, chave_fim: k ? k.slice(-4) : '',
      usuarios: db.prepare("SELECT id, nome, usuario, pode_ia, ativo FROM usuarios WHERE papel = 'aluno' ORDER BY nome").all(),
      frases: db.prepare('SELECT * FROM frases ORDER BY id').all(),
      uso_hoje: db.prepare('SELECT COALESCE(SUM(n),0) n FROM ia_uso WHERE dia = ?').get(hojeStr()).n });
  }));
  P.put('/ia', h((req, res) => {
    const b = req.body || {};
    if (b.chave !== undefined && String(b.chave).trim()) {
      const k = String(b.chave).trim();
      if (!/^sk-[A-Za-z0-9_\-]{20,}$/.test(k)) return res.status(400).json({ erro: 'A chave da OpenAI começa com "sk-". Copie a chave inteira em platform.openai.com/api-keys.' });
      setConfig('_openai_chave', k);
    }
    if (b.remover_chave) setConfig('_openai_chave', '');
    if (b.ativa !== undefined) setConfig('ia_ativa', b.ativa ? '1' : '0');
    if (b.modelo !== undefined && /^[a-z0-9.\-_:]{3,60}$/i.test(String(b.modelo).trim())) setConfig('ia_modelo', String(b.modelo).trim());
    if (b.limite !== undefined) setConfig('ia_limite_dia', String(Math.max(1, Math.min(500, Number(b.limite) || 15))));
    res.json({ ok: true });
  }));
  P.post('/ia/testar', h(async (req, res) => {
    if (!chave()) return res.status(400).json({ erro: 'Salve a chave da OpenAI primeiro.' });
    const modelo = getConfig().ia_modelo || 'gpt-6.1-sol';
    try {
      const r = await fetch(`${BASE}/models/${encodeURIComponent(modelo)}`, { headers: { Authorization: `Bearer ${chave()}` }, signal: AbortSignal.timeout(15000) });
      if (r.ok) return res.json({ ok: true, modelo });
      let m = ''; try { m = (await r.json()).error.message; } catch {}
      const e = erroOpenAI(r.status, m); res.status(400).json({ erro: e.message });
    } catch { res.status(502).json({ erro: 'O servidor não conseguiu falar com a OpenAI. Confira a internet do servidor.' }); }
  }));
  P.put('/ia/usuarios/:id', h((req, res) => {
    db.prepare("UPDATE usuarios SET pode_ia = ? WHERE id = ? AND papel = 'aluno'").run(req.body && req.body.pode_ia ? 1 : 0, Number(req.params.id));
    res.json({ ok: true });
  }));
  P.post('/frases', h((req, res) => {
    const b = req.body || {}; const autor = String(b.autor || '').trim().slice(0, 80), frase = String(b.frase || '').trim().slice(0, 600);
    if (!autor || !frase) return res.status(400).json({ erro: 'Preencha a frase e o autor.' });
    const id = db.prepare('INSERT INTO frases (autor, frase, fonte) VALUES (?,?,?)').run(autor, frase, String(b.fonte || '').trim().slice(0, 120)).lastInsertRowid;
    res.json({ ok: true, id });
  }));
  P.put('/frases/:id', h((req, res) => {
    const f = db.prepare('SELECT * FROM frases WHERE id = ?').get(Number(req.params.id)); if (!f) return res.status(404).json({ erro: 'Frase não encontrada.' });
    const b = req.body || {};
    db.prepare('UPDATE frases SET autor = ?, frase = ?, fonte = ?, ativo = ? WHERE id = ?').run(
      String(b.autor ?? f.autor).trim().slice(0, 80) || f.autor, String(b.frase ?? f.frase).trim().slice(0, 600) || f.frase,
      String(b.fonte ?? f.fonte ?? '').trim().slice(0, 120), b.ativo === undefined ? f.ativo : (b.ativo ? 1 : 0), f.id);
    res.json({ ok: true });
  }));
  P.delete('/frases/:id', h((req, res) => { db.prepare('DELETE FROM frases WHERE id = ?').run(Number(req.params.id)); res.json({ ok: true }); }));
};
module.exports.podeIA = podeIA;
module.exports.montarMaterial = montarMaterial;
module.exports.sistema = sistema;
