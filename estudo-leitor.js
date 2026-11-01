/* VideiraBook — Bíblia de estudo no leitor: notas no rodapé do capítulo e grifos coloridos */
(function () {
  const { esc, $ } = VB;
  const CORES = [['amarelo', 'Amarelo'], ['verde', 'Verde'], ['azul', 'Azul'], ['rosa', 'Rosa'], ['laranja', 'Laranja']];

  // ── Texto do versículo, sem número, botões e notas (é sobre ele que as posições dos grifos são contadas)
  const FORA = 'sup, button, .nota-texto';
  function textos(p) {
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest(FORA) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const lista = []; while (w.nextNode()) lista.push(w.currentNode); return lista;
  }
  const textoDe = p => textos(p).map(t => t.nodeValue).join('');

  function limparGrifos(raiz) {
    raiz.querySelectorAll('mark.grifo').forEach(m => { const pai = m.parentNode; while (m.firstChild) pai.insertBefore(m.firstChild, m); m.remove(); pai.normalize(); });
  }
  function pintar(p, g) {
    let pos = 0;
    for (const tn of textos(p)) {
      const a = pos, b = pos + tn.length; pos = b;
      const s = Math.max(g.ini, a), e = Math.min(g.fim, b);
      if (e <= s) continue;
      const r = document.createRange(); r.setStart(tn, s - a); r.setEnd(tn, e - a);
      const m = document.createElement('mark'); m.className = `grifo g-${g.cor}`; m.dataset.grifo = g.id;
      r.surroundContents(m);
    }
  }
  function aplicarGrifos(raiz, lista) {
    limparGrifos(raiz);
    for (const g of lista) { const p = raiz.querySelector(`p#v${g.verso}`); if (p) { try { pintar(p, g); } catch { /* texto mudou */ } } }
  }

  // Trechos selecionados, versículo por versículo
  function selecaoPorVerso(range, raiz) {
    const out = [];
    raiz.querySelectorAll('p[id^="v"]').forEach(p => {
      if (!range.intersectsNode(p)) return;
      let pos = 0, ini = null, fim = null;
      for (const tn of textos(p)) {
        if (range.intersectsNode(tn)) {
          const s = tn === range.startContainer ? range.startOffset : 0;
          const e = tn === range.endContainer ? range.endOffset : tn.length;
          if (e > s) { if (ini === null) ini = pos + s; fim = pos + e; }
        }
        pos += tn.length;
      }
      if (ini === null) return;
      const t = textoDe(p);
      while (ini < fim && /\s/.test(t[ini])) ini++;
      while (fim > ini && /\s/.test(t[fim - 1])) fim--;
      // completa a palavra cortada no começo e no fim
      const letra = c => c && /[\p{L}\p{N}'’-]/u.test(c);
      while (ini > 0 && letra(t[ini - 1]) && letra(t[ini])) ini--;
      while (fim < t.length && letra(t[fim]) && letra(t[fim - 1])) fim++;
      if (fim > ini) out.push({ verso: Number(p.id.slice(1)), ini, fim });
    });
    return out;
  }

  // ── Barra flutuante de cores
  let barra = null, estado = null;
  function fecharBarra() { if (barra) { barra.remove(); barra = null; } estado = null; }
  function abrirBarra(rect, opcoes) {
    fecharBarra(); estado = opcoes;
    barra = document.createElement('div');
    barra.className = 'grifador'; barra.setAttribute('role', 'toolbar'); barra.setAttribute('aria-label', 'Grifar o texto');
    barra.innerHTML = CORES.map(([c, n]) => `<button type="button" class="g-${c}${opcoes.cor === c ? ' atual' : ''}" data-cor="${c}" aria-label="Grifar de ${n.toLowerCase()}" title="${n}"></button>`).join('')
      + (opcoes.remover ? '<button type="button" class="grifo-tirar" data-tirar aria-label="Tirar o grifo" title="Tirar o grifo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' : '');
    document.body.appendChild(barra);
    const w = barra.offsetWidth, h = barra.offsetHeight;
    let x = rect.left + rect.width / 2 - w / 2, y = rect.top - h - 10;
    if (y < 70) y = rect.bottom + 10;                      // perto do topo: mostra embaixo
    if (matchMedia('(pointer: coarse)').matches) y = rect.bottom + 14;   // no celular o menu do sistema fica em cima
    x = Math.max(8, Math.min(innerWidth - w - 8, x));
    barra.style.left = `${x + scrollX}px`; barra.style.top = `${Math.max(8, y) + scrollY}px`;
    barra.addEventListener('pointerdown', e => e.preventDefault());   // não perde a seleção ao tocar
    barra.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !estado) return;
      const st = estado; fecharBarra();
      if (b.dataset.cor) st.aoCor(b.dataset.cor); else if (b.hasAttribute('data-tirar')) st.aoTirar();
    });
  }

  // ── Leitor: chamado pelo leitor da Bíblia depois de desenhar o capítulo
  VB.estudoLeitor = async function (corpo, { livro, cap, versao, estudo }) {
    if (!VB.me || !VB.me.estudo) return;
    const texto = corpo.querySelector('.biblia-texto'); if (!texto) return;
    texto.classList.add('grifavel');
    let grifos = [];
    const carregarGrifos = async () => {
      try { grifos = await VB.api(`/api/grifos/${encodeURIComponent(versao)}/${livro}/${cap}`); aplicarGrifos(texto, grifos); } catch { /* sem grifos */ }
    };
    const salvar = async (trechos, cor) => {
      try {
        for (const t of trechos) await VB.api('/api/grifos', { method: 'POST', body: { versao, livro, cap, ...t, cor } });
        VB.pref.set('grifo_cor', cor);
      } catch (e) { VB.erro(e); }
      await carregarGrifos();
    };
    const tirar = async ids => {
      try { for (const id of ids) await VB.api(`/api/grifos/${id}`, { method: 'DELETE' }); } catch (e) { VB.erro(e); }
      await carregarGrifos();
    };

    // Seleção de texto → barra de cores
    let espera = null;
    const aoSelecionar = () => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        if (!document.body.contains(texto)) { document.removeEventListener('selectionchange', aoSelecionar); return; }
        const sel = getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) { if (estado && estado.tipo === 'selecao') fecharBarra(); return; }
        const r = sel.getRangeAt(0);
        if (!texto.contains(r.commonAncestorContainer)) return;
        const trechos = selecaoPorVerso(r, texto);
        if (!trechos.length) return;
        const tocados = grifos.filter(g => trechos.some(t => t.verso === g.verso && g.ini < t.fim && g.fim > t.ini)).map(g => g.id);
        abrirBarra(r.getBoundingClientRect(), {
          tipo: 'selecao', remover: tocados.length > 0,
          aoCor: cor => { sel.removeAllRanges(); salvar(trechos, cor); },
          aoTirar: () => { sel.removeAllRanges(); tirar(tocados); },
        });
      }, matchMedia('(pointer: coarse)').matches ? 450 : 120);
    };
    document.addEventListener('selectionchange', aoSelecionar);

    // Toque num grifo → trocar a cor ou tirar
    texto.addEventListener('click', e => {
      const m = e.target.closest('mark.grifo'); if (!m) return;
      const sel = getSelection(); if (sel && !sel.isCollapsed) return;
      const id = Number(m.dataset.grifo); const g = grifos.find(x => x.id === id); if (!g) return;
      const partes = [...texto.querySelectorAll(`mark.grifo[data-grifo="${id}"]`)];
      const r = document.createRange(); r.setStartBefore(partes[0]); r.setEndAfter(partes[partes.length - 1]);
      abrirBarra(r.getBoundingClientRect(), {
        tipo: 'grifo', remover: true, cor: g.cor,
        aoCor: async cor => { try { await VB.api(`/api/grifos/${id}`, { method: 'PUT', body: { cor } }); } catch (er) { VB.erro(er); } carregarGrifos(); },
        aoTirar: () => tirar([id]),
      });
    });

    // Toque em versículos → seleciona um ou vários (em sequência ou não) e grifa todos de uma vez
    const selecionados = new Set();
    let barraV = null;
    const fecharBarraV = () => { selecionados.clear(); texto.querySelectorAll('p.v-sel').forEach(p => p.classList.remove('v-sel')); if (barraV) { barraV.remove(); barraV = null; } };
    const desenharBarraV = () => {
      if (!selecionados.size) { fecharBarraV(); return; }
      const vs = [...selecionados].sort((a, b) => a - b);
      const tem = grifos.some(g => selecionados.has(g.verso));
      if (!barraV) { barraV = document.createElement('div'); barraV.className = 'barra-versos'; barraV.setAttribute('role', 'toolbar'); document.body.appendChild(barraV); }
      const faixa = vs.length === 1 ? `${vs[0]}` : (vs[vs.length - 1] - vs[0] === vs.length - 1 ? `${vs[0]}-${vs[vs.length - 1]}` : vs.join(', '));
      barraV.innerHTML = `<span class="bv-ref">${esc(VB.LIVROS[livro][1])} ${cap}.${faixa}</span>
        <span class="bv-cores">${CORES.map(([c, n]) => `<button type="button" class="g-${c}" data-cor="${c}" aria-label="Grifar de ${n.toLowerCase()}" title="${n}"></button>`).join('')}</span>
        ${tem ? '<button type="button" class="bv-acao" data-tirar>Tirar grifo</button>' : ''}
        <button type="button" class="bv-acao bv-fechar" data-fechar-sel aria-label="Cancelar">${VB.icone.fechar}</button>`;
      barraV.onclick = async e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.cor) {
          const trechos = vs.map(v => { const p = texto.querySelector(`p#v${v}`); const t = p ? textoDe(p) : ''; const ini = t.length - t.trimStart().length; return { verso: v, ini, fim: t.trimEnd().length }; }).filter(t => t.fim > t.ini);
          fecharBarraV(); await salvar(trechos, b.dataset.cor);
        } else if (b.hasAttribute('data-tirar')) {
          const ids = grifos.filter(g => vs.includes(g.verso)).map(g => g.id); fecharBarraV(); await tirar(ids);
        } else fecharBarraV();
      };
    };
    texto.addEventListener('click', e => {
      if (e.target.closest('button, a, mark.grifo, sup, .nota-estudo, .estudo-bloco, input, select')) return;
      const sel = getSelection(); if (sel && !sel.isCollapsed) return;
      const p = e.target.closest('p[id^="v"]'); if (!p || !texto.contains(p)) return;
      const v = Number(p.id.slice(1));
      if (selecionados.has(v)) { selecionados.delete(v); p.classList.remove('v-sel'); } else { selecionados.add(v); p.classList.add('v-sel'); }
      fecharBarra(); desenharBarraV();
    });
    addEventListener('hashchange', fecharBarraV, { once: true });

    await Promise.all([carregarGrifos(), estudo ? montarNotas(corpo, texto, estudo, { livro, cap }) : null]);
    VB.outrasNotas(texto, { livro, cap, atual: estudo ? estudo.cod : '' });
  };

  // ── Bíblia de estudo: a nota fica aberta logo abaixo do versículo comentado
  async function montarNotas(corpo, texto, estudo, { livro, cap }) {
    let d;
    try { d = await VB.api(`/api/estudo/${encodeURIComponent(estudo.cod)}/${livro}/${cap}`); }
    catch (e) { texto.insertAdjacentHTML('afterbegin', `<p class="erro-msg">${esc(e.message)}</p>`); return; }
    if (!document.body.contains(texto)) return;
    const refDe = n => { const b = n.html.match(/^\s*<p>\s*<b>([\d.,\-–—\s]+)<\/b>/); if (b) return b[1].trim();
      return `${n.cap}.${n.de || 1}${n.ate > n.de && n.ate < 150 ? `-${n.ate}` : ''}`; };
    const semRef = h => h.replace(/^\s*<p>\s*<b>[\d.,\-–—\s]+<\/b>\s*/, '<p>');
    // agrupa por versículo
    const porVerso = new Map();
    for (const n of d.notas) { const v = Math.max(1, n.de || 1); if (!porVerso.has(v)) porVerso.set(v, []); porVerso.get(v).push(n); }
    for (const [v, lista] of porVerso) {
      let ancora = texto.querySelector(`p#v${v}`);
      if (!ancora) ancora = [...texto.querySelectorAll('p[id^="v"]')].pop();
      if (!ancora) continue;
      if (ancora.nextElementSibling && ancora.nextElementSibling.classList.contains('comparado')) ancora = ancora.nextElementSibling;
      const notas = lista.filter(n => !n.artigo), artigos = lista.filter(n => n.artigo);
      let html = '';
      // notas primeiro, imagens (com legenda) depois
      const ehImagem = n => /^\s*<img/i.test(n.html);
      const ordenadas = [...notas.filter(n => !ehImagem(n)), ...notas.filter(ehImagem)];
      if (ordenadas.length) html += `<aside class="nota-estudo" aria-label="Nota de estudo">${ordenadas.map(n => ehImagem(n)
        ? `<figure class="ne ne-img">${n.html.replace(/^\s*(<img[^>]*>)/i, '$1<figcaption class="estudo-texto">').replace(/$/, '</figcaption>')}</figure>`
        : `<div class="ne"><span class="ne-ref">${esc(refDe(n))}</span><div class="estudo-texto">${semRef(n.html)}</div></div>`).join('')}</aside>`;
      html += artigos.map(a => `<details class="estudo-bloco estudo-artigo"><summary><span class="estudo-tipo">${esc(a.categoria || 'Artigo')}</span><strong>${esc(a.titulo || 'Artigo')}</strong></summary>
        <div class="estudo-texto">${a.html}</div></details>`).join('');
      ancora.insertAdjacentHTML('afterend', html);
    }
    // epígrafes da própria Bíblia de estudo (títulos de seção e sobrescrito dos Salmos) no lugar das da versão do texto
    if ((d.titulos && d.titulos.length) || d.epigrafe) {
      texto.querySelectorAll('.titulo-secao, .epigrafe').forEach(x => x.remove());
      for (const t of d.titulos || []) {
        const p = texto.querySelector(`p#v${Math.max(1, t.v)}`); if (!p) continue;
        p.insertAdjacentHTML('beforebegin', `<h4 class="titulo-secao">${esc(t.t)}</h4>`);
      }
      if (d.epigrafe) {
        const p1 = texto.querySelector('p#v1');
        const ancora = p1 && p1.previousElementSibling && p1.previousElementSibling.classList.contains('titulo-secao') ? p1.previousElementSibling : p1;
        if (ancora) ancora.insertAdjacentHTML('beforebegin', `<p class="epigrafe">${esc(d.epigrafe)}</p>`);
      }
    }
    if (d.intro && d.intro.length) {
      texto.insertAdjacentHTML('afterbegin', `<details class="estudo-bloco estudo-intro"><summary><span class="estudo-tipo">Introdução ao livro</span><strong>${esc(VB.LIVROS[livro][0])}</strong></summary>
        <div class="estudo-texto">${d.intro.join('')}</div></details>`);
    }
    const credito = corpo.querySelector('.biblia-credito');
    if (credito) credito.insertAdjacentHTML('afterbegin', `${esc(d.titulo)}${d.creditos ? ` — ${esc(d.creditos)}` : ''}<br>Texto bíblico: `);
  }
  document.addEventListener('click', e => {
    if (barra && !e.target.closest('.grifador, mark.grifo')) fecharBarra();
    // imagem da Bíblia de estudo: abre grande
    const img = e.target.closest('.nota-estudo img, .estudo-bloco img');
    if (img) {
      const leg = img.closest('figure')?.querySelector('figcaption')?.innerHTML || '';
      VB.modal({ titulo: 'Imagem', largo: true, corpo: `<figure class="img-ampliada"><img src="${img.getAttribute('src')}" alt="">${leg ? `<figcaption class="estudo-texto">${leg}</figcaption>` : ''}</figure>` });
    }
  });
  addEventListener('hashchange', fecharBarra);
  addEventListener('resize', fecharBarra);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharBarra(); });
})();

