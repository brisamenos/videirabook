// VideiraBook — gestão de igrejas (várias igrejas na mesma plataforma, cada uma no seu espaço)
// • O admin interno (papel "professor") cria as igrejas e o login do administrador de cada uma (papel "pastor").
// • Cada igreja tem endereço próprio (/nome-da-igreja) para os membros criarem conta e entrarem.
// • Mural, status e notificações não se misturam entre igrejas.
// • O administrador da igreja cuida do rol de membros, do financeiro, dos arquivos, da logo e das cores.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { db, UPLOAD_DIR } = require('./db');
const ACESSO = require('./acesso');
require('./mural');   // garante as tabelas do mural antes de acrescentar colunas

db.exec(`
CREATE TABLE IF NOT EXISTS igrejas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  cidade TEXT, telefone TEXT, email TEXT, endereco TEXT, pix TEXT,
  sobre TEXT, declaracao TEXT,
  logo TEXT,
  cor_primaria TEXT NOT NULL DEFAULT '#1E3B2C',
  cor_destaque TEXT NOT NULL DEFAULT '#B48A3F',
  ia_ativa INTEGER NOT NULL DEFAULT 0,
  estudo_ativo INTEGER NOT NULL DEFAULT 0,
  inscricoes_abertas INTEGER NOT NULL DEFAULT 1,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS igreja_arquivos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  igreja_id INTEGER NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL, arquivo TEXT NOT NULL, tamanho INTEGER, ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS membros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  igreja_id INTEGER NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, sexo TEXT, nascimento TEXT, batismo TEXT, data_entrada TEXT,
  cargo TEXT, situacao TEXT NOT NULL DEFAULT 'Membro', estado_civil TEXT,
  telefone TEXT, email TEXT, endereco TEXT, observacoes TEXT,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TEXT DEFAULT (datetime('now','localtime')), atualizado_em TEXT
);
CREATE INDEX IF NOT EXISTS membros_igreja ON membros (igreja_id, nome);
CREATE TABLE IF NOT EXISTS recorrencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  igreja_id INTEGER NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, descricao TEXT NOT NULL, categoria TEXT, valor INTEGER NOT NULL, dia INTEGER NOT NULL DEFAULT 10,
  forma TEXT, ativo INTEGER NOT NULL DEFAULT 1, inicio TEXT NOT NULL, ultima TEXT
);
CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  igreja_id INTEGER NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, data TEXT NOT NULL, valor INTEGER NOT NULL,
  categoria TEXT, descricao TEXT, forma TEXT, culto TEXT,
  membro_id INTEGER REFERENCES membros(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pago',
  recorrencia_id INTEGER REFERENCES recorrencias(id) ON DELETE SET NULL,
  criado_por INTEGER, criado_em TEXT DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS lancamentos_igreja ON lancamentos (igreja_id, data);
`);
if (!db.prepare('PRAGMA table_info(usuarios)').all().some(c => c.name === 'igreja_id')) db.exec('ALTER TABLE usuarios ADD COLUMN igreja_id INTEGER REFERENCES igrejas(id)');
if (!db.prepare('PRAGMA table_info(rede_posts)').all().some(c => c.name === 'fixado')) db.exec('ALTER TABLE rede_posts ADD COLUMN fixado INTEGER NOT NULL DEFAULT 0');

const RESERVADOS = new Set(['api', 'arquivos', 'inscricao', 'inscricoes', '3d', 'css', 'js', 'img', 'fonts', 'sw.js', 'manifest.webmanifest', 'admin', 'login', 'entrar', 'igreja', 'igrejas', 'p', 'well-known']);
const SITUACOES = ['Membro', 'Congregado', 'Novo convertido', 'Visitante', 'Afastado', 'Transferido', 'Falecido'];
const CAT_ENTRADA = ['Dízimo', 'Oferta', 'Oferta missionária', 'Doação', 'Evento', 'Cantina', 'Outras entradas'];
const CAT_SAIDA = ['Aluguel', 'Energia', 'Água', 'Internet e telefone', 'Prebenda / salários', 'Manutenção', 'Material de limpeza', 'Material de escritório', 'Ação social', 'Missões', 'Eventos', 'Impostos e taxas', 'Outras saídas'];
const FORMAS = ['Dinheiro', 'Pix', 'Cartão', 'Transferência', 'Boleto', 'Cheque'];
const TEMAS = [
  { nome: 'Videira', primaria: '#1E3B2C', destaque: '#B48A3F' },
  { nome: 'Vinho', primaria: '#5E1F2B', destaque: '#C9A15A' },
  { nome: 'Oceano', primaria: '#173F5F', destaque: '#E0A43B' },
  { nome: 'Laranja e preto', primaria: '#1C1C1C', destaque: '#E8731A' },
  { nome: 'Real', primaria: '#2E2366', destaque: '#D4A73A' },
  { nome: 'Terra', primaria: '#5B3A1E', destaque: '#3F7D58' },
  { nome: 'Grafite', primaria: '#2B3035', destaque: '#3C8DBC' },
  { nome: 'Rubi', primaria: '#8E1B2B', destaque: '#1F1F1F' },
];

const slugify = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const corOk = c => /^#[0-9a-f]{6}$/i.test(String(c || ''));
const dataOk = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) ? d : null;
const txt = (v, n) => { const t = String(v ?? '').replace(/\r\n?/g, '\n').trim(); return t ? t.slice(0, n) : null; };
const urlArq = a => a ? `/arquivos/${encodeURIComponent(a)}` : null;
const apagar = nome => { if (nome) fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(nome))).catch(() => {}); };
// Valor em reais → centavos. Aceita "1.250,50" (jeito brasileiro) e "1250.50"
const centavos = v => {
  let t = String(v ?? '').replace(/[R$\s]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = Math.round(Number(t) * 100); return t && Number.isFinite(n) ? n : NaN;
};
const igrejaPorId = id => id ? db.prepare('SELECT * FROM igrejas WHERE id = ?').get(id) : null;
const igrejaPorSlug = s => db.prepare('SELECT * FROM igrejas WHERE slug = ? COLLATE NOCASE').get(String(s || ''));

// O que o app (topo, cores, logo) precisa saber da igreja da pessoa
function resumoIgreja(ig) {
  if (!ig) return null;
  return { id: ig.id, nome: ig.nome, slug: ig.slug, cidade: ig.cidade, logo: ig.logo ? `/api/publico/igreja/${ig.slug}/logo?v=${encodeURIComponent(ig.logo)}` : null,
    cor_primaria: ig.cor_primaria, cor_destaque: ig.cor_destaque, ia_ativa: !!ig.ia_ativa, estudo_ativo: !!ig.estudo_ativo };
}

const enviarImg = multer({
  storage: multer.diskStorage({ destination: UPLOAD_DIR, filename: (req, f, cb) => cb(null, `logo-${Date.now()}-${crypto.randomBytes(5).toString('hex')}${({ 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg' })[f.mimetype] || '.jpg'}`) }),
  limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, f, cb) => cb(null, /^image\/(jpeg|png|webp|svg\+xml)$/.test(f.mimetype)),
});
const enviarPdf = multer({
  storage: multer.diskStorage({ destination: UPLOAD_DIR, filename: (req, f, cb) => cb(null, `igreja-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.pdf`) }),
  limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (req, f, cb) => cb(null, f.mimetype === 'application/pdf' || /\.pdf$/i.test(f.originalname)),
});
const nomeOriginal = f => { try { return Buffer.from(f.originalname, 'latin1').toString('utf8'); } catch { return f.originalname; } };

