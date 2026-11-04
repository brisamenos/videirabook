/* VideiraBook — rede da turma: status de 24 h, publicações com fotos, reações e comentários (fica na página Início) */
(function () {
  const { esc, icone, $, $$ } = VB;
  const REACOES = [['curtir', '👍', 'Curtir'], ['amei', '❤️', 'Amei'], ['amem', '🙏', 'Amém'], ['haha', '😂', 'Haha'], ['uau', '😮', 'Uau'], ['triste', '😢', 'Triste']];
  const R = Object.fromEntries(REACOES.map(r => [r[0], r]));
  const I = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ic = {
    foto: I('<rect x="3" y="5" width="18" height="15" rx="2.5"/><circle cx="9" cy="10.5" r="1.8"/><path d="M21 16l-5-5-8 9"/>'),
    balao: I('<path d="M4 5h16v11H9l-5 4z"/>'),
    sorriso: I('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.6"/>'),
    pontos: I('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'),
    enviar: I('<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>'),
    esq: I('<path d="M15 6l-6 6 6 6"/>'),
    dir: I('<path d="M9 6l6 6-6 6"/>'),
    olho: VB.icone.olho, lixo: VB.icone.lixo, lapis: VB.icone.lapis, fechar: VB.icone.fechar, mais: VB.icone.mais,
  };
  const rede = VB.rede = {};

  // ── Utilidades
  const textoHtml = t => esc(t).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br>');
  const nomeCurto = p => VB.primeiroNome(p.nome);
  const seloProf = p => p.papel === 'professor' ? '<span class="rede-selo">Professor</span>' : p.papel === 'pastor' ? '<span class="rede-selo">Liderança</span>' : '';
  // "turma" no espaço principal, "igreja" para quem entrou pelo endereço de uma igreja
  const grupo = () => VB.me && VB.me.igreja ? 'igreja' : 'turma';
  const ehLider = () => VB.me && VB.me.papel === 'pastor';
  function autoAltura(ta) { const f = () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 320) + 'px'; }; ta.addEventListener('input', f); f(); }
  function resumoReacoes(r) {
    if (!r || !r.total) return '';
    const top = Object.entries(r.tipos).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => `<i>${R[t] ? R[t][1] : '👍'}</i>`).join('');
    return `<span class="rr-icones">${top}</span><span>${r.minha && r.total > 1 ? `Você e mais ${r.total - 1}` : r.minha ? 'Você' : r.total}</span>`;
  }
  // Reduz a foto no próprio aparelho antes de enviar (mais rápido e economiza espaço)
  function reduzir(arquivo, max = 1600, q = 0.85) {
    return new Promise(ok => {
      if (!/^image\/(jpeg|png|webp|heic|heif)/.test(arquivo.type) && !/\.(jpe?g|png|webp|heic)$/i.test(arquivo.name)) return ok({ blob: arquivo, nome: arquivo.name });
      const url = URL.createObjectURL(arquivo); const img = new Image();
      img.onload = () => {
        const esc_ = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const l = Math.round(img.naturalWidth * esc_), a = Math.round(img.naturalHeight * esc_);
        const c = document.createElement('canvas'); c.width = l; c.height = a;
        c.getContext('2d').drawImage(img, 0, 0, l, a); URL.revokeObjectURL(url);
        c.toBlob(b => ok(b ? { blob: b, nome: 'foto.jpg', l, a } : { blob: arquivo, nome: arquivo.name, l: img.naturalWidth, a: img.naturalHeight }), 'image/jpeg', q);
      };
      img.onerror = () => { URL.revokeObjectURL(url); ok({ blob: arquivo, nome: arquivo.name }); };
      img.src = url;
    });
  }
  rede.reduzir = reduzir;

  // Janelinha flutuante (escolher reação, menu da publicação)
  let flut = null;
  function fecharFlut() { if (flut) { flut.remove(); flut = null; document.removeEventListener('pointerdown', foraFlut, true); document.removeEventListener('keydown', escFlut); } }
  function foraFlut(e) { if (flut && !flut.contains(e.target) && !e.target.closest('[data-abre-flut]')) fecharFlut(); }
  function escFlut(e) { if (e.key === 'Escape') fecharFlut(); }
  function abrirFlut(ancora, html, classe = '') {
    fecharFlut();
    flut = document.createElement('div'); flut.className = 'rede-flut ' + classe; flut.innerHTML = html;
    document.body.appendChild(flut);
    const r = ancora.getBoundingClientRect(), w = flut.offsetWidth, hgt = flut.offsetHeight;
    let x = r.left + r.width / 2 - w / 2; x = Math.max(8, Math.min(x, innerWidth - w - 8));
    let y = r.top - hgt - 8; if (y < 8) y = r.bottom + 8;
    flut.style.left = x + scrollX + 'px'; flut.style.top = y + scrollY + 'px';
    setTimeout(() => { document.addEventListener('pointerdown', foraFlut, true); document.addEventListener('keydown', escFlut); });
    const primeiro = flut.querySelector('button'); if (primeiro) primeiro.focus({ preventScroll: true });
    return flut;
  }
  function escolherReacao(ancora, atual, aoEscolher) {
    const f = abrirFlut(ancora, REACOES.map(([k, e, n]) => `<button type="button" data-r="${k}" class="${atual === k ? 'atual' : ''}" aria-label="${n}" title="${n}"><span>${e}</span><small>${n}</small></button>`).join(''), 'reacoes');
    f.setAttribute('role', 'menu');
    $$('button', f).forEach(b => b.addEventListener('click', () => { fecharFlut(); aoEscolher(b.dataset.r === atual ? null : b.dataset.r); }));
  }

  // ════════ Página Início: monta status e mural dentro do elemento dado
  rede.montar = async function (raiz, raizStatus) {
    const faixa = `<div class="status-faixa" id="status-faixa" aria-label="Status da ${grupo()}"><div class="carregando mini"></div></div>`;
    if (raizStatus) raizStatus.innerHTML = faixa;
    raiz.innerHTML = `${raizStatus ? '' : faixa}
      <div class="rede-compor painel" id="rede-compor"></div>
      <button class="rede-novos oculto" id="rede-novos" type="button"></button>
      <div id="rede-lista" class="rede-lista"><div class="carregando"></div></div>
      <div id="rede-fim"></div>`;
    montarCompositor($('#rede-compor'));
    carregarStatus();
    estado.ultimoId = 0; estado.maisAntigo = 0; estado.geracao++; estado.carregando = false;
    await carregarFeed(true);
    vigiar();
  };
  const estado = { ultimoId: 0, maisAntigo: 0, mais: false, carregando: false, geracao: 0 };

  // ── Compositor de publicação
  function montarCompositor(el) {
    let fotos = [];
    el.innerHTML = `
      <div class="rc-linha">${VB.avatar(VB.me)}
        <label class="sr" for="rc-texto">Escreva sua publicação</label>
        <textarea id="rc-texto" rows="1" maxlength="5000" placeholder="Escreva algo para a ${grupo()}, ${esc(VB.primeiroNome(VB.nomeExibicao(VB.me)))}…"></textarea></div>
      <div class="rc-previas" id="rc-previas"></div>
      <div class="rc-acoes">
        <label class="btn fantasma rc-foto">${ic.foto}<span>Foto</span><input type="file" accept="image/*" multiple class="sr" id="rc-arq"></label>
        ${ehLider() ? '<label class="rc-info pequeno"><input type="checkbox" id="rc-informativo"> Informativo da igreja</label>' : ''}
        <span class="rc-progresso pequeno muted" id="rc-prog"></span>
        <button class="btn" type="button" id="rc-publicar" disabled>Publicar</button>
      </div>`;
    const ta = $('#rc-texto', el), bt = $('#rc-publicar', el), prev = $('#rc-previas', el);
    autoAltura(ta);
    const atualiza = () => { bt.disabled = !ta.value.trim() && !fotos.length; el.classList.toggle('ativo', !!(ta.value || fotos.length)); };
    ta.addEventListener('input', atualiza);
    ta.addEventListener('focus', () => el.classList.add('ativo'));
    const desenhar = () => {
      prev.innerHTML = fotos.map((f, i) => `<figure><img src="${f.url}" alt=""><button type="button" class="rc-tirar" data-i="${i}" aria-label="Tirar esta foto">${ic.fechar}</button></figure>`).join('');
      $$('.rc-tirar', prev).forEach(b => b.addEventListener('click', () => { URL.revokeObjectURL(fotos[b.dataset.i].url); fotos.splice(Number(b.dataset.i), 1); desenhar(); atualiza(); }));
    };
    $('#rc-arq', el).addEventListener('change', async e => {
      const novos = [...e.target.files]; e.target.value = '';
      if (fotos.length + novos.length > 6) VB.toast('Você pode publicar até 6 fotos de uma vez.', true);
      for (const f of novos.slice(0, 6 - fotos.length)) { const r = await reduzir(f); fotos.push({ ...r, url: URL.createObjectURL(r.blob) }); }
      desenhar(); atualiza();
    });
    bt.addEventListener('click', async () => {
      const fd = new FormData(); fd.append('texto', ta.value);
      const inf = $('#rc-informativo', el); if (inf && inf.checked) fd.append('informativo', '1');
      fotos.forEach(f => fd.append('imagens', f.blob, f.nome));
      fd.append('dimensoes', JSON.stringify(fotos.map(f => ({ l: f.l, a: f.a }))));
      bt.disabled = true; bt.textContent = 'Publicando…';
      try {
        const p = await VB.enviar('/api/rede/posts', fd, 'POST', pct => { $('#rc-prog', el).textContent = fotos.length ? `Enviando ${pct}%` : ''; });
        fotos.forEach(f => URL.revokeObjectURL(f.url)); fotos = []; ta.value = ''; if (inf) inf.checked = false; desenhar(); ta.dispatchEvent(new Event('input'));
        const lista = $('#rede-lista'); const vazio = $('.rede-vazio', lista); if (vazio) vazio.remove();
        lista.insertAdjacentHTML('afterbegin', postHtml(p)); ligarPost(lista.firstElementChild, p);
        estado.ultimoId = Math.max(estado.ultimoId, p.id);
        VB.toast('Publicado');
      } catch (er) { VB.erro(er); }
      bt.textContent = 'Publicar'; $('#rc-prog', el).textContent = ''; atualiza(); el.classList.remove('ativo');
    });
  }

  // ── Mural
  async function carregarFeed(inicio) {
    if (estado.carregando) return;
    const lista = $('#rede-lista'); if (!lista) return;
    const geracao = estado.geracao; estado.carregando = true;
    try {
      const d = await VB.api('/api/rede/feed' + (inicio ? '' : `?antes=${estado.maisAntigo}`));
      if (geracao !== estado.geracao || !lista.isConnected) return;   // a página foi redesenhada enquanto carregava
      if (inicio) lista.innerHTML = '';
      if (inicio && !d.posts.length) lista.innerHTML = `<div class="rede-vazio painel"><h3>O mural da ${grupo()} está esperando a primeira publicação</h3>
        <p class="muted">Compartilhe um versículo que falou com você, uma foto do encontro ou um pedido de oração.</p></div>`;
      for (const p of d.posts) { lista.insertAdjacentHTML('beforeend', postHtml(p)); ligarPost(lista.lastElementChild, p); }
      if (d.posts.length) { estado.maisAntigo = d.posts[d.posts.length - 1].id; if (inicio) estado.ultimoId = d.posts[0].id; }
      estado.mais = d.mais;
      $('#rede-fim').innerHTML = d.mais ? '<button class="btn sec rede-mais" type="button">Ver publicações mais antigas</button>' : (d.posts.length || !inicio ? '<p class="rede-fim-txt muted pequeno">Você chegou ao começo do mural.</p>' : '');
      const bm = $('#rede-fim .rede-mais'); if (bm) bm.addEventListener('click', () => carregarFeed(false));
    } catch (er) { if (inicio) lista.innerHTML = `<p class="erro-msg">${esc(er.message)}</p>`; else VB.erro(er); }
    finally { if (geracao === estado.geracao) estado.carregando = false; }
  }
  // Chegou publicação nova? Mostra um aviso no topo do mural (sem pular a leitura de quem está rolando)
  let tVigia;
  function vigiar() {
    clearInterval(tVigia);
    tVigia = setInterval(async () => {
      if (!/^#\/inicio/.test(location.hash) || !$('#rede-novos')) return clearInterval(tVigia);
      if (document.hidden) return;
      try {
        const d = await VB.api(`/api/rede/novos?depois=${estado.ultimoId}`);
        const b = $('#rede-novos'); if (!b) return;
        b.classList.toggle('oculto', !d.novos);
        b.textContent = d.novos === 1 ? 'Ver 1 nova publicação' : `Ver ${d.novos} novas publicações`;
        b.onclick = () => { b.classList.add('oculto'); carregarFeed(true); carregarStatus(); };
      } catch { /* sem conexão: tenta na próxima */ }
    }, 45000);
  }

  function fotosHtml(imgs) {
    if (!imgs.length) return '';
    const n = imgs.length, vis = imgs.slice(0, 4);
    const um = n === 1 && imgs[0].largura && imgs[0].altura ? ` style="aspect-ratio:${imgs[0].largura}/${Math.min(imgs[0].altura, imgs[0].largura * 1.35)}"` : '';
    return `<div class="post-fotos n${Math.min(n, 4)}">${vis.map((im, i) => `<button type="button" class="pf" data-i="${i}" aria-label="Ver foto ${i + 1} de ${n}"${n === 1 ? um : ''}>
      <img src="${esc(im.url)}" alt="" loading="lazy" decoding="async">${i === 3 && n > 4 ? `<span class="pf-mais">+${n - 4}</span>` : ''}</button>`).join('')}</div>`;
  }
  function comentarioHtml(c) {
    return `<li class="coment" data-cid="${c.id}">${VB.avatar(c.autor, 'mini')}<div class="coment-bolha"><strong>${esc(c.autor.nome)}</strong>${seloProf(c.autor)}
      <p>${textoHtml(c.texto)}</p></div><div class="coment-meta"><time>${VB.quando(c.criado_em)}</time>${c.pode_apagar || c.autor.id === VB.me.id || VB.me.papel === 'professor' ? `<button type="button" class="link-btn" data-apagar-coment="${c.id}">Apagar</button>` : ''}</div></li>`;
  }
  function postHtml(p) {
    const longo = p.texto.length > 420 || (p.texto.match(/\n/g) || []).length > 7;
    return `<article class="post painel${p.informativo ? ' post-informativo' : ''}" data-id="${p.id}">
      ${p.informativo ? `<div class="post-faixa">${VB.icone.alfinete}Informativo da igreja</div>` : ''}
      <header class="post-cab">${VB.avatar(p.autor)}<div class="post-quem"><strong>${esc(p.autor.nome)}</strong>${seloProf(p.autor)}
        <span class="post-sub">${p.autor.arroba ? `<span class="arroba">@${esc(p.autor.arroba)}</span> · ` : ''}<time datetime="${esc(p.criado_em)}">${VB.quando(p.criado_em)}${p.editado_em ? ' · editado' : ''}</time></span></div>
        ${p.pode_apagar || p.pode_editar ? `<button type="button" class="icone-btn post-menu" data-abre-flut aria-label="Opções da publicação">${ic.pontos}</button>` : ''}</header>
      ${p.texto ? `<div class="post-texto${longo ? ' longo' : ''}">${textoHtml(p.texto)}</div>${longo ? '<button type="button" class="link-btn ver-mais">Ver mais</button>' : ''}` : ''}
      ${fotosHtml(p.imagens)}
      <div class="post-resumo"><button type="button" class="link-btn rr" ${p.reacoes.total ? '' : 'hidden'}>${resumoReacoes(p.reacoes)}</button>
        <button type="button" class="link-btn rc" ${p.comentarios_total ? '' : 'hidden'}>${p.comentarios_total} comentário${p.comentarios_total > 1 ? 's' : ''}</button></div>
      <div class="post-acoes">
        <button type="button" class="pa-reagir${p.reacoes.minha ? ' marcado' : ''}" data-abre-flut aria-haspopup="menu">${p.reacoes.minha ? `<span class="pa-emoji">${R[p.reacoes.minha][1]}</span>${R[p.reacoes.minha][2]}` : `${ic.sorriso}Reagir`}</button>
        <button type="button" class="pa-comentar">${ic.balao}Comentar</button>
      </div>
      <div class="post-coments">
        ${p.comentarios_total > p.comentarios.length ? `<button type="button" class="link-btn ver-todos">Ver os ${p.comentarios_total} comentários</button>` : ''}
        <ul class="coments">${p.comentarios.map(comentarioHtml).join('')}</ul>
        <form class="coment-form">${VB.avatar(VB.me, 'mini')}<label class="sr" for="cf-${p.id}">Escreva um comentário</label>
          <textarea id="cf-${p.id}" rows="1" maxlength="2000" placeholder="Escreva um comentário…"></textarea>
          <button type="submit" class="icone-btn cf-enviar" aria-label="Enviar comentário" disabled>${ic.enviar}</button></form>
      </div>
    </article>`;
  }

  function ligarPost(el, p) {
    const vm = $('.ver-mais', el);
    if (vm) vm.addEventListener('click', () => { $('.post-texto', el).classList.remove('longo'); vm.remove(); });
    $$('.pf', el).forEach(b => b.addEventListener('click', () => galeria(p.imagens, Number(b.dataset.i))));
    // reações
    const br = $('.pa-reagir', el);
    br.addEventListener('click', () => escolherReacao(br, p.reacoes.minha, async tipo => {
      try { p.reacoes = await VB.api('/api/rede/reacao', { method: 'POST', body: { alvo: 'post', id: p.id, tipo } }); desenharReacoes(); } catch (er) { VB.erro(er); }
    }));
    const desenharReacoes = () => {
      const m = p.reacoes.minha;
      br.classList.toggle('marcado', !!m);
      br.innerHTML = m ? `<span class="pa-emoji">${R[m][1]}</span>${R[m][2]}` : `${ic.sorriso}Reagir`;
      const rr = $('.rr', el); rr.hidden = !p.reacoes.total; rr.innerHTML = resumoReacoes(p.reacoes);
    };
    $('.rr', el).addEventListener('click', () => quemReagiu('post', p.id));
    // comentários
    const form = $('.coment-form', el), ta = $('textarea', form), env = $('.cf-enviar', form);
    autoAltura(ta);
    ta.addEventListener('input', () => { env.disabled = !ta.value.trim(); });
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && matchMedia('(hover: hover)').matches) { e.preventDefault(); form.requestSubmit(); } });
    $('.pa-comentar', el).addEventListener('click', () => ta.focus());
    $('.rc', el).addEventListener('click', () => verTodos());
    const atualizaTotal = n => { p.comentarios_total = n; const rc = $('.rc', el); rc.hidden = !n; rc.textContent = `${n} comentário${n > 1 ? 's' : ''}`; };
    const ligarApagar = raiz => $$('[data-apagar-coment]', raiz).forEach(b => b.addEventListener('click', async () => {
      if (!await VB.confirmar('Apagar comentário', 'O comentário será apagado para todos.', 'Apagar')) return;
      try { const r = await VB.api(`/api/rede/comentarios/${b.dataset.apagarComent}`, { method: 'DELETE' }); b.closest('.coment').remove(); atualizaTotal(r.total); } catch (er) { VB.erro(er); }
    }));
    ligarApagar(el);
    async function verTodos() {
      try {
        const lista = await VB.api(`/api/rede/comentarios/post/${p.id}`);
        $('.coments', el).innerHTML = lista.map(comentarioHtml).join(''); ligarApagar(el);
        const vt = $('.ver-todos', el); if (vt) vt.remove();
      } catch (er) { VB.erro(er); }
    }
    const vt = $('.ver-todos', el); if (vt) vt.addEventListener('click', verTodos);
    form.addEventListener('submit', async e => {
      e.preventDefault(); const texto = ta.value.trim(); if (!texto) return;
      env.disabled = true;
      try {
        const c = await VB.api(`/api/rede/comentarios/post/${p.id}`, { method: 'POST', body: { texto } });
        $('.coments', el).insertAdjacentHTML('beforeend', comentarioHtml(c)); ligarApagar($('.coments', el).lastElementChild);
        ta.value = ''; ta.dispatchEvent(new Event('input')); atualizaTotal(c.total);
      } catch (er) { VB.erro(er); env.disabled = false; }
    });
    // menu: editar / apagar
    const bm = $('.post-menu', el);
    if (bm) bm.addEventListener('click', () => {
      const f = abrirFlut(bm, `${p.pode_editar ? `<button type="button" data-a="editar">${ic.lapis}Editar texto</button>` : ''}
        ${ehLider() && p.autor.id === VB.me.id ? `<button type="button" data-a="info">${VB.icone.alfinete}${p.informativo ? 'Tirar do mural de informações' : 'Pôr no mural de informações'}</button>` : ''}
        ${p.pode_apagar ? `<button type="button" data-a="apagar" class="perigo">${ic.lixo}Apagar publicação</button>` : ''}`, 'menu');
      $$('button', f).forEach(b => b.addEventListener('click', async () => {
        fecharFlut();
        if (b.dataset.a === 'apagar') {
          if (!await VB.confirmar('Apagar publicação', p.autor.id === VB.me.id ? 'A publicação, as fotos e os comentários serão apagados.' : `A publicação de ${esc(p.autor.nome)}, com as fotos e os comentários, será apagada para todos.`, 'Apagar')) return;
          try { await VB.api(`/api/rede/posts/${p.id}`, { method: 'DELETE' }); el.remove(); VB.toast('Publicação apagada'); } catch (er) { VB.erro(er); }
        } else if (b.dataset.a === 'info') {
          try { await VB.api(`/api/rede/posts/${p.id}`, { method: 'PUT', body: { texto: p.texto, informativo: !p.informativo } }); p.informativo = !p.informativo;
            const novo = document.createElement('div'); novo.innerHTML = postHtml(p); const art = novo.firstElementChild; el.replaceWith(art); ligarPost(art, p);
            VB.toast(p.informativo ? 'Está no mural de informações' : 'Saiu do mural de informações'); } catch (er) { VB.erro(er); }
        } else editar();
      }));
    });
    function editar() {
      const alvo = $('.post-texto', el);
      const box = document.createElement('div'); box.className = 'post-editar';
      box.innerHTML = `<textarea class="input" rows="3" maxlength="5000" aria-label="Texto da publicação">${esc(p.texto)}</textarea>
        <div class="post-editar-acoes"><button type="button" class="btn sec mini" data-c>Cancelar</button><button type="button" class="btn mini" data-s>Salvar</button></div>`;
      if (alvo) alvo.replaceWith(box); else $('.post-cab', el).after(box);
      const vm2 = $('.ver-mais', el); if (vm2) vm2.remove();
      const t = $('textarea', box); autoAltura(t); t.focus();
      const volta = () => { box.outerHTML = p.texto ? `<div class="post-texto">${textoHtml(p.texto)}</div>` : ''; };
      $('[data-c]', box).addEventListener('click', volta);
      $('[data-s]', box).addEventListener('click', async () => {
        try { const r = await VB.api(`/api/rede/posts/${p.id}`, { method: 'PUT', body: { texto: t.value } }); p.texto = r.texto; volta();
          const tm = $('.post-quem time', el); if (!/editado/.test(tm.textContent)) tm.textContent += ' · editado'; } catch (er) { VB.erro(er); }
      });
    }
  }

  rede._desenharPost = (el, p) => { el.innerHTML = postHtml(p); ligarPost(el.firstElementChild, p); };
  // Mural de informações da igreja (informativos e cartazes da liderança)
  rede.informativos = async function (el, limite) {
    if (!el) return;
    try {
      const lista = (await VB.api('/api/rede/informativos')).slice(0, limite || 40);
      el.innerHTML = lista.length ? '' : `<div class="vazio" style="border:0;padding:1rem 0">${ehLider() ? 'Publique um informativo no mural (marque “Informativo da igreja”) e ele aparece aqui para todos.' : 'Nenhum informativo por enquanto.'}</div>`;
      for (const p of lista) { const d = document.createElement('div'); d.innerHTML = postHtml(p); const art = d.firstElementChild; el.appendChild(art); ligarPost(art, p); }
    } catch (er) { el.innerHTML = `<p class="muted">${esc(er.message)}</p>`; }
  };

  async function quemReagiu(alvo, id) {
    try {
      const lista = await VB.api(`/api/rede/reacoes/${alvo}/${id}`);
      VB.modal({ titulo: 'Reações', corpo: `<ul class="rede-pessoas">${lista.map(r => `<li>${VB.avatar(r.pessoa)}<span>${esc(r.pessoa.nome)}</span><i>${R[r.tipo] ? R[r.tipo][1] : ''}</i></li>`).join('')}</ul>` });
    } catch (er) { VB.erro(er); }
  }

  // ── Fotos em tela cheia
  function galeria(imgs, i) {
    const el = document.createElement('div'); el.className = 'rede-galeria'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Fotos');
    el.innerHTML = `<button type="button" class="rg-fechar" aria-label="Fechar">${ic.fechar}</button>
      ${imgs.length > 1 ? `<button type="button" class="rg-ant" aria-label="Foto anterior">${ic.esq}</button><button type="button" class="rg-prox" aria-label="Próxima foto">${ic.dir}</button>` : ''}
      <img alt=""><span class="rg-cont"></span>`;
    document.body.appendChild(el); document.body.classList.add('sem-rolagem');
    const img = $('img', el);
    const mostra = () => { img.src = imgs[i].url; $('.rg-cont', el).textContent = imgs.length > 1 ? `${i + 1} de ${imgs.length}` : ''; };
    const ir = d => { i = (i + d + imgs.length) % imgs.length; mostra(); };
    const fechar = () => { el.remove(); document.body.classList.remove('sem-rolagem'); document.removeEventListener('keydown', tecla); };
    const tecla = e => { if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') ir(-1); if (e.key === 'ArrowRight') ir(1); };
    document.addEventListener('keydown', tecla);
    $('.rg-fechar', el).addEventListener('click', fechar);
    if (imgs.length > 1) { $('.rg-ant', el).addEventListener('click', () => ir(-1)); $('.rg-prox', el).addEventListener('click', () => ir(1)); }
    el.addEventListener('click', e => { if (e.target === el) fechar(); });
    let x0 = null; el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => { if (x0 == null || imgs.length < 2) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1); x0 = null; });
    mostra(); $('.rg-fechar', el).focus();
  }

  // ════════ Status (24 horas)
  let grupos = [], cores = [];
  async function carregarStatus() {
    const faixa = $('#status-faixa'); if (!faixa) return;
    try { const d = await VB.api('/api/rede/status'); grupos = d.grupos; cores = d.cores; } catch { grupos = []; }
    const meu = grupos.find(g => g.pessoa.id === VB.me.id);
    faixa.innerHTML = `
      <div class="st-item st-meu">
        <button type="button" class="st-anel ${meu ? 'visto' : 'vazio'}" data-meu aria-label="${meu ? 'Ver o seu status' : 'Postar um status'}">${VB.avatar(VB.me)}</button>
        <button type="button" class="st-novo" aria-label="Postar um status">${ic.mais}</button>
        <span>Seu status</span></div>
      ${grupos.filter(g => g.pessoa.id !== VB.me.id).map(g => `<div class="st-item"><button type="button" class="st-anel ${g.novos ? 'novo' : 'visto'}" data-u="${g.pessoa.id}" aria-label="Ver status de ${esc(g.pessoa.nome)}">${VB.avatar(g.pessoa)}</button><span>${esc(nomeCurto(g.pessoa))}</span></div>`).join('')}
      ${grupos.filter(g => g.pessoa.id !== VB.me.id).length ? '' : `<p class="st-dica muted pequeno">Os status da ${grupo()} aparecem aqui e somem depois de 24 horas.</p>`}`;
    $('.st-novo', faixa).addEventListener('click', criarStatus);
    $('[data-meu]', faixa).addEventListener('click', () => meu ? verStatus(grupos.indexOf(meu), 0) : criarStatus());
    $$('[data-u]', faixa).forEach(b => b.addEventListener('click', () => {
      const gi = grupos.findIndex(g => g.pessoa.id === Number(b.dataset.u)); const g = grupos[gi];
      verStatus(gi, Math.max(0, g.itens.findIndex(i => !i.visto)));
    }));
  }
  rede.carregarStatus = carregarStatus;

  function criarStatus() {
    let cor = cores[0] || '#1E3B2C', foto = null;
    const m = VB.modal({
      titulo: 'Novo status',
      corpo: `<p class="muted pequeno" style="margin:0 0 .9rem">O status fica no ar por 24 horas. ${grupo() === 'igreja' ? 'A igreja' : 'A turma'} pode reagir e comentar.</p>
        <div class="stc-abas" role="tablist"><button type="button" role="tab" aria-selected="true" data-m="texto">Texto</button><button type="button" role="tab" aria-selected="false" data-m="foto">Foto</button></div>
        <div class="stc-previa" id="stc-previa" style="background:${cor}">
          <textarea id="stc-texto" maxlength="700" rows="4" placeholder="Escreva seu status…" aria-label="Texto do status"></textarea>
          <img id="stc-img" alt="" hidden>
        </div>
        <div class="stc-cores" id="stc-cores">${cores.map(c => `<button type="button" style="background:${c}" data-cor="${c}" aria-label="Fundo nesta cor" aria-pressed="${c === cor}"></button>`).join('')}</div>
        <div id="stc-foto" hidden><label class="btn sec" style="width:100%">${ic.foto}Escolher foto<input type="file" accept="image/*" class="sr" id="stc-arq"></label>
          <label class="campo" style="margin:.8rem 0 0"><span>Legenda (opcional)</span><input class="input" id="stc-leg" maxlength="300"></label></div>`,
      rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="stc-pub" disabled>Publicar status</button>`,
    });
    const el = m.el, prev = $('#stc-previa', el), ta = $('#stc-texto', el), pub = $('#stc-pub', el);
    let modo = 'texto';
    const ok = () => { pub.disabled = modo === 'texto' ? !ta.value.trim() : !foto; };
    ta.addEventListener('input', ok);
    $$('[data-cor]', el).forEach(b => b.addEventListener('click', () => { cor = b.dataset.cor; prev.style.background = cor; $$('[data-cor]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
    $$('.stc-abas button', el).forEach(b => b.addEventListener('click', () => {
      modo = b.dataset.m; $$('.stc-abas button', el).forEach(x => x.setAttribute('aria-selected', x === b));
      ta.hidden = modo !== 'texto'; $('#stc-cores', el).hidden = modo !== 'texto'; $('#stc-foto', el).hidden = modo !== 'foto';
      $('#stc-img', el).hidden = modo !== 'foto' || !foto; prev.classList.toggle('foto', modo === 'foto'); ok();
    }));
    $('#stc-arq', el).addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return; foto = await reduzir(f, 1440, .85);
      const im = $('#stc-img', el); im.src = URL.createObjectURL(foto.blob); im.hidden = false; ok();
    });
    pub.addEventListener('click', async () => {
      const fd = new FormData();
      if (modo === 'texto') { fd.append('texto', ta.value); fd.append('cor', cor); }
      else { fd.append('texto', $('#stc-leg', el).value); fd.append('imagem', foto.blob, foto.nome); }
      pub.disabled = true; pub.textContent = 'Publicando…';
      try { await VB.enviar('/api/rede/status', fd); m.fechar(); VB.toast('Status publicado'); carregarStatus(); }
      catch (er) { VB.erro(er); pub.disabled = false; pub.textContent = 'Publicar status'; }
    });
  }

  // Visualizador de status em tela cheia
  function verStatus(gi, ii) {
    const DUR = 6000;
    const el = document.createElement('div'); el.className = 'st-tela'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    document.body.appendChild(el); document.body.classList.add('sem-rolagem');
    let t0 = 0, gasto = 0, pausado = false, raf = 0;
    const fechar = () => { cancelAnimationFrame(raf); el.remove(); document.body.classList.remove('sem-rolagem'); document.removeEventListener('keydown', tecla); carregarStatus(); };
    const tecla = e => { if (e.target.matches('textarea, input')) return; if (e.key === 'Escape') fechar(); if (e.key === 'ArrowRight') ir(1); if (e.key === 'ArrowLeft') ir(-1); };
    document.addEventListener('keydown', tecla);
    function ir(d) {
      const g = grupos[gi]; ii += d;
      if (ii >= g.itens.length) { gi++; ii = 0; if (gi >= grupos.length) return fechar(); }
      if (ii < 0) { gi--; if (gi < 0) { gi = 0; ii = 0; } else ii = grupos[gi].itens.length - 1; }
      mostrar();
    }
    function mostrar() {
      const g = grupos[gi], s = g.itens[ii], meu = g.pessoa.id === VB.me.id;
      gasto = 0; t0 = performance.now(); pausado = false;
      if (!s.visto && !meu) { s.visto = true; VB.api(`/api/rede/status/${s.id}/visto`, { method: 'POST' }).catch(() => {}); }
      el.innerHTML = `<div class="st-caixa">
        <div class="st-barras">${g.itens.map((x, k) => `<i><b style="width:${k < ii ? 100 : 0}%"></b></i>`).join('')}</div>
        <header class="st-cab">${VB.avatar(g.pessoa)}<div><strong>${esc(meu ? 'Seu status' : g.pessoa.nome)}</strong><time>${!meu && g.pessoa.arroba ? `@${esc(g.pessoa.arroba)} · ` : ''}${VB.quando(s.criado_em)}</time></div>
          ${s.pode_apagar ? `<button type="button" class="st-btn" data-apagar aria-label="Apagar este status">${ic.lixo}</button>` : ''}
          <button type="button" class="st-btn" data-fechar aria-label="Fechar">${ic.fechar}</button></header>
        <div class="st-conteudo ${s.imagem ? 'foto' : 'texto'}" style="${s.imagem ? '' : `background:${esc(s.cor || '#1E3B2C')}`}">
          ${s.imagem ? `<img src="${esc(s.imagem)}" alt="">${s.texto ? `<p class="st-legenda">${textoHtml(s.texto)}</p>` : ''}` : `<p class="st-texto${s.texto.length > 140 ? ' menor' : ''}">${textoHtml(s.texto)}</p>`}
          <button type="button" class="st-zona ant" aria-label="Anterior"></button><button type="button" class="st-zona prox" aria-label="Próximo"></button>
        </div>
        <footer class="st-rodape">
          ${meu ? `<button type="button" class="st-vistos" data-vistos>${ic.olho}<span>Visto por ${s.vistos || 0}</span></button>` :
            `<div class="st-reacoes" role="group" aria-label="Reagir">${REACOES.map(([k, e, n]) => `<button type="button" data-r="${k}" class="${s.reacoes.minha === k ? 'atual' : ''}" aria-label="${n}" title="${n}">${e}</button>`).join('')}</div>`}
          <button type="button" class="st-comentar" data-coments aria-label="Comentários">${ic.balao}<span>${s.comentarios_total || ''}</span></button>
        </footer>
        <section class="st-painel" hidden></section>
      </div>`;
      $('[data-fechar]', el).addEventListener('click', fechar);
      $('.st-zona.ant', el).addEventListener('click', () => ir(-1));
      $('.st-zona.prox', el).addEventListener('click', () => ir(1));
      const cont = $('.st-conteudo', el);
      cont.addEventListener('pointerdown', () => { pausado = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => cont.addEventListener(ev, () => { if (!$('.st-painel', el).hidden) return; if (pausado) { pausado = false; t0 = performance.now() - gasto; } }));
      const ap = $('[data-apagar]', el);
      if (ap) ap.addEventListener('click', async () => {
        pausado = true;
        if (!await VB.confirmar('Apagar status', 'Este status sai do ar para todos.', 'Apagar')) { pausado = false; t0 = performance.now() - gasto; return; }
        try { await VB.api(`/api/rede/status/${s.id}`, { method: 'DELETE' }); g.itens.splice(ii, 1);
          if (!g.itens.length) { grupos.splice(gi, 1); return fechar(); } if (ii >= g.itens.length) ii = g.itens.length - 1; mostrar(); } catch (er) { VB.erro(er); }
      });
      $$('.st-reacoes button', el).forEach(b => b.addEventListener('click', async () => {
        const tipo = s.reacoes.minha === b.dataset.r ? null : b.dataset.r;
        try { s.reacoes = await VB.api('/api/rede/reacao', { method: 'POST', body: { alvo: 'status', id: s.id, tipo } });
          $$('.st-reacoes button', el).forEach(x => x.classList.toggle('atual', x.dataset.r === s.reacoes.minha));
          if (tipo) { b.classList.remove('pulo'); void b.offsetWidth; b.classList.add('pulo'); }
        } catch (er) { VB.erro(er); }
      }));
      const painel = $('.st-painel', el);
      const abrirPainel = async html => { pausado = true; painel.hidden = false; painel.innerHTML = html; };
      const fecharPainel = () => { painel.hidden = true; painel.innerHTML = ''; pausado = false; t0 = performance.now() - gasto; };
      const vb = $('[data-vistos]', el);
      if (vb) vb.addEventListener('click', async () => {
        try {
          const lista = await VB.api(`/api/rede/status/${s.id}/vistos`);
          await abrirPainel(`<div class="stp-cab"><h3>Visto por ${lista.length}</h3><button type="button" class="st-btn" data-x aria-label="Fechar lista">${ic.fechar}</button></div>
            ${lista.length ? `<ul class="rede-pessoas">${lista.map(v => `<li>${VB.avatar(v.pessoa)}<span>${esc(v.pessoa.nome)}<small>${VB.quando(v.visto_em)}</small></span><i>${v.tipo && R[v.tipo] ? R[v.tipo][1] : ''}</i></li>`).join('')}</ul>` : '<p class="muted">Ninguém viu ainda.</p>'}`);
          $('[data-x]', painel).addEventListener('click', fecharPainel);
        } catch (er) { VB.erro(er); }
      });
      $('[data-coments]', el).addEventListener('click', async () => {
        try {
          const lista = await VB.api(`/api/rede/comentarios/status/${s.id}`);
          await abrirPainel(`<div class="stp-cab"><h3>Comentários</h3><button type="button" class="st-btn" data-x aria-label="Fechar comentários">${ic.fechar}</button></div>
            <ul class="coments">${lista.length ? lista.map(comentarioHtml).join('') : ''}</ul>
            <form class="coment-form">${VB.avatar(VB.me, 'mini')}<textarea rows="1" maxlength="2000" placeholder="Comente o status de ${esc(meu ? 'você' : nomeCurto(g.pessoa))}…" aria-label="Escreva um comentário"></textarea>
            <button type="submit" class="icone-btn cf-enviar" aria-label="Enviar comentário" disabled>${ic.enviar}</button></form>`);
          $('[data-x]', painel).addEventListener('click', fecharPainel);
          const f = $('form', painel), t = $('textarea', f), env = $('.cf-enviar', f);
          autoAltura(t); t.addEventListener('input', () => { env.disabled = !t.value.trim(); }); t.focus();
          const ligarApagar = r => $$('[data-apagar-coment]', r).forEach(b => b.addEventListener('click', async () => {
            try { const x = await VB.api(`/api/rede/comentarios/${b.dataset.apagarComent}`, { method: 'DELETE' }); b.closest('.coment').remove(); s.comentarios_total = x.total; } catch (er) { VB.erro(er); }
          }));
          ligarApagar(painel);
          t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && matchMedia('(hover: hover)').matches) { e.preventDefault(); f.requestSubmit(); } });
          f.addEventListener('submit', async e => {
            e.preventDefault(); const texto = t.value.trim(); if (!texto) return; env.disabled = true;
            try { const c = await VB.api(`/api/rede/comentarios/status/${s.id}`, { method: 'POST', body: { texto } });
              $('.coments', painel).insertAdjacentHTML('beforeend', comentarioHtml(c)); ligarApagar($('.coments', painel).lastElementChild);
              s.comentarios_total = c.total; t.value = ''; t.dispatchEvent(new Event('input'));
              $('[data-coments] span', el).textContent = c.total;
            } catch (er) { VB.erro(er); env.disabled = false; }
          });
        } catch (er) { VB.erro(er); }
      });
      $('[data-fechar]', el).focus({ preventScroll: true });
    }
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function passo(agora) {
      raf = requestAnimationFrame(passo);
      if (!el.isConnected) return cancelAnimationFrame(raf);
      if (pausado) return;
      gasto = agora - t0;
      const b = $$('.st-barras b', el)[ii]; if (b) b.style.width = Math.min(100, gasto / DUR * 100) + '%';
      if (gasto >= DUR && !reduz) ir(1);
    }
    mostrar(); raf = requestAnimationFrame(passo);
  }

  // ════════ Foto de perfil (página Perfil)
  rede.blocoFoto = function (el) {
    const desenhar = () => {
      el.innerHTML = `<h3>Como você aparece na rede</h3>
        <div class="perfil-foto">${VB.avatar(VB.me, 'grande')}
          <div><p class="muted pequeno" style="margin:0 0 .8rem">A foto aparece nas suas publicações, comentários e status.</p>
          <div class="acoes-linha"><label class="btn sec">${ic.foto}${VB.me.foto ? 'Trocar foto' : 'Escolher foto'}<input type="file" accept="image/*" class="sr" id="pf-arq"></label>
          ${VB.me.foto ? '<button type="button" class="btn fantasma" id="pf-tirar">Remover foto</button>' : ''}</div></div></div>
        <form id="pf-form" class="pf-form" novalidate>
          <label class="campo"><span>Nome de exibição</span><input class="input" name="apelido" maxlength="40" value="${esc(VB.me.apelido || '')}" placeholder="${esc(VB.me.nome)}">
            <small>É o nome que a ${grupo()} vê. Se ficar vazio, aparece o nome do cadastro: ${esc(VB.me.nome)}.</small></label>
          <label class="campo"><span>Seu @</span><div class="campo-arroba"><b aria-hidden="true">@</b><input class="input" name="arroba" maxlength="21" autocapitalize="none" autocomplete="off" spellcheck="false" value="${esc(VB.me.arroba || '')}" placeholder="seu.nome"></div>
            <small>De 3 a 20 caracteres: letras sem acento, números, ponto e sublinhado. Aparece ao lado do seu nome nas publicações.</small></label>
          <p class="erro-msg" id="pf-erro"></p>
          <button class="btn" type="submit">Salvar nome e @</button>
        </form>`;
      const ar = $('[name=arroba]', el);
      ar.addEventListener('input', () => { const v = ar.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/^@+/, '').replace(/\s+/g, '.').replace(/[^a-z0-9._]/g, ''); if (v !== ar.value) ar.value = v; });
      $('#pf-form', el).addEventListener('submit', async e => {
        e.preventDefault(); $('#pf-erro', el).textContent = '';
        try {
          const d = await VB.api('/api/me/perfil', { method: 'PUT', body: { apelido: $('[name=apelido]', el).value, arroba: ar.value } });
          VB.me.apelido = d.apelido; VB.me.arroba = d.arroba; atualizaTopo(); VB.toast('Nome e @ salvos');
          const n = $('.topo .usuario-chip .nome'); if (n) n.textContent = VB.primeiroNome(VB.nomeExibicao(VB.me));
        } catch (er) { $('#pf-erro', el).textContent = er.message; }
      });
      $('#pf-arq', el).addEventListener('change', async e => {
        const f = e.target.files[0]; if (!f) return;
        try {
          const r = await recortarQuadrado(f);
          const fd = new FormData(); fd.append('foto', r, 'perfil.jpg');
          const d = await VB.enviar('/api/me/foto', fd, 'PUT'); VB.me.foto = d.foto; desenhar(); atualizaTopo(); VB.toast('Foto atualizada');
        } catch (er) { VB.erro(er); }
      });
      const t = $('#pf-tirar', el);
      if (t) t.addEventListener('click', async () => { try { await VB.api('/api/me/foto', { method: 'DELETE' }); VB.me.foto = null; desenhar(); atualizaTopo(); } catch (er) { VB.erro(er); } });
    };
    desenhar();
  };
  function atualizaTopo() { const a = $('.topo .usuario-chip .avatar'); if (a) a.outerHTML = VB.avatar(VB.me); }
  // Foto de perfil: recorta o centro em quadrado de 512 px
  function recortarQuadrado(arquivo) {
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo), img = new Image();
      img.onload = () => {
        const lado = Math.min(img.naturalWidth, img.naturalHeight), t = Math.min(512, lado);
        const c = document.createElement('canvas'); c.width = c.height = t;
        c.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, t, t);
        URL.revokeObjectURL(url); c.toBlob(b => b ? ok(b) : falha(new Error('Não foi possível ler esta imagem.')), 'image/jpeg', .88);
      };
      img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('Não foi possível ler esta imagem. Tente uma foto JPG ou PNG.')); };
      img.src = url;
    });
  }
})();

/* ════════ Notificações, versículo do dia e página de uma publicação */
(function () {
  const { esc, icone, $, $$ } = VB;
  const rede = VB.rede;
  const ICO_TIPO = { reacao: '❤️', comentario: '💬', professor_post: '📣', aviso: '📌', curso: '🎓', inscricao: '🙋' };

  // ── Sino (contador de não lidas)
  let naoLidas = 0, tSino = null;
  function pintarSino() {
    $$('.sino-badge').forEach(b => { b.hidden = !naoLidas; b.textContent = naoLidas > 9 ? '9+' : naoLidas; });
    $$('[data-sino]').forEach(b => b.setAttribute('aria-label', naoLidas ? `Notificações: ${naoLidas} não lida${naoLidas > 1 ? 's' : ''}` : 'Notificações'));
  }
  async function contar() {
    if (!VB.me || document.hidden) return;
    try { naoLidas = (await VB.api('/api/notificacoes/contagem')).nao_lidas; pintarSino(); } catch { /* sem conexão */ }
  }
  rede.ligarSino = function (botao) {
    if (!botao) return;
    botao.setAttribute('data-sino', '');
    botao.addEventListener('click', e => { e.preventDefault(); abrirPainel(botao); });
    pintarSino(); contar();
    if (!tSino) { tSino = setInterval(contar, 60000); document.addEventListener('visibilitychange', () => { if (!document.hidden) contar(); }); }
  };

  // ── Painel de notificações
  let painel = null;
  function fecharPainel() { if (painel) { painel.remove(); painel = null; document.removeEventListener('pointerdown', fora, true); document.removeEventListener('keydown', tecla); } }
  function fora(e) { if (painel && !painel.contains(e.target) && !e.target.closest('[data-sino]')) fecharPainel(); }
  function tecla(e) { if (e.key === 'Escape') fecharPainel(); }
  async function abrirPainel(botao) {
    if (painel) return fecharPainel();
    painel = document.createElement('div'); painel.className = 'notif-painel'; painel.setAttribute('role', 'dialog'); painel.setAttribute('aria-label', 'Notificações');
    painel.innerHTML = `<div class="np-cab"><h2>Notificações</h2><button type="button" class="link-btn" id="np-todas">Marcar todas como lidas</button>
      <button type="button" class="icone-btn np-fechar" aria-label="Fechar">${icone.fechar}</button></div><div class="np-lista"><div class="carregando mini"></div></div>
      <a class="np-ajustes" href="#/perfil">Escolher o que receber</a>`;
    document.body.appendChild(painel);
    const r = botao.getBoundingClientRect();
    if (innerWidth > 720) { painel.style.top = r.bottom + 8 + 'px'; painel.style.right = Math.max(12, innerWidth - r.right - 8) + 'px'; }
    setTimeout(() => { document.addEventListener('pointerdown', fora, true); document.addEventListener('keydown', tecla); });
    $('.np-fechar', painel).addEventListener('click', fecharPainel);
    $('.np-ajustes', painel).addEventListener('click', () => { fecharPainel(); setTimeout(() => { const n = $('#perfil-notif'); if (n) n.scrollIntoView({ behavior: 'smooth' }); }, 400); });
    let d;
    try { d = await VB.api('/api/notificacoes'); } catch (er) { $('.np-lista', painel).innerHTML = `<p class="erro-msg" style="padding:16px">${esc(er.message)}</p>`; return; }
    if (!painel) return;
    naoLidas = d.nao_lidas; pintarSino();
    $('.np-lista', painel).innerHTML = d.lista.length ? d.lista.map(n => `
      <button type="button" class="np-item${n.lida ? '' : ' nova'}" data-id="${n.id}" data-link="${esc(n.link || '')}">
        <span class="np-av">${n.ator ? VB.avatar(n.ator) : '<span class="avatar np-sis" aria-hidden="true"><img src="/img/logo.svg" alt=""></span>'}<i aria-hidden="true">${ICO_TIPO[n.tipo] || '🔔'}</i></span>
        <span class="np-txt">${esc(n.texto)}<time>${VB.quando(n.criado_em)}</time></span>
        ${n.lida ? '' : '<span class="np-ponto" aria-label="Não lida"></span>'}
      </button>`).join('') : `<div class="np-vazio"><strong>Nada por aqui ainda</strong>Quando alguém reagir ou comentar no que você publicou, ${VB.me && VB.me.igreja ? 'ou quando a liderança publicar um informativo, aparece aqui.' : 'ou quando o professor liberar um curso, aparece aqui.'}</div>`;
    $$('.np-item', painel).forEach(b => b.addEventListener('click', async () => {
      if (b.classList.contains('nova')) { VB.api('/api/notificacoes/lidas', { method: 'POST', body: { id: Number(b.dataset.id) } }).catch(() => {}); naoLidas = Math.max(0, naoLidas - 1); pintarSino(); }
      fecharPainel();
      if (b.dataset.link) { if (location.hash === b.dataset.link) VB.rota(); else location.hash = b.dataset.link; }
    }));
    $('#np-todas', painel).addEventListener('click', async () => {
      try { await VB.api('/api/notificacoes/lidas', { method: 'POST', body: {} }); naoLidas = 0; pintarSino();
        $$('.np-item.nova', painel).forEach(x => { x.classList.remove('nova'); const p = $('.np-ponto', x); if (p) p.remove(); }); } catch (er) { VB.erro(er); }
    });
  }

  // ── Uma publicação (aberta pela notificação)
  VB.registrar(/^\/post\/(\d+)$/, 'todos', async id => {
    VB.molduraAluno('inicio', '<div class="carregando"></div>');
    document.title = 'Publicação · VideiraBook';
    try {
      const p = await VB.api(`/api/rede/posts/${id}`);
      $('#conteudo').innerHTML = `<div class="post-unico"><a class="btn fantasma" href="#/inicio" style="margin-bottom:12px">${VB.icone.cima.replace('<path d="M6 15l6-6 6 6"/>', '<path d="M15 6l-6 6 6 6"/>')}Voltar ao mural</a><div id="post-um"></div></div>`;
      rede._desenharPost($('#post-um'), p);
    } catch (er) {
      $('#conteudo').innerHTML = `<div class="post-unico"><div class="rede-vazio painel"><h3>Esta publicação não está mais no mural</h3><p class="muted">Ela pode ter sido apagada por quem publicou.</p><a class="btn" href="#/inicio" style="margin-top:1rem">Ir para o mural</a></div></div>`;
    }
  });

  // ── Versículo do dia
  rede.versiculoDoDia = async function (el) {
    if (!el) return;
    try {
      const v = await VB.api('/api/versiculo-do-dia');
      const livro = VB.LIVROS && VB.LIVROS[v.livro];
      const ref = `${livro ? livro[0] : ''} ${v.cap}.${v.ini}${v.fim > v.ini ? '-' + v.fim : ''}`;
      el.innerHTML = `<section class="versiculo-dia" aria-labelledby="vd-tit">
        <h3 id="vd-tit">Versículo do dia</h3>
        <blockquote><p>${esc(v.texto)}</p><cite>${esc(ref)} · ${esc(v.versao)}</cite></blockquote>
        <div class="vd-acoes">${livro ? `<a class="btn sec mini" href="${VB.rotaBiblia(livro, v.cap, v.ini)}">Ler o capítulo</a>` : ''}
          <button type="button" class="btn fantasma mini" id="vd-compartilhar">Compartilhar no mural</button></div>
      </section>`;
      const b = $('#vd-compartilhar', el);
      b.addEventListener('click', () => {
        const ta = $('#rc-texto');
        if (!ta) { location.hash = '#/inicio'; return; }
        ta.value = `"${v.texto}" (${ref})\n\n`; ta.dispatchEvent(new Event('input')); ta.focus();
        ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } catch { el.remove(); }
  };

  // ── Perfil: escolher as notificações e ativar no celular
  const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
  async function inscricaoAtual() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return null;
    return reg.pushManager.getSubscription();
  }
  rede.blocoNotificacoes = async function (el) {
    if (!el) return;
    let d; try { d = await VB.api('/api/notificacoes/preferencias'); } catch { el.remove(); return; }
    const suporta = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const ios = /iphone|ipad/i.test(navigator.userAgent) && !navigator.standalone && !matchMedia('(display-mode: standalone)').matches;
    const desenhar = async () => {
      const sub = await inscricaoAtual().catch(() => null);
      const ativo = !!sub && Notification.permission === 'granted';
      el.innerHTML = `<h3>Notificações</h3>
        <p class="muted pequeno" style="margin:.2rem 0 .9rem">Escolha o que você quer receber. Tudo aparece no sino, no topo do app.</p>
        <div class="notif-prefs">${Object.entries(d.rotulos).map(([k, r]) => `<label class="chave"><input type="checkbox" data-pref="${k}" ${d.prefs[k] ? 'checked' : ''}>${esc(r)}</label>`).join('')}</div>
        <div class="notif-celular">
          <h4>Neste aparelho</h4>
          ${!d.celular_disponivel ? '<p class="muted pequeno">As notificações fora do app não estão ligadas no servidor.</p>'
            : !suporta ? `<p class="muted pequeno">${ios ? 'No iPhone, primeiro adicione o VideiraBook à Tela de Início (botão Compartilhar → Adicionar à Tela de Início) e abra o app por lá. Depois volte aqui para ativar.' : 'Este navegador não recebe notificações. Tente pelo Chrome ou pelo app instalado.'}</p>`
            : Notification.permission === 'denied' ? '<p class="muted pequeno">As notificações estão bloqueadas para este site. Libere nas configurações do navegador (ícone de cadeado ao lado do endereço) e volte aqui.</p>'
            : ativo ? `<p class="pequeno" style="margin:0 0 .7rem"><span class="selo verde">Ativadas</span> Você recebe as notificações mesmo com o app fechado.</p>
                <div class="acoes-linha"><button type="button" class="btn sec mini" id="nt-teste">Enviar um teste</button><button type="button" class="btn fantasma mini" id="nt-desligar">Desativar neste aparelho</button></div>`
            : `<p class="muted pequeno" style="margin:0 0 .7rem">Receba um aviso no celular quando alguém reagir, comentar ou quando o professor liberar um curso, mesmo com o app fechado.</p>
                <button type="button" class="btn mini" id="nt-ativar">Ativar notificações</button>`}
        </div>`;
      $$('[data-pref]', el).forEach(c => c.addEventListener('change', async () => {
        try { const r = await VB.api('/api/notificacoes/preferencias', { method: 'PUT', body: { [c.dataset.pref]: c.checked } }); d.prefs = r.prefs; VB.toast('Preferência salva'); } catch (er) { VB.erro(er); c.checked = !c.checked; }
      }));
      const at = $('#nt-ativar', el);
      if (at) at.addEventListener('click', async () => {
        at.disabled = true;
        try {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') { VB.toast('Sem permissão, as notificações não chegam neste aparelho.', true); return desenhar(); }
          const reg = await navigator.serviceWorker.ready;
          const s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(d.chave) });
          await VB.api('/api/push/aparelho', { method: 'POST', body: { inscricao: s.toJSON() } });
          await VB.api('/api/notificacoes/preferencias', { method: 'PUT', body: { celular: true } });
          VB.toast('Notificações ativadas'); desenhar();
        } catch (er) { VB.toast('Não foi possível ativar neste aparelho. ' + (er.message || ''), true); at.disabled = false; }
      });
      const te = $('#nt-teste', el); if (te) te.addEventListener('click', async () => { try { await VB.api('/api/push/teste', { method: 'POST' }); VB.toast('Teste enviado. Ele chega em alguns segundos.'); } catch (er) { VB.erro(er); } });
      const de = $('#nt-desligar', el);
      if (de) de.addEventListener('click', async () => {
        try { const s = await inscricaoAtual(); if (s) { await VB.api('/api/push/aparelho', { method: 'DELETE', body: { endpoint: s.endpoint } }); await s.unsubscribe(); } VB.toast('Desativadas neste aparelho'); desenhar(); } catch (er) { VB.erro(er); }
      });
    };
    desenhar();
  };
})();