/* ── Prateleira das Bíblias de estudo, marcadores por versão e "nota em outra Bíblia de estudo" */
(function () {
  const { esc } = VB;
  const ICONE_FITA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18l-5-4-5 4z"/></svg>';
  const ICONE_GRIFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M14.5 4.5l5 5L10 19H5v-5z"/></svg>';

  // Texto bíblico que uma versão mostra (Bíblia de estudo -> a versão escolhida para o texto)
  VB.textoDaVersao = function (v) {
    const est = VB.estudoPorCod(v); if (!est) return v;
    const internas = VB.VERSOES.filter(x => x[3]);
    let tv = VB.pref.get(`estudo_texto_${v}`, est.base);
    if (!internas.some(x => x[0] === tv)) tv = est.base || (internas[0] || [])[0];
    return tv;
  };

  // Folha (painel que sobe de baixo no celular; janela no tablet/computador)
  function folha(titulo, corpo, aoAbrir) {
    const m = VB.modal({ titulo, corpo, largo: true, aoAbrir });
    m.el.classList.add('folha-fundo'); m.el.querySelector('.modal').classList.add('folha');
    return m;
  }

  // ── Versões: escolher sem ocupar a tela de leitura
  VB.folhaVersoes = function ({ aoTrocar, aoTrocarTexto } = {}) {
    const atual = VB.versaoBiblia();
    const internas = VB.VERSOES.filter(x => x[3]);
    const linhaV = v => `<button type="button" class="fv-item${v[0] === atual ? ' atual' : ''}" data-versao="${esc(v[0])}" aria-pressed="${v[0] === atual}"><b>${esc(v[1])}</b><span>${esc(v[2])}${v[3] ? '' : ' · abre no site'}</span></button>`;
    const linhaE = e => `<button type="button" class="fv-item fv-estudo${e.cod === atual ? ' atual' : ''}" data-versao="${esc(e.cod)}" aria-pressed="${e.cod === atual}">${VB.capaMini(e)}<span class="fv-tx"><b>${esc(e.sigla)}</b><span>${esc(e.titulo)}</span></span></button>`;
    const estAtual = VB.estudoPorCod(atual);
    const corpo = `${estAtual ? `<label class="fv-texto"><span>Texto bíblico da ${esc(estAtual.sigla)}</span>
        <select class="input" id="fv-texto">${internas.map(x => `<option value="${esc(x[0])}"${x[0] === VB.textoDaVersao(atual) ? ' selected' : ''}>${esc(x[1])} — ${esc(x[2])}</option>`).join('')}</select></label>` : ''}
      ${VB.ESTUDOS && VB.ESTUDOS.length ? `<h4 class="fv-tit">Bíblias de estudo</h4><div class="fv-lista">${VB.ESTUDOS.map(linhaE).join('')}</div>` : ''}
      <h4 class="fv-tit">Versões</h4><div class="fv-lista">${VB.VERSOES.map(linhaV).join('')}</div>`;
    folha('Versão', corpo, (el, fechar) => {
      el.querySelectorAll('[data-versao]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.versao !== atual) { VB.pref.set('versao', b.dataset.versao); fechar(); aoTrocar && aoTrocar(); }
        else fechar();
      }));
      el.querySelector('#fv-texto')?.addEventListener('change', e => { VB.pref.set(`estudo_texto_${atual}`, e.target.value); fechar(); aoTrocarTexto && aoTrocarTexto(); });
    });
  };

  // ── Livro e capítulo: escolhe ali mesmo, sem voltar para a página da Bíblia
  VB.folhaLivros = function ({ livro, cap } = {}) {
    let test = livro && VB.LIVROS.indexOf(livro) >= 39 ? 'nt' : 'at';
    folha('Livro e capítulo', `<div class="abas-testamento" role="tablist">
        <button type="button" role="tab" data-test="at">Antigo Testamento</button><button type="button" role="tab" data-test="nt">Novo Testamento</button></div>
      <div id="fl-area"></div>`, (el, fechar) => {
      const area = el.querySelector('#fl-area');
      const livros = () => {
        el.querySelectorAll('[data-test]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.test === test)));
        const lista = test === 'at' ? VB.LIVROS.slice(0, 39) : VB.LIVROS.slice(39);
        area.innerHTML = `<div class="livros">${lista.map(l => `<button type="button" class="livro-btn${l === livro ? ' atual' : ''}" data-l="${VB.LIVROS.indexOf(l)}">${esc(l[0])}</button>`).join('')}</div>`;
        area.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => caps(VB.LIVROS[Number(b.dataset.l)])));
      };
      const caps = l => {
        if (l[3] === 1) { fechar(); location.hash = VB.rotaBiblia(l, 1); return; }
        area.innerHTML = `<div class="cap-cab"><button type="button" class="btn sec mini" id="fl-voltar">← Livros</button><h3>${esc(l[0])}</h3></div>
          <div class="cap-grade">${Array.from({ length: l[3] }, (_, i) => `<a href="${VB.rotaBiblia(l, i + 1)}"${l === livro && i + 1 === cap ? ' class="atual"' : ''}>${i + 1}</a>`).join('')}</div>`;
        area.querySelector('#fl-voltar').addEventListener('click', livros);
        area.querySelectorAll('.cap-grade a').forEach(a => a.addEventListener('click', fechar));
      };
      el.querySelectorAll('[data-test]').forEach(b => b.addEventListener('click', () => { test = b.dataset.test; livros(); }));
      livro ? caps(livro) : livros();
    });
  };

  // ── Meus grifos: todos, na ordem da Bíblia
  VB.folhaGrifos = async function () {
    const m = folha('Meus grifos', '<div class="carregando"></div>');
    let lista;
    try { lista = await VB.api('/api/grifos'); } catch (e) { m.el.querySelector('.modal-corpo').innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; return; }
    const corpo = m.el.querySelector('.modal-corpo');
    if (!lista.length) { corpo.innerHTML = '<p class="muted">Você ainda não grifou nada. No leitor, toque em um ou mais versículos (ou selecione um trecho) e escolha a cor.</p>'; return; }
    const CORES = ['amarelo', 'verde', 'azul', 'rosa', 'laranja'];
    let filtro = '';
    const desenhar = () => {
      const vis = lista.filter(g => !filtro || g.cor === filtro);
      let livroAnt = -1, html = '';
      for (const g of vis) {
        if (g.livro !== livroAnt) { html += `<h4 class="fg-livro">${esc(VB.LIVROS[g.livro][0])}</h4>`; livroAnt = g.livro; }
        html += `<a class="fg-item" href="${VB.rotaBiblia(VB.LIVROS[g.livro], g.cap, g.verso)}" data-versao="${esc(g.versao)}">
          <span class="fg-cor g-${esc(g.cor)}"></span><span class="fg-tx"><b>${esc(VB.LIVROS[g.livro][1])} ${g.cap}.${g.verso}</b><small>${esc(nomeVersao(g.versao))}</small>
          ${g.trecho ? `<span class="fg-trecho">${esc(g.trecho)}</span>` : ''}</span></a>`;
      }
      corpo.innerHTML = `<div class="fg-filtro" role="group" aria-label="Filtrar por cor"><button type="button" data-cor="" aria-pressed="${!filtro}">Todos (${lista.length})</button>
        ${CORES.filter(c => lista.some(g => g.cor === c)).map(c => `<button type="button" data-cor="${c}" aria-pressed="${filtro === c}"><span class="fg-cor g-${c}"></span>${lista.filter(g => g.cor === c).length}</button>`).join('')}</div>
        <div class="fg-lista">${html}</div>`;
      corpo.querySelectorAll('[data-cor]').forEach(b => b.addEventListener('click', () => { filtro = b.dataset.cor; desenhar(); }));
      corpo.querySelectorAll('.fg-item').forEach(a => a.addEventListener('click', () => {
        // abre na versão em que o grifo foi feito, se a versão atual mostrar outro texto
        if (VB.textoDaVersao(VB.versaoBiblia()) !== a.dataset.versao) VB.pref.set('versao', a.dataset.versao);
        m.fechar();
        if (location.hash === a.getAttribute('href')) setTimeout(() => VB.rota(), 0);
      }));
    };
    desenhar();
  };

  // ── Marcadores (um por versão)
  VB.MARC = null;
  VB.carregarMarcadores = async function (forcar) {
    if (VB.MARC && !forcar) return VB.MARC;
    try { VB.MARC = {}; (await VB.api('/api/marcadores')).forEach(m => { VB.MARC[m.versao] = m; }); } catch { VB.MARC = VB.MARC || {}; }
    return VB.MARC;
  };
  const nomeVersao = c => (VB.VERSOES.find(v => v[0] === c) || [])[1] || (VB.estudoPorCod(c) || {}).sigla || c;
  const refMarc = m => `${VB.LIVROS[m.livro][0]} ${m.cap}${m.verso > 1 ? `.${m.verso}` : ''}`;
  // Ao escolher uma versão: se ela tem marcador em outro lugar, vai para ele. Devolve true se mudou de página.
  VB.irParaMarcador = function (versao, atual) {
    const m = (VB.MARC || {})[versao];
    if (!m || !VB.LIVROS[m.livro]) return false;
    if (atual && atual.livro === m.livro && atual.cap === m.cap) return false;
    location.hash = VB.rotaBiblia(VB.LIVROS[m.livro], m.cap, m.verso > 1 ? m.verso : 0);
    VB.toast(`Marcador da ${nomeVersao(versao)}: ${refMarc(m)}`);
    return true;
  };
  // Botão do leitor (compacto: só o ícone, na barra do leitor)
  VB.botaoMarcador = function (alvo, { livro, cap, compacto }) {
    const desenhar = () => {
      const v = VB.versaoBiblia(); const m = (VB.MARC || {})[v];
      const aqui = m && m.livro === livro && m.cap === cap;
      alvo.innerHTML = compacto
        ? `<button type="button" class="lb-ico btn-marcador${aqui ? ' ativo' : ''}" aria-pressed="${!!aqui}" aria-label="${aqui ? 'Tirar o marcador' : 'Marcar onde parei nesta versão'}" title="${aqui ? 'Marcado aqui (tocar tira)' : 'Marcar onde parei'}">${ICONE_FITA}</button>`
        : `<button type="button" class="btn sec mini btn-marcador${aqui ? ' ativo' : ''}" aria-pressed="${!!aqui}" title="${aqui ? 'Tirar o marcador' : 'Marcar onde parei nesta versão'}">${ICONE_FITA}${aqui ? 'Marcado' : 'Marcar aqui'}</button>
        ${m && !aqui ? `<a class="marcador-ir" href="${VB.rotaBiblia(VB.LIVROS[m.livro], m.cap, m.verso > 1 ? m.verso : 0)}">Seu marcador na ${esc(nomeVersao(v))}: ${esc(refMarc(m))}</a>` : ''}`;
      alvo.querySelector('button').addEventListener('click', async () => {
        try {
          if (aqui) { await VB.api(`/api/marcadores/${encodeURIComponent(v)}`, { method: 'DELETE' }); delete VB.MARC[v]; VB.toast('Marcador tirado'); }
          else {
            // versículo que está no alto da tela
            const ps = [...document.querySelectorAll('.biblia-texto p[id^="v"]')];
            const p = ps.find(x => x.getBoundingClientRect().top >= 70) || ps[0];
            const verso = p ? Number(p.id.slice(1)) : 1;
            await VB.api(`/api/marcadores/${encodeURIComponent(v)}`, { method: 'PUT', body: { livro, cap, verso } });
            VB.MARC[v] = { versao: v, livro, cap, verso };
            VB.toast(`Marcador da ${nomeVersao(v)} em ${refMarc(VB.MARC[v])}`);
          }
        } catch (e) { VB.erro(e); }
        desenhar();
      });
    };
    VB.carregarMarcadores().then(desenhar);
    return desenhar;
  };
  // Lista de marcadores (página da Bíblia)
  VB.montarMarcadores = async function (el) {
    if (!el) return;
    const M = await VB.carregarMarcadores(true);
    const lista = Object.values(M).filter(m => VB.LIVROS[m.livro] && (VB.versaoInterna(m.versao)));
    const grifos = VB.me && VB.me.estudo;
    if (!lista.length && !grifos) { el.innerHTML = ''; return; }
    el.innerHTML = `<section class="painel marcadores"><div class="marcadores-cab"><h3>${ICONE_FITA}Seus marcadores</h3>
      ${grifos ? `<button type="button" class="btn sec mini" id="abrir-grifos">${ICONE_GRIFO}Meus grifos</button>` : ''}</div>
      ${lista.length ? `<div class="marcadores-lista">${lista.map(m =>
      `<a href="${VB.rotaBiblia(VB.LIVROS[m.livro], m.cap, m.verso > 1 ? m.verso : 0)}" data-versao="${esc(m.versao)}"><b>${esc(nomeVersao(m.versao))}</b><span>${esc(refMarc(m))}</span></a>`).join('')}</div>`
      : '<p class="pequeno muted" style="margin:.4rem 0 0">No leitor, toque na fita para marcar onde parou em cada versão.</p>'}</section>`;
    el.querySelectorAll('a[data-versao]').forEach(a => a.addEventListener('click', () => VB.pref.set('versao', a.dataset.versao)));
    el.querySelector('#abrir-grifos')?.addEventListener('click', () => VB.folhaGrifos());
  };

  // ── Prateleira
  const capaHtml = e => e.capa
    ? `<img src="/api/estudo/${encodeURIComponent(e.cod)}/capa" alt="" loading="lazy">`
    : `<span class="capa-falsa"><b>${esc(e.sigla)}</b><small>${esc(e.titulo)}</small></span>`;
  VB.capaMini = e => e.capa ? `<img class="capa-mini" src="/api/estudo/${encodeURIComponent(e.cod)}/capa" alt="" loading="lazy">` : '';
  VB.montarPrateleira = async function (el) {
    if (!el || !VB.ESTUDOS || !VB.ESTUDOS.length) { if (el) el.innerHTML = ''; return; }
    await VB.carregarMarcadores();
    const atual = VB.versaoBiblia();
    el.innerHTML = `<section class="prateleira" aria-label="Bíblias de estudo">
      <div class="prateleira-cab"><h2>Bíblias de estudo</h2><p>Escolha a Bíblia que você está estudando.</p></div>
      <div class="prateleira-livros"><div class="trilho">${VB.ESTUDOS.map(e => {
        const m = (VB.MARC || {})[e.cod];
        return `<button type="button" class="livro-estudo${e.cod === atual ? ' atual' : ''}" data-estudo="${esc(e.cod)}" aria-label="${esc(e.titulo)}">
          <span class="capa">${capaHtml(e)}${m ? `<span class="fita" title="Marcador">${ICONE_FITA}</span>` : ''}</span>
          <span class="rotulo"><b>${esc(e.sigla)}</b>${m ? `<small>${esc(refMarc(m))}</small>` : '<small>Começar</small>'}</span></button>`;
      }).join('')}</div></div></section>`;
    el.querySelectorAll('[data-estudo]').forEach(b => b.addEventListener('click', () => {
      const cod = b.dataset.estudo; VB.pref.set('versao', cod);
      if (!VB.irParaMarcador(cod)) location.hash = VB.rotaBiblia(VB.LIVROS[0], 1);
    }));
  };

  // ── Sinal de "nota em outra Bíblia de estudo" no versículo
  VB.outrasNotas = async function (texto, { livro, cap, atual }) {
    if (!VB.me || !VB.me.estudo || !VB.ESTUDOS || !VB.ESTUDOS.length) return;
    let marcas;
    try { marcas = await VB.api(`/api/estudo-marcas/${livro}/${cap}`); } catch { return; }
    if (!document.body.contains(texto)) return;
    const porVerso = {};
    for (const [cod, vs] of Object.entries(marcas)) {
      if (cod === atual || !VB.estudoPorCod(cod)) continue;
      vs.forEach(v => { (porVerso[v] = porVerso[v] || []).push(cod); });
    }
    for (const [v, cods] of Object.entries(porVerso)) {
      const p = texto.querySelector(`p#v${v}`); if (!p || p.querySelector('.outra-nota')) continue;
      const siglas = cods.map(c => VB.estudoPorCod(c).sigla).join(', ');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'outra-nota'; b.dataset.cods = cods.join(','); b.dataset.v = v;
      b.title = `Nota em ${siglas}`; b.setAttribute('aria-label', `Ver nota de ${siglas} sobre o versículo ${v}`);
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c2.7-1.3 5.3-1.3 8 0 2.7-1.3 5.3-1.3 8 0V19c-2.7-1.3-5.3-1.3-8 0-2.7-1.3-5.3-1.3-8 0z"/><path d="M12 5.5V19"/></svg><span>${cods.length}</span>`;
      const ac = p.querySelector('.acao-verso'); ac ? ac.before(b) : p.appendChild(b);
    }
    texto.addEventListener('click', async e => {
      const b = e.target.closest('.outra-nota'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const v = Number(b.dataset.v); const cods = b.dataset.cods.split(',');
      const m = VB.modal({ titulo: `Notas sobre ${esc(VB.LIVROS[livro][1])} ${cap}.${v}`, largo: true, corpo: '<div class="carregando"></div>' });
      const partes = await Promise.all(cods.map(async cod => {
        const e2 = VB.estudoPorCod(cod);
        try {
          const d = await VB.api(`/api/estudo/${encodeURIComponent(cod)}/${livro}/${cap}`);
          const ns = d.notas.filter(n => !n.artigo && Math.max(1, n.de || 1) === v);
          if (!ns.length) return '';
          return `<section class="outra-bloco"><h3>${VB.capaMini(e2)}<span>${esc(e2.titulo)}</span></h3>
            <div class="nota-estudo">${ns.map(n => /^\s*<img/i.test(n.html)
              ? `<figure class="ne ne-img">${n.html.replace(/^\s*(<img[^>]*>)/i, '$1<figcaption class="estudo-texto">')}</figcaption></figure>`
              : `<div class="ne"><div class="estudo-texto">${n.html}</div></div>`).join('')}</div>
            <button type="button" class="btn sec mini" data-abrir-estudo="${esc(cod)}">Ler na ${esc(e2.sigla)}</button></section>`;
        } catch { return ''; }
      }));
      const corpo = m.el.querySelector('.modal-corpo');
      corpo.innerHTML = partes.join('') || '<p class="muted">Não encontrei a nota.</p>';
      corpo.querySelectorAll('[data-abrir-estudo]').forEach(x => x.addEventListener('click', () => {
        VB.pref.set('versao', x.dataset.abrirEstudo); m.el.querySelector('[data-fechar]')?.click();
        location.hash = VB.rotaBiblia(VB.LIVROS[livro], cap, v); VB.rota();
      }));
    });
  };
})();
