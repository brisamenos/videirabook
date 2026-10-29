/* VideiraBook — ferramenta de sermões com IA */
(function () {
  const { esc, icone, $, $$ } = VB;
  const TIPOS = [
    ['textual', 'Textual', 'As divisões nascem das palavras do próprio texto.'],
    ['tematico', 'Temático', 'Um tema bíblico desenvolvido com vários textos.'],
    ['historico', 'Histórico', 'Narra um fato ou personagem e tira lições.'],
    ['expositivo', 'Expositivo', 'Explica a passagem versículo por versículo.'],
  ];
  const nomeTipo = t => (TIPOS.find(x => x[0] === t) || [, 'Sermão'])[1];
  const PUBLICOS = ['Igreja (culto geral)', 'Jovens', 'Adolescentes', 'Crianças', 'Mulheres', 'Homens', 'Líderes e obreiros', 'Não convertidos (evangelístico)'];
  const OCASIOES = ['Culto de doutrina e ensino', 'Culto de celebração', 'Culto evangelístico', 'Santa Ceia', 'Batismo', 'Casamento', 'Culto fúnebre', 'Escola Bíblica Dominical', 'Vigília e oração', 'Outra'];
  const moldura = conteudo => VB.molduraAluno('sermoes', conteudo);
  const semAcesso = () => {
    moldura(`<div class="estreita"><div class="painel vazio"><strong>Ferramenta de sermões não liberada</strong>
      ${VB.me.papel === 'professor' ? 'Configure a chave da OpenAI e ligue a ferramenta em <a href="#/p/ia">Sermões com IA</a>.' : 'Peça ao professor para liberar o seu acesso.'}</div></div>`);
  };

  // ── Markdown simples → HTML (títulos, listas, negrito, itálico, citações)
  function md(texto) {
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
  }
  const textoLimpo = t => String(t || '').replace(/^#+\s*/gm, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2');
  function desenharDoc(el, texto, escrevendo) {
    el.innerHTML = md(texto) + (escrevendo ? '<span class="cursor-ia" aria-hidden="true"></span>' : '');
    VB.linkarReferencias(el);
  }
  // Lê a resposta da IA aos pedaços
  async function fluxo(url, corpo, aoChegar) {
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
  }
  const parseRef = txt => {
    const m = String(txt || '').trim().match(/^([123]?\s?[\p{L}]+)\.?\s*(\d{1,3})(?:\s*[.:]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?\s*$/u);
    if (!m) return null;
    const nome = m[1].trim();
    const l = VB.livroPorNome(nome) || VB.LIVROS.find(x => [x[0], x[1]].some(n => VB.normalizar(n) === VB.normalizar(nome)));
    if (!l) return null;
    const cap = l[3] === 1 && !m[3] ? 1 : Number(m[2]); const ini = l[3] === 1 && !m[3] ? Number(m[2]) : Number(m[3]) || 0; const fim = Math.max(ini, Number(m[4]) || ini);
    if (cap < 1 || cap > l[3]) return null;
    return { livro: VB.LIVROS.indexOf(l), cap, ini, fim, texto: `${l[0]} ${cap}${ini ? `.${ini}${fim > ini ? `-${fim}` : ''}` : ''}`, abrev: `${l[1]} ${cap}${ini ? `.${ini}${fim > ini ? `-${fim}` : ''}` : ''}` };
  };

  // ── Lista de sermões
  VB.registrar(/^\/sermoes$/, 'todos', async () => {
    if (!VB.me.ia) return semAcesso();
    moldura('<div class="carregando"></div>'); document.title = 'Sermões · VideiraBook';
    let d; try { d = await VB.api('/api/sermoes'); } catch (e) { return semAcesso(); }
    $('#conteudo').innerHTML = `<div class="estreita">
      <div class="saudacao"><div><h1>Sermões</h1><p>Crie mensagens fiéis ao texto, com exegese, dicionário bíblico e ajustes por conversa.</p></div>
        <a class="btn" href="#/sermoes/novo">${icone.mais}Novo sermão</a></div>
      ${d.uso.limite ? `<p class="pequeno muted" style="margin:-.8rem 0 1.2rem">Hoje: ${d.uso.usados} de ${d.uso.limite} pedidos à IA.</p>` : ''}
      ${d.lista.length ? `<div class="lista-sermoes">${d.lista.map(s => `<a class="painel cartao-sermao" href="#/sermao/${s.id}">
          <span class="etiqueta ok">${esc(nomeTipo(s.tipo))}</span><h3>${esc(s.titulo)}</h3>
          <p class="muted pequeno">${esc(s.referencia || s.tema || '')} · ${VB.quando(s.atualizado_em)}</p></a>`).join('')}</div>`
        : `<div class="painel vazio"><strong>Nenhum sermão ainda</strong>Escolha o tipo, o texto bíblico e o público. A IA prepara o esboço usando o texto da Bíblia escolhida e os verbetes do dicionário.<br><br><a class="btn" href="#/sermoes/novo">Criar o primeiro sermão</a></div>`}
    </div>`;
  });

  // ── Novo sermão
  VB.registrar(/^\/sermoes\/novo(?:\?ref=(.+))?$/, 'todos', async refS => {
    if (!VB.me.ia) return semAcesso();
    moldura(''); document.title = 'Novo sermão · VideiraBook';
    const versoes = VB.VERSOES.filter(v => v[3]);
    const vPadrao = VB.versaoInterna(VB.versaoBiblia()) ? VB.versaoBiblia() : VB.bibliaPadrao;
    $('#conteudo').innerHTML = `<div class="estreita">
      <div class="migalha"><a href="#/sermoes">Sermões</a><span>/</span><span>Novo</span></div>
      <div class="saudacao"><div><h1>Novo sermão</h1><p>Quanto mais claro o pedido, melhor o resultado. Você poderá pedir ajustes depois.</p></div></div>
      <form class="painel form-sermao" id="f-sermao" novalidate>
        <fieldset><legend>Tipo de sermão</legend><div class="tipos-sermao">
          ${TIPOS.map((t, i) => `<label class="tipo-sermao"><input type="radio" name="tipo" value="${t[0]}" ${i === 0 ? 'checked' : ''}><b>${t[1]}</b><span>${t[2]}</span></label>`).join('')}
        </div></fieldset>
        <div class="linha-campos">
          <label class="campo"><span id="rot-ref">Texto bíblico base</span><input class="input" name="referencia" placeholder="Ex.: Jo 3.16-21, Salmos 23, Ef 2.8-10" autocomplete="off">
            <small id="ref-info">Livro, capítulo e versículos.</small></label>
          <label class="campo"><span>Versão para o texto</span><select class="input" name="versao">${versoes.map(v => `<option value="${v[0]}"${v[0] === vPadrao ? ' selected' : ''}>${esc(v[1])} — ${esc(v[2])}</option>`).join('')}</select></label>
        </div>
        <label class="campo"><span id="rot-tema">Tema ou título provisório <small class="muted">(opcional)</small></span><input class="input" name="tema" maxlength="200" placeholder="Ex.: A graça que transforma"></label>
        <div class="linha-campos">
          <label class="campo"><span>Público</span><select class="input" name="publico">${PUBLICOS.map(p => `<option>${p}</option>`).join('')}</select></label>
          <label class="campo"><span>Ocasião</span><select class="input" name="ocasiao">${OCASIOES.map(p => `<option>${p}</option>`).join('')}</select></label>
        </div>
        <div class="linha-campos">
          <label class="campo"><span>Duração da pregação</span><select class="input" name="duracao">${[15, 20, 30, 40, 50, 60].map(n => `<option value="${n}"${n === 40 ? ' selected' : ''}>${n} minutos</option>`).join('')}</select></label>
          <div class="campo" role="radiogroup" aria-labelledby="rot-formato"><span id="rot-formato">Formato</span>
            <div class="opcoes"><label class="opcao"><input type="radio" name="formato" value="esboco" checked> Esboço detalhado</label><label class="opcao"><input type="radio" name="formato" value="completo"> Sermão completo</label></div></div>
        </div>
        ${VB.DICIONARIOS.length || VB.COMENTARIOS.length ? `<div class="campo"><span>Dicionários e comentários para a pesquisa</span>
          <div class="opcoes">${[...VB.DICIONARIOS.map(d => [d, 'Dicionário']), ...VB.COMENTARIOS.map(d => [d, 'Comentário'])].map(([d, t]) => `<label class="opcao"><input type="checkbox" name="dic" value="${esc(d.cod)}" checked> ${esc(d.titulo)} <small class="muted">${t}</small></label>`).join('')}</div></div>
          <label class="campo"><span>Palavras para procurar no dicionário <small class="muted">(opcional)</small></span><input class="input" name="palavras" maxlength="200" placeholder="Ex.: graça, fé, Éfeso"><small>Além destas, o app procura sozinho as palavras importantes do texto.</small></label>`
          : '<p class="pequeno muted">Nenhum dicionário instalado. O professor pode importar dicionários do MySword em Módulos bíblicos.</p>'}
        <label class="campo"><span>Observações para a IA <small class="muted">(opcional)</small></span><textarea class="input" name="observacoes" rows="3" maxlength="1500" placeholder="Ex.: enfatizar a obra do Espírito Santo; incluir apelo para a Santa Ceia; linguagem simples."></textarea></label>
        <p class="erro-msg" id="erro-sermao"></p>
        <button class="btn" type="submit" id="gerar">${icone.faisca}Gerar sermão</button>
      </form></div>`;
    const f = $('#f-sermao');
    const atualizar = () => {
      const tipo = f.tipo.value; const tem = tipo === 'tematico';
      $('#rot-ref').innerHTML = tem ? 'Texto bíblico base <small class="muted">(opcional)</small>' : 'Texto bíblico base';
      $('#rot-tema').innerHTML = tem ? 'Tema do sermão' : 'Tema ou título provisório <small class="muted">(opcional)</small>';
      $$('.tipo-sermao').forEach(l => l.classList.toggle('ativo', l.querySelector('input').checked));
    };
    $$('input[name="tipo"]').forEach(r => r.addEventListener('change', atualizar)); atualizar();
    f.referencia.addEventListener('input', () => {
      const r = parseRef(f.referencia.value); const info = $('#ref-info');
      info.className = ''; info.textContent = !f.referencia.value.trim() ? 'Livro, capítulo e versículos.' : r ? `✓ ${r.texto}` : 'Não reconheci a referência. Tente “Jo 3.16-21”.';
      info.style.color = r ? 'var(--folha)' : f.referencia.value.trim() ? 'var(--perigo)' : '';
    });
    if (refS) { f.referencia.value = decodeURIComponent(refS); f.referencia.dispatchEvent(new Event('input')); f.tema.focus(); }
    f.addEventListener('submit', async e => {
      e.preventDefault(); const err = $('#erro-sermao'); err.textContent = '';
      const tipo = f.tipo.value; const ref = parseRef(f.referencia.value);
      if (f.referencia.value.trim() && !ref) { err.textContent = 'Confira o texto bíblico: não reconheci a referência.'; f.referencia.focus(); return; }
      if (tipo !== 'tematico' && !ref) { err.textContent = 'Informe o texto bíblico base.'; f.referencia.focus(); return; }
      if (tipo === 'tematico' && !ref && !f.tema.value.trim()) { err.textContent = 'Informe o tema do sermão.'; f.tema.focus(); return; }
      const corpo = { tipo, referencia: ref ? ref.abrev : '', livro: ref ? ref.livro : null, cap: ref ? ref.cap : null, ini: ref ? ref.ini : null, fim: ref ? ref.fim : null,
        tema: f.tema.value, publico: f.publico.value, ocasiao: f.ocasiao.value, duracao: Number(f.duracao.value), formato: f.formato.value, versao: f.versao.value,
        dicionarios: $$('input[name="dic"]:checked').map(c => c.value), palavras: f.palavras ? f.palavras.value : '', observacoes: f.observacoes.value };
      $('#gerar').disabled = true;
      try { const r = await VB.api('/api/sermoes', { method: 'POST', body: corpo }); location.hash = `#/sermao/${r.id}?gerar=1`; }
      catch (er) { err.textContent = er.message; $('#gerar').disabled = false; }
    });
  });

  // ── Sermão: documento + conversa de ajustes
  VB.registrar(/^\/sermao\/(\d+)(\?gerar=1)?$/, 'todos', async (id, gerarS) => {
    if (!VB.me.ia) return semAcesso();
    moldura('<div class="carregando"></div>');
    let s; try { s = await VB.api(`/api/sermoes/${id}`); } catch (e) { $('#conteudo').innerHTML = `<div class="estreita"><p class="erro-msg">${esc(e.message)}</p><a href="#/sermoes">Voltar aos sermões</a></div>`; return; }
    if (gerarS) history.replaceState(null, '', `#/sermao/${id}`);
    document.title = `${s.titulo} · Sermões · VideiraBook`;
    $('#conteudo').innerHTML = `<div class="sermao-pagina">
      <div class="migalha"><a href="#/sermoes">Sermões</a><span>/</span><span>${esc(nomeTipo(s.tipo))}</span></div>
      <div class="sermao-barra">
        <div style="min-width:0"><h1 id="s-titulo">${esc(s.titulo)}</h1><p class="muted pequeno" style="margin:.2rem 0 0">${esc([s.referencia, s.publico, `${s.duracao} min`].filter(Boolean).join(' · '))}</p></div>
        <div class="acoes-sermao">
          <button class="btn mini" id="b-pulpito">${icone.olho}Modo púlpito</button>
          <button class="btn sec mini" id="b-copiar">Copiar</button>
          <button class="btn sec mini" id="b-imprimir">Imprimir</button>
          <button class="btn sec mini" id="b-editar">${icone.lapis}Editar texto</button>
          <button class="btn sec mini" id="b-refazer">${icone.faisca}Gerar de novo</button>
          <button class="icone-btn" id="b-excluir" aria-label="Excluir sermão" title="Excluir sermão">${icone.lixo}</button>
        </div></div>
      <div class="abas-sermao" role="tablist"><button role="tab" data-aba="doc" aria-selected="true">Sermão</button><button role="tab" data-aba="chat" aria-selected="false">Ajustes com a IA</button></div>
      <div class="sermao-grade" data-aba="doc">
        <div style="min-width:0">
          <article class="painel doc-sermao leitura" id="doc"></article>
          <div class="painel" id="editor" hidden><textarea class="input" id="editor-txt" rows="24" style="font:15px/1.55 ui-monospace,Menlo,monospace"></textarea>
            <div style="display:flex;gap:8px;margin-top:10px"><button class="btn" id="salvar-txt">Salvar texto</button><button class="btn sec" id="cancelar-txt">Cancelar</button></div></div>
          <details class="painel fontes-sermao" id="fontes"></details>
        </div>
        <aside class="painel chat-sermao">
          <h3>Ajustes com a IA</h3>
          <p class="muted pequeno" style="margin:.2rem 0 .8rem" id="uso-ia"></p>
          <div class="chat-msgs" id="msgs"></div>
          <div class="chips-chat">${['Deixe a introdução mais curta', 'Acrescente uma ilustração', 'Mais aplicação prática', 'Aprofunde a exegese', 'Simplifique a linguagem', 'Fortaleça o apelo final'].map(c => `<button type="button" data-chip>${c}</button>`).join('')}</div>
          <form id="f-chat" class="f-chat"><textarea class="input" name="msg" rows="2" maxlength="2000" placeholder="Peça uma mudança ou tire uma dúvida sobre o sermão" aria-label="Mensagem"></textarea>
            <button class="btn" type="submit" id="enviar-chat" aria-label="Enviar">Enviar</button></form>
        </aside>
      </div></div>`;
    const doc = $('#doc'), msgs = $('#msgs');
    let ocupado = false;
    const usoTxt = u => { $('#uso-ia').textContent = u && u.limite ? `Hoje: ${u.usados} de ${u.limite} pedidos.` : 'Peça mudanças e a IA reescreve o sermão.'; };
    usoTxt(s.uso);
    const desenharFontes = fo => {
      const el = $('#fontes'); const v = (fo && fo.verbetes) || [];
      el.hidden = !fo || (!fo.versao && !v.length && !(fo.comentarios || []).length);
      el.innerHTML = `<summary>Fontes consultadas pela IA</summary>
        ${fo && fo.versao ? `<p><b>Texto bíblico:</b> ${esc(fo.versao)}</p>` : ''}
        ${v.length ? `<p><b>Verbetes de dicionário:</b> ${v.map(x => `<a href="#" class="ref-verbete" data-verbete="${esc(x.palavra)}" data-dic-de="${esc(x.dic)}">${esc(x.palavra)}</a>`).join(', ')}</p>` : ''}
        ${fo && fo.comentarios && fo.comentarios.length ? `<p><b>Comentários consultados:</b> ${fo.comentarios.map(c => esc(c.titulo)).join(', ')}</p>` : ''}
        ${fo && fo.frases ? `<p><b>Frases autorizadas disponíveis:</b> ${fo.frases}</p>` : ''}
        <p class="pequeno muted">Toque nas referências bíblicas do sermão para conferir o texto. Revise sempre antes de pregar.</p>`;
      el.setAttribute('data-dic', (VB.DICIONARIOS.find(d => v[0] && d.sigla === v[0].dic) || VB.DICIONARIOS[0] || {}).cod || '');
    };
    const desenharMsgs = () => {
      msgs.innerHTML = s.chat.length ? s.chat.map(m => `<div class="msg ${m.papel === 'eu' ? 'eu' : 'ia'}">${m.papel === 'eu' ? esc(m.texto) : md(m.texto)}</div>`).join('')
        : '<p class="muted pequeno">Exemplos: “Troque a ilustração por uma do dia a dia”, “Inclua Rm 8.28 no segundo ponto”, “Qual o contexto histórico de Éfeso?”</p>';
      VB.linkarReferencias(msgs); msgs.scrollTop = msgs.scrollHeight;
    };
    const mostrar = () => { if (s.conteudo) desenharDoc(doc, s.conteudo); else doc.innerHTML = '<div class="vazio" style="border:0"><strong>Sermão ainda não gerado</strong>Use “Gerar de novo” para criar.</div>'; };
    mostrar(); desenharFontes(s.fontes); desenharMsgs();

    let t = 0;
    const gerar = async () => {
      if (ocupado) return; ocupado = true; document.body.classList.add('ia-trabalhando');
      doc.innerHTML = '<div class="gerando"><span class="faisca-anim">' + icone.faisca + '</span><p>Lendo o texto bíblico e o dicionário…</p></div>';
      try {
        await fluxo(`/api/sermoes/${id}/gerar`, {}, txt => { const n = Date.now(); if (n - t > 90) { t = n; desenharDoc(doc, txt, true); } });
        s = await VB.api(`/api/sermoes/${id}`); $('#s-titulo').textContent = s.titulo; document.title = `${s.titulo} · Sermões · VideiraBook`;
        mostrar(); desenharFontes(s.fontes); desenharMsgs(); usoTxt(s.uso); VB.toast('Sermão pronto');
      } catch (e) { doc.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; if (s.conteudo) { const b = document.createElement('div'); b.innerHTML = md(s.conteudo); doc.append(b); } }
      ocupado = false; document.body.classList.remove('ia-trabalhando');
    };
    if (gerarS || !s.conteudo) gerar();

    const enviar = async texto => {
      texto = texto.trim(); if (!texto || ocupado) return; ocupado = true;
      s.chat.push({ papel: 'eu', texto }); desenharMsgs();
      const bolha = document.createElement('div'); bolha.className = 'msg ia'; bolha.innerHTML = '<span class="cursor-ia"></span>'; msgs.append(bolha); msgs.scrollTop = msgs.scrollHeight;
      let reescrevendo = false;
      try {
        await fluxo(`/api/sermoes/${id}/chat`, { mensagem: texto }, txt => {
          const ini = txt.trimStart();
          if (!reescrevendo && ini.startsWith('#')) { reescrevendo = true; bolha.innerHTML = '<em>Reescrevendo o sermão…</em>'; if (innerWidth < 900) trocarAba('doc'); }
          const n = Date.now(); if (n - t < 90) return; t = n;
          if (reescrevendo) desenharDoc(doc, ini, true); else if (ini) { bolha.innerHTML = md(ini) + '<span class="cursor-ia"></span>'; msgs.scrollTop = msgs.scrollHeight; }
        });
        s = await VB.api(`/api/sermoes/${id}`); $('#s-titulo').textContent = s.titulo;
        mostrar(); desenharMsgs(); usoTxt(s.uso);
        if (reescrevendo) VB.toast('Sermão atualizado');
      } catch (e) { bolha.innerHTML = `<span class="erro-msg">${esc(e.message)}</span>`; s.chat.pop(); mostrar(); }
      ocupado = false;
    };
    $('#f-chat').addEventListener('submit', e => { e.preventDefault(); const v = e.target.msg.value; e.target.msg.value = ''; enviar(v); });
    $('#f-chat').msg.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#f-chat').requestSubmit(); } });
    $$('[data-chip]').forEach(b => b.addEventListener('click', () => enviar(b.textContent)));

    const trocarAba = a => { $('.sermao-grade').dataset.aba = a; $$('.abas-sermao button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.aba === a))); };
    $$('.abas-sermao button').forEach(b => b.addEventListener('click', () => trocarAba(b.dataset.aba)));

    $('#b-refazer').addEventListener('click', async () => {
      if (s.conteudo && !(await VB.confirmar('Gerar de novo', 'A IA vai escrever um sermão novo a partir do mesmo pedido. O texto atual e a conversa serão substituídos.', 'Gerar de novo'))) return;
      gerar();
    });
    $('#b-copiar').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(textoLimpo(s.conteudo)); VB.toast('Sermão copiado'); } catch { VB.toast('Não foi possível copiar neste aparelho', true); }
    });
    $('#b-imprimir').addEventListener('click', () => { document.body.classList.add('imprimindo-sermao'); setTimeout(() => { window.print(); document.body.classList.remove('imprimindo-sermao'); }, 50); });
    $('#b-editar').addEventListener('click', () => { $('#editor-txt').value = s.conteudo; $('#editor').hidden = false; doc.hidden = true; $('#editor-txt').focus(); });
    $('#cancelar-txt').addEventListener('click', () => { $('#editor').hidden = true; doc.hidden = false; });
    $('#salvar-txt').addEventListener('click', async () => {
      try { await VB.api(`/api/sermoes/${id}`, { method: 'PUT', body: { conteudo: $('#editor-txt').value } }); s = await VB.api(`/api/sermoes/${id}`);
        $('#s-titulo').textContent = s.titulo; mostrar(); $('#editor').hidden = true; doc.hidden = false; VB.toast('Texto salvo'); } catch (e) { VB.erro(e); }
    });
    $('#b-excluir').addEventListener('click', async () => {
      if (!(await VB.confirmar('Excluir sermão', `Excluir <strong>${esc(s.titulo)}</strong>? Não dá para desfazer.`))) return;
      await VB.api(`/api/sermoes/${id}`, { method: 'DELETE' }); VB.toast('Sermão excluído'); location.hash = '#/sermoes';
    });
    $('#b-pulpito').addEventListener('click', () => pulpito(s));
  });

  // ── Modo púlpito: tela cheia, letra grande, fundo escuro
  async function pulpito(s) {
    let escala = Number(VB.pref.get('pulpito_escala', '1.35')) || 1.35;
    const el = document.createElement('div'); el.className = 'pulpito'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Modo púlpito');
    el.innerHTML = `<div class="pulpito-barra"><button data-p="-" aria-label="Diminuir letra">A−</button><button data-p="+" aria-label="Aumentar letra">A+</button><button data-p="x" aria-label="Fechar">Fechar</button></div>
      <article class="pulpito-texto leitura"></article>`;
    document.body.append(el); document.body.style.overflow = 'hidden';
    const art = el.querySelector('.pulpito-texto'); desenharDoc(art, s.conteudo);
    const aplicar = () => { art.style.fontSize = `${escala * 1.15}rem`; VB.pref.set('pulpito_escala', escala); }; aplicar();
    let trava = null; try { trava = await navigator.wakeLock.request('screen'); } catch { /* sem suporte */ }
    const fechar = () => { el.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', tecla); try { trava && trava.release(); } catch {} if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
    const tecla = e => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', tecla);
    el.querySelector('.pulpito-barra').addEventListener('click', e => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      if (b.dataset.p === 'x') return fechar();
      escala = Math.max(.9, Math.min(2.6, escala + (b.dataset.p === '+' ? .15 : -.15))); aplicar();
    });
    try { await el.requestFullscreen(); } catch { /* sem tela cheia */ }
  }
})();