// ── Contas recorrentes viram lançamentos "a pagar" no mês em que vencem
function gerarRecorrentes(igrejaId) {
  const agora = new Date(); const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  const ins = db.prepare("INSERT INTO lancamentos (igreja_id, tipo, data, valor, categoria, descricao, forma, status, recorrencia_id) VALUES (?,?,?,?,?,?,?, 'pendente', ?)");
  for (const r of db.prepare('SELECT * FROM recorrencias WHERE igreja_id = ? AND ativo = 1').all(igrejaId)) {
    let [y, m] = (r.ultima ? r.ultima : r.inicio).split('-').map(Number);
    if (r.ultima) { m++; if (m > 12) { m = 1; y++; } }
    let ultima = r.ultima;
    while (`${y}-${String(m).padStart(2, '0')}` <= mesAtual) {
      const mes = `${y}-${String(m).padStart(2, '0')}`;
      const fim = new Date(y, m, 0).getDate();
      ins.run(igrejaId, r.tipo, `${mes}-${String(Math.min(r.dia, fim)).padStart(2, '0')}`, r.valor, r.categoria, r.descricao, r.forma, r.id);
      ultima = mes; m++; if (m > 12) { m = 1; y++; }
    }
    if (ultima !== r.ultima) db.prepare('UPDATE recorrencias SET ultima = ? WHERE id = ?').run(ultima, r.id);
  }
}

// ── Relatórios em PDF e Word
const brl = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dBR = d => d ? d.split('-').reverse().join('/') : '';
function pdfTabela(ig, titulo, sub, colunas, linhas, rodape) {
  const PDF = require('pdfkit');
  const doc = new PDF({ size: 'A4', margin: 40, info: { Title: titulo, Author: ig.nome } });
  const cor = ig.cor_primaria || '#1E3B2C';
  let y = 40;
  if (ig.logo && !/\.svg$/i.test(ig.logo)) { try { doc.image(path.join(UPLOAD_DIR, ig.logo), 40, y, { fit: [46, 46] }); } catch { /* sem logo */ } }
  doc.fillColor(cor).font('Helvetica-Bold').fontSize(15).text(ig.nome, 96, y + 4, { width: 460 });
  doc.fillColor('#555').font('Helvetica').fontSize(9).text([ig.cidade, ig.telefone].filter(Boolean).join(' · ') || ' ', 96, y + 24, { width: 460 });
  y = 100;
  doc.fillColor('#111').font('Helvetica-Bold').fontSize(13).text(titulo, 40, y); y += 18;
  if (sub) { doc.fillColor('#666').font('Helvetica').fontSize(9).text(sub, 40, y); y += 16; }
  const larg = 515, tot = colunas.reduce((s, c) => s + c.l, 0), esc_ = larg / tot;
  const cab = () => {
    doc.rect(40, y, larg, 18).fill(cor); let x = 40;
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8);
    for (const c of colunas) { doc.text(c.t, x + 4, y + 5, { width: c.l * esc_ - 8, align: c.a || 'left' }); x += c.l * esc_; }
    y += 18;
  };
  cab();
  doc.font('Helvetica').fontSize(8);
  linhas.forEach((l, i) => {
    const alt = Math.max(16, ...l.map((v, k) => doc.heightOfString(String(v ?? ''), { width: colunas[k].l * esc_ - 8 }) + 8));
    if (y + alt > 790) { doc.addPage(); y = 40; cab(); doc.font('Helvetica').fontSize(8); }
    if (i % 2) doc.rect(40, y, larg, alt).fill('#F3F4F1');
    let x = 40; doc.fillColor('#222');
    l.forEach((v, k) => { doc.text(String(v ?? ''), x + 4, y + 4, { width: colunas[k].l * esc_ - 8, align: colunas[k].a || 'left' }); x += colunas[k].l * esc_; });
    y += alt;
  });
  if (!linhas.length) { doc.fillColor('#777').text('Nenhum registro no período.', 44, y + 6); y += 24; }
  if (rodape && rodape.length) {
    y += 10; if (y > 760) { doc.addPage(); y = 40; }
    for (const [r, v] of rodape) { doc.font('Helvetica-Bold').fillColor('#111').fontSize(10).text(`${r}: ${v}`, 40, y, { width: larg, align: 'right' }); y += 15; }
  }
  doc.page.margins.bottom = 0;
  doc.fontSize(7).fillColor('#999').text(`Gerado em ${new Date().toLocaleString('pt-BR')} pelo VideiraBook`, 40, 805, { width: larg, align: 'center' });
  return doc;
}
async function docxTabela(ig, titulo, sub, colunas, linhas, rodape) {
  const D = require('docx');
  const cor = (ig.cor_primaria || '#1E3B2C').slice(1);
  const cel = (t, cab, a) => new D.TableCell({
    shading: cab ? { fill: cor, type: D.ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new D.Paragraph({ alignment: a === 'right' ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT, children: [new D.TextRun({ text: String(t ?? ''), bold: !!cab, color: cab ? 'FFFFFF' : '222222', size: 18 })] })],
  });
  const tabela = new D.Table({
    width: { size: 100, type: D.WidthType.PERCENTAGE },
    rows: [new D.TableRow({ tableHeader: true, children: colunas.map(c => cel(c.t, true, c.a)) }), ...linhas.map(l => new D.TableRow({ children: l.map((v, k) => cel(v, false, colunas[k].a)) }))],
  });
  const doc = new D.Document({
    creator: 'VideiraBook', title: titulo,
    sections: [{ properties: {}, children: [
      new D.Paragraph({ children: [new D.TextRun({ text: ig.nome, bold: true, size: 30, color: cor })] }),
      new D.Paragraph({ children: [new D.TextRun({ text: [ig.cidade, ig.telefone].filter(Boolean).join(' · '), size: 18, color: '666666' })] }),
      new D.Paragraph({ spacing: { before: 240 }, children: [new D.TextRun({ text: titulo, bold: true, size: 26 })] }),
      ...(sub ? [new D.Paragraph({ children: [new D.TextRun({ text: sub, size: 18, color: '666666' })] })] : []),
      new D.Paragraph({ text: '' }), tabela,
      ...(rodape || []).map(([r, v]) => new D.Paragraph({ alignment: D.AlignmentType.RIGHT, spacing: { before: 120 }, children: [new D.TextRun({ text: `${r}: ${v}`, bold: true, size: 20 })] })),
      new D.Paragraph({ spacing: { before: 300 }, children: [new D.TextRun({ text: `Gerado em ${new Date().toLocaleString('pt-BR')} pelo VideiraBook`, size: 14, color: '999999' })] }),
    ] }],
  });
  return D.Packer.toBuffer(doc);
}
async function responderRelatorio(res, formato, ig, nomeArq, titulo, sub, colunas, linhas, rodape) {
  const base = `${nomeArq}-${slugify(ig.nome)}`;
  if (formato === 'docx') {
    const buf = await docxTabela(ig, titulo, sub, colunas, linhas, rodape);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="${base}.docx"` }).send(buf);
  } else if (formato === 'csv') {
    const c = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const corpo = '﻿' + [colunas.map(x => c(x.t)).join(';'), ...linhas.map(l => l.map(c).join(';'))].join('\r\n');
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${base}.csv"` }).send(corpo);
  } else {
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${base}.pdf"` });
    const doc = pdfTabela(ig, titulo, sub, colunas, linhas, rodape); doc.pipe(res); doc.end();
  }
}

