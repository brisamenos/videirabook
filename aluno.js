/* VideiraBook — área do aluno */
(function () {
  const { esc, icone, $, $$ } = VB;

  // ── Moldura (topo + barra inferior no celular)
  function moldura(ativo, conteudo) {
    const ehProf = VB.me.papel === 'professor';
    const links = [
      ['inicio', '#/inicio', 'Início', icone.casa],
      ['jornada', '#/jornada', 'Jornada', icone.vinha],
      ['biblia', '#/biblia', 'Bíblia', icone.livro],
      ['avisos', '#/avisos', 'Avisos', icone.sino],
      ['perfil', '#/perfil', 'Perfil', icone.pessoa],
    ];
    if (VB.me.ia) links.splice(3, 0, ['sermoes', '#/sermoes', 'Sermões', icone.caneta]);
    document.getElementById('app').innerHTML = `
      <header class="topo"><div class="topo-in">
        <a class="marca" href="#/inicio"><img src="/img/logo.svg" alt="">VideiraBook</a>
        <nav class="nav" aria-label="Principal">
          ${links.map(l => `<a href="${l[1]}" class="${ativo === l[0] ? 'ativo' : ''}">${l[2]}</a>`).join('')}
          ${ehProf ? '<a href="#/p/painel">Painel do professor</a>' : ''}
        </nav>
        <button class="btn-leitura" type="button" id="btn-leitura" aria-label="Ajustes de leitura: tamanho das letras e leitura noturna" title="Tamanho das letras e leitura noturna">Aa</button>
        <a class="usuario-chip" href="#/perfil" style="text-decoration:none;color:inherit" aria-label="Meu perfil">
          <span class="avatar">${esc(VB.iniciais(VB.me.nome))}</span>
          <span class="nome pequeno">${esc(VB.primeiroNome(VB.me.nome))}</span>
        </a>
      </div></header>
      <main class="pagina" id="conteudo">${conteudo}</main>
      <nav class="tabbar" aria-label="Navegação">
        ${(ehProf ? [...links.filter(l => l[0] !== 'perfil' && !(VB.me.ia && l[0] === 'avisos')), ['painel', '#/p/painel', 'Professor', icone.painel]] : links)
          .map(l => `<a href="${l[1]}" class="${ativo === l[0] ? 'ativo' : ''}">${l[3]}<span>${l[2]}</span></a>`).join('')}
      </nav>`;
    $('#btn-leitura').addEventListener('click', VB.painelLeitura);
  }
  VB.molduraAluno = moldura;

  // ── Início
  VB.registrar(/^\/inicio$/, 'todos', async () => {
    moldura('inicio', '<div class="carregando"></div>');
    document.title = 'Início · VideiraBook';
    const d = await VB.api('/api/inicio');
    const cfg = d.config;
    const e = d.proximoEncontro;
    const cont = d.continuar;
    const curso = d.cursos[0];
    const dias = e ? VB.diasAte(e.data_encontro) : null;
    const quando = dias === 0 ? 'O encontro é hoje' : dias === 1 ? 'O encontro é amanhã' : dias > 1 ? `Faltam ${dias} dias para o encontro` : '';

    const blocoEncontro = e ? `
      <section class="encontro" aria-labelledby="enc-tit">
        ${VB.arteCacho}
        ${quando ? `<div class="contagem">${quando}</div>` : ''}
        <div class="encontro-data">
          <div class="calendario"><b>${VB.diaNum(e.data_encontro)}</b><span>${VB.mesAbrev(e.data_encontro)}</span></div>
          <p><strong>Semana ${e.semana} · ${esc(VB.dataLonga(e.data_encontro))}</strong>${esc(cfg.horario || '')}${cfg.duracao_min ? ` · ${cfg.duracao_min} minutos` : ''}${cfg.local ? ` · ${esc(cfg.local)}` : ''}</p>
        </div>
        <h2 id="enc-tit">${esc(e.titulo)}</h2>
        <p class="sub">${esc(e.subtitulo || '')}</p>
        <div class="acoes">
          ${e.status !== 'bloqueada' ? `<a class="btn" href="#/aula/${e.id}">${e.concluida ? 'Revisar a aula' : e.pre_estudo ? 'Fazer o pré-estudo' : 'Abrir a aula'}</a>` : `<span class="btn sec" aria-disabled="true">${icone.cadeado}${esc(e.motivo)}</span>`}
          <a class="btn sec" href="#/jornada">Ver a jornada</a>
        </div>
      </section>` : `
      <section class="encontro"><h2>Nenhum encontro agendado</h2><p class="sub">Quando o professor definir as datas, o próximo encontro aparece aqui.</p>
      <div class="acoes"><a class="btn" href="#/jornada">Ver a jornada</a></div></section>`;

    const blocoContinuar = cont && (!e || cont.id !== e.id) ? `
      <div class="painel">
        <div class="painel-cab"><h3>Continue de onde parou</h3><span class="selo vinho">Semana ${cont.semana}</span></div>
        <p style="margin:0 0 .3rem;font:500 1.2rem var(--serif)">${esc(cont.titulo)}</p>
        <p class="muted pequeno" style="margin:0 0 1rem">${cont.itens_feitos} de ${cont.itens_total} itens do checklist feitos</p>
        <a class="btn sec" href="#/aula/${cont.id}">Continuar a aula</a>
      </div>` : '';

    const blocoProgresso = curso ? `
      <div class="painel">
        <h3>${esc(curso.titulo)}</h3>
        <div class="progresso-curso">
          ${VB.anel(curso.resumo.percentual)}
          <div><p style="margin:0;font:500 1.15rem var(--serif)">${curso.resumo.concluidas} de ${curso.resumo.total} aulas concluídas</p>
          <p class="muted pequeno" style="margin:.2rem 0 0">Uma aula é concluída quando todo o checklist está marcado.</p></div>
        </div>
        <ul class="modulos-mini">
          ${curso.modulos.map(m => `<li><span>${esc(m.titulo)}</span><span class="muted">${m.concluidas}/${m.total}</span>${VB.barra(m.total ? m.concluidas / m.total * 100 : 0)}</li>`).join('')}
        </ul>
      </div>` : '';

    const blocoAvisos = `
      <div class="painel">
        <div class="painel-cab"><h3>Avisos</h3><a href="#/avisos" class="pequeno">Ver todos</a></div>
        ${d.avisos.length ? d.avisos.slice(0, 3).map(avisoHtml).join('') : '<p class="muted" style="margin:0">Nenhum aviso por enquanto.</p>'}
      </div>`;

    $('#conteudo').innerHTML = `
      <div class="saudacao">
        <div><h1>${VB.saudacao()}, ${esc(VB.primeiroNome(VB.me.nome))}</h1>
        <p>${esc(cfg.nome_turma || '')}${cfg.dia_semana ? ` · encontros às ${VB.DIAS[Number(cfg.dia_semana)].toLowerCase()}s` : ''}</p></div>
      </div>
      <div class="inicio-grade">
        <div>${blocoEncontro}${blocoContinuar ? `<div style="margin-top:20px">${blocoContinuar}</div>` : ''}<div style="margin-top:20px">${blocoAvisos}</div></div>
        <div>${blocoProgresso}</div>
      </div>`;
  });

  function avisoHtml(a) {
    return `<article class="aviso"><h4>${a.fixado ? `<span class="fixado" title="Fixado">${icone.alfinete.replace('<svg', '<svg width="15" height="15"')}</span>` : ''}${esc(a.titulo)}</h4>
      <p>${esc(a.texto)}</p><time>${VB.quando(a.criado_em)}</time></article>`;
  }

  // ── Jornada (lista de cursos ou o próprio curso)
  VB.registrar(/^\/jornada$/, 'todos', async () => {
    moldura('jornada', '<div class="carregando"></div>');
    const cursos = await VB.api('/api/cursos');
    const visiveis = cursos.filter(c => c.publicado || VB.me.papel === 'professor');
    if (visiveis.length === 1) return trilha(visiveis[0].id);
    document.title = 'Jornada · VideiraBook';
    $('#conteudo').innerHTML = `
      <div class="trilha-cab"><div><h1>Sua jornada</h1><p>Escolha um estudo para continuar.</p></div></div>
      ${visiveis.length ? visiveis.map(c => `
        <a class="folha-aula" href="#/curso/${c.id}" style="margin-bottom:14px">
          <h3>${esc(c.titulo)}</h3>
          <div class="meta"><span>${c.resumo.total} aulas</span><span>${c.modulos} módulos</span></div>
          <div class="estado">${VB.anel(c.resumo.percentual, 62)}</div>
        </a>`).join('') : '<div class="vazio"><strong>Nenhum estudo disponível</strong>O professor ainda não publicou um curso.</div>'}`;
  });
  VB.registrar(/^\/curso\/(\d+)$/, 'todos', id => { moldura('jornada', '<div class="carregando"></div>'); return trilha(id); });

  // Nós desenhados na videira
  const NO = {
    concluida: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4C8 8 5 15 7 26c9-1 17-7 19-20-3-1.5-6.5-2-10-2z" fill="var(--folha-2)"/><path d="M8 25C13 18 17 13 23 8" stroke="#E3ECDD" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
    atual: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="var(--vinho-claro)"/><circle cx="16" cy="16" r="8.5" fill="var(--vinho-2)"/></svg>`,
    disponivel: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="9" fill="var(--papel)" stroke="var(--vinho-2)" stroke-width="2.4"/></svg>`,
    bloqueada: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="7" fill="var(--fundo)" stroke="var(--fraco)" stroke-width="1.6" stroke-dasharray="3 2.4"/></svg>`,
    modulo: `<svg viewBox="0 0 28 28" aria-hidden="true"><g fill="var(--ouro)"><circle cx="9" cy="10" r="4"/><circle cx="17" cy="10" r="4"/><circle cx="13" cy="16.5" r="4"/><circle cx="13" cy="23" r="3.4"/></g><path d="M13 6c0-3 2-5 5-5.5" stroke="var(--ouro)" stroke-width="1.6" fill="none"/></svg>`,
  };

  async function trilha(id) {
    const v = await VB.api(`/api/cursos/${id}`);
    document.title = `${v.curso.titulo} · VideiraBook`;
    const atualId = (v.aulas.find(a => a.status === 'disponivel') || {}).id;
    let n = 0;
    $('#conteudo').innerHTML = `
      <div class="trilha-cab">
        <div><h1>${esc(v.curso.titulo)}</h1><p>${esc(v.curso.descricao || '')}</p></div>
        ${VB.anel(v.resumo.percentual, 96)}
      </div>
      <div class="legenda" style="margin-bottom:1.4rem">
        <span><i style="background:var(--folha-2)"></i>Concluída</span>
        <span><i style="background:var(--vinho-2)"></i>Aberta</span>
        <span><i style="border:1.5px dashed var(--fraco)"></i>Ainda fechada</span>
      </div>
      <div class="vinha" id="vinha">
        <svg class="caule" id="caule"></svg>
        ${v.modulos.map(m => `
          <div class="ramo-modulo">
            <span class="no-modulo" data-no>${NO.modulo}</span>
            <span class="num-mod">Módulo ${++n}</span>
            <h2>${esc(m.titulo)}</h2>
            ${m.descricao ? `<p>${esc(m.descricao)}</p>` : ''}
          </div>
          ${m.aulas.map(a => {
            const est = a.status === 'concluida' ? 'concluida' : a.status === 'bloqueada' ? 'bloqueada' : (a.id === atualId ? 'atual' : 'disponivel');
            const tag = a.status === 'bloqueada' ? 'div' : 'a';
            return `<${tag} class="folha-aula ${est === 'atual' ? 'atual' : ''} ${a.status === 'bloqueada' ? 'bloqueada' : ''}" ${tag === 'a' ? `href="#/aula/${a.id}"` : 'aria-disabled="true"'} data-estado="${est}">
              <span class="no" data-no data-feito="${a.concluida ? 1 : 0}">${NO[est]}</span>
              <span class="semana">Semana ${a.semana}${a.data_encontro ? ` · ${VB.dataCurta(a.data_encontro)}` : ''}${!a.publicada ? ' · rascunho' : ''}</span>
              <h3>${esc(a.titulo)}</h3>
              <div class="meta">${a.texto_base ? `<span>${esc(a.texto_base)}</span>` : ''}${a.pre_estudo ? `<span>${a.pre_estudo} pré-estudo${a.pre_estudo > 1 ? 's' : ''}</span>` : ''}</div>
              <div class="estado">${a.status === 'concluida' ? '<span class="selo verde">Concluída</span>'
                : a.status === 'bloqueada' ? `<span class="selo">${icone.cadeado.replace('<svg', '<svg width="13" height="13"')}${esc(a.motivo)}</span>`
                : `<span class="selo vinho">${a.progresso}% feito</span>`}</div>
            </${tag}>`;
          }).join('')}
        `).join('')}
      </div>`;
    desenharCaule();
    window.removeEventListener('resize', desenharCaule);
    window.addEventListener('resize', desenharCaule);
    const atual = $('.folha-aula.atual');
    if (atual && v.resumo.concluidas > 1) atual.scrollIntoView({ block: 'center' });
  }

  // Desenha o caule da videira ligando os nós; o trecho já percorrido fica verde
  function desenharCaule() {
    const vinha = $('#vinha'), svg = $('#caule');
    if (!vinha || !svg) return;
    const base = vinha.getBoundingClientRect();
    const nos = $$('[data-no]', vinha).map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2, feito: el.dataset.feito === '1', modulo: el.classList.contains('no-modulo') };
    });
    if (nos.length < 2) return;
    let ultimoFeito = -1;
    nos.forEach((p, i) => { if (p.feito) ultimoFeito = i; });
    const seg = (a, b, i) => {
      const dy = b.y - a.y, s = i % 2 ? 9 : -9;
      return `C ${a.x + s} ${a.y + dy * .4}, ${b.x + s} ${b.y - dy * .4}, ${b.x} ${b.y}`;
    };
    let todo = `M ${nos[0].x} ${nos[0].y - 18} L ${nos[0].x} ${nos[0].y} `;
    let feito = '';
    for (let i = 1; i < nos.length; i++) {
      todo += seg(nos[i - 1], nos[i], i) + ' ';
      if (i <= ultimoFeito) feito += (feito ? '' : `M ${nos[0].x} ${nos[0].y - 18} L ${nos[0].x} ${nos[0].y} `) + seg(nos[i - 1], nos[i], i) + ' ';
    }
    // gavinhas decorativas ao lado dos nós de módulo
    const gav = nos.filter(p => p.modulo).map(p => `M ${p.x} ${p.y + 16} q -14 6 -10 18 q 3 6 8 2`).join(' ');
    svg.setAttribute('viewBox', `0 0 ${svg.clientWidth} ${vinha.clientHeight}`);
    svg.innerHTML = `<path d="${todo}" fill="none" stroke="#C9CFC2" stroke-width="3" stroke-linecap="round"/>
      ${feito ? `<path d="${feito}" fill="none" stroke="var(--folha-2)" stroke-width="3.4" stroke-linecap="round"/>` : ''}
      <path d="${gav}" fill="none" stroke="#C9CFC2" stroke-width="1.6" stroke-linecap="round"/>`;
  }

  // ── Aula
  VB.registrar(/^\/aula\/(\d+)$/, 'todos', async id => {
    moldura('jornada', '<div class="carregando"></div>');
    let d;
    try { d = await VB.api(`/api/aulas/${id}`); }
    catch (e) {
      if (e.status === 403 || e.status === 404) {
        $('#conteudo').innerHTML = `<div class="bloqueio">${VB.anel(0, 72, 'var(--fraco)').replace('0%', '')}
          <h1>${e.status === 403 ? 'Esta aula ainda está fechada' : 'Aula não encontrada'}</h1><p>${esc(e.message)}</p>
          <a class="btn" href="#/jornada">Voltar para a jornada</a></div>`;
        return;
      }
      throw e;
    }
    renderAula(d);
  });

  function renderAula(d) {
    const a = d.aula;
    document.title = `${a.titulo} · VideiraBook`;
    const pre = d.materiais.filter(m => m.pre_estudo);
    const outros = d.materiais.filter(m => !m.pre_estudo);
    const itemPorMaterial = {};
    d.checklist.forEach(c => { if (c.material_id) itemPorMaterial[c.material_id] = c; });
    const temLivro = d.curso.livro_arquivo && a.pagina_inicio;
    const urlLivro = temLivro ? `/arquivos/${encodeURIComponent(d.curso.livro_arquivo)}#page=${a.pagina_inicio}` : '';
    const ehProf = VB.me.papel === 'professor';

    const material = m => {
      const it = itemPorMaterial[m.id];
      const marca = it ? `<button class="btn mini ${it.feito ? 'verde' : 'sec'}" data-marcar="${it.id}">${it.feito ? `${icone.check}Visto` : 'Marcar como visto'}</button>` : '';
      let corpo = '', acoes = '';
      const arq = m.arquivo ? `/arquivos/${encodeURIComponent(m.arquivo)}` : '';
      if (m.tipo === 'video' || m.tipo === 'audio') {
        corpo = VB.embed(m);
        if (!corpo && m.url) acoes = `<a class="btn sec mini" href="${esc(m.url)}" target="_blank" rel="noopener">${icone.externo}Abrir ${m.tipo === 'audio' ? 'áudio' : 'vídeo'}</a>`;
      } else if (m.tipo === 'pdf') {
        const src = arq || m.url;
        acoes = `<a class="btn sec mini" href="${esc(src)}" target="_blank" rel="noopener">${icone.externo}Abrir PDF</a>
          ${arq ? `<button class="btn fantasma mini" data-ver-pdf="${esc(src)}">Ver nesta página</button>` : ''}`;
        corpo = `<div class="pdf-alvo"></div>`;
      } else if (m.tipo === 'texto') {
        corpo = `<div class="leitura" style="font-size:1.08rem">${VB.limparHtml(String(m.conteudo || '').split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join(''))}</div>`;
      } else if (m.tipo === 'link') {
        acoes = `<a class="btn sec mini" href="${esc(m.url)}" target="_blank" rel="noopener">${icone.externo}Acessar link</a>`;
      }
      return `<article class="material">
        <div class="material-cab"><span class="tipo">${VB.iconeTipo(m.tipo)}</span>
          <div><h4>${esc(m.titulo)}</h4>${m.descricao ? `<p>${esc(m.descricao)}</p>` : `<p>${VB.nomeTipo[m.tipo] || ''}${m.arquivo_nome ? ` · ${esc(m.arquivo_nome)}` : ''}</p>`}</div></div>
        ${corpo ? `<div class="corpo">${corpo}</div>` : ''}
        ${acoes || marca ? `<div class="acoes">${acoes}${marca}</div>` : ''}
      </article>`;
    };

    const quizHtml = () => {
      const q = d.quiz;
      if (!q.perguntas.length) return '';
      if (q.resposta) {
        const r = q.resposta;
        return `<div class="resultado"><div><strong>${r.acertos} de ${r.total}</strong><div class="pequeno muted">acertos no questionário</div></div>
          <button class="btn sec mini" id="refazer">Refazer questionário</button></div>
          ${q.perguntas.map((p, i) => `<div class="quiz-q"><h4>${i + 1}. ${esc(p.pergunta)}</h4>
            ${p.opcoes.map((o, j) => {
              const marcada = Number(r.respostas[p.id]) === j;
              const cls = j === p.correta ? 'certa' : marcada ? 'errada' : '';
              return `<div class="opcao ${cls}">${j === p.correta ? icone.check.replace('<svg', '<svg width="18" height="18" style="color:var(--folha)"') : `<span style="width:18px"></span>`}<span>${esc(o)}${marcada && j !== p.correta ? ' <small class="muted">(sua resposta)</small>' : ''}</span></div>`;
            }).join('')}
            ${p.explicacao ? `<p class="explicacao">${esc(p.explicacao)}</p>` : ''}</div>`).join('')}`;
      }
      return `<form id="form-quiz">
        ${q.perguntas.map((p, i) => `<fieldset class="quiz-q" style="border:1px solid var(--linha-2)"><legend class="sr">Pergunta ${i + 1}</legend><h4>${i + 1}. ${esc(p.pergunta)}</h4>
          ${p.opcoes.map((o, j) => `<label class="opcao"><input type="radio" name="q${p.id}" value="${j}" required><span>${esc(o)}</span></label>`).join('')}</fieldset>`).join('')}
        <button class="btn" type="submit">Enviar respostas</button></form>`;
    };

    const sumario = [
      pre.length && ['pre', 'Pré-estudo'], temLivro && ['livro', 'Leitura'], a.conteudo_html && ['explicacao', 'Explicação'],
      outros.length && ['materiais', 'Materiais'], d.quiz.perguntas.length && ['quiz', 'Questionário'],
    ].filter(Boolean);

    $('#conteudo').innerHTML = `
      <div class="aula-cab">
        <div class="migalha"><a href="#/curso/${d.curso.id}">${esc(d.curso.titulo)}</a><span>/</span><span>${esc(a.modulo_titulo)}</span><span>/</span><span>Semana ${a.semana || '—'} de ${d.total_aulas}</span>
          ${ehProf ? `<a class="btn mini sec" style="margin-left:auto" href="#/p/aula/${a.id}">${icone.lapis}Editar esta aula</a>` : ''}</div>
        <h1>${esc(a.titulo)}</h1>
        ${a.subtitulo ? `<p class="subtitulo">${esc(a.subtitulo)}</p>` : ''}
        ${a.texto_base || a.data_encontro ? `<div class="texto-base">
          ${a.texto_base ? `<div><span>Texto-base</span><strong>${esc(a.texto_base)}</strong></div>` : '<div></div>'}
          ${a.data_encontro ? `<div style="text-align:right"><span>Encontro</span><strong>${esc(VB.dataLonga(a.data_encontro))}</strong></div>` : ''}
        </div>` : ''}
        <a href="#" class="selo vinho chip-check" data-ir="check-cartao">Checklist ${d.checklist.filter(c => c.feito).length} de ${d.checklist.length}</a>
      </div>
      <div class="aula-layout">
        <div class="aula-principal">
          ${a.objetivo || a.topicos.length ? `<section class="secao"><h2>Objetivo da aula</h2>
            ${a.objetivo ? `<p class="objetivo">${esc(a.objetivo)}</p>` : ''}
            ${a.topicos.length ? `<ul class="topicos">${a.topicos.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</section>` : ''}

          ${pre.length ? `<section class="secao" id="pre"><h2>Pré-estudo <small>antes do encontro</small></h2>${pre.map(material).join('')}</section>` : ''}

          ${temLivro ? `<section class="secao" id="livro"><h2>Leitura no livro-texto</h2>
            <div class="livro-cartao"><div><strong>Páginas ${a.pagina_inicio} a ${a.pagina_fim || a.pagina_inicio}</strong><span>${esc(d.curso.livro_nome || 'Livro-texto')}</span></div>
            <a class="btn verde" href="${urlLivro}" target="_blank" rel="noopener">${icone.livro}Abrir na página ${a.pagina_inicio}</a></div></section>`
            : a.pagina_inicio ? `<section class="secao" id="livro"><h2>Leitura no livro-texto</h2><div class="livro-cartao"><div><strong>Páginas ${a.pagina_inicio} a ${a.pagina_fim || a.pagina_inicio}</strong><span>Leia no seu exemplar do livro</span></div></div></section>` : ''}

          ${a.conteudo_html ? `<section class="secao" id="explicacao"><h2>Explicação</h2><div class="leitura">${VB.limparHtml(a.conteudo_html)}</div></section>` : ''}

          ${outros.length ? `<section class="secao" id="materiais"><h2>Materiais da aula</h2>${outros.map(material).join('')}</section>` : ''}

          ${a.reflexao.length ? `<section class="secao"><h2>Para refletir</h2><ol class="reflexao">${a.reflexao.map(r => `<li>${esc(r)}</li>`).join('')}</ol></section>` : ''}

          ${a.aplicacao ? `<section class="secao"><h2>Aplicação para a semana</h2><div class="aplicacao">${esc(a.aplicacao)}</div></section>` : ''}

          ${d.quiz.perguntas.length ? `<section class="secao" id="quiz"><h2>Questionário <small>${d.quiz.perguntas.length} perguntas</small></h2><div id="quiz-alvo">${quizHtml()}</div></section>` : ''}

          <section class="secao notas"><h2>Minhas anotações</h2>
            <textarea class="input" id="notas" placeholder="Escreva aqui suas respostas às perguntas de reflexão, dúvidas para o encontro ou o que Deus falou com você.">${esc(d.anotacao ? d.anotacao.texto : '')}</textarea>
            <div class="salvo" id="salvo">${d.anotacao ? `Salvo ${VB.quando(d.anotacao.atualizado_em)}` : 'Suas anotações são salvas automaticamente e só você as vê.'}</div>
          </section>

          <nav class="nav-aulas" aria-label="Navegação entre aulas">
            ${d.anterior ? `<a href="#/aula/${d.anterior.id}"><span>Aula anterior</span><strong>${esc(d.anterior.titulo)}</strong></a>` : '<span></span>'}
            ${d.proxima ? `<a class="prox ${d.proxima.status === 'bloqueada' ? 'bloq' : ''}" href="#/aula/${d.proxima.id}" id="link-prox"><span>${d.proxima.status === 'bloqueada' ? 'Próxima aula (fechada)' : 'Próxima aula'}</span><strong>${esc(d.proxima.titulo)}</strong></a>` : ''}
          </nav>
        </div>

        <aside class="lateral-aula">
          <div class="check-cartao" id="check-cartao"></div>
          ${sumario.length > 1 ? `<nav class="painel" style="margin-top:16px;padding:16px 20px" aria-label="Nesta aula"><h3 style="font-size:1.05rem;margin-bottom:.4rem">Nesta aula</h3>
            ${sumario.map(s => `<a href="#" data-ir="${s[0]}" style="display:block;padding:.3rem 0;text-decoration:none" class="pequeno">${s[1]}</a>`).join('')}</nav>` : ''}
        </aside>
      </div>`;
    VB.linkarReferencias($('.aula-principal'));
    VB.linkarReferencias($('.texto-base'));

    desenharChecklist(d);

    // Ações
    $$('[data-ir]').forEach(l => l.addEventListener('click', e => { e.preventDefault(); document.getElementById(l.dataset.ir).scrollIntoView({ behavior: 'smooth' }); }));
    $$('[data-ver-pdf]').forEach(b => b.addEventListener('click', () => {
      const alvo = b.closest('.material').querySelector('.pdf-alvo');
      if (alvo.innerHTML) { alvo.innerHTML = ''; b.textContent = 'Ver nesta página'; return; }
      alvo.innerHTML = `<iframe class="pdf-frame" src="${b.dataset.verPdf}" title="PDF"></iframe>`; b.textContent = 'Fechar visualização';
    }));
    $$('[data-marcar]').forEach(b => b.addEventListener('click', () => {
      const it = d.checklist.find(c => c.id === Number(b.dataset.marcar));
      alternar(d, it, !it.feito);
    }));
    const fq = $('#form-quiz');
    if (fq) fq.addEventListener('submit', async e => {
      e.preventDefault();
      const respostas = {};
      d.quiz.perguntas.forEach(p => { const m = fq.querySelector(`input[name=q${p.id}]:checked`); if (m) respostas[p.id] = Number(m.value); });
      try {
        const r = await VB.api(`/api/aulas/${a.id}/quiz`, { method: 'POST', body: { respostas } });
        VB.toast(`Questionário enviado: ${r.acertos} de ${r.total} acertos`);
        recarregar(a.id, 'quiz');
      } catch (er) { VB.erro(er); }
    });
    const rf = $('#refazer');
    if (rf) rf.addEventListener('click', async () => { await VB.api(`/api/aulas/${a.id}/quiz`, { method: 'DELETE' }); recarregar(a.id, 'quiz'); });

    let tNota;
    $('#notas').addEventListener('input', e => {
      clearTimeout(tNota); $('#salvo').textContent = 'Salvando…';
      tNota = setTimeout(async () => {
        try { await VB.api(`/api/aulas/${a.id}/anotacao`, { method: 'PUT', body: { texto: e.target.value } }); $('#salvo').textContent = 'Salvo agora'; }
        catch (er) { $('#salvo').textContent = 'Não foi possível salvar. Verifique a conexão.'; }
      }, 900);
    });
  }

  async function recarregar(id, ancora) {
    const d = await VB.api(`/api/aulas/${id}`);
    const y = window.scrollY;
    renderAula(d);
    if (ancora && document.getElementById(ancora)) document.getElementById(ancora).scrollIntoView();
    else window.scrollTo(0, y);
  }

  function desenharChecklist(d) {
    const alvo = $('#check-cartao');
    const total = d.checklist.length, feitos = d.checklist.filter(c => c.feito).length;
    const obrig = d.checklist.filter(c => c.tipo !== 'encontro');
    const concluida = obrig.length && obrig.every(c => c.feito);
    const ehProf = VB.me.papel === 'professor';
    const chip = $('.chip-check'); if (chip) chip.textContent = `Checklist ${feitos} de ${total}`;
    alvo.innerHTML = `
      <h3>Checklist da aula</h3>
      <div class="check-progresso">${VB.barra(total ? feitos / total * 100 : 0)}<span>${feitos}/${total}</span></div>
      <ul class="checklist">
        ${d.checklist.map(c => {
          const auto = c.tipo === 'encontro' || c.tipo === 'quiz';
          const dica = c.tipo === 'encontro' ? 'O professor marca a sua presença' : c.tipo === 'quiz' ? 'Marcado ao enviar o questionário' : '';
          return `<li><label class="check ${c.feito ? 'feito' : ''}"><input type="checkbox" data-item="${c.id}" ${c.feito ? 'checked' : ''} ${auto || ehProf ? 'disabled' : ''}>
            <span>${esc(c.texto)}${dica ? `<small>${dica}</small>` : ''}</span></label></li>`;
        }).join('')}
      </ul>
      ${concluida ? `<div class="concluida-msg">Aula concluída. ${d.proxima ? 'A próxima já pode ser aberta.' : 'Você chegou ao fim da jornada!'}</div>` : ''}
      ${ehProf ? '<p class="pequeno muted" style="margin:.8rem 0 0">Você está vendo a aula como o aluno vê.</p>' : ''}`;
    $$('input[data-item]', alvo).forEach(inp => inp.addEventListener('change', () => {
      const it = d.checklist.find(c => c.id === Number(inp.dataset.item));
      alternar(d, it, inp.checked);
    }));
  }

  async function alternar(d, it, feito) {
    try {
      await VB.api(`/api/aulas/${d.aula.id}/checklist/${it.id}`, { method: 'POST', body: { feito } });
      const antes = d.checklist.filter(c => c.tipo !== 'encontro').every(c => c.feito);
      it.feito = feito;
      const depois = d.checklist.filter(c => c.tipo !== 'encontro').every(c => c.feito);
      if (depois !== antes) return recarregar(d.aula.id);
      desenharChecklist(d);
      const b = document.querySelector(`[data-marcar="${it.id}"]`);
      if (b) { b.className = `btn mini ${feito ? 'verde' : 'sec'}`; b.innerHTML = feito ? `${icone.check}Visto` : 'Marcar como visto'; }
    } catch (e) { VB.erro(e); desenharChecklist(d); }
  }

  // ── Avisos
  VB.registrar(/^\/avisos$/, 'todos', async () => {
    moldura('avisos', '<div class="carregando"></div>');
    document.title = 'Avisos · VideiraBook';
    const lista = await VB.api('/api/avisos');
    $('#conteudo').innerHTML = `<div class="estreita"><div class="saudacao"><div><h1>Avisos</h1><p>Recados do professor para a turma.</p></div></div>
      <div class="painel">${lista.length ? lista.map(avisoHtml).join('') : '<p class="muted" style="margin:0">Nenhum aviso por enquanto.</p>'}</div></div>`;
  });

  // ── Bíblia: ARA, ACF, NVI, NVT, KJF e Almeida 1819 lidas dentro do app; ARC numa janela do Bíblia Online
  const nomeVersao = c => (VB.VERSOES.find(v => v[0] === c) || [])[1] || '';
  const livroPorSlug = slug => VB.LIVROS.find(l => l[2] === slug);
  let embutirOk;   // o site Bíblia Online pode ser aberto dentro do app?
  const podeEmbutir = async () => {
    if (embutirOk === undefined) { try { embutirOk = (await VB.api('/api/biblia-externa')).permitido; } catch { embutirOk = null; } }
    return embutirOk !== false;
  };
  const urlExterna = (l, cap) => {
    return VB.urlBiblia(l, cap, VB.versaoBiblia());
  };
  const chipsVersao = () => `<div class="versoes" role="radiogroup" aria-label="Versão da Bíblia">
    ${VB.VERSOES.map(v => `<button type="button" role="radio" class="versao" aria-checked="${v[0] === VB.versaoBiblia()}" data-versao="${v[0]}"><b>${v[1]}</b><span>${v[2]}</span></button>`).join('')}</div>`;
  const ligarChips = aoTrocar => $$('.versao').forEach(b => b.addEventListener('click', () => {
    VB.pref.set('versao', b.dataset.versao);
    $$('.versao').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    aoTrocar && aoTrocar();
  }));

  VB.registrar(/^\/biblia$/, 'todos', () => {
    moldura('biblia', '');
    document.title = 'Bíblia · VideiraBook';
    let testamento = VB.pref.get('testamento', 'at');
    let livro = null;
    $('#conteudo').innerHTML = `<div class="estreita biblia">
      <div class="saudacao"><div><h1>Bíblia</h1><p>Escolha a versão, o livro e o capítulo para ler aqui mesmo.</p></div></div>
      ${abasBiblia('ler')}
      <section class="painel"><h3>Versão</h3>${chipsVersao()}
        <label class="campo" id="campo-comparar" style="margin:1rem 0 0"><span>Comparar com outra versão (versículo por versículo)</span>
          <select class="input" id="comparar"><option value="">Não comparar</option>${VB.VERSOES.filter(v => v[3]).map(v => `<option value="${v[0]}">${v[1]} — ${v[2]}</option>`).join('')}</select></label>
      </section>
      <section class="painel" style="margin-top:16px">
        <form id="busca-ref" class="busca-ref" autocomplete="off">
          <label class="campo" style="margin:0;flex:1"><span>Ir direto para uma passagem</span>
            <input class="input" name="ref" placeholder="Ex.: Jo 3.16, Salmos 23, 1 Co 13"></label>
          <button class="btn" type="submit">Ler</button>
        </form>
        <p class="erro-msg" id="ref-erro"></p>
      </section>
      <section class="painel" style="margin-top:16px" id="escolha">
        <div class="abas-testamento" role="tablist">
          <button type="button" role="tab" data-test="at">Antigo Testamento</button>
          <button type="button" role="tab" data-test="nt">Novo Testamento</button>
        </div>
        <div id="livros" class="livros"></div>
        <div id="capitulos" class="capitulos" hidden></div>
      </section>
      <p class="pequeno muted" style="margin-top:14px">As versões ficam guardadas no próprio app. Cada uma mostra os créditos da editora no fim do capítulo.</p>
    </div>`;
    const atualizarComparar = () => { $('#campo-comparar').hidden = !VB.versaoInterna(VB.versaoBiblia()); $('#comparar').value = VB.pref.get('comparar', ''); };
    const desenharLivros = () => {
      $$('.abas-testamento button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.test === testamento)));
      const lista = testamento === 'at' ? VB.LIVROS.slice(0, 39) : VB.LIVROS.slice(39);
      $('#livros').innerHTML = lista.map(l => `<button type="button" class="livro-btn" data-livro="${esc(l[2])}">${esc(l[0])}</button>`).join('');
      $('#livros').hidden = false; $('#capitulos').hidden = true;
    };
    const desenharCapitulos = () => {
      if (livro[3] === 1) { location.hash = VB.rotaBiblia(livro, 1); return; }
      $('#livros').hidden = true; $('#capitulos').hidden = false;
      $('#capitulos').innerHTML = `<div class="cap-cab"><button type="button" class="btn sec mini" id="voltar-livros">← Livros</button>
        <h3>${esc(livro[0])}</h3></div>
        <div class="cap-grade">${Array.from({ length: livro[3] }, (_, i) => `<a href="${VB.rotaBiblia(livro, i + 1)}">${i + 1}</a>`).join('')}</div>`;
      $('#voltar-livros').addEventListener('click', desenharLivros);
      $('#escolha').scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    ligarChips(atualizarComparar);
    $('#comparar').addEventListener('change', e => VB.pref.set('comparar', e.target.value));
    $$('.abas-testamento button').forEach(b => b.addEventListener('click', () => { testamento = b.dataset.test; VB.pref.set('testamento', testamento); desenharLivros(); }));
    $('#livros').addEventListener('click', e => { const b = e.target.closest('[data-livro]'); if (b) { livro = livroPorSlug(b.dataset.livro); desenharCapitulos(); } });
    $('#busca-ref').addEventListener('submit', e => {
      e.preventDefault();
      const m = e.target.ref.value.trim().match(/^([123]?\s?[\p{L}]+)\s*(\d{1,3})?(?:[.:](\d{1,3}))?/u);
      const nome = m && m[1].trim();
      const l = nome && (VB.livroPorNome(nome) || VB.LIVROS.find(x => [x[0], x[1]].some(n => n.toLowerCase() === nome.toLowerCase())));
      const cap = l && l[3] === 1 ? 1 : Number(m && m[2]) || 1;
      if (!l || cap > l[3]) { $('#ref-erro').textContent = 'Não encontrei essa passagem. Tente algo como “Jo 3.16” ou “Salmos 23”.'; return; }
      location.hash = VB.rotaBiblia(l, cap, Number(m[3]) || (l[3] === 1 ? Number(m[2]) : 0));
    });
    atualizarComparar(); desenharLivros();
  });

  // Leitor
  VB.registrar(/^\/biblia\/([^/]+)\/(\d+)(?:\/(\d+))?$/, 'todos', async (slug, capS, versoS) => {
    const livro = livroPorSlug(decodeURIComponent(slug));
    const cap = Number(capS); const verso = Number(versoS) || 0;
    if (!livro || cap < 1 || cap > livro[3]) { location.hash = '#/biblia'; return; }
    moldura('biblia', '');
    document.title = `${livro[0]} ${cap} · Bíblia · VideiraBook`;
    const idx = VB.LIVROS.indexOf(livro);
    const ant = cap > 1 ? [livro, cap - 1] : idx > 0 ? [VB.LIVROS[idx - 1], VB.LIVROS[idx - 1][3]] : null;
    const prox = cap < livro[3] ? [livro, cap + 1] : idx < VB.LIVROS.length - 1 ? [VB.LIVROS[idx + 1], 1] : null;
    const navCap = `<nav class="leitor-nav" aria-label="Capítulos">
      ${ant ? `<a class="btn sec mini" href="${VB.rotaBiblia(...ant)}">← ${esc(ant[0][1])} ${ant[1]}</a>` : '<span></span>'}
      <a class="btn sec mini" href="#/biblia">Livros</a>
      ${prox ? `<a class="btn sec mini" href="${VB.rotaBiblia(...prox)}">${esc(prox[0][1])} ${prox[1]} →</a>` : '<span></span>'}</nav>`;
    $('#conteudo').innerHTML = `<div class="leitor">
      <div class="leitor-cab"><div><span class="migalha"><a href="#/biblia">Bíblia</a></span><h1>${esc(livro[0])} ${cap}</h1></div>${navCap}</div>
      ${chipsVersao()}
      <div id="leitor-corpo" class="leitor-corpo"><div class="carregando"></div></div>
      ${navCap}
    </div>`;
    const desenhar = async () => {
      const v = VB.versaoBiblia(); const corpo = $('#leitor-corpo');
      if (VB.versaoInterna(v)) {
        corpo.innerHTML = '<div class="carregando"></div>';
        const c = VB.pref.get('comparar', '');
        const compara = c && c !== v && VB.versaoInterna(c) ? c : '';
        let d, comp = null;
        try {
          [d, comp] = await Promise.all([VB.api(`/api/biblia/${idx}/${cap}?v=${v}`), compara ? VB.api(`/api/biblia/${idx}/${cap}?v=${compara}`) : null]);
        } catch (e) { corpo.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; return; }
        if (VB.versaoBiblia() !== v) return;   // trocou de versão enquanto carregava
        corpo.innerHTML = `<div class="leitura biblia-texto${comp ? ' com-comparacao' : ''}">${VB.htmlVersos(d, { destaque: verso, comp })}</div>
          <p class="pequeno muted biblia-credito">${esc(d.versao)} — ${esc(d.licenca)}${comp ? `<br>${esc(comp.versao)} — ${esc(comp.licenca)}` : ''}</p>`;
        if (verso) { const alvo = $(`#v${verso}`); if (alvo) setTimeout(() => alvo.scrollIntoView({ block: 'center' }), 50); }
        return;
      }
      const url = urlExterna(livro, cap);
      const titulo = `${livro[0]} ${cap} · ${nomeVersao(v)}`;
      corpo.innerHTML = '<div class="carregando"></div>';
      if (await podeEmbutir()) {
        corpo.innerHTML = `<div class="janela-biblia">
          <div class="janela-cab"><span>${esc(titulo)}${verso ? ` · versículo ${verso}` : ''}</span><a href="${esc(url)}" target="_blank" rel="noopener">${icone.externo}Abrir em tela cheia</a></div>
          <iframe src="${esc(url)}" title="${esc(titulo)}" loading="lazy" referrerpolicy="no-referrer"></iframe></div>
          <p class="pequeno muted biblia-credito">Texto da ${esc(nomeVersao(v))} exibido pelo site Bíblia Online. Se a janela ficar em branco, use “Abrir em tela cheia” ou escolha outra versão.</p>`;
      } else {
        corpo.innerHTML = `<div class="painel bloqueio-biblia"><h3>A ${esc(nomeVersao(v))} não pode ser exibida aqui dentro</h3>
          <p class="muted">O site que publica essa versão não permite ser aberto dentro de outros apps. Você pode lê-la no site ou ler este capítulo na Almeida aqui no app.</p>
          <div class="acoes"><a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${icone.externo}Ler a ${esc(nomeVersao(v))} no site</a>
          <button class="btn sec" type="button" id="ler-alm">Ler na ARA aqui</button></div></div>`;
        $('#ler-alm').addEventListener('click', () => { VB.pref.set('versao', 'ara'); $$('.versao').forEach(x => x.setAttribute('aria-checked', String(x.dataset.versao === 'ara'))); desenhar(); });
      }
    };
    ligarChips(desenhar);
    desenhar();
  });

  // ── Abas da área Bíblia: Ler, Dicionário, Concordância
  function abasBiblia(ativa) {
    const abas = [['ler', '#/biblia', 'Ler'], ...(VB.DICIONARIOS.length ? [['dic', '#/dicionario', 'Dicionário']] : []), ['conc', '#/concordancia', 'Concordância']];
    return `<nav class="abas-biblia" aria-label="Bíblia">${abas.map(a => `<a href="${a[1]}"${a[0] === ativa ? ' aria-current="page"' : ''}>${a[2]}</a>`).join('')}</nav>`;
  }
  VB.abasBiblia = abasBiblia;

  // ── Dicionário
  VB.registrar(/^\/dicionario(?:\/([^/]+)(?:\/(.+))?)?$/, 'todos', async (codS, palavraS) => {
    moldura('biblia', '');
    document.title = 'Dicionário · VideiraBook';
    if (!VB.DICIONARIOS.length) {
      $('#conteudo').innerHTML = `<div class="estreita"><div class="saudacao"><div><h1>Dicionário</h1></div></div>${abasBiblia('dic')}
        <div class="painel vazio"><strong>Nenhum dicionário instalado</strong>O professor pode importar dicionários do MySword no painel, em Módulos bíblicos.</div></div>`;
      return;
    }
    const cod = codS && VB.DICIONARIOS.some(d => d.cod === decodeURIComponent(codS)) ? decodeURIComponent(codS) : VB.pref.get('dicionario', VB.DICIONARIOS[0].cod);
    const dic = VB.DICIONARIOS.find(d => d.cod === cod) || VB.DICIONARIOS[0];
    VB.pref.set('dicionario', dic.cod);
    const palavra = palavraS ? decodeURIComponent(palavraS) : '';
    $('#conteudo').innerHTML = `<div class="dic-pagina${palavra ? ' com-verbete' : ''}" data-dic-pagina data-dic="${esc(dic.cod)}">
      <div class="saudacao"><div><h1>Dicionário</h1><p>${esc(dic.titulo)}</p></div></div>
      ${abasBiblia('dic')}
      <div class="dic-grade">
        <aside class="painel dic-lado">
          ${VB.DICIONARIOS.length > 1 ? `<label class="campo" style="margin:0 0 .7rem"><span>Dicionário</span><select class="input" id="dic-escolha">${VB.DICIONARIOS.map(d => `<option value="${esc(d.cod)}"${d.cod === dic.cod ? ' selected' : ''}>${esc(d.sigla)} — ${esc(d.titulo)}</option>`).join('')}</select></label>` : ''}
          <input class="input" id="dic-busca" type="search" placeholder="Procurar palavra (ex.: graça)" aria-label="Procurar palavra" autocomplete="off">
          <div class="dic-lista" id="dic-lista"><div class="carregando" style="min-height:80px"></div></div>
        </aside>
        <article class="painel dic-verbete" id="dic-verbete">${palavra ? '<div class="carregando"></div>' : `<div class="vazio" style="border:0"><strong>Escolha uma palavra</strong>Procure pelo nome e toque no resultado. As referências bíblicas abrem o versículo na hora.</div>`}</article>
      </div></div>`;
    const lista = $('#dic-lista');
    let ult = 0;
    const procurar = async q => {
      const n = ++ult;
      try {
        const r = await VB.api(`/api/dicionario/${encodeURIComponent(dic.cod)}?q=${encodeURIComponent(q)}`);
        if (n !== ult) return;
        lista.innerHTML = r.length ? r.map(w => `<a href="#/dicionario/${encodeURIComponent(dic.cod)}/${encodeURIComponent(w)}"${w === palavra ? ' aria-current="true"' : ''}>${esc(w)}</a>`).join('')
          : '<p class="muted pequeno" style="padding:.6rem">Nada encontrado com esse nome.</p>';
      } catch (e) { lista.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
    };
    let t; const busca = $('#dic-busca');
    busca.value = VB.pref.get('dic_busca', '');
    busca.addEventListener('input', () => { clearTimeout(t); VB.pref.set('dic_busca', busca.value); t = setTimeout(() => procurar(busca.value.trim()), 180); });
    procurar(busca.value.trim());
    if ($('#dic-escolha')) $('#dic-escolha').addEventListener('change', e => { location.hash = `#/dicionario/${encodeURIComponent(e.target.value)}`; });
    if (palavra) {
      const art = $('#dic-verbete');
      try {
        const v = await VB.api(`/api/dicionario/${encodeURIComponent(dic.cod)}/verbete?p=${encodeURIComponent(palavra)}`);
        document.title = `${v.palavra} · Dicionário · VideiraBook`;
        art.innerHTML = `<button type="button" class="btn sec mini dic-voltar" id="dic-voltar">← Palavras</button>
          <h2 class="dic-titulo">${esc(v.palavra)}</h2><div class="leitura verbete">${v.html}</div>
          <p class="pequeno muted biblia-credito">${esc(v.dicionario)}${v.creditos ? ` — ${esc(v.creditos)}` : ''}</p>`;
        VB.prepararVerbete(art);
        $('#dic-voltar').addEventListener('click', () => { location.hash = `#/dicionario/${encodeURIComponent(dic.cod)}`; });
        if (innerWidth < 900) art.scrollIntoView({ block: 'start' });
      } catch (e) { art.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
    }
  });

  // ── Concordância: procurar palavra ou frase na Bíblia
  const marcar = (texto, termo) => {
    const tn = [...texto].map(c => VB.normalizar(c)); const q = VB.normalizar(termo);
    const plano = tn.join(''); if (!q) return esc(texto);
    const idx = []; let i = plano.indexOf(q);
    while (i >= 0) { idx.push(i); i = plano.indexOf(q, i + q.length); }
    if (!idx.length) return esc(texto);
    // converte posição no texto normalizado para posição no texto original
    const mapa = []; let p = 0; [...texto].forEach((c, k) => { for (let x = 0; x < tn[k].length; x++) mapa[p++] = k; }); mapa[p] = [...texto].length;
    const chars = [...texto]; let out = '', ult = 0;
    idx.forEach(ii => { const a = mapa[ii], b = mapa[ii + q.length] ?? chars.length; out += esc(chars.slice(ult, a).join('')) + `<mark>${esc(chars.slice(a, b).join(''))}</mark>`; ult = b; });
    return out + esc(chars.slice(ult).join(''));
  };
  VB.registrar(/^\/concordancia(?:\/([^/]+)\/(.+))?$/, 'todos', async (codS, termoS) => {
    moldura('biblia', '');
    document.title = 'Concordância · VideiraBook';
    const termo = termoS ? decodeURIComponent(termoS) : '';
    const v = codS && VB.VERSOES.some(x => x[0] === codS && x[3]) ? codS : (VB.versaoInterna(VB.versaoBiblia()) ? VB.versaoBiblia() : VB.bibliaPadrao);
    const escopo = VB.pref.get('escopo', 'tudo');
    $('#conteudo').innerHTML = `<div class="estreita">
      <div class="saudacao"><div><h1>Concordância</h1><p>Encontre todos os versículos com uma palavra ou frase.</p></div></div>
      ${abasBiblia('conc')}
      <form class="painel conc-form" id="conc-form" autocomplete="off">
        <label class="campo" style="margin:0;flex:2 1 260px"><span>Palavra ou frase</span><input class="input" name="q" required minlength="3" value="${esc(termo)}" placeholder="Ex.: graça, fruto do Espírito"></label>
        <label class="campo" style="margin:0;flex:1 1 160px"><span>Versão</span><select class="input" name="v">${VB.VERSOES.filter(x => x[3]).map(x => `<option value="${x[0]}"${x[0] === v ? ' selected' : ''}>${esc(x[1])}</option>`).join('')}</select></label>
        <label class="campo" style="margin:0;flex:1 1 160px"><span>Onde</span><select class="input" name="e">
          <option value="tudo"${escopo === 'tudo' ? ' selected' : ''}>Toda a Bíblia</option><option value="at"${escopo === 'at' ? ' selected' : ''}>Antigo Testamento</option><option value="nt"${escopo === 'nt' ? ' selected' : ''}>Novo Testamento</option></select></label>
        <button class="btn" type="submit" style="align-self:end">Procurar</button>
      </form>
      <div id="conc-res" style="margin-top:16px"></div></div>`;
    $('#conc-form').addEventListener('submit', e => {
      e.preventDefault(); const f = new FormData(e.target); VB.pref.set('escopo', f.get('e')); VB.pref.set('escopo_v', f.get('v'));
      const q = String(f.get('q')).trim(); if (q.length < 3) return;
      const alvo = `#/concordancia/${f.get('v')}/${encodeURIComponent(q)}`;
      if (location.hash === alvo) VB.rota(); else location.hash = alvo;
    });
    if (!termo) return;
    const res = $('#conc-res'); res.innerHTML = '<div class="carregando"></div>';
    const [de, ate] = escopo === 'at' ? [0, 38] : escopo === 'nt' ? [39, 65] : [0, 65];
    try {
      const r = await VB.api(`/api/biblia/busca?v=${v}&q=${encodeURIComponent(termo)}&de=${de}&ate=${ate}`);
      if (!r.lista.length) { res.innerHTML = `<div class="painel vazio"><strong>Nenhum versículo encontrado</strong>Tente outra palavra ou outra versão.</div>`; return; }
      const grupos = new Map(); r.lista.forEach(x => { if (!grupos.has(x.l)) grupos.set(x.l, []); grupos.get(x.l).push(x); });
      res.innerHTML = `<p class="muted pequeno" style="margin:0 0 .8rem">${r.mais ? `Mostrando os primeiros ${r.lista.length} versículos` : `${r.lista.length} versículo${r.lista.length === 1 ? '' : 's'}`} com “${esc(termo)}” na ${esc(r.sigla)}${r.mais ? '. Refine a busca para ver menos resultados.' : '.'}</p>
        ${[...grupos].map(([l, itens]) => `<section class="painel conc-livro"><h3>${esc(VB.LIVROS[l][0])} <span class="muted pequeno">${itens.length}</span></h3>
          ${itens.map(x => `<p class="conc-item"><a class="ref-biblia" data-livro="${l}" data-cap="${x.c}" data-ini="${x.v}" data-fim="${x.v}" href="${VB.rotaBiblia(VB.LIVROS[l], x.c, x.v)}">${esc(VB.LIVROS[l][1])} ${x.c}.${x.v}</a> ${marcar(x.t, termo)}</p>`).join('')}</section>`).join('')}`;
    } catch (e) { res.innerHTML = `<p class="erro-msg">${esc(e.message)}</p>`; }
  });

  // ── Perfil
  VB.registrar(/^\/perfil$/, 'todos', async () => {
    moldura('perfil', '');
    document.title = 'Perfil · VideiraBook';
    $('#conteudo').innerHTML = `<div class="estreita">
      <div class="saudacao"><div><h1>Meu perfil</h1><p>${esc(VB.me.nome)} · usuário <strong>${esc(VB.me.usuario)}</strong></p></div>
      <button class="btn sec" id="sair">${icone.sair}Sair</button></div>
      <form class="painel" id="form-senha" style="max-width:460px">
        <h3>Trocar senha</h3>
        <label class="campo"><span>Senha atual</span><input class="input" type="password" name="atual" autocomplete="current-password" required></label>
        <label class="campo"><span>Nova senha</span><input class="input" type="password" name="nova" minlength="6" autocomplete="new-password" required><small>Pelo menos 6 caracteres.</small></label>
        <button class="btn" type="submit">Salvar nova senha</button>
      </form>
      <div class="painel" style="max-width:460px;margin-top:16px">
        <h3>Leitura</h3>
        <p class="muted pequeno" style="margin:.2rem 0 .9rem">Aumente as letras das aulas ou ative a leitura noturna. O ajuste fica salvo neste aparelho.</p>
        <button class="btn sec" type="button" id="abrir-leitura">Ajustar leitura</button>
      </div></div>`;
    $('#abrir-leitura').addEventListener('click', VB.painelLeitura);
    $('#sair').addEventListener('click', VB.sair);
    $('#form-senha').addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      try { await VB.api('/api/me/senha', { method: 'PUT', body: { atual: f.get('atual'), nova: f.get('nova') } }); VB.toast('Senha alterada'); e.target.reset(); }
      catch (er) { VB.erro(er); }
    });
  });
})();
