/* VideiraBook — painel do professor */
(function () {
  const { esc, icone, $, $$ } = VB;

  function moldura(ativo, conteudo) {
    const links = [
      ['painel', '#/p/painel', 'Painel', icone.painel],
      ['cursos', '#/p/cursos', 'Cursos e aulas', icone.livro],
      ['alunos', '#/p/alunos', 'Alunos', icone.pessoas],
      ['inscricoes', '#/p/inscricoes', 'Inscrições', icone.pessoa],
      ['modulos', '#/p/modulos', 'Módulos bíblicos', icone.livro],
      ['ia', '#/p/ia', 'Sermões com IA', icone.caneta],
      ['avisos', '#/p/avisos', 'Avisos', icone.sino],
      ['config', '#/p/config', 'Configurações', icone.engrenagem],
    ];
    document.getElementById('app').innerHTML = `
      <div class="admin">
        <aside class="lateral" id="lateral">
          <a class="marca" href="#/p/painel"><img src="/img/logo.svg" alt="">VideiraBook</a>
          <nav aria-label="Professor">${links.map(l => `<a href="${l[1]}" class="${ativo === l[0] ? 'ativo' : ''}">${l[3]}${l[2]}</a>`).join('')}</nav>
          <nav aria-label="Visão do aluno"><a href="#/inicio">${icone.olho}Ver como aluno</a><a href="#/biblia">${icone.livro}Bíblia</a>${VB.me.ia ? `<a href="#/sermoes">${icone.caneta}Meus sermões</a>` : ''}
            <a href="#" id="btn-leitura-prof"><span class="aa-icone" aria-hidden="true">Aa</span>Leitura e modo noturno</a></nav>
          <div class="rodape"><div style="color:#fff;font-weight:600">${esc(VB.me.nome)}</div>
            <div style="margin:.15rem 0 .6rem">Professor · <a href="#/perfil">trocar senha</a></div>
            <button id="btn-sair">Sair</button></div>
        </aside>
        <div>
          <div class="admin-topo-mobile"><button class="icone-btn" id="abrir-menu" aria-label="Abrir menu">${icone.menu}</button>
            <a class="marca" href="#/p/painel"><img src="/img/logo.svg" alt="">VideiraBook</a></div>
          <main class="admin-main" id="conteudo">${conteudo}</main>
        </div>
      </div>`;
    $('#btn-sair').addEventListener('click', VB.sair);
    $('#btn-leitura-prof').addEventListener('click', e => { e.preventDefault(); VB.painelLeitura(); });
    $('#abrir-menu').addEventListener('click', e => { e.stopPropagation(); $('#lateral').classList.add('aberta'); });
    document.addEventListener('click', function f(e) {
      const l = $('#lateral'); if (!l) return document.removeEventListener('click', f);
      if (l.classList.contains('aberta') && (!l.contains(e.target) || e.target.closest('a'))) l.classList.remove('aberta');
    });
  }
  const carregando = ativo => moldura(ativo, '<div class="carregando"></div>');
  const cabecalho = (titulo, sub, acoes = '') => `<div class="admin-cab"><div><h1>${titulo}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${acoes ? `<div class="acoes">${acoes}</div>` : ''}</div>`;

  // ═════════════ PAINEL
  VB.registrar(/^\/p\/painel$/, 'professor', async () => {
    carregando('painel'); document.title = 'Painel · VideiraBook';
    const d = await VB.api('/api/admin/painel');
    const c = d.cursos[0];
    $('#conteudo').innerHTML = `
      ${cabecalho(`${VB.saudacao()}, ${esc(VB.primeiroNome(VB.me.nome))}`, esc(VB.config.nome_turma || ''), `<a class="btn" href="#/p/alunos?novo=1">${icone.mais}Novo aluno</a>`)}
      <div class="numeros">
        <div class="numero"><b>${d.alunos.ativos}</b><span>alunos ativos</span></div>
        <div class="numero"><b>${d.alunos.acessaram7d}</b><span>acessaram nos últimos 7 dias</span></div>
        <div class="numero"><b>${c ? c.media : 0}%</b><span>progresso médio da turma</span></div>
        <div class="numero"><b>${c ? c.aulas : 0}</b><span>aulas em ${c ? c.modulos : 0} módulos</span></div>
      </div>
      <div class="grade-2">
        <div>
          ${d.cursos.map(cu => `<div class="painel">
            <div class="painel-cab"><h3>${esc(cu.titulo)}</h3>${cu.publicado ? '<span class="selo verde">Publicado</span>' : '<span class="selo">Oculto</span>'}</div>
            ${cu.proxima ? `<p class="muted pequeno" style="margin:0 0 .3rem">Próximo encontro · ${esc(VB.dataLonga(cu.proxima.data_encontro))}</p>
              <p style="margin:0 0 1rem;font:500 1.3rem var(--serif)">Semana ${cu.proxima.semana}: ${esc(cu.proxima.titulo)}</p>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap"><a class="btn" href="#/p/aula/${cu.proxima.id}">Preparar a aula</a><a class="btn sec" href="#/p/curso/${cu.id}">Ver a grade</a></div>`
              : `<p class="muted" style="margin:0 0 1rem">Sem encontros futuros agendados.</p><a class="btn sec" href="#/p/curso/${cu.id}">Ver a grade</a>`}
          </div>`).join('')}
          <div class="painel"><h3>Primeiros passos</h3>
            <ol style="margin:0;padding-left:1.2rem;line-height:1.9">
              <li>Confira dia, horário e data de início em <a href="#/p/config">Configurações</a>.</li>
              <li>Envie o PDF do livro-texto na <a href="#/p/cursos">grade do curso</a>, para os alunos abrirem direto na página certa.</li>
              <li>Em cada aula, adicione o vídeo de pré-estudo e os PDFs de apoio.</li>
              <li>Cadastre os alunos e envie os dados de acesso pelo WhatsApp.</li>
            </ol></div>
        </div>
        <div class="painel"><h3>Atividade recente</h3>
          ${d.atividade.length ? `<ul class="atividade">${d.atividade.map(x => `<li><span class="avatar">${esc(VB.iniciais(x.nome))}</span>
            <div><p><strong>${esc(VB.primeiroNome(x.nome))}</strong> marcou “${esc(x.texto)}”</p><time>${esc(x.aula)} · ${VB.quando(x.feito_em)}</time></div></li>`).join('')}</ul>`
            : '<p class="muted" style="margin:0">Quando os alunos começarem a marcar o checklist, a atividade aparece aqui.</p>'}
        </div>
      </div>`;
  });

  // ═════════════ ALUNOS
  function gerarSenha() {
    const s = 'abcdefghjkmnpqrstuvwxyz23456789'; let r = '';
    for (let i = 0; i < 7; i++) r += s[Math.floor(Math.random() * s.length)];
    return r;
  }
  function sugerirUsuario(nome) {
    const p = String(nome).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '';
    return p.length > 1 ? `${p[0]}.${p[p.length - 1]}` : p[0];
  }
  function credenciais(nome, usuario, senha) {
    const url = location.origin;
    const txt = `Olá, ${VB.primeiroNome(nome)}! Seu acesso ao VideiraBook está pronto.\n\nEndereço: ${url}\nUsuário: ${usuario}\nSenha: ${senha}\n\nNo primeiro acesso, troque a senha em Perfil.`;
    const m = VB.modal({
      titulo: 'Dados de acesso',
      corpo: `<p class="muted" style="margin-top:0">Envie estes dados para ${esc(VB.primeiroNome(nome))}. A senha não aparece de novo depois que você fechar.</p>
        <pre style="white-space:pre-wrap;background:#fff;border:1px solid var(--linha);border-radius:var(--r-sm);padding:14px;font:inherit;margin:0">${esc(txt)}</pre>`,
      rodape: `<button class="btn sec" id="copiar">Copiar</button><a class="btn verde" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">Enviar pelo WhatsApp</a><button class="btn" data-fechar>Concluir</button>`,
    });
    m.el.querySelector('#copiar').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(txt); VB.toast('Dados copiados'); } catch { VB.toast('Selecione o texto e copie manualmente', true); }
    });
  }
  function formAluno(al, aoSalvar, pre = {}) {
    const novo = !al;
    const senhaIni = novo ? gerarSenha() : '';
    const m = VB.modal({
      titulo: novo ? 'Novo aluno' : 'Editar aluno',
      corpo: `<form id="f-aluno">
        <label class="campo"><span>Nome completo</span><input class="input" name="nome" required value="${esc(al?.nome || pre.nome || '')}"></label>
        <div class="linha-campos">
          <label class="campo"><span>Usuário de acesso</span><input class="input" name="usuario" required autocapitalize="none" pattern="[A-Za-z0-9._\\-]{3,40}" value="${esc(al?.usuario || '')}"><small>Sem espaços nem acentos.</small></label>
          <label class="campo"><span>WhatsApp</span><input class="input" name="telefone" inputmode="tel" placeholder="(88) 9 0000-0000" value="${esc(al?.telefone || pre.telefone || '')}"></label>
        </div>
        <label class="campo"><span>${novo ? 'Senha inicial' : 'Nova senha'}</span>
          <div style="display:flex;gap:.5rem"><input class="input" name="senha" ${novo ? 'required' : ''} minlength="6" value="${senhaIni}" placeholder="${novo ? '' : 'Deixe em branco para manter'}"><button type="button" class="btn sec" id="gerar">Gerar</button></div></label>
        ${!novo ? `<label class="chave"><input type="checkbox" name="ativo" ${al.ativo ? 'checked' : ''}>Acesso ativo</label>` : ''}
      </form>`,
      rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="salvar">${novo ? 'Cadastrar aluno' : 'Salvar alterações'}</button>`,
    });
    const f = m.el.querySelector('#f-aluno');
    let mexeuUsuario = !novo;
    if (novo && pre.nome) f.usuario.value = sugerirUsuario(pre.nome);
    f.usuario.addEventListener('input', () => { mexeuUsuario = true; });
    f.nome.addEventListener('input', () => { if (!mexeuUsuario) f.usuario.value = sugerirUsuario(f.nome.value); });
    m.el.querySelector('#gerar').addEventListener('click', () => { f.senha.value = gerarSenha(); });
    m.el.querySelector('#salvar').addEventListener('click', async () => {
      if (!f.reportValidity()) return;
      const corpo = { nome: f.nome.value.trim(), usuario: f.usuario.value.trim(), telefone: f.telefone.value.trim(), senha: f.senha.value };
      if (!novo) corpo.ativo = f.ativo.checked;
      try {
        let r;
        if (novo) r = await VB.api('/api/admin/alunos', { method: 'POST', body: corpo });
        else await VB.api(`/api/admin/alunos/${al.id}`, { method: 'PUT', body: corpo });
        m.fechar();
        VB.toast(novo ? 'Aluno cadastrado' : 'Aluno atualizado');
        if (novo || corpo.senha) credenciais(corpo.nome, corpo.usuario.toLowerCase(), corpo.senha);
        aoSalvar && aoSalvar(r && r.id);
      } catch (e) { VB.erro(e); }
    });
  }

  VB.registrar(/^\/p\/alunos(\?novo=1)?$/, 'professor', async novo => {
    carregando('alunos'); document.title = 'Alunos · VideiraBook';
    const lista = await VB.api('/api/admin/alunos');
    const desenhar = (filtro = '') => {
      const f = filtro.toLowerCase();
      const vis = lista.filter(a => !f || a.nome.toLowerCase().includes(f) || a.usuario.includes(f));
      $('#tab-alunos').innerHTML = vis.length ? `<table class="tabela"><thead><tr><th>Aluno</th><th>Progresso</th><th class="col-opc">Presenças</th><th class="col-opc">Último acesso</th><th></th></tr></thead><tbody>
        ${vis.map(a => `<tr>
          <td><div class="pessoa"><span class="avatar">${esc(VB.iniciais(a.nome))}</span><div><a href="#/p/aluno/${a.id}" style="color:inherit;text-decoration:none"><strong>${esc(a.nome)}</strong></a><small>${esc(a.usuario)}${a.ativo ? '' : ' · <span style="color:var(--perigo)">desativado</span>'}</small></div></div></td>
          <td><div class="mini-barra">${VB.barra(a.percentual)}<span class="pequeno muted">${a.concluidas}/${a.total}</span></div></td>
          <td class="col-opc">${a.presencas}</td>
          <td class="col-opc pequeno muted">${VB.quando(a.ultimo_acesso)}</td>
          <td><div class="acoes">
            <a class="icone-btn" href="#/p/aluno/${a.id}" title="Ver progresso" aria-label="Ver progresso">${icone.olho}</a>
            <button class="icone-btn" data-editar="${a.id}" title="Editar" aria-label="Editar">${icone.lapis}</button>
            <button class="icone-btn" data-excluir="${a.id}" title="Excluir" aria-label="Excluir">${icone.lixo}</button>
          </div></td></tr>`).join('')}</tbody></table>`
        : `<div class="vazio" style="border:0"><strong>${lista.length ? 'Ninguém encontrado' : 'Nenhum aluno cadastrado'}</strong>${lista.length ? 'Tente outro nome.' : 'Cadastre o primeiro aluno para ele acessar a plataforma.'}</div>`;
      $$('[data-editar]').forEach(b => b.addEventListener('click', () => formAluno(lista.find(x => x.id === Number(b.dataset.editar)), () => VB.rota())));
      $$('[data-excluir]').forEach(b => b.addEventListener('click', async () => {
        const a = lista.find(x => x.id === Number(b.dataset.excluir));
        if (!(await VB.confirmar('Excluir aluno', `Excluir <strong>${esc(a.nome)}</strong> apagará também o progresso, as anotações e as respostas dele. Se quiser só bloquear o acesso, edite e desative.`))) return;
        await VB.api(`/api/admin/alunos/${a.id}`, { method: 'DELETE' }); VB.toast('Aluno excluído'); VB.rota();
      }));
    };
    $('#conteudo').innerHTML = `
      ${cabecalho('Alunos', `${lista.length} cadastrado${lista.length === 1 ? '' : 's'}`, `<button class="btn" id="novo">${icone.mais}Novo aluno</button>`)}
      <input class="input" id="busca" placeholder="Buscar por nome ou usuário" style="max-width:360px;margin-bottom:1rem" aria-label="Buscar aluno">
      <div class="tabela-wrap" id="tab-alunos"></div>`;
    desenhar();
    $('#busca').addEventListener('input', e => desenhar(e.target.value));
    $('#novo').addEventListener('click', () => formAluno(null, () => { location.hash = '#/p/alunos'; VB.rota(); }));
    if (novo) { history.replaceState(null, '', '#/p/alunos'); formAluno(null, () => VB.rota()); }
  });

  // ── Módulos bíblicos (MySword): importar, ordenar, padrão, ativar
  const tamanho = b => b > 1048576 ? `${(b / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.round((b || 0) / 1024)} KB`;
  VB.registrar(/^\/p\/modulos$/, 'professor', async () => {
    carregando('modulos'); document.title = 'Módulos bíblicos · VideiraBook';
    const { padrao, lista } = await VB.api('/api/admin/biblioteca');
    const bloco = (tipo, titulo, vazio) => {
      const itens = lista.filter(m => m.tipo === tipo);
      return `<section class="painel" style="margin-bottom:16px"><h3 style="margin:0 0 .8rem">${titulo}</h3>
        ${itens.length ? `<div class="tabela-wrap" style="border:0"><table class="tabela"><thead><tr><th style="width:84px">Ordem</th><th>Módulo</th>${tipo === 'biblia' ? '<th>Padrão</th>' : ''}<th>Ativo</th><th></th></tr></thead><tbody>
        ${itens.map((m, i) => `<tr${m.ativo ? '' : ' style="opacity:.55"'}>
          <td><div class="acoes" style="justify-content:flex-start"><button class="icone-btn" data-mover="${m.cod}" data-dir="-1" ${i ? '' : 'disabled'} aria-label="Subir">${icone.cima}</button><button class="icone-btn" data-mover="${m.cod}" data-dir="1" ${i < itens.length - 1 ? '' : 'disabled'} aria-label="Descer">${icone.baixo}</button></div></td>
          <td><strong>${esc(m.sigla)}</strong> — ${esc(m.titulo)}<br><small class="muted">${esc(m.creditos || 'sem créditos')} · ${m.formato === 'json' ? 'texto do app' : m.formato === 'mybible' ? 'MyBible' : 'MySword'} · ${tamanho(m.tamanho)}${m.embutido ? ' · vem com o app' : ''}${m.existe ? '' : ' · <span style="color:var(--perigo)">arquivo não encontrado</span>'}</small></td>
          ${tipo === 'biblia' ? `<td><input type="radio" name="padrao" value="${m.cod}" ${m.cod === padrao ? 'checked' : ''} ${m.ativo ? '' : 'disabled'} aria-label="Versão padrão"></td>` : ''}
          <td><label class="chave"><input type="checkbox" data-ativo="${m.cod}" ${m.ativo ? 'checked' : ''} aria-label="Ativo"></label></td>
          <td><div class="acoes"><button class="icone-btn" data-editar="${m.cod}" title="Editar nome e créditos" aria-label="Editar">${icone.lapis}</button>
            ${m.embutido ? '' : `<button class="icone-btn" data-excluir="${m.cod}" title="Remover" aria-label="Remover">${icone.lixo}</button>`}</div></td></tr>`).join('')}</tbody></table></div>`
        : `<p class="muted" style="margin:0">${vazio}</p>`}</section>`;
    };
    $('#conteudo').innerHTML = `${cabecalho('Módulos bíblicos', 'Bíblias e dicionários no formato do MySword (.mybible), usados na leitura, na concordância e nos sermões.', `<button class="btn" id="importar">${icone.upload}Importar módulo</button>`)}
      <input type="file" id="arq-modulo" accept=".mybible,.sqlite3,.SQLite3" hidden>
      <div id="envio" hidden class="painel" style="margin-bottom:16px"><p style="margin:0 0 .5rem" id="envio-txt">Enviando…</p>${VB.barra(0)}</div>
      ${bloco('biblia', 'Bíblias', 'Nenhuma Bíblia instalada.')}
      ${bloco('dicionario', 'Dicionários', 'Nenhum dicionário ainda. Importe um arquivo .dct.mybible do MySword (por exemplo, o Dicionário Wycliffe).')}
      <p class="pequeno muted">Aceita Bíblias (<b>.bbl.mybible</b>) e dicionários (<b>.dct.mybible</b>) do MySword, e Bíblias do MyBible. Títulos, epígrafes dos Salmos, palavras de Jesus em vermelho e notas de rodapé aparecem quando o módulo traz essas marcações.</p>`;
    $('#importar').addEventListener('click', () => $('#arq-modulo').click());
    $('#arq-modulo').addEventListener('change', e => {
      const arq = e.target.files[0]; if (!arq) return;
      const fd = new FormData(); fd.append('arquivo', arq);
      const caixa = $('#envio'); caixa.hidden = false; $('#envio-txt').textContent = `Enviando ${arq.name}…`;
      const barra = caixa.querySelector('.barra i, .barra span, .barra > *');
      const x = new XMLHttpRequest(); x.open('POST', '/api/admin/biblioteca');
      x.upload.onprogress = ev => { if (ev.lengthComputable && barra) barra.style.width = `${Math.round(ev.loaded / ev.total * 100)}%`; if (ev.loaded === ev.total) $('#envio-txt').textContent = 'Conferindo o módulo…'; };
      x.onload = async () => {
        let d = {}; try { d = JSON.parse(x.responseText); } catch {}
        if (x.status >= 400) { caixa.hidden = true; VB.toast(d.erro || 'Não foi possível importar o módulo.', true); e.target.value = ''; return; }
        VB.toast(`${d.tipo === 'biblia' ? 'Bíblia importada' : 'Dicionário importado'}: ${d.sigla || d.titulo}`);
        await VB.carregarBiblioteca(); VB.rota();
      };
      x.onerror = () => { caixa.hidden = true; VB.toast('A conexão caiu durante o envio. Tente de novo.', true); };
      x.send(fd);
    });
    const recarregar = async () => { await VB.carregarBiblioteca(); VB.rota(); };
    $$('[data-mover]').forEach(b => b.addEventListener('click', async () => { await VB.api(`/api/admin/biblioteca/${b.dataset.mover}/mover`, { method: 'POST', body: { dir: Number(b.dataset.dir) } }); recarregar(); }));
    $$('[data-ativo]').forEach(c => c.addEventListener('change', async () => {
      try { await VB.api(`/api/admin/biblioteca/${c.dataset.ativo}`, { method: 'PUT', body: { ativo: c.checked } }); recarregar(); } catch (er) { VB.erro(er); }
    }));
    $$('input[name="padrao"]').forEach(r => r.addEventListener('change', async () => {
      await VB.api('/api/admin/config', { method: 'PUT', body: { biblia_padrao: r.value } }); VB.toast('Versão padrão alterada'); recarregar();
    }));
    $$('[data-editar]').forEach(b => b.addEventListener('click', () => {
      const m = lista.find(x => x.cod === b.dataset.editar);
      const md = VB.modal({ titulo: 'Editar módulo', corpo: `<form id="f-mod">
          <div class="linha-campos"><label class="campo"><span>Sigla</span><input class="input" name="sigla" maxlength="20" required value="${esc(m.sigla)}"></label>
          <label class="campo"><span>Nome</span><input class="input" name="titulo" maxlength="120" required value="${esc(m.titulo)}"></label></div>
          <label class="campo"><span>Créditos (aparece embaixo do texto)</span><input class="input" name="creditos" maxlength="200" value="${esc(m.creditos || '')}" placeholder="Ex.: © Sociedade Bíblica do Brasil"></label></form>`,
        rodape: '<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="salvar-mod">Salvar</button>' });
      md.el.querySelector('#salvar-mod').addEventListener('click', async () => {
        const f = md.el.querySelector('#f-mod'); if (!f.reportValidity()) return;
        try { await VB.api(`/api/admin/biblioteca/${m.cod}`, { method: 'PUT', body: { sigla: f.sigla.value, titulo: f.titulo.value, creditos: f.creditos.value } }); md.fechar(); VB.toast('Módulo atualizado'); recarregar(); }
        catch (er) { VB.erro(er); }
      });
    }));
    $$('[data-excluir]').forEach(b => b.addEventListener('click', async () => {
      const m = lista.find(x => x.cod === b.dataset.excluir);
      if (!(await VB.confirmar('Remover módulo', `Remover <strong>${esc(m.sigla)} — ${esc(m.titulo)}</strong> do app? O arquivo será apagado do servidor.`, 'Remover'))) return;
      try { await VB.api(`/api/admin/biblioteca/${m.cod}`, { method: 'DELETE' }); VB.toast('Módulo removido'); recarregar(); } catch (er) { VB.erro(er); }
    }));
  });

  // ── Sermões com IA: chave da OpenAI, modelo, quem pode usar e frases de homens de Deus
  const MODELOS = [['gpt-6.1-sol', 'GPT-6.1 Sol — recomendado: ótimo texto, custo médio'], ['gpt-6-luna', 'GPT-6 Luna — mais econômico'], ['gpt-6-astra', 'GPT-6 Astra — o mais completo, custo maior']];
  VB.registrar(/^\/p\/ia$/, 'professor', async () => {
    carregando('ia'); document.title = 'Sermões com IA · VideiraBook';
    const d = await VB.api('/api/admin/ia');
    const outro = !MODELOS.some(m => m[0] === d.modelo);
    $('#conteudo').innerHTML = `${cabecalho('Sermões com IA', 'Ferramenta para pregadores criarem sermões textuais, temáticos, históricos e expositivos, com texto bíblico dos módulos, dicionários e frases cadastradas.', `<a class="btn sec" href="#/sermoes">${icone.caneta}Abrir a ferramenta</a>`)}
      <div class="ia-grade">
      <section class="painel"><h3 style="margin-top:0">Conexão com a OpenAI</h3>
        <form id="f-ia">
          <label class="campo"><span>Chave da API${d.tem_chave ? ` <small class="muted">(salva, termina em …${esc(d.chave_fim)})</small>` : ''}</span>
            <input class="input" name="chave" type="password" autocomplete="off" placeholder="${d.tem_chave ? 'Deixe em branco para manter a chave salva' : 'sk-...'}">
            <small>Crie em platform.openai.com/api-keys. Ela fica guardada só no servidor e nunca aparece para os alunos. O uso é cobrado na sua conta da OpenAI.</small></label>
          <label class="campo"><span>Modelo</span><select class="input" name="modelo_sel">${MODELOS.map(m => `<option value="${m[0]}"${m[0] === d.modelo ? ' selected' : ''}>${m[1]}</option>`).join('')}<option value="outro"${outro ? ' selected' : ''}>Outro (digitar o nome)</option></select></label>
          <label class="campo" id="campo-modelo-outro" ${outro ? '' : 'hidden'}><span>Nome do modelo</span><input class="input" name="modelo_outro" value="${outro ? esc(d.modelo) : ''}" placeholder="ex.: gpt-6-sol"></label>
          <label class="campo"><span>Limite de pedidos por pessoa, por dia</span><input class="input" name="limite" type="number" min="1" max="500" value="${d.limite}" style="max-width:140px"><small>Cada geração ou ajuste conta 1. O professor não tem limite. Hoje foram ${d.uso_hoje} pedido${d.uso_hoje === 1 ? '' : 's'}.</small></label>
          <label class="chave" style="margin:.4rem 0 1rem"><input type="checkbox" name="ativa" ${d.ativa ? 'checked' : ''}>Ferramenta de sermões ligada</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="submit">Salvar</button><button class="btn sec" type="button" id="testar">Testar conexão</button>
            ${d.tem_chave ? '<button class="btn sec" type="button" id="remover-chave">Remover chave</button>' : ''}</div>
          <p class="pequeno" id="teste-res" style="margin:.8rem 0 0"></p>
        </form></section>
      <section class="painel"><h3 style="margin-top:0">Quem pode usar</h3>
        <p class="muted pequeno" style="margin-top:0">Marque os alunos que poderão criar sermões. Você, professor, sempre tem acesso.</p>
        <input class="input" id="busca-ia" placeholder="Buscar aluno" style="margin-bottom:.6rem" aria-label="Buscar aluno">
        <div class="lista-ia" id="lista-ia">${d.usuarios.length ? d.usuarios.map(u => `<label class="chave linha-ia" data-nome="${esc(VB.normalizar(u.nome + ' ' + u.usuario))}"><input type="checkbox" data-ia="${u.id}" ${u.pode_ia ? 'checked' : ''}><span><strong>${esc(u.nome)}</strong> <small class="muted">${esc(u.usuario)}${u.ativo ? '' : ' · desativado'}</small></span></label>`).join('') : '<p class="muted">Nenhum aluno cadastrado.</p>'}</div>
      </section></div>
      <section class="painel" style="margin-top:16px">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><h3 style="margin:0">Frases de homens de Deus</h3>
          <p class="muted pequeno" style="margin:.3rem 0 0">A IA só pode citar frases desta lista, palavra por palavra. Confira a fonte antes de ativar uma frase nova.</p></div>
          <button class="btn sec" id="nova-frase">${icone.mais}Nova frase</button></div>
        <div class="tabela-wrap" style="margin-top:12px"><table class="tabela"><thead><tr><th>Frase</th><th class="col-opc">Fonte</th><th>Ativa</th><th></th></tr></thead><tbody>
        ${d.frases.map(f => `<tr${f.ativo ? '' : ' style="opacity:.55"'}><td><span style="font-family:var(--serif)">“${esc(f.frase)}”</span><br><small class="muted">— ${esc(f.autor)}</small></td><td class="col-opc pequeno muted">${esc(f.fonte || '')}</td>
          <td><label class="chave"><input type="checkbox" data-frase-ativa="${f.id}" ${f.ativo ? 'checked' : ''} aria-label="Ativa"></label></td>
          <td><div class="acoes"><button class="icone-btn" data-frase-editar="${f.id}" aria-label="Editar">${icone.lapis}</button><button class="icone-btn" data-frase-excluir="${f.id}" aria-label="Excluir">${icone.lixo}</button></div></td></tr>`).join('')}
        </tbody></table></div></section>`;
    const f = $('#f-ia');
    f.modelo_sel.addEventListener('change', () => { $('#campo-modelo-outro').hidden = f.modelo_sel.value !== 'outro'; });
    const salvar = async (extra = {}) => {
      const modelo = f.modelo_sel.value === 'outro' ? f.modelo_outro.value.trim() : f.modelo_sel.value;
      await VB.api('/api/admin/ia', { method: 'PUT', body: { chave: f.chave.value.trim(), modelo, limite: Number(f.limite.value), ativa: f.ativa.checked, ...extra } });
    };
    f.addEventListener('submit', async e => { e.preventDefault(); try { await salvar(); VB.toast('Configuração salva'); await VB.carregarMe(); VB.rota(); } catch (er) { VB.erro(er); } });
    $('#testar').addEventListener('click', async () => {
      const r = $('#teste-res'); r.style.color = ''; r.textContent = 'Testando…';
      try { if (f.chave.value.trim()) await salvar(); const t = await VB.api('/api/admin/ia/testar', { method: 'POST' }); r.style.color = 'var(--folha)'; r.textContent = `Conexão funcionando com o modelo ${t.modelo}.`; }
      catch (er) { r.style.color = 'var(--perigo)'; r.textContent = er.message; }
    });
    if ($('#remover-chave')) $('#remover-chave').addEventListener('click', async () => {
      if (!(await VB.confirmar('Remover chave', 'A ferramenta de sermões para de funcionar até você salvar uma nova chave.', 'Remover'))) return;
      await VB.api('/api/admin/ia', { method: 'PUT', body: { remover_chave: true } }); VB.toast('Chave removida'); VB.rota();
    });
    $$('[data-ia]').forEach(c => c.addEventListener('change', async () => {
      try { await VB.api(`/api/admin/ia/usuarios/${c.dataset.ia}`, { method: 'PUT', body: { pode_ia: c.checked } }); VB.toast(c.checked ? 'Acesso liberado' : 'Acesso retirado'); } catch (er) { VB.erro(er); c.checked = !c.checked; }
    }));
    $('#busca-ia').addEventListener('input', e => { const q = VB.normalizar(e.target.value); $$('.linha-ia').forEach(l => { l.hidden = !!q && !l.dataset.nome.includes(q); }); });
    const formFrase = fr => {
      const md = VB.modal({ titulo: fr ? 'Editar frase' : 'Nova frase', corpo: `<form id="f-frase">
          <label class="campo"><span>Frase</span><textarea class="input" name="frase" rows="4" required maxlength="600">${esc(fr?.frase || '')}</textarea></label>
          <div class="linha-campos"><label class="campo"><span>Autor</span><input class="input" name="autor" required maxlength="80" value="${esc(fr?.autor || '')}"></label>
          <label class="campo"><span>Fonte (livro, sermão, ano)</span><input class="input" name="fonte" maxlength="120" value="${esc(fr?.fonte || '')}"></label></div></form>`,
        rodape: '<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="salvar-frase">Salvar</button>' });
      md.el.querySelector('#salvar-frase').addEventListener('click', async () => {
        const ff = md.el.querySelector('#f-frase'); if (!ff.reportValidity()) return;
        const corpo = { frase: ff.frase.value, autor: ff.autor.value, fonte: ff.fonte.value };
        try { await VB.api(fr ? `/api/admin/frases/${fr.id}` : '/api/admin/frases', { method: fr ? 'PUT' : 'POST', body: corpo }); md.fechar(); VB.toast('Frase salva'); VB.rota(); } catch (er) { VB.erro(er); }
      });
    };
    $('#nova-frase').addEventListener('click', () => formFrase(null));
    $$('[data-frase-editar]').forEach(b => b.addEventListener('click', () => formFrase(d.frases.find(x => x.id === Number(b.dataset.fraseEditar)))));
    $$('[data-frase-ativa]').forEach(c => c.addEventListener('change', async () => { await VB.api(`/api/admin/frases/${c.dataset.fraseAtiva}`, { method: 'PUT', body: { ativo: c.checked } }); VB.rota(); }));
    $$('[data-frase-excluir]').forEach(b => b.addEventListener('click', async () => {
      if (!(await VB.confirmar('Excluir frase', 'A IA deixará de poder citar esta frase.'))) return;
      await VB.api(`/api/admin/frases/${b.dataset.fraseExcluir}`, { method: 'DELETE' }); VB.toast('Frase excluída'); VB.rota();
    }));
  });

  // ── Inscrições vindas da página pública /inscricao
  const foneBonito = t => { const d = String(t || '').replace(/\D/g, ''); return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : t; };
  const linkWhats = (t, txt) => { let d = String(t || '').replace(/\D/g, ''); if (d.length <= 11) d = '55' + d; return `https://wa.me/${d}${txt ? `?text=${encodeURIComponent(txt)}` : ''}`; };
  VB.registrar(/^\/p\/inscricoes$/, 'professor', async () => {
    carregando('inscricoes'); document.title = 'Inscrições · VideiraBook';
    const [lista, cfg] = await Promise.all([VB.api('/api/admin/inscricoes'), VB.api('/api/admin/config')]);
    const abertas = cfg.inscricoes_abertas !== '0';
    const url = `${location.origin}/inscricao`;
    const novas = lista.filter(i => !i.aluno_id).length;
    const desenhar = (filtro = '') => {
      const f = filtro.toLowerCase();
      const vis = lista.filter(i => !f || [i.nome, i.email, i.igreja, i.cargo, i.telefone].some(x => String(x || '').toLowerCase().includes(f)));
      $('#tab-insc').innerHTML = vis.length ? `<table class="tabela"><thead><tr><th>Inscrito</th><th>WhatsApp</th><th class="col-opc">Cargo e igreja</th><th class="col-opc">Data</th><th>Situação</th><th></th></tr></thead><tbody>
        ${vis.map(i => `<tr>
          <td><div class="pessoa"><span class="avatar">${esc(VB.iniciais(i.nome))}</span><div><strong>${esc(i.nome)}</strong><small>${esc(i.email)}</small></div></div></td>
          <td><a href="${linkWhats(i.telefone)}" target="_blank" rel="noopener">${esc(foneBonito(i.telefone))}</a></td>
          <td class="col-opc">${esc(i.cargo || '')}<br><small class="muted">${esc(i.igreja || '')}</small></td>
          <td class="col-opc pequeno muted">${VB.quando(i.criado_em)}</td>
          <td>${i.aluno_id ? `<span class="etiqueta ok">Aluno · ${esc(i.aluno_usuario || '')}</span>` : '<span class="etiqueta nova">Nova</span>'}</td>
          <td><div class="acoes">
            ${i.aluno_id ? '' : `<button class="btn mini" data-acesso="${i.id}">Criar acesso</button>`}
            <button class="icone-btn" data-excluir="${i.id}" title="Excluir inscrição" aria-label="Excluir inscrição">${icone.lixo}</button>
          </div></td></tr>`).join('')}</tbody></table>`
        : `<div class="vazio" style="border:0"><strong>${lista.length ? 'Ninguém encontrado' : 'Nenhuma inscrição ainda'}</strong>${lista.length ? 'Tente outro nome.' : 'Envie o endereço da página de inscrição para os interessados.'}</div>`;
      $$('[data-acesso]').forEach(b => b.addEventListener('click', () => {
        const i = lista.find(x => x.id === Number(b.dataset.acesso));
        formAluno(null, async alunoId => {
          if (alunoId) await VB.api(`/api/admin/inscricoes/${i.id}`, { method: 'PUT', body: { aluno_id: alunoId } });
          const vale = document.querySelector('.modal a[href^="https://wa.me/?text="]');
          if (vale) vale.href = vale.href.replace('https://wa.me/?text=', linkWhats(i.telefone) + '?text=');
          VB.rota();
        }, { nome: i.nome, telefone: foneBonito(i.telefone) });
      }));
      $$('[data-excluir]').forEach(b => b.addEventListener('click', async () => {
        const i = lista.find(x => x.id === Number(b.dataset.excluir));
        if (!(await VB.confirmar('Excluir inscrição', `Excluir a inscrição de <strong>${esc(i.nome)}</strong>? ${i.aluno_id ? 'O acesso de aluno continua valendo.' : ''}`))) return;
        await VB.api(`/api/admin/inscricoes/${i.id}`, { method: 'DELETE' }); VB.toast('Inscrição excluída'); VB.rota();
      }));
    };
    $('#conteudo').innerHTML = `
      ${cabecalho('Inscrições', `${lista.length} recebida${lista.length === 1 ? '' : 's'}${novas ? ` · ${novas} aguardando acesso` : ''}`, `<button class="btn sec" id="csv">Baixar planilha</button>`)}
      <section class="painel" style="margin-bottom:16px">
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
          <div style="min-width:0"><h3 style="margin:0 0 .25rem">Página de inscrição</h3>
            <p class="muted pequeno" style="margin:0;word-break:break-all">${esc(url)}</p></div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <button class="btn sec mini" id="copiar-link">Copiar endereço</button>
            <a class="btn sec mini" href="/inscricao" target="_blank" rel="noopener">${icone.externo}Abrir</a>
            <a class="btn verde mini" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Inscrições abertas para o curso de Teologia Sistemática! Faça a sua aqui: ${url}`)}">Divulgar no WhatsApp</a>
          </div>
        </div>
        <label class="chave" style="margin-top:14px"><input type="checkbox" id="abertas" ${abertas ? 'checked' : ''}>Aceitando novas inscrições</label>
      </section>
      <input class="input" id="busca" placeholder="Buscar por nome, e-mail, igreja ou cargo" style="max-width:380px;margin-bottom:1rem" aria-label="Buscar inscrição">
      <div class="tabela-wrap" id="tab-insc"></div>`;
    desenhar();
    $('#busca').addEventListener('input', e => desenhar(e.target.value));
    $('#copiar-link').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(url); VB.toast('Endereço copiado'); } catch { VB.toast('Selecione o endereço e copie manualmente', true); }
    });
    $('#abertas').addEventListener('change', async e => {
      try { await VB.api('/api/admin/config', { method: 'PUT', body: { inscricoes_abertas: e.target.checked ? '1' : '0' } });
        VB.toast(e.target.checked ? 'Inscrições abertas' : 'Inscrições encerradas'); } catch (er) { VB.erro(er); }
    });
    $('#csv').addEventListener('click', () => {
      const cel = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const linhas = [['Nome', 'E-mail', 'WhatsApp', 'Cargo', 'Igreja', 'Data', 'Usuário no app'],
        ...lista.map(i => [i.nome, i.email, foneBonito(i.telefone), i.cargo, i.igreja, i.criado_em, i.aluno_usuario || ''])];
      const blob = new Blob(['﻿' + linhas.map(l => l.map(cel).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'inscricoes-teologia.csv';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
  });

  VB.registrar(/^\/p\/aluno\/(\d+)$/, 'professor', async id => {
    carregando('alunos');
    const d = await VB.api(`/api/admin/alunos/${id}`);
    const al = d.aluno;
    document.title = `${al.nome} · VideiraBook`;
    $('#conteudo').innerHTML = `
      <div class="migalha"><a href="#/p/alunos">Alunos</a><span>/</span><span>${esc(al.nome)}</span></div>
      ${cabecalho(esc(al.nome), `Usuário <strong>${esc(al.usuario)}</strong>${al.telefone ? ` · ${esc(al.telefone)}` : ''} · último acesso ${VB.quando(al.ultimo_acesso)}`,
        `${al.telefone ? `<a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/55${al.telefone.replace(/\D/g, '').replace(/^55/, '')}">WhatsApp</a>` : ''}<button class="btn sec" id="editar">${icone.lapis}Editar</button>`)}
      ${d.cursos.map(c => `
        <div class="painel" style="margin-bottom:20px">
          <div class="progresso-curso" style="margin-bottom:1rem">${VB.anel(c.resumo.percentual, 76)}<div><h3 style="margin:0">${esc(c.curso.titulo)}</h3><p class="muted" style="margin:.2rem 0 0">${c.resumo.concluidas} de ${c.resumo.total} aulas concluídas</p></div></div>
          <div class="tabela-wrap"><table class="tabela"><thead><tr><th>Sem.</th><th>Aula</th><th>Checklist</th><th class="col-opc">Questionário</th><th>Encontro</th></tr></thead><tbody>
          ${c.aulas.map(a => `<tr><td class="muted">${a.semana}</td><td><a href="#/p/aula/${a.id}" style="color:inherit">${esc(a.titulo)}</a></td>
            <td><div class="mini-barra">${VB.barra(a.progresso)}<span class="pequeno muted">${a.progresso}%</span></div></td>
            <td class="col-opc">${a.quiz ? `${a.quiz.acertos}/${a.quiz.total}` : '<span class="muted">—</span>'}</td>
            <td>${a.presente ? '<span class="selo verde">Presente</span>' : (a.data_encontro && a.data_encontro < new Date().toISOString().slice(0, 10) ? '<span class="selo">Ausente</span>' : '<span class="muted pequeno">—</span>')}</td></tr>`).join('')}
          </tbody></table></div>
        </div>`).join('')}`;
    $('#editar').addEventListener('click', () => formAluno(al, () => VB.rota()));
  });

  // ═════════════ CURSOS
  VB.registrar(/^\/p\/cursos$/, 'professor', async () => {
    carregando('cursos'); document.title = 'Cursos · VideiraBook';
    const cursos = await VB.api('/api/cursos');
    $('#conteudo').innerHTML = `
      ${cabecalho('Cursos e aulas', 'Cada curso é um tema de estudo com seus módulos e aulas semanais.', `<button class="btn" id="novo-curso">${icone.mais}Novo curso</button>`)}
      ${cursos.map(c => `<a class="folha-aula" style="margin-bottom:14px" href="#/p/curso/${c.id}">
        <span class="semana">${c.modulos} módulos · ${c.resumo.total} aulas</span><h3>${esc(c.titulo)}</h3>
        <div class="meta"><span>${esc(c.descricao || '')}</span></div>
        <div class="estado">${c.publicado ? '<span class="selo verde">Publicado</span>' : '<span class="selo">Oculto dos alunos</span>'}</div></a>`).join('')
        || '<div class="vazio"><strong>Nenhum curso</strong>Crie o primeiro curso para começar a montar a grade.</div>'}`;
    $('#novo-curso').addEventListener('click', () => formCurso(null));
  });

  function formCurso(c) {
    const m = VB.modal({
      titulo: c ? 'Editar curso' : 'Novo curso',
      corpo: `<form id="f"><label class="campo"><span>Título</span><input class="input" name="titulo" required value="${esc(c?.titulo || '')}"></label>
        <label class="campo"><span>Descrição</span><textarea class="input" name="descricao">${esc(c?.descricao || '')}</textarea></label>
        ${c ? `<label class="chave"><input type="checkbox" name="publicado" ${c.publicado ? 'checked' : ''}>Visível para os alunos</label>` : ''}</form>`,
      rodape: `${c ? '<button class="btn perigo" id="excluir" style="margin-right:auto">Excluir curso</button>' : ''}<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="ok">Salvar</button>`,
    });
    const f = m.el.querySelector('#f');
    m.el.querySelector('#ok').addEventListener('click', async () => {
      if (!f.reportValidity()) return;
      try {
        if (c) await VB.api(`/api/admin/cursos/${c.id}`, { method: 'PUT', body: { titulo: f.titulo.value, descricao: f.descricao.value, publicado: f.publicado.checked } });
        else { const r = await VB.api('/api/admin/cursos', { method: 'POST', body: { titulo: f.titulo.value, descricao: f.descricao.value } }); location.hash = `#/p/curso/${r.id}`; }
        m.fechar(); VB.toast('Curso salvo'); VB.rota();
      } catch (e) { VB.erro(e); }
    });
    const ex = m.el.querySelector('#excluir');
    if (ex) ex.addEventListener('click', async () => {
      m.fechar();
      if (!(await VB.confirmar('Excluir curso', `Isso apaga <strong>${esc(c.titulo)}</strong> com todos os módulos, aulas, materiais e o progresso dos alunos. Não dá para desfazer.`))) return;
      await VB.api(`/api/admin/cursos/${c.id}`, { method: 'DELETE' }); VB.toast('Curso excluído'); location.hash = '#/p/cursos';
    });
  }

  function formModulo(cursoId, mod) {
    const m = VB.modal({
      titulo: mod ? 'Editar módulo' : 'Novo módulo',
      corpo: `<form id="f"><label class="campo"><span>Título</span><input class="input" name="titulo" required value="${esc(mod?.titulo || '')}"></label>
        <label class="campo"><span>Descrição</span><textarea class="input" name="descricao">${esc(mod?.descricao || '')}</textarea></label></form>`,
      rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="ok">Salvar</button>`,
    });
    const f = m.el.querySelector('#f');
    m.el.querySelector('#ok').addEventListener('click', async () => {
      if (!f.reportValidity()) return;
      try {
        if (mod) await VB.api(`/api/admin/modulos/${mod.id}`, { method: 'PUT', body: { titulo: f.titulo.value, descricao: f.descricao.value } });
        else await VB.api('/api/admin/modulos', { method: 'POST', body: { curso_id: cursoId, titulo: f.titulo.value, descricao: f.descricao.value } });
        m.fechar(); VB.toast('Módulo salvo'); VB.rota();
      } catch (e) { VB.erro(e); }
    });
  }

  VB.registrar(/^\/p\/curso\/(\d+)$/, 'professor', async id => {
    carregando('cursos');
    const v = await VB.api(`/api/cursos/${id}`);
    const c = v.curso;
    document.title = `${c.titulo} · VideiraBook`;
    let nMod = 0;
    $('#conteudo').innerHTML = `
      <div class="migalha"><a href="#/p/cursos">Cursos</a><span>/</span><span>${esc(c.titulo)}</span></div>
      ${cabecalho(esc(c.titulo), `${v.modulos.length} módulos · ${v.aulas.length} aulas · ${c.publicado ? 'visível para os alunos' : 'oculto dos alunos'}`,
        `<a class="btn sec" href="#/curso/${c.id}">${icone.olho}Ver como aluno</a><button class="btn sec" id="ed-curso">${icone.lapis}Editar curso</button><button class="btn" id="novo-mod">${icone.mais}Novo módulo</button>`)}

      <div class="painel" style="margin-bottom:20px">
        <div class="painel-cab"><h3>Livro-texto</h3>${c.livro_arquivo ? '<span class="selo verde">Enviado</span>' : '<span class="selo ouro">Ainda não enviado</span>'}</div>
        <p class="muted" style="margin:0 0 1rem">Com o PDF enviado, cada aula mostra o botão “Abrir na página” que leva o aluno direto às páginas da lição.</p>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;align-items:center">
          ${c.livro_arquivo ? `<a class="btn sec arquivo" target="_blank" rel="noopener" href="/arquivos/${encodeURIComponent(c.livro_arquivo)}">${icone.pdf}<span>${esc(c.livro_nome || 'livro.pdf')}</span></a>` : ''}
          <label class="btn ${c.livro_arquivo ? 'fantasma' : ''}">${icone.upload}${c.livro_arquivo ? 'Trocar PDF' : 'Enviar PDF do livro'}<input type="file" accept="application/pdf" id="livro" hidden></label>
          ${c.livro_arquivo ? '<button class="btn perigo mini" id="rem-livro">Remover</button>' : ''}
        </div>
        <div class="barra-progresso-upload oculto" id="up-livro"><i></i></div>
      </div>

      <div class="painel" style="margin-bottom:20px;display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <p class="muted" style="margin:0;max-width:60ch">As aulas abrem sozinhas ${VB.config.dias_antes_liberar || 0} dias antes do encontro. Você pode liberar uma aula antes, dentro do editor dela, ou liberar todas de uma vez.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn sec mini" id="lib-todas">Liberar todas</button><button class="btn sec mini" id="bloq-todas">Voltar ao calendário</button><button class="btn sec mini" id="recalc">Recalcular datas</button></div>
      </div>

      ${v.modulos.map(m => `
        <section class="mod-bloco">
          <div class="mod-cab">
            <span class="num">Módulo ${++nMod}</span><h3>${esc(m.titulo)}</h3>
            <div class="ordem-btns">
              <button class="icone-btn" data-mod-mover="${m.id}" data-dir="-1" aria-label="Subir módulo">${icone.cima}</button>
              <button class="icone-btn" data-mod-mover="${m.id}" data-dir="1" aria-label="Descer módulo">${icone.baixo}</button>
              <button class="icone-btn" data-mod-editar="${m.id}" aria-label="Editar módulo">${icone.lapis}</button>
              <button class="icone-btn" data-mod-excluir="${m.id}" aria-label="Excluir módulo">${icone.lixo}</button>
            </div>
          </div>
          ${m.aulas.map(a => `<div class="aula-linha">
            <span class="sem" title="Semana">${a.semana}</span>
            <div><a class="tit" href="#/p/aula/${a.id}">${esc(a.titulo)}</a><small>${a.data_encontro ? esc(VB.dataLonga(a.data_encontro)) : 'sem data'}${a.pagina_inicio ? ` · págs. ${a.pagina_inicio}–${a.pagina_fim || a.pagina_inicio}` : ''}</small></div>
            <div class="selos">${!a.publicada ? '<span class="selo">Rascunho</span>' : ''}${a.liberada ? '<span class="selo verde">Liberada</span>' : ''}${a.pre_estudo ? `<span class="selo vinho">${a.pre_estudo} pré-estudo</span>` : ''}</div>
            <div class="ordem-btns">
              <button class="icone-btn" data-aula-mover="${a.id}" data-dir="-1" aria-label="Subir aula">${icone.cima}</button>
              <button class="icone-btn" data-aula-mover="${a.id}" data-dir="1" aria-label="Descer aula">${icone.baixo}</button>
            </div>
          </div>`).join('')}
          <div style="padding:10px 16px;border-top:1px solid var(--linha-2)"><button class="btn fantasma mini" data-nova-aula="${m.id}">${icone.mais}Adicionar aula</button></div>
        </section>`).join('') || '<div class="vazio"><strong>Nenhum módulo</strong>Crie um módulo para organizar as aulas.</div>'}`;

    $('#ed-curso').addEventListener('click', () => formCurso(c));
    $('#novo-mod').addEventListener('click', () => formModulo(c.id));
    $('#livro').addEventListener('change', async e => {
      const arq = e.target.files[0]; if (!arq) return;
      const fd = new FormData(); fd.append('arquivo', arq);
      const bar = $('#up-livro'); bar.classList.remove('oculto');
      try { await VB.enviar(`/api/admin/cursos/${c.id}/livro`, fd, 'POST', p => { bar.firstElementChild.style.width = p + '%'; }); VB.toast('Livro enviado'); VB.rota(); }
      catch (er) { VB.erro(er); bar.classList.add('oculto'); }
    });
    const rem = $('#rem-livro');
    if (rem) rem.addEventListener('click', async () => {
      if (!(await VB.confirmar('Remover livro-texto', 'Os alunos deixarão de ver o botão para abrir o livro nas aulas.', 'Remover'))) return;
      await VB.api(`/api/admin/cursos/${c.id}/livro`, { method: 'DELETE' }); VB.rota();
    });
    $('#lib-todas').addEventListener('click', async () => { await VB.api(`/api/admin/cursos/${c.id}/liberar-todas`, { method: 'POST', body: { liberar: true } }); VB.toast('Todas as aulas liberadas'); VB.rota(); });
    $('#bloq-todas').addEventListener('click', async () => { await VB.api(`/api/admin/cursos/${c.id}/liberar-todas`, { method: 'POST', body: { liberar: false } }); VB.toast('As aulas voltaram a abrir pelo calendário'); VB.rota(); });
    $('#recalc').addEventListener('click', async () => {
      if (!(await VB.confirmar('Recalcular datas', `As datas dos encontros serão refeitas a partir de ${VB.dataLonga(VB.config.data_inicio)}, uma aula por semana, na ordem da grade.`, 'Recalcular'))) return;
      await VB.api(`/api/admin/cursos/${c.id}/recalcular`, { method: 'POST', body: {} }); VB.toast('Datas recalculadas'); VB.rota();
    });
    $$('[data-mod-mover]').forEach(b => b.addEventListener('click', async () => { await VB.api('/api/admin/reordenar', { method: 'POST', body: { tipo: 'modulo', id: Number(b.dataset.modMover), direcao: Number(b.dataset.dir) } }); VB.rota(); }));
    $$('[data-aula-mover]').forEach(b => b.addEventListener('click', async () => { await VB.api('/api/admin/reordenar', { method: 'POST', body: { tipo: 'aula', id: Number(b.dataset.aulaMover), direcao: Number(b.dataset.dir) } }); VB.rota(); }));
    $$('[data-mod-editar]').forEach(b => b.addEventListener('click', () => formModulo(c.id, v.modulos.find(m => m.id === Number(b.dataset.modEditar)))));
    $$('[data-mod-excluir]').forEach(b => b.addEventListener('click', async () => {
      const m = v.modulos.find(x => x.id === Number(b.dataset.modExcluir));
      if (!(await VB.confirmar('Excluir módulo', `Excluir <strong>${esc(m.titulo)}</strong> apaga suas ${m.aulas.length} aulas, materiais e o progresso dos alunos nelas.`))) return;
      await VB.api(`/api/admin/modulos/${m.id}`, { method: 'DELETE' }); VB.toast('Módulo excluído'); VB.rota();
    }));
    $$('[data-nova-aula]').forEach(b => b.addEventListener('click', () => {
      const m = VB.modal({ titulo: 'Nova aula', corpo: '<form id="f"><label class="campo"><span>Título da aula</span><input class="input" name="titulo" required></label><p class="muted pequeno" style="margin:0">A aula nasce como rascunho. Publique quando estiver pronta.</p></form>',
        rodape: '<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="ok">Criar e editar</button>' });
      const f = m.el.querySelector('#f');
      const criar = async () => {
        if (!f.reportValidity()) return;
        try { const r = await VB.api('/api/admin/aulas', { method: 'POST', body: { modulo_id: Number(b.dataset.novaAula), titulo: f.titulo.value } }); m.fechar(); location.hash = `#/p/aula/${r.id}`; }
        catch (e) { VB.erro(e); }
      };
      m.el.querySelector('#ok').addEventListener('click', criar);
      f.addEventListener('submit', e => { e.preventDefault(); criar(); });
    }));
  });

  // ═════════════ EDITOR DE AULA
  let abaAtual = 'conteudo';
  VB.registrar(/^\/p\/aula\/(\d+)$/, 'professor', async id => {
    carregando('cursos');
    const d = await VB.api(`/api/admin/aulas/${id}`);
    const a = d.aula;
    document.title = `${a.titulo} · Editor · VideiraBook`;
    const abas = [
      ['conteudo', 'Conteúdo', ''],
      ['materiais', 'Materiais', d.materiais.length],
      ['checklist', 'Checklist', d.checklist.length],
      ['quiz', 'Questionário', d.quiz.length],
      ['turma', 'Turma e presença', d.alunos.filter(x => x.presente).length + '/' + d.alunos.length],
    ];
    $('#conteudo').innerHTML = `
      <div class="migalha"><a href="#/p/cursos">Cursos</a><span>/</span><a href="#/p/curso/${a.curso_id}">${esc(a.modulo_titulo)}</a><span>/</span><span>${esc(a.titulo)}</span></div>
      ${cabecalho(esc(a.titulo), `${a.data_encontro ? `Encontro ${esc(VB.dataLonga(a.data_encontro))}` : 'Sem data de encontro'} · ${a.publicada ? 'publicada' : 'rascunho'}${a.liberada ? ' · liberada' : ''}`,
        `<a class="btn sec" href="#/aula/${a.id}">${icone.olho}Ver como aluno</a><button class="btn perigo" id="excluir-aula">${icone.lixo}Excluir</button>`)}
      <div class="abas" role="tablist">${abas.map(x => `<button role="tab" data-aba="${x[0]}" class="${abaAtual === x[0] ? 'ativo' : ''}">${x[1]}${x[2] !== '' ? `<span class="cont">${x[2]}</span>` : ''}</button>`).join('')}</div>
      <div id="aba"></div>`;
    $$('[data-aba]').forEach(b => b.addEventListener('click', () => { abaAtual = b.dataset.aba; $$('[data-aba]').forEach(x => x.classList.toggle('ativo', x === b)); desenharAba(d); }));
    $('#excluir-aula').addEventListener('click', async () => {
      if (!(await VB.confirmar('Excluir aula', `Excluir <strong>${esc(a.titulo)}</strong> apaga materiais, questionário e o progresso dos alunos nesta aula.`))) return;
      await VB.api(`/api/admin/aulas/${a.id}`, { method: 'DELETE' }); VB.toast('Aula excluída'); location.hash = `#/p/curso/${a.curso_id}`;
    });
    desenharAba(d);
  });

  function desenharAba(d) {
    const alvo = $('#aba');
    ({ conteudo: abaConteudo, materiais: abaMateriais, checklist: abaChecklist, quiz: abaQuiz, turma: abaTurma }[abaAtual] || abaConteudo)(d, alvo);
  }
  const recarregarAula = () => VB.rota();

  // Conteúdo
  function abaConteudo(d, alvo) {
    const a = d.aula;
    alvo.innerHTML = `<form id="f-aula">
      <div class="grade-2">
        <div>
          <label class="campo"><span>Título</span><input class="input" name="titulo" required value="${esc(a.titulo)}"></label>
          <label class="campo"><span>Subtítulo</span><input class="input" name="subtitulo" value="${esc(a.subtitulo || '')}"></label>
          <label class="campo"><span>Objetivo da aula</span><textarea class="input" name="objetivo" style="min-height:80px">${esc(a.objetivo || '')}</textarea></label>
          <div class="campo"><span>Explicação</span>
            <div class="editor">
              <div class="editor-barra" role="toolbar" aria-label="Formatação">
                <button type="button" data-cmd="formatBlock" data-v="H3" title="Subtítulo">Título</button>
                <button type="button" data-cmd="formatBlock" data-v="P" title="Parágrafo">Texto</button>
                <button type="button" data-cmd="bold" title="Negrito"><b>N</b></button>
                <button type="button" data-cmd="italic" title="Itálico"><i>I</i></button>
                <button type="button" data-cmd="insertUnorderedList" title="Lista">• Lista</button>
                <button type="button" data-cmd="insertOrderedList" title="Lista numerada">1. Lista</button>
                <button type="button" data-cmd="formatBlock" data-v="BLOCKQUOTE" title="Citação">“ Citação</button>
                <button type="button" data-cmd="link" title="Link">Link</button>
                <button type="button" data-cmd="removeFormat" title="Limpar formatação">Limpar</button>
              </div>
              <div class="editor-area leitura" id="editor" contenteditable="true" style="font-size:1.08rem">${VB.limparHtml(a.conteudo_html || '')}</div>
            </div>
          </div>
          <label class="campo"><span>Perguntas para refletir</span><textarea class="input" name="reflexao">${esc(a.reflexao.join('\n'))}</textarea><small>Uma pergunta por linha.</small></label>
          <label class="campo"><span>Aplicação para a semana</span><textarea class="input" name="aplicacao" style="min-height:80px">${esc(a.aplicacao || '')}</textarea></label>
        </div>
        <div>
          <div class="painel">
            <h3>Publicação</h3>
            <label class="chave" style="margin-bottom:.8rem"><input type="checkbox" name="publicada" ${a.publicada ? 'checked' : ''}>Publicada (aparece na jornada)</label>
            <label class="chave"><input type="checkbox" name="liberada" ${a.liberada ? 'checked' : ''}>Liberar agora, sem esperar a data</label>
            <p class="muted pequeno" style="margin:.7rem 0 0">Sem liberar manualmente, a aula abre ${VB.config.dias_antes_liberar || 0} dias antes do encontro${VB.config.sequencial === '1' ? ', e só depois que o aluno concluir a anterior' : ''}.</p>
          </div>
          <div class="painel">
            <h3>Encontro e leitura</h3>
            <label class="campo"><span>Data do encontro</span><input class="input" type="date" name="data_encontro" value="${esc(a.data_encontro || '')}"></label>
            <label class="campo"><span>Módulo</span><select class="input" name="modulo_id">${d.modulos.map(m => `<option value="${m.id}" ${m.id === a.modulo_id ? 'selected' : ''}>${esc(m.titulo)}</option>`).join('')}</select></label>
            <label class="campo"><span>Texto-base</span><input class="input" name="texto_base" value="${esc(a.texto_base || '')}" placeholder="Ex.: João 15.1-8"></label>
            <div class="linha-campos" style="grid-template-columns:1fr 1fr">
              <label class="campo"><span>Página inicial</span><input class="input" type="number" min="1" name="pagina_inicio" value="${a.pagina_inicio ?? ''}"></label>
              <label class="campo"><span>Página final</span><input class="input" type="number" min="1" name="pagina_fim" value="${a.pagina_fim ?? ''}"></label>
            </div>
            <label class="campo" style="margin:0"><span>Tópicos da aula</span><textarea class="input" name="topicos">${esc(a.topicos.join('\n'))}</textarea><small>Um tópico por linha.</small></label>
          </div>
          <button class="btn" type="submit" style="width:100%">Salvar aula</button>
        </div>
      </div></form>`;
    const ed = $('#editor');
    $$('[data-cmd]', alvo).forEach(b => b.addEventListener('click', () => {
      ed.focus();
      if (b.dataset.cmd === 'link') { const u = prompt('Endereço do link (https://...)'); if (u) document.execCommand('createLink', false, u); return; }
      document.execCommand(b.dataset.cmd, false, b.dataset.v ? `<${b.dataset.v}>` : null);
    }));
    ed.addEventListener('paste', e => {
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      const txt = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, html ? VB.limparHtml(html) : esc(txt).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>'));
    });
    $('#f-aula').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      const linhas = s => s.split('\n').map(x => x.trim()).filter(Boolean);
      const corpo = {
        titulo: f.titulo.value, subtitulo: f.subtitulo.value, objetivo: f.objetivo.value, texto_base: f.texto_base.value,
        conteudo_html: VB.limparHtml(ed.innerHTML), aplicacao: f.aplicacao.value, reflexao: linhas(f.reflexao.value), topicos: linhas(f.topicos.value),
        pagina_inicio: f.pagina_inicio.value, pagina_fim: f.pagina_fim.value, data_encontro: f.data_encontro.value,
        publicada: f.publicada.checked, liberada: f.liberada.checked, modulo_id: Number(f.modulo_id.value),
      };
      try { await VB.api(`/api/admin/aulas/${d.aula.id}`, { method: 'PUT', body: corpo }); VB.toast('Aula salva'); recarregarAula(); }
      catch (er) { VB.erro(er); }
    });
  }

  // Materiais
  function abaMateriais(d, alvo) {
    alvo.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
        <p class="muted" style="margin:0;max-width:60ch">Vídeos marcados como pré-estudo aparecem no topo da aula, para o aluno ver antes do encontro. Cada material entra no checklist automaticamente.</p>
        <button class="btn" id="novo-mat">${icone.mais}Adicionar material</button></div>
      ${d.materiais.length ? d.materiais.map(m => `<div class="mat-item"><span class="tipo">${VB.iconeTipo(m.tipo)}</span>
        <div><strong>${esc(m.titulo)}</strong><small>${VB.nomeTipo[m.tipo]}${m.pre_estudo ? ' · pré-estudo' : ''} · ${esc(m.arquivo_nome || m.url || (m.conteudo ? 'texto escrito' : ''))}</small></div>
        <div class="ordem-btns"><button class="icone-btn" data-ed="${m.id}" aria-label="Editar">${icone.lapis}</button><button class="icone-btn" data-ex="${m.id}" aria-label="Excluir">${icone.lixo}</button></div></div>`).join('')
        : '<div class="vazio"><strong>Nenhum material ainda</strong>Adicione o vídeo de pré-estudo, PDFs de apoio, textos ou links.</div>'}`;
    $('#novo-mat').addEventListener('click', () => formMaterial(d.aula.id, null));
    $$('[data-ed]', alvo).forEach(b => b.addEventListener('click', () => formMaterial(d.aula.id, d.materiais.find(m => m.id === Number(b.dataset.ed)))));
    $$('[data-ex]', alvo).forEach(b => b.addEventListener('click', async () => {
      const m = d.materiais.find(x => x.id === Number(b.dataset.ex));
      if (!(await VB.confirmar('Excluir material', `Excluir <strong>${esc(m.titulo)}</strong>? O item correspondente sai do checklist.`))) return;
      await VB.api(`/api/admin/materiais/${m.id}`, { method: 'DELETE' }); VB.toast('Material excluído'); recarregarAula();
    }));
  }

  function formMaterial(aulaId, mat) {
    const tipos = ['video', 'pdf', 'texto', 'link', 'audio'];
    const tipo0 = mat?.tipo || 'video';
    const m = VB.modal({
      titulo: mat ? 'Editar material' : 'Adicionar material', largo: true,
      corpo: `<form id="f-mat">
        <div class="tipo-escolha" role="radiogroup" aria-label="Tipo">${tipos.map(t => `<label><input type="radio" name="tipo" value="${t}" ${t === tipo0 ? 'checked' : ''}>${VB.iconeTipo(t)}${VB.nomeTipo[t]}</label>`).join('')}</div>
        <label class="campo"><span>Título</span><input class="input" name="titulo" required value="${esc(mat?.titulo || '')}" placeholder="Ex.: Introdução à Bibliologia"></label>
        <label class="campo"><span>Descrição (opcional)</span><input class="input" name="descricao" value="${esc(mat?.descricao || '')}"></label>
        <div data-para="video audio pdf link"><label class="campo"><span id="rot-url">Link</span><input class="input" name="url" value="${esc(mat?.url || '')}" placeholder="https://"><small id="dica-url"></small></label></div>
        <div data-para="video audio pdf"><label class="campo"><span id="rot-arq">Ou envie um arquivo</span><input class="input" type="file" name="arquivo" style="padding:.5rem">${mat?.arquivo_nome ? `<small>Atual: ${esc(mat.arquivo_nome)}. Envie outro para substituir.</small>` : ''}</label>
          <div class="barra-progresso-upload oculto" id="up-mat"><i></i></div></div>
        <div data-para="texto"><label class="campo"><span>Texto</span><textarea class="input" name="conteudo" style="min-height:200px">${esc(mat?.conteudo || '')}</textarea><small>Deixe uma linha em branco entre os parágrafos.</small></label></div>
        <label class="chave" style="margin-bottom:.7rem"><input type="checkbox" name="pre_estudo" ${mat ? (mat.pre_estudo ? 'checked' : '') : 'checked'}>Pré-estudo (ver antes do encontro)</label>
        ${!mat ? '<label class="chave"><input type="checkbox" name="no_checklist" checked>Adicionar ao checklist da aula</label>' : ''}
      </form>`,
      rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="ok">${mat ? 'Salvar' : 'Adicionar'}</button>`,
    });
    const f = m.el.querySelector('#f-mat');
    const atualizar = () => {
      const t = f.tipo.value;
      $$('[data-para]', f).forEach(el => el.classList.toggle('oculto', !el.dataset.para.split(' ').includes(t)));
      $('#rot-url').textContent = t === 'video' ? 'Link do vídeo' : t === 'pdf' ? 'Link do PDF' : t === 'audio' ? 'Link do áudio' : 'Link';
      $('#dica-url').textContent = t === 'video' ? 'YouTube, Vimeo ou Google Drive. O vídeo aparece dentro da aula.' : '';
      f.arquivo.accept = t === 'pdf' ? 'application/pdf' : t === 'video' ? 'video/*' : t === 'audio' ? 'audio/*' : '';
      if (!mat) f.pre_estudo.checked = t === 'video';
    };
    $$('input[name=tipo]', f).forEach(r => r.addEventListener('change', atualizar));
    atualizar();
    if (mat) f.pre_estudo.checked = !!mat.pre_estudo;
    m.el.querySelector('#ok').addEventListener('click', async () => {
      if (!f.reportValidity()) return;
      const t = f.tipo.value;
      const temArq = f.arquivo.files.length > 0;
      if (!mat && t !== 'texto' && !f.url.value.trim() && !temArq) return VB.toast('Cole um link ou escolha um arquivo', true);
      if (t === 'texto' && !f.conteudo.value.trim()) return VB.toast('Escreva o texto do material', true);
      const fd = new FormData();
      fd.append('tipo', t); fd.append('titulo', f.titulo.value); fd.append('descricao', f.descricao.value);
      fd.append('url', ['texto'].includes(t) ? '' : f.url.value.trim()); fd.append('conteudo', t === 'texto' ? f.conteudo.value : '');
      fd.append('pre_estudo', f.pre_estudo.checked ? '1' : '0');
      if (!mat) fd.append('no_checklist', f.no_checklist.checked ? '1' : '0');
      if (temArq && t !== 'texto' && t !== 'link') fd.append('arquivo', f.arquivo.files[0]);
      const bt = m.el.querySelector('#ok'); bt.disabled = true;
      const bar = $('#up-mat'); if (temArq) bar.classList.remove('oculto');
      try {
        await VB.enviar(mat ? `/api/admin/materiais/${mat.id}` : `/api/admin/aulas/${aulaId}/materiais`, fd, mat ? 'PUT' : 'POST', p => { bar.firstElementChild.style.width = p + '%'; });
        m.fechar(); VB.toast(mat ? 'Material salvo' : 'Material adicionado'); recarregarAula();
      } catch (e) { VB.erro(e); bt.disabled = false; }
    });
  }

  // Checklist
  const ROT_TIPO = { manual: 'Marcado pelo aluno', leitura: 'Leitura do livro', material: 'Ligado a um material', quiz: 'Automático ao enviar o questionário', encontro: 'Marcado por você na presença' };
  function abaChecklist(d, alvo) {
    alvo.innerHTML = `
      <p class="muted" style="margin:0 0 1rem;max-width:64ch">O aluno conclui a aula quando marca todos os itens, exceto a presença no encontro, que você marca na aba Turma e presença.</p>
      <ul class="lista-edit">${d.checklist.map((c, i) => `<li>
        <div class="txt">${esc(c.texto)}<small>${ROT_TIPO[c.tipo] || ''}</small></div>
        <button class="icone-btn" data-mv="${c.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">${icone.cima}</button>
        <button class="icone-btn" data-mv="${c.id}" data-dir="1" ${i === d.checklist.length - 1 ? 'disabled' : ''} aria-label="Descer">${icone.baixo}</button>
        ${['manual', 'leitura', 'encontro'].includes(c.tipo) ? `<button class="icone-btn" data-ed="${c.id}" aria-label="Editar">${icone.lapis}</button>` : ''}
        ${c.tipo !== 'quiz' && c.tipo !== 'material' ? `<button class="icone-btn" data-ex="${c.id}" aria-label="Excluir">${icone.lixo}</button>` : ''}
      </li>`).join('')}</ul>
      <form id="f-item" style="display:flex;gap:.5rem;margin-top:1rem;max-width:620px"><input class="input" name="texto" placeholder="Novo item, ex.: Assistir ao culto de oração de quarta" required><button class="btn">Adicionar</button></form>`;
    $('#f-item').addEventListener('submit', async e => {
      e.preventDefault();
      try { await VB.api(`/api/admin/aulas/${d.aula.id}/checklist`, { method: 'POST', body: { texto: e.target.texto.value } }); recarregarAula(); } catch (er) { VB.erro(er); }
    });
    $$('[data-mv]', alvo).forEach(b => b.addEventListener('click', async () => { await VB.api(`/api/admin/checklist/${b.dataset.mv}/mover`, { method: 'POST', body: { direcao: Number(b.dataset.dir) } }); recarregarAula(); }));
    $$('[data-ed]', alvo).forEach(b => b.addEventListener('click', async () => {
      const c = d.checklist.find(x => x.id === Number(b.dataset.ed));
      const t = prompt('Texto do item', c.texto);
      if (t && t.trim()) { await VB.api(`/api/admin/checklist/${c.id}`, { method: 'PUT', body: { texto: t.trim() } }); recarregarAula(); }
    }));
    $$('[data-ex]', alvo).forEach(b => b.addEventListener('click', async () => {
      if (!(await VB.confirmar('Excluir item', 'O item sai do checklist de todos os alunos.'))) return;
      await VB.api(`/api/admin/checklist/${b.dataset.ex}`, { method: 'DELETE' }); recarregarAula();
    }));
  }

  // Questionário
  function abaQuiz(d, alvo) {
    alvo.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
        <p class="muted" style="margin:0">Perguntas de múltipla escolha. O aluno vê o gabarito e a explicação depois de enviar.</p>
        <button class="btn" id="nova-q">${icone.mais}Nova pergunta</button></div>
      ${d.quiz.length ? d.quiz.map((q, i) => `<div class="quiz-edit">
        <div style="display:flex;gap:1rem;justify-content:space-between;align-items:start"><h4>${i + 1}. ${esc(q.pergunta)}</h4>
          <div class="ordem-btns"><button class="icone-btn" data-ed="${q.id}" aria-label="Editar">${icone.lapis}</button><button class="icone-btn" data-ex="${q.id}" aria-label="Excluir">${icone.lixo}</button></div></div>
        <ol type="a">${q.opcoes.map((o, j) => `<li class="${j === q.correta ? 'certa' : ''}">${esc(o)}</li>`).join('')}</ol>
        ${q.explicacao ? `<p class="explicacao">${esc(q.explicacao)}</p>` : ''}</div>`).join('')
        : '<div class="vazio"><strong>Sem questionário</strong>Crie perguntas para fixar o conteúdo da aula.</div>'}`;
    $('#nova-q').addEventListener('click', () => formQuiz(d.aula.id, null));
    $$('[data-ed]', alvo).forEach(b => b.addEventListener('click', () => formQuiz(d.aula.id, d.quiz.find(q => q.id === Number(b.dataset.ed)))));
    $$('[data-ex]', alvo).forEach(b => b.addEventListener('click', async () => {
      if (!(await VB.confirmar('Excluir pergunta', 'A pergunta sai do questionário desta aula.'))) return;
      await VB.api(`/api/admin/quiz/${b.dataset.ex}`, { method: 'DELETE' }); recarregarAula();
    }));
  }
  function formQuiz(aulaId, q) {
    const ops = q ? [...q.opcoes] : ['', '', '', ''];
    while (ops.length < 4) ops.push('');
    const m = VB.modal({
      titulo: q ? 'Editar pergunta' : 'Nova pergunta', largo: true,
      corpo: `<form id="f-q"><label class="campo"><span>Pergunta</span><textarea class="input" name="pergunta" required style="min-height:70px">${esc(q?.pergunta || '')}</textarea></label>
        <div class="campo"><span>Opções <small style="font-weight:400">(marque a correta)</small></span>
          ${ops.map((o, j) => `<div class="op-linha"><input type="radio" name="correta" value="${j}" ${q ? (q.correta === j ? 'checked' : '') : (j === 0 ? 'checked' : '')} aria-label="Opção ${j + 1} é a correta"><input class="input" name="op${j}" value="${esc(o)}" placeholder="Opção ${j + 1}${j > 1 ? ' (opcional)' : ''}"></div>`).join('')}
        </div>
        <label class="campo"><span>Explicação (aparece depois da resposta)</span><input class="input" name="explicacao" value="${esc(q?.explicacao || '')}"></label></form>`,
      rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="ok">Salvar pergunta</button>`,
    });
    const f = m.el.querySelector('#f-q');
    m.el.querySelector('#ok').addEventListener('click', async () => {
      if (!f.reportValidity()) return;
      const lista = [0, 1, 2, 3].map(j => f[`op${j}`].value.trim());
      const correta = Number(f.correta.value);
      if (!lista[correta]) return VB.toast('A opção marcada como correta está vazia', true);
      // remove vazias ajustando o índice da correta
      const cheias = []; let novaCorreta = 0;
      lista.forEach((o, j) => { if (o) { if (j === correta) novaCorreta = cheias.length; cheias.push(o); } });
      const corpo = { pergunta: f.pergunta.value.trim(), opcoes: cheias, correta: novaCorreta, explicacao: f.explicacao.value.trim() };
      try {
        if (q) await VB.api(`/api/admin/quiz/${q.id}`, { method: 'PUT', body: corpo });
        else await VB.api(`/api/admin/aulas/${aulaId}/quiz`, { method: 'POST', body: corpo });
        m.fechar(); VB.toast('Pergunta salva'); recarregarAula();
      } catch (e) { VB.erro(e); }
    });
  }

  // Turma e presença
  function abaTurma(d, alvo) {
    alvo.innerHTML = d.alunos.length ? `
      <p class="muted" style="margin:0 0 1rem">Marque quem esteve no encontro. A presença completa o item “Participar do encontro” no checklist do aluno.</p>
      <div class="tabela-wrap"><table class="tabela"><thead><tr><th>Aluno</th><th>Checklist</th><th class="col-opc">Questionário</th><th>Presente</th></tr></thead><tbody>
      ${d.alunos.map(al => `<tr><td><div class="pessoa"><span class="avatar">${esc(VB.iniciais(al.nome))}</span><strong>${esc(al.nome)}</strong></div></td>
        <td><div class="mini-barra">${VB.barra(al.total ? al.feitos / al.total * 100 : 0)}<span class="pequeno muted">${al.feitos}/${al.total}</span></div></td>
        <td class="col-opc">${al.quiz ? `${al.quiz.acertos}/${al.quiz.total}` : '<span class="muted">—</span>'}</td>
        <td><label class="chave"><input type="checkbox" data-pres="${al.id}" ${al.presente ? 'checked' : ''} aria-label="Presença de ${esc(al.nome)}"></label></td></tr>`).join('')}
      </tbody></table></div>`
      : '<div class="vazio"><strong>Nenhum aluno ativo</strong><a href="#/p/alunos">Cadastre alunos</a> para acompanhar a turma.</div>';
    $$('[data-pres]', alvo).forEach(c => c.addEventListener('change', async () => {
      try { await VB.api(`/api/admin/aulas/${d.aula.id}/presenca`, { method: 'PUT', body: { usuario_id: Number(c.dataset.pres), presente: c.checked } }); VB.toast(c.checked ? 'Presença marcada' : 'Presença removida'); }
      catch (e) { VB.erro(e); c.checked = !c.checked; }
    }));
  }

  // ═════════════ AVISOS
  VB.registrar(/^\/p\/avisos$/, 'professor', async () => {
    carregando('avisos'); document.title = 'Avisos · VideiraBook';
    const lista = await VB.api('/api/avisos');
    $('#conteudo').innerHTML = `${cabecalho('Avisos', 'Recados que aparecem na tela inicial dos alunos.', `<button class="btn" id="novo">${icone.mais}Novo aviso</button>`)}
      <div class="painel" style="max-width:820px">${lista.length ? lista.map(a => `<article class="aviso" style="display:flex;gap:1rem;justify-content:space-between">
        <div><h4>${a.fixado ? `<span class="fixado">${icone.alfinete.replace('<svg', '<svg width="15" height="15"')}</span>` : ''}${esc(a.titulo)}</h4><p>${esc(a.texto)}</p><time>${VB.quando(a.criado_em)}</time></div>
        <div class="ordem-btns"><button class="icone-btn" data-ed="${a.id}" aria-label="Editar">${icone.lapis}</button><button class="icone-btn" data-ex="${a.id}" aria-label="Excluir">${icone.lixo}</button></div></article>`).join('')
        : '<p class="muted" style="margin:0">Nenhum aviso publicado.</p>'}</div>`;
    const form = av => {
      const m = VB.modal({ titulo: av ? 'Editar aviso' : 'Novo aviso',
        corpo: `<form id="f"><label class="campo"><span>Título</span><input class="input" name="titulo" required value="${esc(av?.titulo || '')}"></label>
          <label class="campo"><span>Mensagem</span><textarea class="input" name="texto">${esc(av?.texto || '')}</textarea></label>
          <label class="chave"><input type="checkbox" name="fixado" ${av?.fixado ? 'checked' : ''}>Fixar no topo</label></form>`,
        rodape: `<button class="btn sec" data-fechar>Cancelar</button><button class="btn" id="ok">${av ? 'Salvar' : 'Publicar aviso'}</button>` });
      const f = m.el.querySelector('#f');
      m.el.querySelector('#ok').addEventListener('click', async () => {
        if (!f.reportValidity()) return;
        const corpo = { titulo: f.titulo.value, texto: f.texto.value, fixado: f.fixado.checked };
        try { await VB.api(av ? `/api/admin/avisos/${av.id}` : '/api/admin/avisos', { method: av ? 'PUT' : 'POST', body: corpo }); m.fechar(); VB.toast(av ? 'Aviso salvo' : 'Aviso publicado'); VB.rota(); }
        catch (e) { VB.erro(e); }
      });
    };
    $('#novo').addEventListener('click', () => form(null));
    $$('[data-ed]').forEach(b => b.addEventListener('click', () => form(lista.find(a => a.id === Number(b.dataset.ed)))));
    $$('[data-ex]').forEach(b => b.addEventListener('click', async () => {
      if (!(await VB.confirmar('Excluir aviso', 'O aviso deixa de aparecer para os alunos.'))) return;
      await VB.api(`/api/admin/avisos/${b.dataset.ex}`, { method: 'DELETE' }); VB.rota();
    }));
  });

  // ═════════════ CONFIGURAÇÕES
  VB.registrar(/^\/p\/config$/, 'professor', async () => {
    carregando('config'); document.title = 'Configurações · VideiraBook';
    const c = await VB.api('/api/admin/config');
    $('#conteudo').innerHTML = `${cabecalho('Configurações', 'Dados da turma e regras de liberação das aulas.')}
      <form id="f-cfg" class="painel" style="max-width:820px">
        <h3>Turma e encontros</h3>
        <label class="campo"><span>Nome da turma</span><input class="input" name="nome_turma" value="${esc(c.nome_turma || '')}"></label>
        <div class="linha-campos">
          <label class="campo"><span>Dia do encontro</span><select class="input" name="dia_semana">${VB.DIAS.map((d, i) => `<option value="${i}" ${String(i) === c.dia_semana ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          <label class="campo"><span>Horário</span><input class="input" type="time" name="horario" value="${esc(c.horario || '')}"></label>
          <label class="campo"><span>Duração (minutos)</span><input class="input" type="number" min="15" step="5" name="duracao_min" value="${esc(c.duracao_min || '90')}"></label>
        </div>
        <div class="linha-campos">
          <label class="campo"><span>Local</span><input class="input" name="local" value="${esc(c.local || '')}"></label>
          <label class="campo"><span>Data do primeiro encontro</span><input class="input" type="date" name="data_inicio" value="${esc(c.data_inicio || '')}"><small>As aulas seguem uma por semana a partir desta data.</small></label>
        </div>
        <h3 style="margin-top:.6rem">Liberação das aulas</h3>
        <div class="linha-campos">
          <label class="campo"><span>Abrir a aula quantos dias antes do encontro?</span><input class="input" type="number" min="0" max="60" name="dias_antes_liberar" value="${esc(c.dias_antes_liberar || '7')}"><small>Tempo para o pré-estudo. Use 0 para abrir no dia.</small></label>
        </div>
        <label class="chave" style="margin-bottom:1.2rem"><input type="checkbox" name="sequencial" ${c.sequencial === '1' ? 'checked' : ''}>Seguir a sequência: a próxima aula só abre depois que o aluno conclui a anterior</label>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn" type="submit">Salvar</button><button class="btn sec" type="button" id="salvar-recalc">Salvar e recalcular as datas das aulas</button></div>
      </form>`;
    const salvar = async recalcular => {
      const f = $('#f-cfg');
      const corpo = { nome_turma: f.nome_turma.value, dia_semana: f.dia_semana.value, horario: f.horario.value, duracao_min: f.duracao_min.value, local: f.local.value,
        data_inicio: f.data_inicio.value, dias_antes_liberar: f.dias_antes_liberar.value, sequencial: f.sequencial.checked ? '1' : '0', recalcular };
      const di = VB.data(corpo.data_inicio);
      if (di && String(di.getDay()) !== corpo.dia_semana && !(await VB.confirmar('Dia diferente', `A data do primeiro encontro cai numa ${VB.DIAS[di.getDay()].toLowerCase()}, mas o dia do encontro está como ${VB.DIAS[Number(corpo.dia_semana)].toLowerCase()}. Salvar assim mesmo?`, 'Salvar assim'))) return;
      try { await VB.api('/api/admin/config', { method: 'PUT', body: corpo }); await VB.carregarMe(); VB.toast(recalcular ? 'Salvo e datas recalculadas' : 'Configurações salvas'); }
      catch (e) { VB.erro(e); }
    };
    $('#f-cfg').addEventListener('submit', e => { e.preventDefault(); salvar(false); });
    $('#salvar-recalc').addEventListener('click', () => salvar(true));
  });
})();
