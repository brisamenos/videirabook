/* VideiraBook — núcleo: API, rotas, utilidades e componentes compartilhados */
window.VB = (function () {
  const VB = { me: null, config: {}, rotas: [] };

  // ── API
  VB.api = async function (url, opcoes = {}) {
    const o = { method: 'GET', credentials: 'same-origin', ...opcoes, headers: { ...(opcoes.headers || {}) } };
    if (o.body && !(o.body instanceof FormData)) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(o.body); }
    const r = await fetch(url, o);
    let dados = null;
    try { dados = await r.json(); } catch { dados = null; }
    if (r.status === 401 && !url.includes('/api/login')) { VB.me = null; VB.telaLogin(); throw new Error('Sessão encerrada'); }
    if (!r.ok) { const e = new Error((dados && dados.erro) || 'Não foi possível concluir. Tente de novo.'); e.status = r.status; throw e; }
    return dados;
  };
  // Upload com barra de progresso
  VB.enviar = function (url, formData, metodo = 'POST', aoProgresso) {
    return new Promise((ok, falha) => {
      const x = new XMLHttpRequest();
      x.open(metodo, url);
      x.upload.onprogress = e => { if (e.lengthComputable && aoProgresso) aoProgresso(Math.round(e.loaded / e.total * 100)); };
      x.onload = () => {
        let d = null; try { d = JSON.parse(x.responseText); } catch {}
        if (x.status >= 200 && x.status < 300) ok(d); else falha(new Error((d && d.erro) || 'Falha no envio do arquivo.'));
      };
      x.onerror = () => falha(new Error('Falha de conexão durante o envio.'));
      x.send(formData);
    });
  };

  // ── Utilidades
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  VB.esc = esc;
  VB.$ = (sel, raiz = document) => raiz.querySelector(sel);
  VB.$$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const MESES_L = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  VB.DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  VB.data = function (iso) { if (!iso) return null; const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  VB.dataCurta = iso => { const d = VB.data(iso); return d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` : '—'; };
  VB.dataLonga = iso => { const d = VB.data(iso); return d ? `${VB.DIAS[d.getDay()].toLowerCase()}, ${d.getDate()} de ${MESES_L[d.getMonth()]}` : '—'; };
  VB.mesAbrev = iso => { const d = VB.data(iso); return d ? MESES[d.getMonth()] : ''; };
  VB.diaNum = iso => { const d = VB.data(iso); return d ? d.getDate() : ''; };
  VB.quando = function (dt) {
    if (!dt) return 'nunca';
    const d = new Date(dt.replace(' ', 'T'));
    const min = Math.round((Date.now() - d) / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;
    const h = Math.round(min / 60); if (h < 24) return `há ${h} h`;
    const dias = Math.round(h / 24); if (dias < 30) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
    return d.toLocaleDateString('pt-BR');
  };
  VB.diasAte = function (iso) {
    const d = VB.data(iso); if (!d) return null;
    const h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((d - h) / 864e5);
  };
  VB.iniciais = nome => String(nome || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
  VB.primeiroNome = nome => String(nome || '').trim().split(/\s+/)[0];
  VB.saudacao = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

  // ── Ícones (traço 1.8)
  const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  VB.icone = {
    casa: I('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    vinha: I('<path d="M12 21V9"/><path d="M12 9c0-3 2-5 5-6"/><path d="M17 3c2.5 0 4 1.5 4 3.5-2 .5-4-.5-4-3.5z"/><circle cx="8" cy="13" r="1.6"/><circle cx="5.5" cy="13" r="1.6"/><circle cx="6.8" cy="15.6" r="1.6"/>'),
    sino: I('<path d="M6 16V11a6 6 0 1112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/>'),
    pessoa: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
    pessoas: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.5 3.6-5 6.5-5s5.3 1.5 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.3 0 4 1.3 4.8 4"/>'),
    painel: I('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
    livro: I('<path d="M3 5c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v14c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z"/><path d="M12 5v14"/>'),
    marcador: I('<path d="M15 4l5 5-9 9H6v-5z"/><path d="M4 21h16"/>'),
    engrenagem: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>'),
    video: I('<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3"/>'),
    pdf: I('<path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
    texto: I('<path d="M4 6h16M4 10h16M4 14h10M4 18h12"/>'),
    link: I('<path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/>'),
    audio: I('<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    mais: I('<path d="M12 5v14M5 12h14"/>'),
    lapis: I('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    lixo: I('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>'),
    cima: I('<path d="M6 15l6-6 6 6"/>'),
    baixo: I('<path d="M6 9l6 6 6-6"/>'),
    fechar: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    cadeado: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
    olho: I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    sair: I('<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>'),
    alfinete: I('<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v8"/>'),
    calendario: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    externo: I('<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>'),
    check: I('<path d="M5 12l5 5L20 7"/>'),
    caneta: I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>'),
    faisca: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
    upload: I('<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>'),
  };
  VB.iconeTipo = t => VB.icone[{ video: 'video', pdf: 'pdf', texto: 'texto', link: 'link', audio: 'audio' }[t] || 'texto'];
  VB.nomeTipo = { video: 'Vídeo', pdf: 'PDF', texto: 'Texto', link: 'Link', audio: 'Áudio' };

  // Anel de progresso
  VB.anel = function (pct, tam = 92, cor = 'var(--folha)') {
    const r = (tam - 10) / 2, c = 2 * Math.PI * r;
    return `<div class="anel" style="width:${tam}px;height:${tam}px" role="img" aria-label="${pct}% concluído">
      <svg width="${tam}" height="${tam}"><circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="var(--linha-2)" stroke-width="7"/>
      <circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="${cor}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c - c * pct / 100}"/></svg>
      <b>${pct}%</b></div>`;
  };
  VB.barra = pct => `<div class="barra"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;

  // ── Toast, modal, confirmação
  let tToast;
  VB.toast = function (msg, erro = false) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = 'on' + (erro ? ' erro' : '');
    clearTimeout(tToast); tToast = setTimeout(() => { t.className = erro ? 'erro' : ''; }, 3200);
  };
  VB.erro = e => VB.toast(e.message || String(e), true);

  VB.modal = function ({ titulo, corpo, rodape = '', largo = false, aoAbrir }) {
    const raiz = document.getElementById('modal-raiz');
    raiz.innerHTML = `<div class="modal-fundo"><div class="modal ${largo ? 'largo' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div class="modal-cab"><h2 id="modal-titulo">${titulo}</h2><button class="icone-btn" data-fechar aria-label="Fechar">${VB.icone.fechar}</button></div>
      <div class="modal-corpo">${corpo}</div>${rodape ? `<div class="modal-rodape">${rodape}</div>` : ''}</div></div>`;
    const fundo = raiz.firstElementChild;
    const fechar = () => { raiz.innerHTML = ''; document.removeEventListener('keydown', tecla); };
    const tecla = e => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', tecla);
    fundo.addEventListener('mousedown', e => { if (e.target === fundo) fechar(); });
    VB.$$('[data-fechar]', fundo).forEach(b => b.addEventListener('click', fechar));
    const primeiro = fundo.querySelector('input:not([type=hidden]), textarea, select');
    if (primeiro) setTimeout(() => primeiro.focus(), 30);
    if (aoAbrir) aoAbrir(fundo, fechar);
    return { el: fundo, fechar };
  };
  VB.confirmar = function (titulo, texto, rotulo = 'Excluir') {
    return new Promise(ok => {
      const m = VB.modal({
        titulo, corpo: `<p style="margin:0 0 .5rem">${texto}</p>`,
        rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" style="background:var(--perigo)" data-ok>${rotulo}</button>`,
      });
      m.el.querySelector('[data-ok]').addEventListener('click', () => { m.fechar(); ok(true); });
      m.el.querySelectorAll('[data-fechar]').forEach(b => b.addEventListener('click', () => ok(false)));
    });
  };

  // ── HTML seguro (conteúdo das aulas)
  const PERMITIDAS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG', 'HR', 'SPAN', 'DIV', 'SUB', 'SUP']);
  VB.limparHtml = function (html) {
    const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
    const andar = no => {
      [...no.childNodes].forEach(f => {
        if (f.nodeType === 8) { f.remove(); return; }
        if (f.nodeType !== 1) return;
        if (!PERMITIDAS.has(f.tagName)) {
          if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(f.tagName)) { f.remove(); return; }
          andar(f); f.replaceWith(...f.childNodes); return;
        }
        [...f.attributes].forEach(a => {
          const n = a.name.toLowerCase();
          const ok = (f.tagName === 'A' && n === 'href' && /^(https?:|mailto:|\/|#)/i.test(a.value)) ||
                     (f.tagName === 'IMG' && (n === 'src' && /^(https?:|\/)/i.test(a.value) || n === 'alt'));
          if (!ok) f.removeAttribute(a.name);
        });
        if (f.tagName === 'A') { f.setAttribute('target', '_blank'); f.setAttribute('rel', 'noopener'); }
        andar(f);
      });
    };
    andar(doc.body.firstChild);
    return doc.body.firstChild.innerHTML;
  };

  // ── Vídeos: YouTube, Vimeo, Google Drive ou arquivo enviado
  VB.embed = function (m) {
    if (m.arquivo) {
      const src = `/arquivos/${encodeURIComponent(m.arquivo)}`;
      if (m.tipo === 'audio') return `<audio controls preload="metadata" src="${src}" style="width:100%"></audio>`;
      return `<div class="video"><video controls preload="metadata" playsinline src="${src}"></video></div>`;
    }
    const u = String(m.url || '');
    let id;
    if ((id = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)))
      return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${id[1]}?rel=0" title="${esc(m.titulo)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    if ((id = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return `<div class="video"><iframe src="https://player.vimeo.com/video/${id[1]}" title="${esc(m.titulo)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    if ((id = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/)))
      return `<div class="video"><iframe src="https://drive.google.com/file/d/${id[1]}/preview" title="${esc(m.titulo)}" allow="autoplay" allowfullscreen loading="lazy"></iframe></div>`;
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) return `<div class="video"><video controls preload="metadata" playsinline src="${esc(u)}"></video></div>`;
    return '';
  };

  // ── Desenhos (ramos de videira)
  VB.arteRamo = `<svg class="ramo" viewBox="0 0 300 900" fill="none" aria-hidden="true">
    <path d="M250 -20 C170 120 290 220 200 360 S120 560 210 700 S170 860 140 940" stroke="#8DAE7E" stroke-width="3"/>
    <path d="M214 330c-40-10-70 8-84 40 34 10 66-4 84-40z" fill="#5E7F55"/><path d="M214 330c-28 4-56 18-84 40" stroke="#3E5C3A" stroke-width="1.5"/>
    <path d="M232 120c30-26 64-26 86-6-26 26-60 26-86 6z" fill="#5E7F55"/>
    <path d="M190 620c-46-4-74 22-80 58 38 2 68-20 80-58z" fill="#5E7F55"/>
    <g fill="#B48A3F"><circle cx="246" cy="460" r="11"/><circle cx="268" cy="460" r="11"/><circle cx="224" cy="460" r="11"/><circle cx="235" cy="479" r="11"/><circle cx="257" cy="479" r="11"/><circle cx="246" cy="498" r="11"/><circle cx="246" cy="516" r="10"/></g>
    <path d="M246 449c0-14 6-22 14-26" stroke="#8DAE7E" stroke-width="2.5"/>
    <path d="M170 820c-30-30-24-60 4-78" stroke="#8DAE7E" stroke-width="2" /><path d="M222 220c26 6 40 26 36 50" stroke="#8DAE7E" stroke-width="2"/>
  </svg>`;
  VB.arteCacho = `<svg class="cacho" viewBox="0 0 120 150" fill="#F5EEE4" aria-hidden="true"><path d="M60 22c0-12 6-18 16-20" stroke="#F5EEE4" stroke-width="4" fill="none"/>
    <circle cx="40" cy="40" r="13"/><circle cx="66" cy="40" r="13"/><circle cx="92" cy="40" r="13"/><circle cx="53" cy="62" r="13"/><circle cx="79" cy="62" r="13"/><circle cx="27" cy="62" r="13"/><circle cx="40" cy="84" r="13"/><circle cx="66" cy="84" r="13"/><circle cx="53" cy="106" r="13"/><circle cx="53" cy="128" r="12"/></svg>`;

  // ── Login
  VB.telaLogin = function () {
    document.title = 'Entrar · VideiraBook';
    document.getElementById('app').innerHTML = `
      <main class="login">
        <section class="login-arte">
          ${VB.arteRamo}
          <div class="login-marca"><img src="/img/logo.svg" alt="">VideiraBook</div>
          <div class="login-versiculo">
            <p>Eu sou a videira, vós, as varas.</p>
            <cite>João 15.5</cite>
          </div>
        </section>
        <section class="login-form">
          <form id="form-login" autocomplete="on">
            <h1>Entrar</h1>
            <p class="muted">Use o usuário e a senha que o professor entregou a você.</p>
            <label class="campo"><span>Usuário</span><input class="input" name="usuario" autocomplete="username" autocapitalize="none" required></label>
            <label class="campo"><span>Senha</span><input class="input" type="password" name="senha" autocomplete="current-password" required></label>
            <button class="btn" type="submit">Entrar</button>
            <p class="erro-msg" id="erro-login"></p>
          </form>
        </section>
      </main>`;
    VB.$('#form-login').addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(e.target), b = e.target.querySelector('button');
      b.disabled = true; VB.$('#erro-login').textContent = '';
      try {
        await VB.api('/api/login', { method: 'POST', body: { usuario: f.get('usuario'), senha: f.get('senha') } });
        await VB.carregarMe(); await VB.carregarBiblioteca();
        location.hash = VB.me.papel === 'professor' ? '#/p/painel' : '#/inicio';
        VB.rota();
      } catch (er) { VB.$('#erro-login').textContent = er.message; b.disabled = false; }
    });
  };
  VB.sair = async function () { try { await VB.api('/api/logout', { method: 'POST' }); } catch {} VB.me = null; location.hash = ''; VB.telaLogin(); };

  VB.carregarMe = async function () {
    const d = await VB.api('/api/me');
    VB.me = d.usuario; VB.config = d.config;
  };

  // ── Preferências de leitura (ficam salvas só neste aparelho)
  const ESCALAS = [0.9, 1, 1.12, 1.25, 1.4, 1.6];
  VB.pref = {
    get(k, def) { try { const v = localStorage.getItem('vb_' + k); return v === null ? def : v; } catch { return def; } },
    set(k, v) { try { localStorage.setItem('vb_' + k, String(v)); } catch { /* navegador sem armazenamento */ } },
  };
  const idxEscala = () => Math.max(0, Math.min(ESCALAS.length - 1, Number(VB.pref.get('escala', 1)) || 0));
  VB.aplicarPrefs = function () {
    const r = document.documentElement;
    const noite = VB.pref.get('tema', 'dia') === 'noite';
    r.dataset.tema = noite ? 'noite' : 'dia';
    r.style.setProperty('--escala-leitura', ESCALAS[idxEscala()]);
    const m = document.querySelector('meta[name=theme-color]');
    if (m) m.content = noite ? '#141B16' : '#1E3B2C';
  };
  VB.painelLeitura = function () {
    const rotulo = () => `${Math.round(ESCALAS[idxEscala()] * 100)}%`;
    VB.modal({
      titulo: 'Ajustes de leitura',
      corpo: `<div class="ajuste">
        <div class="ajuste-linha"><div><strong>Tamanho das letras</strong><small>Vale para os textos das aulas</small></div>
          <div class="ajuste-tamanho"><button type="button" class="btn sec mini" data-esc="-1" aria-label="Diminuir as letras">A−</button>
          <b id="esc-rot" aria-live="polite">${rotulo()}</b>
          <button type="button" class="btn sec mini" data-esc="1" aria-label="Aumentar as letras">A+</button></div></div>
        <p class="leitura ajuste-amostra">“Lâmpada para os meus pés é tua palavra, e luz para o meu caminho” (Sl 119.105).</p>
        <label class="ajuste-linha"><div><strong>Leitura noturna</strong><small>Fundo escuro, mais confortável à noite</small></div>
          <span class="chave"><input type="checkbox" id="tema-noite" ${VB.pref.get('tema', 'dia') === 'noite' ? 'checked' : ''}></span></label>
      </div>`,
      rodape: '<button class="btn" data-fechar>Pronto</button>',
      aoAbrir(el) {
        el.querySelectorAll('[data-esc]').forEach(b => b.addEventListener('click', () => {
          VB.pref.set('escala', Math.max(0, Math.min(ESCALAS.length - 1, idxEscala() + Number(b.dataset.esc))));
          VB.aplicarPrefs(); el.querySelector('#esc-rot').textContent = rotulo();
        }));
        el.querySelector('#tema-noite').addEventListener('change', e => { VB.pref.set('tema', e.target.checked ? 'noite' : 'dia'); VB.aplicarPrefs(); });
      },
    });
  };

  // ── Bíblia: livros, versões e links (o texto abre no site Bíblia Online)
  // [código, sigla, nome, fica dentro do app?] — a lista real vem do servidor (módulos instalados pelo professor)
  VB.VERSOES = [['ara', 'ARA', 'Almeida Revista e Atualizada', true], ['acf', 'ACF', 'Almeida Corrigida Fiel', true],
    ['nvi', 'NVI', 'Nova Versão Internacional', true], ['nvt', 'NVT', 'Nova Versão Transformadora', true],
    ['kjf', 'KJF', 'King James Fiel 1611', true], ['alm', 'Almeida', 'Almeida 1819', true]];
  VB.DICIONARIOS = []; VB.COMENTARIOS = []; VB.bibliaPadrao = 'ara';
  VB.normalizar = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  VB.carregarBiblioteca = async function () {
    try {
      const b = await VB.api('/api/biblioteca');
      if (b.biblias.length) VB.VERSOES = b.biblias.map(x => [x.cod, x.sigla, x.titulo, true]);
      if (!VB.VERSOES.some(v => /^arc$/i.test(v[1]))) VB.VERSOES.push(['arc', 'ARC', 'Almeida Revista e Corrigida · abre no site', false]);
      VB.DICIONARIOS = b.dicionarios; VB.COMENTARIOS = b.comentarios || []; VB.bibliaPadrao = b.padrao;
    } catch { /* fica com a lista padrão */ }
  };
  VB.versaoInterna = c => !!(VB.VERSOES.find(v => v[0] === c) || [])[3];
  // [nome, abreviação, código no site, capítulos, outros nomes]
  VB.LIVROS = [
    ['Gênesis', 'Gn', 'gn', 50], ['Êxodo', 'Êx', 'ex', 40, ['Ex']], ['Levítico', 'Lv', 'lv', 27], ['Números', 'Nm', 'nm', 36],
    ['Deuteronômio', 'Dt', 'dt', 34], ['Josué', 'Js', 'js', 24], ['Juízes', 'Jz', 'jz', 21], ['Rute', 'Rt', 'rt', 4],
    ['1 Samuel', '1 Sm', '1sm', 31], ['2 Samuel', '2 Sm', '2sm', 24], ['1 Reis', '1 Rs', '1rs', 22], ['2 Reis', '2 Rs', '2rs', 25],
    ['1 Crônicas', '1 Cr', '1cr', 29], ['2 Crônicas', '2 Cr', '2cr', 36], ['Esdras', 'Ed', 'ed', 10], ['Neemias', 'Ne', 'ne', 13],
    ['Ester', 'Et', 'et', 10], ['Jó', 'Jó', 'jó', 42], ['Salmos', 'Sl', 'sl', 150, ['Salmo']], ['Provérbios', 'Pv', 'pv', 31],
    ['Eclesiastes', 'Ec', 'ec', 12], ['Cânticos', 'Ct', 'ct', 8, ['Cantares']], ['Isaías', 'Is', 'is', 66], ['Jeremias', 'Jr', 'jr', 52],
    ['Lamentações', 'Lm', 'lm', 5], ['Ezequiel', 'Ez', 'ez', 48], ['Daniel', 'Dn', 'dn', 12], ['Oseias', 'Os', 'os', 14, ['Oséias']],
    ['Joel', 'Jl', 'jl', 3], ['Amós', 'Am', 'am', 9], ['Obadias', 'Ob', 'ob', 1], ['Jonas', 'Jn', 'jn', 4],
    ['Miqueias', 'Mq', 'mq', 7, ['Miquéias']], ['Naum', 'Na', 'na', 3], ['Habacuque', 'Hc', 'hc', 3], ['Sofonias', 'Sf', 'sf', 3],
    ['Ageu', 'Ag', 'ag', 2], ['Zacarias', 'Zc', 'zc', 14], ['Malaquias', 'Ml', 'ml', 4],
    ['Mateus', 'Mt', 'mt', 28], ['Marcos', 'Mc', 'mc', 16], ['Lucas', 'Lc', 'lc', 24], ['João', 'Jo', 'jo', 21],
    ['Atos', 'At', 'atos', 28], ['Romanos', 'Rm', 'rm', 16], ['1 Coríntios', '1 Co', '1co', 16], ['2 Coríntios', '2 Co', '2co', 13],
    ['Gálatas', 'Gl', 'gl', 6], ['Efésios', 'Ef', 'ef', 6], ['Filipenses', 'Fp', 'fp', 4], ['Colossenses', 'Cl', 'cl', 4],
    ['1 Tessalonicenses', '1 Ts', '1ts', 5], ['2 Tessalonicenses', '2 Ts', '2ts', 3], ['1 Timóteo', '1 Tm', '1tm', 6],
    ['2 Timóteo', '2 Tm', '2tm', 4], ['Tito', 'Tt', 'tt', 3], ['Filemom', 'Fm', 'fm', 1], ['Hebreus', 'Hb', 'hb', 13],
    ['Tiago', 'Tg', 'tg', 5], ['1 Pedro', '1 Pe', '1pe', 5], ['2 Pedro', '2 Pe', '2pe', 3], ['1 João', '1 Jo', '1jo', 5],
    ['2 João', '2 Jo', '2jo', 1], ['3 João', '3 Jo', '3jo', 1], ['Judas', 'Jd', 'jd', 1], ['Apocalipse', 'Ap', 'ap', 22],
  ];
  VB.versaoBiblia = () => { const v = VB.pref.get('versao', VB.bibliaPadrao); return VB.VERSOES.some(x => x[0] === v) ? v : (VB.VERSOES[0] || ['ara'])[0]; };
  // Texto de um capítulo como parágrafos (títulos de seção, versículo destacado, versão comparada)
  VB.htmlVersos = (d, { ini = 0, fim = 0, destaque = 0, comp = null, acoes = false } = {}) => {
    const fimPar = new Set(d.fim || []), recuo = d.recuo || {};
    const epi = d.epigrafe && (!ini || ini === 1) ? `<p class="epigrafe">${esc(d.epigrafe)}</p>` : '';
    return epi + d.versos.map((t, i) => {
      const n = i + 1; if (ini && (n < ini || n > fim)) return '';
      const tit = d.titulos && d.titulos[n] && !ini ? `<h4 class="titulo-secao">${esc(d.titulos[n])}</h4>` : '';
      const c = comp && comp.versos[i] ? `<p class="comparado"><b>${esc(comp.sigla)}</b>${comp.versos[i]}</p>` : '';
      const cls = [destaque === n ? 'destaque' : '', fimPar.has(n) ? 'fim-par' : '', recuo[n] ? `recuo-${Math.min(4, recuo[n])}` : ''].filter(Boolean).join(' ');
      const ac = acoes ? `<button type="button" class="acao-verso" data-acao-v="${n}" aria-label="Opções do versículo ${n}" aria-haspopup="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg></button>` : '';
      return `${tit}<p id="v${n}"${cls ? ` class="${cls}"` : ''}><sup>${n}</sup>${t}${ac}</p>${c}`;
    }).join('');
  };
  // ── Markdown simples e leitura da resposta da IA aos pedaços (usados em vários lugares)
  VB.md = function md(texto) {
    const linhas = String(texto || '').replace(/\r/g, '').split('\n');
    const inl = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>').replace(/_([^_\n]+)_/g, '<em>$1</em>');
    let html = '', lista = null, par = [];
    const fechaPar = () => { if (par.length) { html += `<p>${par.map(inl).join('<br>')}</p>`; par = []; } };
    const fechaLista = () => { if (lista) { html += `</${lista}>`; lista = null; } };
    for (const bruto of linhas) {
      const l = bruto.trimEnd(); let m;
      if (!l.trim()) { fechaPar(); fechaLista(); continue; }
      if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { fechaPar(); fechaLista(); const n = Math.min(4, m[1].length + 0); html += `<h${n}>${inl(m[2])}</h${n}>`; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { fechaPar(); fechaLista(); html += '<hr>'; continue; }
      if ((m = l.match(/^\s*>\s?(.*)$/))) { fechaPar(); fechaLista(); html += `<blockquote>${inl(m[1])}</blockquote>`; continue; }
      if ((m = l.match(/^\s*([IVXLC]+)\.\s+(.*)$/))) { fechaPar(); fechaLista(); html += `<p class="ponto"><span class="romano">${m[1]}.</span> ${inl(m[2])}</p>`; continue; }
      if ((m = l.match(/^(\s*)[-*•]\s+(.*)$/))) { fechaPar(); if (lista !== 'ul') { fechaLista(); html += '<ul>'; lista = 'ul'; } html += `<li${m[1].length >= 2 ? ' class="sub"' : ''}>${inl(m[2])}</li>`; continue; }
      if ((m = l.match(/^\s*(\d+)[.)]\s+(.*)$/))) { fechaPar(); if (lista !== 'ol') { fechaLista(); html += '<ol>'; lista = 'ol'; } html += `<li>${inl(m[2])}</li>`; continue; }
      fechaLista(); par.push(l.trim());
    }
    fechaPar(); fechaLista();
    return html;
  };
  VB.fluxo = async function fluxo(url, corpo, aoChegar) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(corpo || {}) });
    if (!r.ok) { let m = 'Não foi possível falar com a IA agora.'; try { m = (await r.json()).erro || m; } catch {} throw new Error(m); }
    const leitor = r.body.getReader(); const dec = new TextDecoder(); let texto = '';
    for (;;) {
      const { done, value } = await leitor.read(); if (done) break;
      texto += dec.decode(value, { stream: true });
      const i = texto.indexOf('\u0000ERRO:');
      if (i >= 0) { aoChegar(texto.slice(0, i)); throw new Error(texto.slice(i + 6)); }
      aoChegar(texto);
    }
    return texto;
  };

  // ── Menu de cada versículo: contexto, comentários, concordância, gerar mensagem, copiar
  const PARADAS_V = new Set('para pelo pela pelos pelas como mais mas que quem qual quais quando onde entre sobre este esta estes estas esse essa esses essas aquele aquela isto isso seu sua seus suas meu minha meus minhas teu tua nosso nossa vosso vossa lhe lhes eles elas ele ela todo toda todos todas pois porque porém então assim também ainda não nem seja será foram eram estava está estão tinha havia disse diz fazer feito sendo tendo tem hoje agora depois antes sempre aqui eis tão tanto grande vós nós'.split(' '));
  const refVerso = (l, cap, v) => `${VB.LIVROS[l][1]} ${cap}.${v}`;
  function fecharMenuVerso() { const m = document.querySelector('.menu-verso'); if (m) { m.remove(); document.querySelector('.acao-verso[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false'); } }
  VB.menuVerso = function (btn) {
    fecharMenuVerso();
    const caixa = btn.closest('[data-ctx-livro]'); if (!caixa) return;
    const l = Number(caixa.dataset.ctxLivro), cap = Number(caixa.dataset.ctxCap), versao = caixa.dataset.ctxVersao, v = Number(btn.dataset.acaoV);
    const p = btn.closest('p'); const texto = p ? [...p.childNodes].filter(n => !(n.nodeType === 1 && (n.tagName === 'SUP' || n.matches('button, .nota-texto')))).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim() : '';
    const itens = [
      ['contexto', 'Contexto', '<path d="M4 6h16M4 12h10M4 18h16"/>'],
      ['comentarios', `Ver comentários${btn.classList.contains('tem-com') ? '' : ''}`, '<path d="M4 5h16v11H8l-4 4z"/>'],
      ['concordancia', 'Concordância', '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'],
      ['original', l < 39 ? 'Hebraico' : 'Grego', '<path d="M5 19V5h9a4 4 0 010 8H5"/><path d="M13 13l6 6"/>'],
      ...(VB.me && VB.me.ia ? [['sermao', 'Gerar mensagem', '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>']] : []),
      ['copiar', 'Copiar versículo', '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>'],
    ];
    const menu = document.createElement('div'); menu.className = 'menu-verso'; menu.setAttribute('role', 'menu');
    menu.innerHTML = `<div class="menu-verso-cab">${esc(VB.LIVROS[l][0])} ${cap}.${v}</div>` + itens.map(i => `<button type="button" role="menuitem" data-op="${i[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${i[2]}</svg>${i[1]}</button>`).join('');
    document.body.append(menu);
    const r = btn.getBoundingClientRect(); const w = menu.offsetWidth, hh = menu.offsetHeight;
    let x = r.right - w + 6, y = r.bottom + 6;
    if (x < 10) x = 10; if (x + w > innerWidth - 10) x = innerWidth - w - 10;
    if (y + hh > innerHeight - 10) y = Math.max(10, r.top - hh - 6);
    menu.style.left = `${x + scrollX}px`; menu.style.top = `${y + scrollY}px`;
    btn.setAttribute('aria-expanded', 'true');
    menu.querySelector('button').focus();
    menu.addEventListener('click', async e => {
      const b = e.target.closest('[data-op]'); if (!b) return; fecharMenuVerso();
      const op = b.dataset.op;
      if (op === 'contexto') return VB.contextoVerso(l, cap, v, versao);
      if (op === 'comentarios') return VB.comentariosVerso(l, cap, v);
      if (op === 'concordancia') return VB.concordanciaVerso(l, cap, v, versao, texto);
      if (op === 'original') return VB.originalVerso(l, cap, v, versao);
      if (op === 'sermao') { location.hash = `#/sermoes/novo?ref=${encodeURIComponent(refVerso(l, cap, v))}`; return; }
      if (op === 'copiar') {
        const sigla = (VB.VERSOES.find(x => x[0] === versao) || [, ''])[1];
        try { await navigator.clipboard.writeText(`“${texto}” (${VB.LIVROS[l][0]} ${cap}.${v}${sigla ? ` ${sigla}` : ''})`); VB.toast('Versículo copiado'); } catch { VB.toast('Não foi possível copiar neste aparelho', true); }
      }
    });
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('.acao-verso[data-acao-v]');
    if (b) { e.preventDefault(); e.stopPropagation(); if (b.getAttribute('aria-expanded') === 'true') fecharMenuVerso(); else VB.menuVerso(b); return; }
    if (!e.target.closest('.menu-verso')) fecharMenuVerso();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenuVerso(); });
  addEventListener('hashchange', () => { fecharMenuVerso(); const r = document.getElementById('modal-raiz'); if (r && r.firstElementChild) r.innerHTML = ''; });   // trocou de tela: fecha janelas abertas

  // Parte da IA dentro de uma janela (contexto, concordância, estudo das palavras): usa o que já foi gerado, se houver
  VB.blocoIA = function (caixa, tipo, l, cap, v, versao) {
    caixa.innerHTML = `<div class="ia-bloco"><div class="ia-cab"><span class="ia-selo">${VB.icone.faisca}IA</span><span class="pequeno muted" data-ia-status>Preparando…</span>
      ${VB.me.papel === 'professor' ? '<button type="button" class="btn sec mini" data-ia-refazer hidden>Gerar de novo</button>' : ''}</div><div class="leitura ia-texto" data-ia-texto></div></div>`;
    const alvo = caixa.querySelector('[data-ia-texto]'), status = caixa.querySelector('[data-ia-status]'), refazer = caixa.querySelector('[data-ia-refazer]');
    let t = 0;
    const rodar = async (refaz) => {
      status.textContent = 'A IA está escrevendo…'; alvo.innerHTML = '<span class="cursor-ia"></span>'; if (refazer) refazer.hidden = true;
      try {
        const txt = await VB.fluxo('/api/ia/verso', { tipo, livro: l, cap, verso: v, versao, refazer: !!refaz }, parcial => {
          const n = Date.now(); if (n - t < 90) return; t = n; alvo.innerHTML = VB.md(parcial) + '<span class="cursor-ia"></span>'; VB.linkarReferencias(alvo);
        });
        alvo.innerHTML = VB.md(txt); VB.linkarReferencias(alvo);
        status.textContent = 'Gerado por IA a partir do texto bíblico, do original e dos módulos instalados. Confira as referências.';
        if (refazer) refazer.hidden = false;
      } catch (e) { alvo.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; status.textContent = ''; }
    };
    if (refazer) refazer.addEventListener('click', () => rodar(true));
    rodar(false);
  };

  // Quando a IA não está disponível, explica o motivo em vez de sumir
  VB.avisoIA = function (caixa, oQue) {
    if (!caixa || (VB.me && VB.me.ia)) return;
    const prof = VB.me && VB.me.papel === 'professor'; const mot = VB.me && VB.me.ia_motivo;
    const msg = prof
      ? mot === 'sem_chave' ? `Para gerar ${oQue} com IA, salve a chave da OpenAI em <a href="#/p/ia">Sermões com IA</a>.`
        : mot === 'desligada' ? `A IA está desligada. Ligue em <a href="#/p/ia">Sermões com IA</a> (opção “Ferramenta de sermões ligada”) para gerar ${oQue}.`
          : `A IA não está disponível agora. Confira a configuração em <a href="#/p/ia">Sermões com IA</a>.`
      : mot === 'nao_liberado' ? `${oQue[0].toUpperCase() + oQue.slice(1)} com IA é liberado pelo professor. Peça a ele para liberar o seu acesso.`
        : `${oQue[0].toUpperCase() + oQue.slice(1)} com IA ainda não foi ativado pelo professor.`;
    caixa.innerHTML = `<div class="ia-bloco ia-off"><div class="ia-cab"><span class="ia-selo">${VB.icone.faisca}IA</span></div><p class="pequeno" style="margin:0">${msg}</p></div>`;
    caixa.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { const r = document.getElementById('modal-raiz'); if (r) r.innerHTML = ''; }));
  };
  // Contexto: explicação da IA (quem tem acesso) + versículos ao redor + verbete do livro
  VB.contextoVerso = async function (l, cap, v, versao) {
    const livro = VB.LIVROS[l];
    const m = VB.modal({ titulo: `Contexto de ${esc(livro[0])} ${cap}.${v}`, largo: true, corpo: '<div id="ctx-ia"></div><div id="ctx-texto"><div class="carregando" style="min-height:140px"></div></div><div id="ctx-livro"></div>',
      rodape: `<a class="btn sec" href="${VB.rotaBiblia(livro, cap, v)}" data-fechar>Ler o capítulo</a><button class="btn" data-fechar>Fechar</button>` });
    const corpo = m.el.querySelector('.modal-corpo');
    if (VB.me && VB.me.ia) VB.blocoIA(corpo.querySelector('#ctx-ia'), 'contexto', l, cap, v, versao); else VB.avisoIA(corpo.querySelector('#ctx-ia'), 'o contexto');
    try {
      const d = await VB.api(`/api/biblia/${l}/${cap}?v=${versao}`);
      const ini = Math.max(1, v - 4), fim = Math.min(d.versos.length, v + 4);
      let titulo = ''; for (let n = v; n >= 1; n--) if (d.titulos && d.titulos[n]) { titulo = d.titulos[n]; break; }
      const caixaTexto = corpo.querySelector('#ctx-texto');
      caixaTexto.innerHTML = `<h3 class="ctx-sub">Os versículos ao redor</h3><p class="pequeno muted" style="margin:0 0 .4rem">${titulo ? `Seção: <b>${esc(titulo)}</b> · ` : ''}${esc(livro[0])} ${cap}.${ini}-${fim} (${esc(d.sigla)})</p>
        <div class="leitura biblia-texto popup-versos" style="max-height:none">${VB.htmlVersos(d, { ini, fim, destaque: v })}</div>`;
      const dic = VB.DICIONARIOS[0];
      if (dic) {
        const nome = livro[0].replace(/^[123]\s+/, '');
        const lista = await VB.api(`/api/dicionario/${encodeURIComponent(dic.cod)}?q=${encodeURIComponent(nome)}`);
        const quer = l >= 39 && l <= 42 ? /evangelho/i : l >= 44 && l <= 64 ? /ep[ií]stola|carta/i : /livro/i;
        const alvo = lista.filter(w => VB.normalizar(w).startsWith(VB.normalizar(nome))).sort((a, b) => (quer.test(b) - quer.test(a)) || a.length - b.length)[0];
        if (alvo) {
          const vb = await VB.api(`/api/dicionario/${encodeURIComponent(dic.cod)}/verbete?p=${encodeURIComponent(alvo)}`);
          const box = corpo.querySelector('#ctx-livro');
          const tmp = document.createElement('div'); tmp.innerHTML = vb.html;
          const pars = [...tmp.querySelectorAll('p')].filter(p => p.textContent.trim().length > 40).slice(0, 3);
          box.innerHTML = `<h3 class="ctx-sub">Sobre o livro · ${esc(vb.palavra)}</h3><div class="leitura verbete" data-dic="${esc(dic.cod)}">${(pars.length ? pars.map(p => p.outerHTML).join('') : vb.html)}</div>
            <p class="pequeno"><a href="#/dicionario/${encodeURIComponent(dic.cod)}/${encodeURIComponent(vb.palavra)}" class="ver-verbete">Ler o verbete completo no ${esc(dic.sigla)}</a></p>`;
          VB.prepararVerbete(box);
          box.querySelector('.ver-verbete').addEventListener('click', () => m.fechar());
        }
      }
    } catch (e) { corpo.querySelector('#ctx-texto').innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
  };
  // Comentários importados sobre o versículo (ou sobre o capítulo)
  VB.comentariosVerso = async function (l, cap, v) {
    const livro = VB.LIVROS[l];
    const m = VB.modal({ titulo: `Comentários · ${esc(livro[0])} ${cap}${v ? `.${v}` : ''}`, largo: true, corpo: '<div class="carregando" style="min-height:140px"></div>',
      rodape: `${v ? '<button class="btn sec" id="com-cap">Comentários do capítulo inteiro</button>' : ''}<button class="btn" data-fechar>Fechar</button>` });
    const corpo = m.el.querySelector('.modal-corpo');
    const capBtn = m.el.querySelector('#com-cap'); if (capBtn) capBtn.addEventListener('click', () => VB.comentariosVerso(l, cap, 0));
    if (!VB.COMENTARIOS.length) { corpo.innerHTML = `<div class="vazio" style="border:0"><strong>Nenhum comentário instalado</strong>${VB.me && VB.me.papel === 'professor' ? 'Importe comentários do MySword (.cmt.mybible) em <a href="#/p/modulos" data-fechar>Módulos bíblicos</a>.' : 'O professor pode importar comentários bíblicos no painel.'}</div>`; return; }
    try {
      const lista = await VB.api(`/api/comentarios/${l}/${cap}/${v}`);
      if (!lista.length) { corpo.innerHTML = `<div class="vazio" style="border:0"><strong>Nenhum comentário sobre ${v ? 'este versículo' : 'este capítulo'}</strong>Os comentários instalados (${VB.COMENTARIOS.map(c => esc(c.sigla)).join(', ')}) não tratam deste trecho.</div>`; return; }
      corpo.innerHTML = `<p class="pequeno muted" style="margin:0 0 .8rem">${lista.length} comentário${lista.length === 1 ? '' : 's'} sobre este trecho</p>` + lista.map((c, i) => `<details class="bloco-com"${i === 0 ? ' open' : ''}>
        <summary><b>${esc(c.titulo)}</b>${c.creditos ? ` <span class="muted pequeno">${esc(c.creditos)}</span>` : ''}</summary>
        ${c.trechos.map(t => `<div class="trecho-com"><p class="ref-com">${esc(livro[1])} ${esc(t.ref)}</p><div class="leitura verbete">${t.html}</div></div>`).join('')}</details>`).join('');
      VB.prepararVerbete(corpo);
    } catch (e) { corpo.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
  };
  // Concordância: IA escolhe versículos relacionados entre os que têm as mesmas palavras no original
  VB.concordanciaVerso = async function (l, cap, v, versao, texto) {
    const palavras = [...new Set((texto.match(/[\p{L}-]{4,}/gu) || []).filter(w => !PARADAS_V.has(VB.normalizar(w))).map(w => w.toLowerCase()))].slice(0, 14);
    const m = VB.modal({ titulo: `Concordância · ${esc(VB.LIVROS[l][0])} ${cap}.${v}`, largo: !!(VB.me && VB.me.ia), corpo: `<div id="conc-ia"></div>
      <h3 class="ctx-sub">Palavras do versículo</h3>
      <p class="muted pequeno" style="margin-top:0">Toque numa palavra para ver todos os versículos em que ela aparece, ou escreva uma expressão.</p>
      <div class="chips-palavras">${palavras.map(w => `<a href="#/concordancia/${versao}/${encodeURIComponent(w)}" data-fechar>${esc(w)}</a>`).join('')}</div>
      <form id="f-conc-v" style="display:flex;gap:8px;margin-top:14px"><input class="input" name="q" minlength="3" required placeholder="Ex.: fruto do Espírito" aria-label="Palavra ou expressão"><button class="btn" type="submit">Procurar</button></form>
      <div id="conc-orig"></div>`,
      rodape: '<button class="btn sec" data-fechar>Fechar</button>' });
    m.el.querySelector('#f-conc-v').addEventListener('submit', e => { e.preventDefault(); const q = e.target.q.value.trim(); if (q.length < 3) return; m.fechar(); location.hash = `#/concordancia/${versao}/${encodeURIComponent(q)}`; });
    if (VB.me && VB.me.ia) VB.blocoIA(m.el.querySelector('#conc-ia'), 'concordancia', l, cap, v, versao); else VB.avisoIA(m.el.querySelector('#conc-ia'), 'a concordância');
    try {
      const o = await VB.api(`/api/original/${l}/${cap}/${v}`);
      const vistos = new Set();
      const chaves = o.palavras.filter(w => w.s && w.ocorr > 1 && w.ocorr < 3000 && !/^(T|C|R|S)|^(CONJ|PREP|PRT)|^[TPRCDKIXQFS]-/.test(w.m) && !vistos.has(w.s) && vistos.add(w.s));
      if (chaves.length) {
        const box = m.el.querySelector('#conc-orig');
        box.innerHTML = `<h3 class="ctx-sub">No ${o.lingua} (concordância exata)</h3><p class="muted pequeno" style="margin-top:0">Mostra todos os versículos com a mesma palavra no texto original, mesmo quando a tradução usa palavras diferentes.</p>
          <div class="chips-palavras orig">${chaves.map(w => `<button type="button" data-strong="${w.s}" data-lema="${esc(w.lema || w.o)}"><span class="o ${o.lingua}">${esc(w.lema || w.o)}</span> ${esc(w.pt || w.sentido)} <small>${w.ocorr}×</small></button>`).join('')}</div>`;
        box.querySelectorAll('[data-strong]').forEach(b => b.addEventListener('click', () => VB.ocorrenciasStrong(b.dataset.strong, b.dataset.lema, versao)));
      }
    } catch { /* sem texto original */ }
  };
  // Todas as ocorrências de uma palavra do original (por número de Strong)
  VB.ocorrenciasStrong = async function (strong, lema, versao) {
    const m = VB.modal({ titulo: `${esc(lema)} <small class="muted pequeno">${esc(strong)}</small>`, largo: true, corpo: '<div class="carregando" style="min-height:140px"></div>', rodape: '<button class="btn" data-fechar>Fechar</button>' });
    const corpo = m.el.querySelector('.modal-corpo');
    try {
      const [r, lx] = await Promise.all([VB.api(`/api/original/ocorrencias/${strong}?v=${versao || VB.bibliaPadrao}`), VB.api(`/api/original/lexico/${strong}`).catch(() => null)]);
      corpo.innerHTML = `${lx ? `<div class="lex-caixa"><p><span class="o ${strong[0] === 'H' ? 'hebraico' : 'grego'}" style="font-size:1.6rem">${esc(lx.lema)}</span> <i>${esc((lx.translit || '').replace(/\./g, ''))}</i> — ${esc(lx.gloss)}</p>
        <details><summary class="pequeno">Definição do léxico (em inglês)</summary><p class="pequeno lex-def">${esc(lx.def || '').replace(/\n/g, '<br>')}</p></details></div>` : ''}
        <p class="pequeno muted">${r.total} ocorrência${r.total === 1 ? '' : 's'} no ${strong[0] === 'H' ? 'Antigo' : 'Novo'} Testamento${r.total > r.lista.length ? ` (mostrando ${r.lista.length})` : ''} · texto em português: ${esc(r.sigla)}</p>
        ${r.lista.map(x => `<p class="conc-item"><a class="ref-biblia" data-livro="${x.l}" data-cap="${x.c}" data-ini="${x.v}" data-fim="${x.v}" href="${VB.rotaBiblia(VB.LIVROS[x.l], x.c, x.v)}">${esc(VB.LIVROS[x.l][1])} ${x.c}.${x.v}</a> ${esc(x.t)}</p>`).join('')}`;
      VB.linkarReferencias(corpo.querySelector('.lex-caixa') || corpo);
    } catch (e) { corpo.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
  };
  // Hebraico / grego palavra por palavra
  VB.originalVerso = async function (l, cap, v, versao) {
    const livro = VB.LIVROS[l];
    const m = VB.modal({ titulo: `${l < 39 ? 'Hebraico' : 'Grego'} · ${esc(livro[0])} ${cap}.${v}`, largo: true, corpo: '<div class="carregando" style="min-height:160px"></div>',
      rodape: `${VB.me && VB.me.ia ? `<button class="btn sec" id="orig-ia">${VB.icone.faisca}Estudo das palavras com IA</button>` : ''}<button class="btn" data-fechar>Fechar</button>` });
    const corpo = m.el.querySelector('.modal-corpo');
    try {
      const o = await VB.api(`/api/original/${l}/${cap}/${v}`);
      let texto = VB.pref.get('texto_grego', 'NA');
      const desenhar = () => {
        const pal = o.lingua === 'grego' ? o.palavras.filter(w => texto === 'TR' ? w.ed.includes('T') : w.ed.includes('N')) : o.palavras;
        corpo.innerHTML = `${o.lingua === 'grego' ? `<div class="abas-texto" role="radiogroup" aria-label="Texto grego">
            <button type="button" role="radio" data-t="NA" aria-checked="${texto === 'NA'}">Nestle-Aland 28 (texto crítico)</button><button type="button" role="radio" data-t="TR" aria-checked="${texto === 'TR'}">Texto Recebido (base da ACF e KJF)</button></div>` : ''}
          <p class="linha-original ${o.lingua}" dir="${o.lingua === 'hebraico' ? 'rtl' : 'ltr'}" lang="${o.lingua === 'hebraico' ? 'he' : 'grc'}">${pal.map(w => esc(w.o)).join(' ')}</p>
          <div class="palavras-orig" dir="${o.lingua === 'hebraico' ? 'rtl' : 'ltr'}">${pal.map((w, i) => `<button type="button" class="palavra-orig" data-i="${i}" dir="ltr">
            <span class="o ${o.lingua}" lang="${o.lingua === 'hebraico' ? 'he' : 'grc'}">${esc(w.o)}</span><span class="tr">${esc(w.t)}</span>
            <span class="pt">${esc(w.pt || '—')}</span><span class="st">${esc(w.s)}${w.ocorr ? ` · ${w.ocorr}×` : ''}</span></button>`).join('')}</div>
          <div id="orig-detalhe" class="orig-detalhe" hidden></div>
          <div id="orig-ia-caixa"></div>
          <p class="pequeno muted" style="margin-top:1rem">Toque numa palavra para ver o léxico e as outras ocorrências. Português alinhado pela ${esc(o.siglaPt || 'Bíblia com Strong')}. ${esc(o.creditos)}</p>`;
        corpo.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { texto = b.dataset.t; VB.pref.set('texto_grego', texto); desenhar(); }));
        corpo.querySelectorAll('.palavra-orig').forEach(b => b.addEventListener('click', async () => {
          corpo.querySelectorAll('.palavra-orig').forEach(x => x.classList.toggle('ativa', x === b));
          const w = pal[Number(b.dataset.i)]; const box = corpo.querySelector('#orig-detalhe'); box.hidden = false;
          box.innerHTML = `<div class="carregando" style="min-height:60px"></div>`;
          let lx = null; try { lx = await VB.api(`/api/original/lexico/${w.s}?suf=${encodeURIComponent(w.suf || '')}`); } catch {}
          box.innerHTML = `<p style="margin:0 0 .4rem"><span class="o ${o.lingua}" style="font-size:1.7rem">${esc(w.o)}</span> <i>${esc(w.t)}</i></p>
            <dl class="orig-dados"><dt>Forma de dicionário</dt><dd><span class="o ${o.lingua}">${esc(w.lema || (lx && lx.lema) || '')}</span> ${esc(w.lemaT || '')}</dd>
            <dt>Strong</dt><dd>${esc(w.s)}${w.suf ? esc(w.suf) : ''}</dd><dt>Gramática</dt><dd>${esc(w.morf || w.m)}</dd>
            <dt>Em português (${esc(o.siglaPt || '—')})</dt><dd>${esc(w.pt || '—')}</dd><dt>Sentido</dt><dd>${esc(w.sentido || w.g)} <small class="muted">(léxico em inglês)</small></dd>
            ${o.lingua === 'grego' ? `<dt>Aparece em</dt><dd>${w.ed.includes('N') ? 'Nestle-Aland 28' : ''}${w.ed === 'NT' ? ' e ' : ''}${w.ed.includes('T') ? 'Texto Recebido' : ''}</dd>` : ''}</dl>
            ${lx && lx.def ? `<details><summary class="pequeno">Definição completa do léxico (em inglês)</summary><p class="pequeno lex-def">${esc(lx.def).replace(/\n/g, '<br>')}</p></details>` : ''}
            ${w.ocorr > 1 ? `<button type="button" class="btn sec mini" id="ver-ocorr">Ver as ${w.ocorr} ocorrências na Bíblia</button>` : ''}`;
          VB.linkarReferencias(box);
          const vo = box.querySelector('#ver-ocorr'); if (vo) vo.addEventListener('click', () => VB.ocorrenciasStrong(w.s, w.lema || w.o, versao));
          box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }));
      };
      desenhar();
      const bIA = m.el.querySelector('#orig-ia');
      if (bIA) bIA.addEventListener('click', () => { bIA.disabled = true; const cx = corpo.querySelector('#orig-ia-caixa'); VB.blocoIA(cx, 'palavras', l, cap, v, versao); cx.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    } catch (e) { corpo.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; const b = m.el.querySelector('#orig-ia'); if (b) b.remove(); }
  };

  // Verbete de dicionário numa janela (usado fora da tela do dicionário)
  VB.prepararVerbete = raiz => {
    raiz.querySelectorAll('a.ref-biblia[data-livro]').forEach(a => {
      const l = VB.LIVROS[Number(a.dataset.livro)]; if (l) a.href = VB.rotaBiblia(l, Number(a.dataset.cap), Number(a.dataset.ini) || 0);
    });
    VB.linkarReferencias(raiz);
  };
  VB.popupVerbete = async function (cod, palavra) {
    const m = VB.modal({ titulo: esc(palavra), corpo: '<div class="carregando" style="min-height:120px"></div>',
      rodape: `<a class="btn sec" href="#/dicionario/${encodeURIComponent(cod)}/${encodeURIComponent(palavra)}" data-fechar>Abrir no dicionário</a><button class="btn" data-fechar>Fechar</button>` });
    const corpo = m.el.querySelector('.modal-corpo');
    try {
      const v = await VB.api(`/api/dicionario/${encodeURIComponent(cod)}/verbete?p=${encodeURIComponent(palavra)}`);
      corpo.innerHTML = `<div class="leitura verbete popup-versos" data-dic="${esc(cod)}">${v.html}</div><p class="pequeno muted" style="margin:.8rem 0 0">${esc(v.dicionario)}</p>`;
      VB.prepararVerbete(corpo);
    } catch (e) { corpo.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a.ref-verbete[data-verbete]'); if (!a) return;
    e.preventDefault();
    const cod = (a.closest('[data-dic]') || {}).dataset?.dic || (VB.DICIONARIOS[0] || {}).cod; if (!cod) return;
    if (a.closest('[data-dic-pagina]')) location.hash = `#/dicionario/${encodeURIComponent(cod)}/${encodeURIComponent(a.dataset.verbete)}`;
    else { const aberto = a.closest('.modal-fundo, .modal'); if (aberto) aberto.querySelector('[data-fechar]')?.click(); VB.popupVerbete(cod, a.dataset.verbete); }
  });
  // Nota de rodapé de um versículo
  document.addEventListener('click', e => {
    const b = e.target.closest('button.nota[data-nota]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const prox = b.nextElementSibling;
    if (prox && prox.classList.contains('nota-texto')) { prox.remove(); b.setAttribute('aria-expanded', 'false'); return; }
    const sp = document.createElement('span'); sp.className = 'nota-texto'; sp.textContent = b.dataset.nota;
    b.after(sp); b.setAttribute('aria-expanded', 'true');
  });
  VB.rotaBiblia = (livro, cap, verso) => `#/biblia/${encodeURIComponent(livro[2])}/${cap}${verso ? `/${verso}` : ''}`;
  VB.urlBiblia = (livro, cap, versao = VB.versaoBiblia()) =>
    `https://www.bibliaonline.com.br/${versao}/${encodeURIComponent(livro[2])}/${cap}`;

  // Reconhece referências como "Jo 3.16", "1 Co 15.3-8" ou "2 Pedro 1.19"
  const nomesRef = new Map();
  VB.LIVROS.forEach(l => [l[0], l[1], ...(l[4] || [])].forEach(n => nomesRef.set(n, l)));
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s?');
  const reRef = new RegExp(`(^|[^\\p{L}\\d])(${[...nomesRef.keys()].sort((a, b) => b.length - a.length).map(escRe).join('|')})\\s(\\d{1,3})(?:[.:](\\d{1,3}(?:[-–]\\d{1,3})?))?(?![\\dªº\\p{L}])`, 'gu');
  const AMBIGUAS = new Set(['Os', 'Am', 'At', 'Is', 'Na', 'Ag', 'Ed', 'Et', 'Ne', 'Ec', 'Ct', 'Ob', 'Jn', 'Ml']);
  VB.livroPorNome = nome => nomesRef.get(nome) || nomesRef.get(nome.replace(/^([123])(?=\S)/, '$1 '));
  VB.linkarReferencias = function (raiz) {
    if (!raiz) return;
    const andar = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest('a, button, label, textarea, [contenteditable], .quiz-q') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nos = []; while (andar.nextNode()) nos.push(andar.currentNode);
        nos.forEach(no => {
      const t = no.nodeValue; reRef.lastIndex = 0;
      if (!reRef.test(t)) return;
      reRef.lastIndex = 0;
      const frag = document.createDocumentFragment(); let ult = 0, m;
      while ((m = reRef.exec(t))) {
        const livro = VB.livroPorNome(m[2]);
        const ini = m.index + m[1].length;
        if (!livro || (AMBIGUAS.has(m[2]) && !m[4])) continue;   // "Os 12 apóstolos" não é referência
        const cap = livro[3] === 1 ? 1 : Number(m[3]);          // Judas 6 = capítulo único, versículo 6
        if (cap < 1 || cap > livro[3]) continue;
        frag.append(t.slice(ult, ini));
        const a = document.createElement('a');
        const verso = livro[3] === 1 && !m[4] ? Number(m[3]) : parseInt(m[4], 10) || 0;
        const fim = (m[4] && /[-–](\d+)/.exec(m[4])) ? Number(/[-–](\d+)/.exec(m[4])[1]) : verso;
        a.className = 'ref-biblia'; a.href = VB.rotaBiblia(livro, cap, verso);
        a.dataset.livro = VB.LIVROS.indexOf(livro); a.dataset.cap = cap; a.dataset.ini = verso; a.dataset.fim = fim;
        a.title = `Ler ${livro[0]} ${cap}${verso ? `.${verso}${fim > verso ? `-${fim}` : ''}` : ''}`;
        a.textContent = t.slice(ini, m.index + m[0].length);
        frag.append(a); ult = m.index + m[0].length;
      }
      if (!ult) return;
      frag.append(t.slice(ult)); no.replaceWith(frag);
    });
  };


  // Clique numa referência: abre o trecho na versão escolhida, numa janela por cima da página
  VB.popupVersiculo = async function (a) {
    const livro = VB.LIVROS[Number(a.dataset.livro)]; const cap = Number(a.dataset.cap);
    const ini = Number(a.dataset.ini) || 0; const fim = Math.max(ini, Number(a.dataset.fim) || ini);
    const ref = `${livro[0]} ${cap}${ini ? `.${ini}${fim > ini ? `-${fim}` : ''}` : ''}`;
    let v = VB.versaoInterna(VB.versaoBiblia()) ? VB.versaoBiblia() : VB.bibliaPadrao;
    const m = VB.modal({
      titulo: esc(ref),
      corpo: `<div class="popup-trocar" role="radiogroup" aria-label="Versão">${VB.VERSOES.filter(x => x[3]).map(x =>
        `<button type="button" role="radio" data-v="${x[0]}" aria-checked="${x[0] === v}">${esc(x[1])}</button>`).join('')}</div>
        <div class="popup-texto"><div class="carregando" style="min-height:120px"></div></div>`,
      rodape: `<a class="btn sec" href="${VB.rotaBiblia(livro, cap, ini)}" data-fechar>Ler o capítulo inteiro</a><button class="btn" data-fechar>Fechar</button>`,
    });
    const caixa = m.el.querySelector('.popup-texto');
    const desenhar = async () => {
      if (!caixa) return;
      caixa.innerHTML = '<div class="carregando" style="min-height:120px"></div>';
      try {
        const d = await VB.api(`/api/biblia/${a.dataset.livro}/${cap}?v=${v}`);
        caixa.innerHTML = `<div class="leitura biblia-texto popup-versos">${VB.htmlVersos(d, { ini, fim })}</div>
          <p class="pequeno muted" style="margin:.8rem 0 0">${esc(d.versao)} · ${esc(d.licenca)}</p>`;
      } catch (e) { caixa.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
    };
    m.el.querySelectorAll('.popup-trocar button').forEach(b => b.addEventListener('click', () => {
      v = b.dataset.v; VB.pref.set('versao', v);
      m.el.querySelectorAll('.popup-trocar button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      desenhar();
    }));
    desenhar();
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a.ref-biblia[data-livro]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault(); VB.popupVersiculo(a);
  });

  // ── Roteador (hash)
  VB.registrar = (padrao, papel, fn) => VB.rotas.push({ padrao, papel, fn });
  VB.rota = async function () {
    if (!VB.me) return VB.telaLogin();
    const h = location.hash.replace(/^#/, '') || (VB.me.papel === 'professor' ? '/p/painel' : '/inicio');
    for (const r of VB.rotas) {
      const m = h.match(r.padrao);
      if (m && (r.papel === 'todos' || r.papel === VB.me.papel)) {
        window.scrollTo(0, 0);
        try { await r.fn(...m.slice(1)); } catch (e) { if (e.message !== 'Sessão encerrada') { console.error(e); VB.erro(e); } }
        return;
      }
    }
    location.hash = VB.me.papel === 'professor' ? '#/p/painel' : '#/inicio';
  };
  VB.iniciar = async function () {
    VB.aplicarPrefs();
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('/sw.js').catch(() => {});
    window.addEventListener('hashchange', VB.rota);
    document.getElementById('app').innerHTML = '<div class="carregando"></div>';
    try { await VB.carregarMe(); await VB.carregarBiblioteca(); } catch (e) {
      if (e.message !== 'Sessão encerrada' && (!navigator.onLine || !e.status)) {
        document.getElementById('app').innerHTML = `<div class="bloqueio" style="min-height:80vh;display:grid;place-content:center;text-align:center;padding:24px">
          <img src="/icon-192.png" alt="" width="72" height="72" style="margin:0 auto 1rem;border-radius:18px">
          <h1>Sem conexão</h1><p class="muted">Conecte-se à internet para abrir suas aulas.</p>
          <button class="btn" onclick="location.reload()">Tentar de novo</button></div>`;
        window.addEventListener('online', () => location.reload(), { once: true });
        return;
      }
      return VB.telaLogin();
    }
    VB.rota();
  };

  return VB;
})();
