/* VideiraBook — Bíblia de estudo no leitor: notas no rodapé do capítulo e grifos coloridos */
(function () {
  const { esc, $ } = VB;
  const CORES = [['amarelo', 'Amarelo'], ['verde', 'Verde'], ['azul', 'Azul'], ['rosa', 'Rosa'], ['laranja', 'Laranja']];
  const ICONE_NOTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c2.7-1.3 5.3-1.3 8 0 2.7-1.3 5.3-1.3 8 0V19c-2.7-1.3-5.3-1.3-8 0-2.7-1.3-5.3-1.3-8 0z"/><path d="M12 5.5V19"/></svg>';

  // ── Texto do versículo, sem número, botões e notas (é sobre ele que as posições dos grifos são contadas)
  const FORA = 'sup, button, .nota-texto, .marca-estudo';
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
  VB.estudoLeitor = async function (corpo, { livro, cap, versao }) {
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

    await Promise.all([carregarGrifos(), montarNotas(corpo, texto, { livro, cap })]);
  };

  // ── Notas de estudo no rodapé
  let MODULOS = null;
  async function montarNotas(corpo, texto, { livro, cap }) {
    try { MODULOS = MODULOS || await VB.api('/api/estudo'); } catch { MODULOS = []; }
    corpo.querySelector('.estudo')?.remove();
    if (!MODULOS.length) return;
    let cod = VB.pref.get('estudo_cod', MODULOS[0].cod);
    if (!MODULOS.some(m => m.cod === cod)) cod = MODULOS[0].cod;
    const ligado = VB.pref.get('estudo_ligado', '1') === '1';

    const sec = document.createElement('section');
    sec.className = 'estudo'; sec.setAttribute('aria-label', 'Notas da Bíblia de estudo');
    const credito = corpo.querySelector('.biblia-credito');
    (credito || texto).after(sec);

    const cab = mod => `<header class="estudo-cab">
        <div><h2>Notas de estudo</h2><p>${esc(mod.titulo)}</p></div>
        <div class="estudo-ops">
          ${MODULOS.length > 1 ? `<select class="input mini" id="estudo-mod" aria-label="Bíblia de estudo">${MODULOS.map(m => `<option value="${esc(m.cod)}"${m.cod === mod.cod ? ' selected' : ''}>${esc(m.sigla)}</option>`).join('')}</select>` : ''}
          <button type="button" class="btn sec mini" id="estudo-ligar" aria-pressed="${ligado}">${ligado ? 'Ocultar notas' : 'Mostrar notas'}</button>
        </div></header>`;

    const desenhar = async () => {
      const mod = MODULOS.find(m => m.cod === cod);
      texto.querySelectorAll('.marca-estudo').forEach(a => a.remove());
      texto.querySelectorAll('p.tem-nota').forEach(p => p.classList.remove('tem-nota'));
      if (!ligado) { sec.innerHTML = cab(mod); ligar(); return; }
      sec.innerHTML = cab(mod) + '<div class="carregando"></div>'; ligar();
      let d;
      try { d = await VB.api(`/api/estudo/${encodeURIComponent(cod)}/${livro}/${cap}`); }
      catch (e) { sec.querySelector('.carregando').outerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; return; }
      const artigos = [], notas = [];
      d.notas.forEach(n => (n.artigo ? artigos : notas).push(n));
      const refDe = n => { const b = n.html.match(/^\s*<p>\s*<b>([\d.,\-–—\s]+)<\/b>/); if (b) return b[1].trim();
        return n.capAte && n.capAte !== n.cap ? `${n.cap}.${n.de}–${n.capAte}` : `${n.cap}.${n.de || 1}${n.ate > n.de && n.ate < 150 ? `-${n.ate}` : ''}`; };
      const semRef = h => h.replace(/^\s*<p>\s*<b>[\d.,\-–—\s]+<\/b>\s*/, '<p>');
      let html = '';
      if (d.intro && d.intro.length) {
        html += `<details class="estudo-bloco estudo-intro"><summary><span class="estudo-tipo">Introdução ao livro</span><strong>${esc(VB.LIVROS[livro][0])}</strong></summary>
          <div class="estudo-texto">${d.intro.join('')}</div></details>`;
      }
      html += artigos.map(a => `<details class="estudo-bloco estudo-artigo"><summary><span class="estudo-tipo">${esc(a.categoria || 'Artigo')}</span><strong>${esc(a.titulo || 'Artigo')}</strong></summary>
          <div class="estudo-texto">${a.html}</div></details>`).join('');
      if (notas.length) {
        html += `<ol class="estudo-notas">${notas.map((n, i) => `<li id="ne-${i}" data-de="${n.de}" data-ate="${n.ate}">
          <a class="ne-ref" href="#v${n.de || 1}" data-ir-verso="${n.de || 1}">${refDe(n)}</a>
          <div class="estudo-texto">${semRef(n.html)}</div></li>`).join('')}</ol>`;
      }
      if (!html) html = `<p class="muted estudo-vazio">Não há notas de estudo para ${esc(VB.LIVROS[livro][0])} ${cap}.</p>`;
      html += d.creditos ? `<p class="pequeno muted estudo-credito">${esc(d.titulo)} — ${esc(d.creditos)}</p>` : '';
      sec.querySelector('.carregando').outerHTML = html;
      // marca nos versículos que têm nota
      notas.forEach((n, i) => {
        const p = texto.querySelector(`p#v${n.de || 1}`); if (!p) return;
        p.classList.add('tem-nota');
        if (p.querySelector('.marca-estudo')) return;
        const a = document.createElement('a');
        a.className = 'marca-estudo'; a.href = `#ne-${i}`; a.dataset.ne = i;
        a.setAttribute('aria-label', `Nota de estudo sobre ${refDe(n)}`); a.title = 'Nota de estudo';
        a.innerHTML = ICONE_NOTA;
        const ac = p.querySelector('.acao-verso'); ac ? ac.before(a) : p.appendChild(a);
      });
    };
    const ligar = () => {
      sec.querySelector('#estudo-ligar')?.addEventListener('click', () => { VB.pref.set('estudo_ligado', ligado ? '0' : '1'); montarNotas(corpo, texto, { livro, cap }); });
      sec.querySelector('#estudo-mod')?.addEventListener('change', e => { VB.pref.set('estudo_cod', e.target.value); montarNotas(corpo, texto, { livro, cap }); });
    };
    await desenhar();
  }
  // Ir da marca do versículo para a nota e voltar
  const piscar = el => { el.classList.remove('piscar'); void el.offsetWidth; el.classList.add('piscar'); };
  document.addEventListener('click', e => {
    const m = e.target.closest('a.marca-estudo');
    if (m) { e.preventDefault(); const n = document.getElementById(`ne-${m.dataset.ne}`); if (n) { n.scrollIntoView({ block: 'center', behavior: 'smooth' }); piscar(n); } return; }
    const r = e.target.closest('a.ne-ref[data-ir-verso]');
    if (r) { e.preventDefault(); const p = document.getElementById(`v${r.dataset.irVerso}`); if (p) { p.scrollIntoView({ block: 'center', behavior: 'smooth' }); piscar(p); } return; }
    if (barra && !e.target.closest('.grifador, mark.grifo')) fecharBarra();
  });
  addEventListener('hashchange', fecharBarra);
  addEventListener('resize', fecharBarra);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharBarra(); });
})();
