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

    await Promise.all([carregarGrifos(), estudo ? montarNotas(corpo, texto, estudo, { livro, cap }) : null]);
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
      if (notas.length) html += `<aside class="nota-estudo" aria-label="Nota de estudo">${notas.map(n => `<div class="ne"><span class="ne-ref">${esc(refDe(n))}</span><div class="estudo-texto">${semRef(n.html)}</div></div>`).join('')}</aside>`;
      html += artigos.map(a => `<details class="estudo-bloco estudo-artigo"><summary><span class="estudo-tipo">${esc(a.categoria || 'Artigo')}</span><strong>${esc(a.titulo || 'Artigo')}</strong></summary>
        <div class="estudo-texto">${a.html}</div></details>`).join('');
      ancora.insertAdjacentHTML('afterend', html);
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
  });
  addEventListener('hashchange', fecharBarra);
  addEventListener('resize', fecharBarra);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharBarra(); });
})();