module.exports = function (app, P, auth, h, emitirToken) {
  // ── Página pública de cada igreja (/nome-da-igreja): entrar ou criar conta
  app.get('/:slug', (req, res, next) => {
    const s = req.params.slug;
    if (RESERVADOS.has(s.toLowerCase()) || s.includes('.')) return next();
    const ig = igrejaPorSlug(s);
    if (!ig || !ig.ativo) return next();
    res.sendFile(path.join(__dirname, 'igreja.html'), { maxAge: 0, lastModified: true });
  });
  app.get('/api/publico/igreja/:slug', h((req, res) => {
    const ig = igrejaPorSlug(req.params.slug);
    if (!ig || !ig.ativo) return res.status(404).json({ erro: 'Igreja não encontrada.' });
    res.json({ ...resumoIgreja(ig), sobre: ig.sobre, inscricoes_abertas: !!ig.inscricoes_abertas });
  }));
  app.get('/api/publico/igreja/:slug/logo', (req, res) => {
    const ig = igrejaPorSlug(req.params.slug);
    if (!ig || !ig.logo) return res.status(404).end();
    res.sendFile(path.join(UPLOAD_DIR, path.basename(ig.logo)), { maxAge: '7d' });
  });
  const tentativas = new Map();
  app.post('/api/publico/igreja/:slug/cadastro', h((req, res) => {
    const ip = req.ip || ''; const agora = Date.now();
    const lista = (tentativas.get(ip) || []).filter(t => agora - t < 10 * 60e3);
    if (lista.length >= 8) return res.status(429).json({ erro: 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.' });
    lista.push(agora); tentativas.set(ip, lista); if (tentativas.size > 5000) tentativas.clear();
    const ig = igrejaPorSlug(req.params.slug);
    if (!ig || !ig.ativo) return res.status(404).json({ erro: 'Igreja não encontrada.' });
    if (!ig.inscricoes_abertas) return res.status(403).json({ erro: 'Os cadastros desta igreja estão fechados no momento. Fale com a liderança.' });
    const b = req.body || {};
    if (b.site) return res.json({ ok: true });
    const nome = String(b.nome || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const email = String(b.email || '').trim().toLowerCase().slice(0, 160);
    const telefone = String(b.telefone || '').replace(/\D/g, '').slice(0, 13);
    const senha = String(b.senha || '');
    if (nome.length < 3 || !nome.includes(' ')) return res.status(400).json({ erro: 'Escreva seu nome completo.', campo: 'nome' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ erro: 'Confira o e-mail: ele parece incompleto.', campo: 'email' });
    if (telefone && (telefone.length < 10 || telefone.length > 13)) return res.status(400).json({ erro: 'Confira o WhatsApp com DDD.', campo: 'telefone' });
    if (senha.length < 6) return res.status(400).json({ erro: 'Crie uma senha com pelo menos 6 caracteres.', campo: 'senha' });
    if (db.prepare('SELECT 1 FROM usuarios WHERE email = ? COLLATE NOCASE').get(email)) return res.status(400).json({ erro: 'Já existe uma conta com este e-mail. Use "Entrar".', campo: 'email', conta: true });
    const base = (email.split('@')[0]).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9._-]/g, '').slice(0, 30) || 'membro';
    let usuario = base.length >= 3 ? base : base + 'vb', n = 1;
    while (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) usuario = `${base}${++n}`;
    const uid = db.prepare("INSERT INTO usuarios (nome, usuario, telefone, senha_hash, papel, email, origem, igreja_id) VALUES (?,?,?,?, 'aluno', ?, 'igreja', ?)")
      .run(nome, usuario, telefone || null, bcrypt.hashSync(senha, 10), email, ig.id).lastInsertRowid;
    emitirToken(res, { id: uid, papel: 'aluno' });
    db.prepare("UPDATE usuarios SET ultimo_acesso = datetime('now','localtime') WHERE id = ?").run(uid);
    for (const p of db.prepare("SELECT id FROM usuarios WHERE igreja_id = ? AND papel = 'pastor' AND ativo = 1").all(ig.id))
      ACESSO.notificar(p.id, { tipo: 'inscricao', texto: `${nome} criou uma conta no app da igreja.`, link: '#/g/membros', atorId: uid, titulo: 'Novo cadastro' });
    res.json({ ok: true });
  }));

  // ── Membros logados: página da igreja (sobre, declaração de fé, arquivos, contatos)
  app.get('/api/igreja', auth, h((req, res) => {
    const ig = igrejaPorId(req.user.igreja_id);
    if (!ig) return res.status(404).json({ erro: 'Você não está ligado a uma igreja.' });
    res.json({ ...resumoIgreja(ig), sobre: ig.sobre, declaracao: ig.declaracao, telefone: ig.telefone, email: ig.email, endereco: ig.endereco, pix: ig.pix,
      arquivos: db.prepare('SELECT id, titulo, arquivo, tamanho FROM igreja_arquivos WHERE igreja_id = ? ORDER BY ordem, id').all(ig.id).map(a => ({ id: a.id, titulo: a.titulo, url: urlArq(a.arquivo), tamanho: a.tamanho })),
      sou_admin: req.user.papel === 'pastor' });
  }));

  // ════════ Administração da igreja (papel "pastor")
  const G = require('express').Router();
  G.use(auth, (req, res, next) => {
    if (req.user.papel !== 'pastor' || !req.user.igreja_id) return res.status(403).json({ erro: 'Acesso exclusivo da administração da igreja.' });
    req.igreja = igrejaPorId(req.user.igreja_id);
    if (!req.igreja || !req.igreja.ativo) return res.status(403).json({ erro: 'Esta igreja está desativada. Fale com o suporte.' });
    next();
  });
  app.use('/api/gestao', G);

  // Painel com os números da igreja
  G.get('/painel', h((req, res) => {
    const id = req.igreja.id; gerarRecorrentes(id);
    const hoje = new Date(); const mes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const porSit = db.prepare('SELECT situacao, COUNT(*) n FROM membros WHERE igreja_id = ? GROUP BY situacao').all(id);
    const aniversariantes = db.prepare("SELECT id, nome, nascimento, telefone FROM membros WHERE igreja_id = ? AND nascimento IS NOT NULL AND substr(nascimento, 6, 2) = ? AND situacao NOT IN ('Falecido','Transferido') ORDER BY substr(nascimento, 9, 2)").all(id, mes.slice(5));
    const somaMes = (tipo, m) => db.prepare("SELECT COALESCE(SUM(valor),0) v FROM lancamentos WHERE igreja_id = ? AND tipo = ? AND status = 'pago' AND substr(data,1,7) = ?").get(id, tipo, m).v;
    const meses = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1); const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; meses.push({ mes: m, entradas: somaMes('entrada', m), saidas: somaMes('saida', m) }); }
    const saldo = db.prepare("SELECT COALESCE(SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END),0) v FROM lancamentos WHERE igreja_id = ? AND status = 'pago'").get(id).v;
    const pendentes = db.prepare("SELECT COUNT(*) n, COALESCE(SUM(valor),0) v FROM lancamentos WHERE igreja_id = ? AND status = 'pendente' AND tipo = 'saida' AND data <= ?").get(id, `${mes}-31`);
    res.json({
      igreja: resumoIgreja(req.igreja),
      membros: { total: porSit.reduce((s, r) => s + r.n, 0), por_situacao: porSit,
        batizados: db.prepare("SELECT COUNT(*) n FROM membros WHERE igreja_id = ? AND batismo IS NOT NULL AND situacao NOT IN ('Falecido','Transferido')").get(id).n,
        novos_mes: db.prepare("SELECT COUNT(*) n FROM membros WHERE igreja_id = ? AND substr(criado_em,1,7) = ?").get(id, mes).n },
      aniversariantes,
      app: { contas: db.prepare('SELECT COUNT(*) n FROM usuarios WHERE igreja_id = ? AND ativo = 1').get(id).n,
        novas_30: db.prepare("SELECT COUNT(*) n FROM usuarios WHERE igreja_id = ? AND criado_em >= datetime('now','localtime','-30 days')").get(id).n,
        ativos_7: db.prepare("SELECT COUNT(*) n FROM usuarios WHERE igreja_id = ? AND ultimo_acesso >= datetime('now','localtime','-7 days')").get(id).n,
        publicacoes_30: db.prepare("SELECT COUNT(*) n FROM rede_posts p JOIN usuarios u ON u.id = p.usuario_id WHERE u.igreja_id = ? AND p.criado_em >= datetime('now','localtime','-30 days')").get(id).n },
      financeiro: { mes, entradas: somaMes('entrada', mes), saidas: somaMes('saida', mes), saldo, meses, pendentes },
      endereco: `/${req.igreja.slug}`,
    });
  }));

  // ── Rol de membros
  const camposMembro = b => ({
    nome: txt(b.nome, 160), sexo: ['M', 'F'].includes(b.sexo) ? b.sexo : null, nascimento: dataOk(b.nascimento), batismo: dataOk(b.batismo), data_entrada: dataOk(b.data_entrada),
    cargo: txt(b.cargo, 80), situacao: SITUACOES.includes(b.situacao) ? b.situacao : 'Membro', estado_civil: txt(b.estado_civil, 30),
    telefone: txt(b.telefone, 30), email: txt(b.email, 160), endereco: txt(b.endereco, 300), observacoes: txt(b.observacoes, 2000),
  });
  G.get('/membros', h((req, res) => {
    res.json({ lista: db.prepare('SELECT * FROM membros WHERE igreja_id = ? ORDER BY nome COLLATE NOCASE').all(req.igreja.id), situacoes: SITUACOES,
      cargos: db.prepare('SELECT DISTINCT cargo FROM membros WHERE igreja_id = ? AND cargo IS NOT NULL ORDER BY cargo').all(req.igreja.id).map(r => r.cargo),
      contas_fora: db.prepare('SELECT u.id, u.nome, u.email, u.telefone, u.criado_em FROM usuarios u WHERE u.igreja_id = ? AND NOT EXISTS (SELECT 1 FROM membros m WHERE m.usuario_id = u.id) ORDER BY u.criado_em DESC').all(req.igreja.id) });
  }));
  G.post('/membros', h((req, res) => {
    const m = camposMembro(req.body || {});
    if (!m.nome) return res.status(400).json({ erro: 'Escreva o nome completo.' });
    const uid = Number(req.body.usuario_id) || null;
    if (uid && !db.prepare('SELECT 1 FROM usuarios WHERE id = ? AND igreja_id = ?').get(uid, req.igreja.id)) return res.status(400).json({ erro: 'Conta inválida.' });
    const id = db.prepare(`INSERT INTO membros (igreja_id, nome, sexo, nascimento, batismo, data_entrada, cargo, situacao, estado_civil, telefone, email, endereco, observacoes, usuario_id)
      VALUES (@igreja_id, @nome, @sexo, @nascimento, @batismo, @data_entrada, @cargo, @situacao, @estado_civil, @telefone, @email, @endereco, @observacoes, @usuario_id)`).run({ ...m, igreja_id: req.igreja.id, usuario_id: uid }).lastInsertRowid;
    res.json({ ok: true, id });
  }));
  G.put('/membros/:id', h((req, res) => {
    const atual = db.prepare('SELECT * FROM membros WHERE id = ? AND igreja_id = ?').get(Number(req.params.id), req.igreja.id);
    if (!atual) return res.status(404).json({ erro: 'Membro não encontrado.' });
    const m = camposMembro(req.body || {});
    if (!m.nome) return res.status(400).json({ erro: 'Escreva o nome completo.' });
    db.prepare(`UPDATE membros SET nome=@nome, sexo=@sexo, nascimento=@nascimento, batismo=@batismo, data_entrada=@data_entrada, cargo=@cargo, situacao=@situacao, estado_civil=@estado_civil,
      telefone=@telefone, email=@email, endereco=@endereco, observacoes=@observacoes, atualizado_em=datetime('now','localtime') WHERE id=@id`).run({ ...m, id: atual.id });
    res.json({ ok: true });
  }));
  G.delete('/membros/:id', h((req, res) => {
    db.prepare('DELETE FROM membros WHERE id = ? AND igreja_id = ?').run(Number(req.params.id), req.igreja.id);
    res.json({ ok: true });
  }));
  G.get('/membros/exportar', h(async (req, res) => {
    const sit = SITUACOES.includes(req.query.situacao) ? req.query.situacao : null;
    const lista = db.prepare(`SELECT * FROM membros WHERE igreja_id = ? ${sit ? 'AND situacao = ?' : ''} ORDER BY nome COLLATE NOCASE`).all(...[req.igreja.id, ...(sit ? [sit] : [])]);
    await responderRelatorio(res, req.query.formato, req.igreja, 'rol-de-membros', 'Rol de membros', `${lista.length} pessoa${lista.length === 1 ? '' : 's'}${sit ? ` · ${sit}` : ''}`,
      [{ t: 'Nome', l: 30 }, { t: 'Situação', l: 12 }, { t: 'Cargo', l: 14 }, { t: 'Nascimento', l: 11 }, { t: 'Batismo', l: 11 }, { t: 'Telefone', l: 14 }],
      lista.map(m => [m.nome, m.situacao, m.cargo || '', dBR(m.nascimento), dBR(m.batismo), m.telefone || '']));
  }));

  // ── Financeiro
  G.get('/financeiro', h((req, res) => {
    const id = req.igreja.id; gerarRecorrentes(id);
    const mes = /^\d{4}-\d{2}$/.test(req.query.mes || '') ? req.query.mes : new Date().toISOString().slice(0, 7);
    const lanc = db.prepare(`SELECT l.*, m.nome AS membro_nome FROM lancamentos l LEFT JOIN membros m ON m.id = l.membro_id
      WHERE l.igreja_id = ? AND substr(l.data,1,7) = ? ORDER BY l.data DESC, l.id DESC`).all(id, mes);
    const soma = (t, st = 'pago') => lanc.filter(l => l.tipo === t && l.status === st).reduce((s, l) => s + l.valor, 0);
    const porCat = {};
    for (const l of lanc.filter(x => x.status === 'pago')) { const k = `${l.tipo}|${l.categoria || 'Sem categoria'}`; porCat[k] = (porCat[k] || 0) + l.valor; }
    const saldoAnterior = db.prepare("SELECT COALESCE(SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END),0) v FROM lancamentos WHERE igreja_id = ? AND status = 'pago' AND substr(data,1,7) < ?").get(id, mes).v;
    res.json({ mes, lancamentos: lanc, entradas: soma('entrada'), saidas: soma('saida'), a_pagar: soma('saida', 'pendente'), a_receber: soma('entrada', 'pendente'), saldo_anterior: saldoAnterior,
      categorias: Object.entries(porCat).map(([k, v]) => { const [tipo, nome] = k.split('|'); return { tipo, nome, valor: v }; }).sort((a, b) => b.valor - a.valor),
      cat_entrada: CAT_ENTRADA, cat_saida: CAT_SAIDA, formas: FORMAS,
      recorrencias: db.prepare('SELECT * FROM recorrencias WHERE igreja_id = ? ORDER BY ativo DESC, descricao').all(id),
      membros: db.prepare("SELECT id, nome FROM membros WHERE igreja_id = ? AND situacao NOT IN ('Falecido','Transferido') ORDER BY nome COLLATE NOCASE").all(id) });
  }));
  const camposLanc = (b, igId) => {
    const valor = centavos(b.valor);
    const membro = Number(b.membro_id) || null;
    return { tipo: b.tipo === 'saida' ? 'saida' : 'entrada', data: dataOk(b.data), valor, categoria: txt(b.categoria, 60), descricao: txt(b.descricao, 300), forma: txt(b.forma, 30), culto: txt(b.culto, 80),
      membro_id: membro && db.prepare('SELECT 1 FROM membros WHERE id = ? AND igreja_id = ?').get(membro, igId) ? membro : null, status: b.status === 'pendente' ? 'pendente' : 'pago' };
  };
  G.post('/lancamentos', h((req, res) => {
    const l = camposLanc(req.body || {}, req.igreja.id);
    if (!l.data) return res.status(400).json({ erro: 'Informe a data.' });
    if (!(l.valor > 0)) return res.status(400).json({ erro: 'Informe um valor maior que zero.' });
    const id = db.prepare(`INSERT INTO lancamentos (igreja_id, tipo, data, valor, categoria, descricao, forma, culto, membro_id, status, criado_por)
      VALUES (@igreja_id,@tipo,@data,@valor,@categoria,@descricao,@forma,@culto,@membro_id,@status,@criado_por)`).run({ ...l, igreja_id: req.igreja.id, criado_por: req.user.id }).lastInsertRowid;
    res.json({ ok: true, id });
  }));
  G.put('/lancamentos/:id', h((req, res) => {
    const atual = db.prepare('SELECT * FROM lancamentos WHERE id = ? AND igreja_id = ?').get(Number(req.params.id), req.igreja.id);
    if (!atual) return res.status(404).json({ erro: 'Lançamento não encontrado.' });
    const l = camposLanc({ ...atual, valor: atual.valor / 100, ...req.body }, req.igreja.id);
    if (req.body.valor === undefined) l.valor = atual.valor;
    if (!l.data || !(l.valor > 0)) return res.status(400).json({ erro: 'Confira a data e o valor.' });
    db.prepare('UPDATE lancamentos SET tipo=@tipo, data=@data, valor=@valor, categoria=@categoria, descricao=@descricao, forma=@forma, culto=@culto, membro_id=@membro_id, status=@status WHERE id=@id').run({ ...l, id: atual.id });
    res.json({ ok: true });
  }));
  G.delete('/lancamentos/:id', h((req, res) => {
    db.prepare('DELETE FROM lancamentos WHERE id = ? AND igreja_id = ?').run(Number(req.params.id), req.igreja.id);
    res.json({ ok: true });
  }));
  G.post('/recorrencias', h((req, res) => {
    const b = req.body || {}; const valor = centavos(b.valor), dia = Math.min(28, Math.max(1, Number(b.dia) || 10));
    if (!txt(b.descricao, 120)) return res.status(400).json({ erro: 'Descreva a conta (ex.: Aluguel do templo).' });
    if (!(valor > 0)) return res.status(400).json({ erro: 'Informe o valor mensal.' });
    const inicio = /^\d{4}-\d{2}$/.test(b.inicio || '') ? b.inicio : new Date().toISOString().slice(0, 7);
    db.prepare('INSERT INTO recorrencias (igreja_id, tipo, descricao, categoria, valor, dia, forma, inicio) VALUES (?,?,?,?,?,?,?,?)')
      .run(req.igreja.id, b.tipo === 'entrada' ? 'entrada' : 'saida', txt(b.descricao, 120), txt(b.categoria, 60), valor, dia, txt(b.forma, 30), inicio);
    gerarRecorrentes(req.igreja.id);
    res.json({ ok: true });
  }));
  G.put('/recorrencias/:id', h((req, res) => {
    const r = db.prepare('SELECT * FROM recorrencias WHERE id = ? AND igreja_id = ?').get(Number(req.params.id), req.igreja.id);
    if (!r) return res.status(404).json({ erro: 'Conta recorrente não encontrada.' });
    const b = req.body || {};
    const valor = b.valor !== undefined ? centavos(b.valor) : r.valor;
    db.prepare('UPDATE recorrencias SET descricao = ?, categoria = ?, valor = ?, dia = ?, forma = ?, ativo = ? WHERE id = ?').run(
      txt(b.descricao, 120) || r.descricao, b.categoria !== undefined ? txt(b.categoria, 60) : r.categoria, valor > 0 ? valor : r.valor,
      b.dia ? Math.min(28, Math.max(1, Number(b.dia))) : r.dia, b.forma !== undefined ? txt(b.forma, 30) : r.forma, b.ativo === undefined ? r.ativo : (b.ativo ? 1 : 0), r.id);
    res.json({ ok: true });
  }));
  G.delete('/recorrencias/:id', h((req, res) => {
    db.prepare("DELETE FROM lancamentos WHERE recorrencia_id = ? AND igreja_id = ? AND status = 'pendente'").run(Number(req.params.id), req.igreja.id);
    db.prepare('DELETE FROM recorrencias WHERE id = ? AND igreja_id = ?').run(Number(req.params.id), req.igreja.id);
    res.json({ ok: true });
  }));
  G.get('/financeiro/exportar', h(async (req, res) => {
    const de = dataOk(req.query.de) || new Date().toISOString().slice(0, 8) + '01', ate = dataOk(req.query.ate) || new Date().toISOString().slice(0, 10);
    const tipo = ['entrada', 'saida'].includes(req.query.tipo) ? req.query.tipo : null;
    const lanc = db.prepare(`SELECT l.*, m.nome AS membro_nome FROM lancamentos l LEFT JOIN membros m ON m.id = l.membro_id
      WHERE l.igreja_id = ? AND l.data BETWEEN ? AND ? ${tipo ? 'AND l.tipo = ?' : ''} ORDER BY l.data, l.id`).all(...[req.igreja.id, de, ate, ...(tipo ? [tipo] : [])]);
    const pagos = lanc.filter(l => l.status === 'pago');
    const ent = pagos.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0), sai = pagos.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
    await responderRelatorio(res, req.query.formato, req.igreja, 'financeiro', tipo === 'entrada' ? 'Relatório de entradas' : tipo === 'saida' ? 'Relatório de saídas' : 'Relatório financeiro',
      `Período de ${dBR(de)} a ${dBR(ate)}`,
      [{ t: 'Data', l: 10 }, { t: 'Tipo', l: 8 }, { t: 'Categoria', l: 16 }, { t: 'Descrição', l: 30 }, { t: 'Forma', l: 10 }, { t: 'Situação', l: 9 }, { t: 'Valor', l: 13, a: 'right' }],
      lanc.map(l => [dBR(l.data), l.tipo === 'entrada' ? 'Entrada' : 'Saída', l.categoria || '', [l.descricao, l.culto, l.membro_nome].filter(Boolean).join(' · '), l.forma || '', l.status === 'pago' ? 'Pago' : 'A pagar', (l.tipo === 'saida' ? '- ' : '') + brl(l.valor)]),
      tipo === 'saida' ? [['Total de saídas', brl(sai)]] : tipo === 'entrada' ? [['Total de entradas', brl(ent)]] : [['Entradas', brl(ent)], ['Saídas', brl(sai)], ['Resultado do período', brl(ent - sai)]]);
  }));

  // ── Dados, logo, cores e arquivos da igreja
  G.get('/igreja', h((req, res) => {
    const ig = req.igreja;
    res.json({ ...resumoIgreja(ig), sobre: ig.sobre, declaracao: ig.declaracao, telefone: ig.telefone, email: ig.email, endereco: ig.endereco, pix: ig.pix,
      inscricoes_abertas: !!ig.inscricoes_abertas, temas: TEMAS,
      arquivos: db.prepare('SELECT * FROM igreja_arquivos WHERE igreja_id = ? ORDER BY ordem, id').all(ig.id).map(a => ({ ...a, url: urlArq(a.arquivo) })) });
  }));
  G.put('/igreja', h((req, res) => {
    const b = req.body || {}, ig = req.igreja;
    db.prepare(`UPDATE igrejas SET nome = ?, cidade = ?, telefone = ?, email = ?, endereco = ?, pix = ?, sobre = ?, declaracao = ?, cor_primaria = ?, cor_destaque = ?, inscricoes_abertas = ? WHERE id = ?`).run(
      txt(b.nome, 120) || ig.nome, b.cidade !== undefined ? txt(b.cidade, 80) : ig.cidade, b.telefone !== undefined ? txt(b.telefone, 30) : ig.telefone,
      b.email !== undefined ? txt(b.email, 160) : ig.email, b.endereco !== undefined ? txt(b.endereco, 300) : ig.endereco, b.pix !== undefined ? txt(b.pix, 160) : ig.pix,
      b.sobre !== undefined ? txt(b.sobre, 3000) : ig.sobre, b.declaracao !== undefined ? txt(b.declaracao, 30000) : ig.declaracao,
      corOk(b.cor_primaria) ? b.cor_primaria : ig.cor_primaria, corOk(b.cor_destaque) ? b.cor_destaque : ig.cor_destaque,
      b.inscricoes_abertas === undefined ? ig.inscricoes_abertas : (b.inscricoes_abertas ? 1 : 0), ig.id);
    res.json({ ok: true, igreja: resumoIgreja(igrejaPorId(ig.id)) });
  }));
  G.put('/igreja/logo', (req, res, next) => enviarImg.single('logo')(req, res, e => e ? res.status(400).json({ erro: e.code === 'LIMIT_FILE_SIZE' ? 'A logo pode ter até 5 MB.' : 'Não foi possível receber a imagem.' }) : next()), h((req, res) => {
    if (!req.file) return res.status(400).json({ erro: 'Escolha uma imagem PNG, JPG, WebP ou SVG.' });
    apagar(req.igreja.logo);
    db.prepare('UPDATE igrejas SET logo = ? WHERE id = ?').run(req.file.filename, req.igreja.id);
    res.json({ ok: true, igreja: resumoIgreja(igrejaPorId(req.igreja.id)) });
  }));
  G.delete('/igreja/logo', h((req, res) => {
    apagar(req.igreja.logo); db.prepare('UPDATE igrejas SET logo = NULL WHERE id = ?').run(req.igreja.id);
    res.json({ ok: true, igreja: resumoIgreja(igrejaPorId(req.igreja.id)) });
  }));
  G.post('/arquivos', (req, res, next) => {
    if (db.prepare('SELECT COUNT(*) n FROM igreja_arquivos WHERE igreja_id = ?').get(req.igreja.id).n >= 10) return res.status(400).json({ erro: 'Limite de 10 arquivos. Apague um para enviar outro.' });
    enviarPdf.single('arquivo')(req, res, e => e ? res.status(400).json({ erro: e.code === 'LIMIT_FILE_SIZE' ? 'O PDF pode ter até 25 MB.' : 'Não foi possível receber o arquivo.' }) : next());
  }, h((req, res) => {
    if (!req.file) return res.status(400).json({ erro: 'Escolha um arquivo PDF.' });
    const titulo = txt(req.body.titulo, 120) || nomeOriginal(req.file).replace(/\.pdf$/i, '');
    const ordem = db.prepare('SELECT COALESCE(MAX(ordem),0)+1 n FROM igreja_arquivos WHERE igreja_id = ?').get(req.igreja.id).n;
    db.prepare('INSERT INTO igreja_arquivos (igreja_id, titulo, arquivo, tamanho, ordem) VALUES (?,?,?,?,?)').run(req.igreja.id, titulo, req.file.filename, req.file.size, ordem);
    res.json({ ok: true });
  }));
  G.put('/arquivos/:id', h((req, res) => {
    const t = txt((req.body || {}).titulo, 120); if (!t) return res.status(400).json({ erro: 'Escreva o título.' });
    db.prepare('UPDATE igreja_arquivos SET titulo = ? WHERE id = ? AND igreja_id = ?').run(t, Number(req.params.id), req.igreja.id);
    res.json({ ok: true });
  }));
  G.delete('/arquivos/:id', h((req, res) => {
    const a = db.prepare('SELECT * FROM igreja_arquivos WHERE id = ? AND igreja_id = ?').get(Number(req.params.id), req.igreja.id);
    if (a) { apagar(a.arquivo); db.prepare('DELETE FROM igreja_arquivos WHERE id = ?').run(a.id); }
    res.json({ ok: true });
  }));

  // ── Contas do app da igreja (quem se cadastrou pelo endereço da igreja)
  G.get('/usuarios', h((req, res) => {
    res.json(db.prepare(`SELECT u.id, u.nome, u.email, u.telefone, u.papel, u.ativo, u.criado_em, u.ultimo_acesso,
      (SELECT m.id FROM membros m WHERE m.usuario_id = u.id) AS membro_id FROM usuarios u WHERE u.igreja_id = ? ORDER BY u.nome COLLATE NOCASE`).all(req.igreja.id));
  }));
  G.post('/usuarios', h((req, res) => {
    const b = req.body || {};
    const nome = txt(b.nome, 120), email = String(b.email || '').trim().toLowerCase(), senha = String(b.senha || '');
    if (!nome) return res.status(400).json({ erro: 'Escreva o nome.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ erro: 'Confira o e-mail.' });
    if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    if (db.prepare('SELECT 1 FROM usuarios WHERE email = ? COLLATE NOCASE').get(email)) return res.status(400).json({ erro: 'Já existe uma conta com este e-mail.' });
    let usuario = email.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 30) || 'membro', n = 1; const base = usuario;
    while (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) usuario = `${base}${++n}`;
    db.prepare("INSERT INTO usuarios (nome, usuario, senha_hash, papel, email, origem, igreja_id) VALUES (?,?,?,?,?, 'igreja', ?)")
      .run(nome, usuario, bcrypt.hashSync(senha, 10), b.admin ? 'pastor' : 'aluno', email, req.igreja.id);
    res.json({ ok: true });
  }));
  G.put('/usuarios/:id', h((req, res) => {
    const u = db.prepare('SELECT * FROM usuarios WHERE id = ? AND igreja_id = ?').get(Number(req.params.id), req.igreja.id);
    if (!u) return res.status(404).json({ erro: 'Conta não encontrada.' });
    const b = req.body || {};
    if (u.id === req.user.id && (b.ativo === false || b.admin === false)) return res.status(400).json({ erro: 'Você não pode tirar o seu próprio acesso de administrador.' });
    if (b.senha !== undefined) {
      if (String(b.senha).length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
      db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(bcrypt.hashSync(String(b.senha), 10), u.id);
    }
    if (b.ativo !== undefined) db.prepare('UPDATE usuarios SET ativo = ? WHERE id = ?').run(b.ativo ? 1 : 0, u.id);
    if (b.admin !== undefined) db.prepare('UPDATE usuarios SET papel = ? WHERE id = ?').run(b.admin ? 'pastor' : 'aluno', u.id);
    res.json({ ok: true });
  }));
  G.delete('/usuarios/:id', h((req, res) => {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ erro: 'Você não pode excluir a sua própria conta por aqui.' });
    db.prepare('DELETE FROM usuarios WHERE id = ? AND igreja_id = ?').run(Number(req.params.id), req.igreja.id);
    res.json({ ok: true });
  }));

  // ════════ Admin interno: cadastro das igrejas
  P.get('/igrejas', h((req, res) => {
    res.json(db.prepare(`SELECT i.*, (SELECT COUNT(*) FROM usuarios u WHERE u.igreja_id = i.id) AS contas, (SELECT COUNT(*) FROM membros m WHERE m.igreja_id = i.id) AS membros,
      (SELECT group_concat(u.nome || ' <' || COALESCE(u.email, u.usuario) || '>', '; ') FROM usuarios u WHERE u.igreja_id = i.id AND u.papel = 'pastor') AS admins
      FROM igrejas i ORDER BY i.nome COLLATE NOCASE`).all().map(i => ({ ...i, logo_url: resumoIgreja(i).logo })));
  }));
  P.post('/igrejas', h((req, res) => {
    const b = req.body || {};
    const nome = txt(b.nome, 120); const slug = slugify(b.slug || b.nome);
    const adminNome = txt(b.admin_nome, 120), email = String(b.admin_email || '').trim().toLowerCase(), senha = String(b.admin_senha || '');
    if (!nome) return res.status(400).json({ erro: 'Escreva o nome da igreja.' });
    if (slug.length < 3 || RESERVADOS.has(slug)) return res.status(400).json({ erro: 'Escolha outro endereço para a igreja (mínimo de 3 letras).' });
    if (igrejaPorSlug(slug)) return res.status(400).json({ erro: `O endereço /${slug} já está em uso.` });
    if (!adminNome) return res.status(400).json({ erro: 'Escreva o nome de quem vai administrar a igreja.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ erro: 'Confira o e-mail do administrador (é o login dele).' });
    if (db.prepare('SELECT 1 FROM usuarios WHERE email = ? COLLATE NOCASE').get(email)) return res.status(400).json({ erro: 'Já existe uma conta com este e-mail.' });
    if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    const tema = TEMAS.find(t => t.nome === b.tema) || TEMAS[0];
    const id = db.transaction(() => {
      const iid = db.prepare('INSERT INTO igrejas (nome, slug, cidade, cor_primaria, cor_destaque, ia_ativa, estudo_ativo) VALUES (?,?,?,?,?,?,?)')
        .run(nome, slug, txt(b.cidade, 80), tema.primaria, tema.destaque, b.ia_ativa ? 1 : 0, b.estudo_ativo ? 1 : 0).lastInsertRowid;
      let usuario = email.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 30) || 'admin', n = 1; const base = usuario;
      while (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) usuario = `${base}${++n}`;
      db.prepare("INSERT INTO usuarios (nome, usuario, senha_hash, papel, email, origem, igreja_id) VALUES (?,?,?, 'pastor', ?, 'admin', ?)").run(adminNome, usuario, bcrypt.hashSync(senha, 10), email, iid);
      return iid;
    })();
    res.json({ ok: true, id, slug });
  }));
  P.put('/igrejas/:id', h((req, res) => {
    const ig = igrejaPorId(Number(req.params.id)); if (!ig) return res.status(404).json({ erro: 'Igreja não encontrada.' });
    const b = req.body || {};
    let slug = ig.slug;
    if (b.slug !== undefined && slugify(b.slug) !== ig.slug) {
      slug = slugify(b.slug);
      if (slug.length < 3 || RESERVADOS.has(slug)) return res.status(400).json({ erro: 'Escolha outro endereço (mínimo de 3 letras).' });
      if (igrejaPorSlug(slug)) return res.status(400).json({ erro: `O endereço /${slug} já está em uso.` });
    }
    db.prepare('UPDATE igrejas SET nome = ?, slug = ?, cidade = ?, ativo = ?, ia_ativa = ?, estudo_ativo = ? WHERE id = ?').run(
      txt(b.nome, 120) || ig.nome, slug, b.cidade !== undefined ? txt(b.cidade, 80) : ig.cidade,
      b.ativo === undefined ? ig.ativo : (b.ativo ? 1 : 0), b.ia_ativa === undefined ? ig.ia_ativa : (b.ia_ativa ? 1 : 0), b.estudo_ativo === undefined ? ig.estudo_ativo : (b.estudo_ativo ? 1 : 0), ig.id);
    res.json({ ok: true });
  }));
  // Novo login de administração para a igreja (ou troca de senha de um administrador)
  P.post('/igrejas/:id/admins', h((req, res) => {
    const ig = igrejaPorId(Number(req.params.id)); if (!ig) return res.status(404).json({ erro: 'Igreja não encontrada.' });
    const b = req.body || {}; const email = String(b.email || '').trim().toLowerCase(), senha = String(b.senha || '');
    if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    const existe = db.prepare('SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE').get(email);
    if (existe) {
      if (existe.igreja_id !== ig.id) return res.status(400).json({ erro: 'Este e-mail já pertence a outra conta.' });
      db.prepare("UPDATE usuarios SET senha_hash = ?, papel = 'pastor', ativo = 1 WHERE id = ?").run(bcrypt.hashSync(senha, 10), existe.id);
      return res.json({ ok: true, atualizado: true });
    }
    const nome = txt(b.nome, 120); if (!nome) return res.status(400).json({ erro: 'Escreva o nome.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ erro: 'Confira o e-mail.' });
    let usuario = email.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 30) || 'admin', n = 1; const base = usuario;
    while (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) usuario = `${base}${++n}`;
    db.prepare("INSERT INTO usuarios (nome, usuario, senha_hash, papel, email, origem, igreja_id) VALUES (?,?,?, 'pastor', ?, 'admin', ?)").run(nome, usuario, bcrypt.hashSync(senha, 10), email, ig.id);
    res.json({ ok: true });
  }));
  P.delete('/igrejas/:id', h((req, res) => {
    const ig = igrejaPorId(Number(req.params.id)); if (!ig) return res.json({ ok: true });
    if (String((req.body || {}).confirmar || '').trim().toLowerCase() !== ig.slug.toLowerCase()) return res.status(400).json({ erro: `Para excluir, digite o endereço da igreja: ${ig.slug}` });
    apagar(ig.logo);
    for (const a of db.prepare('SELECT arquivo FROM igreja_arquivos WHERE igreja_id = ?').all(ig.id)) apagar(a.arquivo);
    db.transaction(() => {
      db.prepare('DELETE FROM usuarios WHERE igreja_id = ?').run(ig.id);
      db.prepare('DELETE FROM igrejas WHERE id = ?').run(ig.id);
    })();
    res.json({ ok: true });
  }));
};
Object.assign(module.exports, { resumoIgreja, igrejaPorId, TEMAS });
