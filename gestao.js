/* VideiraBook — gestão da igreja (administração: painel, rol de membros, financeiro, contas do app e dados da igreja) */
(function () {
  const { esc, icone, $, $$ } = VB;
  const brl = c => (Number(c || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const dBR = d => d ? d.split('-').reverse().join('/') : '—';
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const nomeMes = m => { const [y, mm] = m.split('-').map(Number); return `${MESES[mm - 1]} de ${y}`; };
  const mesAbrev = m => MESES[Number(m.slice(5, 7)) - 1].slice(0, 3);
  const hojeIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const idade = n => { if (!n) return ''; const [y, m, d] = n.split('-').map(Number); const h = new Date(); let i = h.getFullYear() - y; if (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d)) i--; return i >= 0 && i < 130 ? `${i} anos` : ''; };
  const opcoes = (lista, atual) => lista.map(o => `<option ${o === atual ? 'selected' : ''}>${esc(o)}</option>`).join('');
  const valorEdit = c => c ? (c / 100).toFixed(2).replace('.', ',') : '';

  const ABAS = [['painel', 'Painel'], ['membros', 'Membros'], ['financeiro', 'Financeiro'], ['contas', 'Contas do app'], ['igreja', 'Dados da igreja']];
  function moldura(ativa, titulo) {
    VB.molduraAluno('gestao', `<div class="gestao">
      <div class="gestao-cab"><div><p class="gestao-sobre">${esc(VB.me.igreja.nome)}</p><h1>${titulo}</h1></div><div class="acoes" id="g-acoes"></div></div>
      <nav class="abas gestao-abas" aria-label="Gestão da igreja">${ABAS.map(a => `<a href="#/g/${a[0]}" class="${a[0] === ativa ? 'ativo' : ''}" ${a[0] === ativa ? 'aria-current="page"' : ''}>${a[1]}</a>`).join('')}</nav>
      <div id="g-corpo"><div class="carregando"></div></div></div>`);
    document.title = `${titulo} · ${VB.me.igreja.nome}`;
  }
  const corpo = h => { $('#g-corpo').innerHTML = h; };

  // Baixa um relatório (PDF, Word ou planilha) gerado no servidor
  function baixar(url) { const a = document.createElement('a'); a.href = url; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }

  // ═════════ PAINEL
  VB.registrar(/^\/g\/painel$/, 'pastor', async () => {
    moldura('painel', 'Painel da igreja');
    const d = await VB.api('/api/gestao/painel');
    const f = d.financeiro, maxBar = Math.max(1, ...f.meses.flatMap(m => [m.entradas, m.saidas]));
    const link = `${location.origin}${d.endereco}`;
    const sit = Object.fromEntries(d.membros.por_situacao.map(s => [s.situacao, s.n]));
    corpo(`
      <div class="numeros">
        <a class="numero" href="#/g/membros"><b>${d.membros.total}</b><span>${d.membros.total === 1 ? 'pessoa' : 'pessoas'} no rol · ${sit.Membro || 0} ${sit.Membro === 1 ? 'membro' : 'membros'}, ${sit.Congregado || 0} ${sit.Congregado === 1 ? 'congregado' : 'congregados'}</span></a>
        <a class="numero" href="#/g/contas"><b>${d.app.contas}</b><span>${d.app.contas === 1 ? 'conta' : 'contas'} no app · ${d.app.ativos_7} ${d.app.ativos_7 === 1 ? 'entrou' : 'entraram'} nos últimos 7 dias</span></a>
        <a class="numero" href="#/g/financeiro"><b class="n-verde">${brl(f.entradas)}</b><span>entradas em ${MESES[Number(f.mes.slice(5)) - 1]}</span></a>
        <a class="numero" href="#/g/financeiro"><b class="n-vermelho">${brl(f.saidas)}</b><span>saídas em ${MESES[Number(f.mes.slice(5)) - 1]}</span></a>
      </div>
      <div class="grade-2 gestao-grade">
        <div>
          <div class="painel">
            <div class="painel-cab"><h3>Entradas e saídas</h3><span class="selo ${f.saldo < 0 ? '' : 'verde'}">Saldo em caixa ${brl(f.saldo)}</span></div>
            <div class="fin-grafico" role="img" aria-label="Entradas e saídas dos últimos 6 meses">
              ${f.meses.map(m => `<div class="fg-mes"><div class="fg-barras">
                <i class="fg-e" style="height:${(m.entradas / maxBar * 100).toFixed(1)}%" title="Entradas: ${brl(m.entradas)}"></i>
                <i class="fg-s" style="height:${(m.saidas / maxBar * 100).toFixed(1)}%" title="Saídas: ${brl(m.saidas)}"></i></div>
                <span>${mesAbrev(m.mes)}</span></div>`).join('')}
            </div>
            <p class="fin-legenda pequeno"><span><i class="fg-e"></i>Entradas</span><span><i class="fg-s"></i>Saídas</span></p>
            ${f.pendentes.n ? `<p class="aviso-pend">${f.pendentes.n} conta${f.pendentes.n > 1 ? 's' : ''} a pagar em aberto · ${brl(f.pendentes.v)} <a href="#/g/financeiro">Ver</a></p>` : ''}
          </div>
          <div class="painel">
            <h3>Endereço da igreja no app</h3>
            <p class="muted pequeno" style="margin:.2rem 0 .8rem">Envie este link aos membros. Por ele, cada pessoa cria a própria conta e entra no mural da igreja.</p>
            <div class="link-copiar"><code>${esc(link)}</code><button class="btn sec mini" type="button" id="copiar-link">Copiar link</button></div>
          </div>
        </div>
        <div>
          <div class="painel">
            <div class="painel-cab"><h3>Aniversariantes de ${MESES[Number(f.mes.slice(5)) - 1]}</h3><span class="selo ouro">${d.aniversariantes.length}</span></div>
            ${d.aniversariantes.length ? `<ul class="aniv">${d.aniversariantes.map(a => `<li><b>${a.nascimento.slice(8)}</b><span>${esc(a.nome)}<small>faz ${new Date().getFullYear() - Number(a.nascimento.slice(0, 4))} anos${a.telefone ? ` · ${esc(a.telefone)}` : ''}</small></span></li>`).join('')}</ul>`
              : '<p class="muted pequeno" style="margin:0">Ninguém do rol faz aniversário este mês, ou as datas de nascimento ainda não foram preenchidas.</p>'}
          </div>
          <div class="painel">
            <h3>Rol de membros</h3>
            <ul class="sit-lista">${['Membro', 'Congregado', 'Novo convertido', 'Visitante', 'Afastado'].map(s => `<li><span>${s}</span><b>${sit[s] || 0}</b></li>`).join('')}
              <li><span>Batizados</span><b>${d.membros.batizados}</b></li><li><span>Cadastrados este mês</span><b>${d.membros.novos_mes}</b></li></ul>
          </div>
        </div>
      </div>`);
    $('#copiar-link').addEventListener('click', () => navigator.clipboard.writeText(link).then(() => VB.toast('Link copiado')).catch(() => VB.toast('Não foi possível copiar', true)));
  });

  // ═════════ MEMBROS
  let filtroSit = '', buscaMembro = '';
  VB.registrar(/^\/g\/membros$/, 'pastor', async () => {
    moldura('membros', 'Rol de membros');
    const d = await VB.api('/api/gestao/membros');
    $('#g-acoes').innerHTML = `<button class="btn sec" type="button" id="m-exportar">${icone.pdf}Exportar</button><button class="btn" type="button" id="m-novo">${icone.mais}Novo membro</button>`;
    const contas = d.contas_fora.length ? `<div class="painel contas-fora"><div class="painel-cab"><h3>Contas no app sem ficha no rol</h3><span class="selo ouro">${d.contas_fora.length}</span></div>
      <p class="muted pequeno" style="margin:0 0 .6rem">Estas pessoas criaram conta pelo endereço da igreja. Crie a ficha para incluir no rol.</p>
      <ul class="cf-lista">${d.contas_fora.map(u => `<li><span><strong>${esc(u.nome)}</strong><small>${esc(u.email || '')}${u.telefone ? ` · ${esc(u.telefone)}` : ''}</small></span><button class="btn sec mini" type="button" data-ficha="${u.id}">Criar ficha</button></li>`).join('')}</ul></div>` : '';
    corpo(`${contas}
      <div class="filtros-membros">
        <label class="sr" for="m-busca">Buscar no rol</label><input class="input" id="m-busca" type="search" placeholder="Buscar por nome, cargo ou telefone" value="${esc(buscaMembro)}">
        <label class="sr" for="m-sit">Situação</label><select class="input" id="m-sit"><option value="">Todas as situações</option>${opcoes(d.situacoes, filtroSit)}</select>
      </div>
      <div id="m-tabela"></div>`);
    const desenhar = () => {
      const q = buscaMembro.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const vis = d.lista.filter(m => (!filtroSit || m.situacao === filtroSit) && (!q || [m.nome, m.cargo, m.telefone].join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
      $('#m-tabela').innerHTML = d.lista.length ? `<p class="muted pequeno" style="margin:0 0 .5rem">${vis.length} de ${d.lista.length} pessoa${d.lista.length > 1 ? 's' : ''}</p>
        <div class="tabela-wrap"><table class="tabela"><thead><tr><th>Nome</th><th>Situação</th><th class="col-opc">Cargo</th><th class="col-opc">Nascimento</th><th class="col-opc">Batismo</th><th class="col-opc">Telefone</th></tr></thead><tbody>
        ${vis.map(m => `<tr class="linha-clique" data-membro="${m.id}" tabindex="0"><td><strong>${esc(m.nome)}</strong>${m.usuario_id ? ' <span class="selo vinho" title="Tem conta no app">app</span>' : ''}</td>
          <td><span class="selo ${m.situacao === 'Membro' ? 'verde' : m.situacao === 'Congregado' || m.situacao === 'Novo convertido' ? 'ouro' : ''}">${esc(m.situacao)}</span></td>
          <td class="col-opc">${esc(m.cargo || '')}</td><td class="col-opc">${dBR(m.nascimento)}</td><td class="col-opc">${dBR(m.batismo)}</td><td class="col-opc">${esc(m.telefone || '')}</td></tr>`).join('')}
        </tbody></table></div>` : `<div class="vazio"><strong>O rol ainda está vazio</strong>Cadastre os membros com nome completo, nascimento, batismo e cargo. Depois é só exportar em PDF ou Word.</div>`;
      $$('[data-membro]').forEach(tr => { const abre = () => formMembro(d, d.lista.find(m => m.id === Number(tr.dataset.membro))); tr.addEventListener('click', abre); tr.addEventListener('keydown', e => { if (e.key === 'Enter') abre(); }); });
    };
    desenhar();
    $('#m-busca').addEventListener('input', e => { buscaMembro = e.target.value; desenhar(); });
    $('#m-sit').addEventListener('change', e => { filtroSit = e.target.value; desenhar(); });
    $('#m-novo').addEventListener('click', () => formMembro(d, null));
    $$('[data-ficha]').forEach(b => b.addEventListener('click', () => { const u = d.contas_fora.find(x => x.id === Number(b.dataset.ficha)); formMembro(d, null, { nome: u.nome, email: u.email, telefone: u.telefone, usuario_id: u.id }); }));
    $('#m-exportar').addEventListener('click', () => {
      const m = VB.modal({ titulo: 'Exportar o rol de membros', corpo: `
        <label class="campo"><span>Quem entra no relatório</span><select class="input" id="ex-sit"><option value="">Todas as situações</option>${opcoes(d.situacoes, filtroSit)}</select></label>
        <div class="formatos"><button class="btn" type="button" data-f="pdf">${icone.pdf}PDF</button><button class="btn sec" type="button" data-f="docx">${icone.texto}Word</button><button class="btn sec" type="button" data-f="csv">Planilha (CSV)</button></div>` });
      $$('[data-f]', m.el).forEach(b => b.addEventListener('click', () => { baixar(`/api/gestao/membros/exportar?formato=${b.dataset.f}&situacao=${encodeURIComponent($('#ex-sit', m.el).value)}`); m.fechar(); }));
    });
  });

  function formMembro(d, m, pre = {}) {
    const v = { situacao: 'Membro', ...pre, ...(m || {}) };
    const md = VB.modal({ titulo: m ? esc(m.nome) : 'Novo membro', largo: true, corpo: `<form id="f-membro">
      <label class="campo"><span>Nome completo</span><input class="input" name="nome" required maxlength="160" value="${esc(v.nome || '')}"></label>
      <div class="linha-campos">
        <label class="campo"><span>Situação</span><select class="input" name="situacao">${opcoes(d.situacoes, v.situacao)}</select></label>
        <label class="campo"><span>Cargo ou função</span><input class="input" name="cargo" maxlength="80" list="cargos" placeholder="Ex.: Diácono, Presbítero, Músico" value="${esc(v.cargo || '')}">
          <datalist id="cargos">${[...new Set(['Pastor', 'Presbítero', 'Evangelista', 'Diácono', 'Diaconisa', 'Missionário', 'Líder de louvor', 'Professor da EBD', 'Membro', ...d.cargos])].map(c => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <label class="campo"><span>Sexo</span><select class="input" name="sexo"><option value="">—</option><option value="M" ${v.sexo === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${v.sexo === 'F' ? 'selected' : ''}>Feminino</option></select></label>
      </div>
      <div class="linha-campos">
        <label class="campo"><span>Data de nascimento</span><input class="input" type="date" name="nascimento" value="${esc(v.nascimento || '')}"></label>
        <label class="campo"><span>Data de batismo</span><input class="input" type="date" name="batismo" value="${esc(v.batismo || '')}"></label>
        <label class="campo"><span>Membro desde</span><input class="input" type="date" name="data_entrada" value="${esc(v.data_entrada || '')}"></label>
      </div>
      <div class="linha-campos">
        <label class="campo"><span>Telefone / WhatsApp</span><input class="input" name="telefone" inputmode="tel" maxlength="30" value="${esc(v.telefone || '')}"></label>
        <label class="campo"><span>E-mail</span><input class="input" type="email" name="email" maxlength="160" value="${esc(v.email || '')}"></label>
        <label class="campo"><span>Estado civil</span><select class="input" name="estado_civil"><option value="">—</option>${opcoes(['Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'Divorciado(a)', 'União estável'], v.estado_civil)}</select></label>
      </div>
      <label class="campo"><span>Endereço</span><input class="input" name="endereco" maxlength="300" value="${esc(v.endereco || '')}"></label>
      <label class="campo"><span>Observações</span><textarea class="input" name="observacoes" maxlength="2000" rows="3">${esc(v.observacoes || '')}</textarea></label>
      <p class="erro-msg" id="fm-erro"></p></form>`,
      rodape: `${m ? `<button class="btn perigo" type="button" id="fm-excluir" style="margin-right:auto">${icone.lixo}Excluir</button>` : ''}<button class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit" form="f-membro">${m ? 'Salvar' : 'Cadastrar'}</button>` });
    $('#f-membro', md.el).addEventListener('submit', async e => {
      e.preventDefault(); const corpoF = Object.fromEntries(new FormData(e.target)); if (pre.usuario_id) corpoF.usuario_id = pre.usuario_id;
      try { await VB.api(m ? `/api/gestao/membros/${m.id}` : '/api/gestao/membros', { method: m ? 'PUT' : 'POST', body: corpoF }); md.fechar(); VB.toast(m ? 'Ficha atualizada' : 'Membro cadastrado'); VB.rota(); }
      catch (er) { $('#fm-erro', md.el).textContent = er.message; }
    });
    const ex = $('#fm-excluir', md.el);
    if (ex) ex.addEventListener('click', async () => {
      if (!await VB.confirmar('Excluir do rol', `A ficha de ${esc(m.nome)} será apagada. Os lançamentos ligados a ela continuam no financeiro.`, 'Excluir')) return;
      try { await VB.api(`/api/gestao/membros/${m.id}`, { method: 'DELETE' }); VB.toast('Ficha excluída'); VB.rota(); } catch (er) { VB.erro(er); }
    });
  }

  // ═════════ FINANCEIRO
  let mesFin = null;
  VB.registrar(/^\/g\/financeiro$/, 'pastor', async () => {
    moldura('financeiro', 'Financeiro');
    const d = await VB.api(`/api/gestao/financeiro${mesFin ? `?mes=${mesFin}` : ''}`);
    mesFin = d.mes;
    const res = d.entradas - d.saidas, saldo = d.saldo_anterior + res;
    const mover = n => { const [y, m] = mesFin.split('-').map(Number); const dt = new Date(y, m - 1 + n, 1); mesFin = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; VB.rota(); };
    $('#g-acoes').innerHTML = `<button class="btn sec" type="button" id="f-exportar">${icone.pdf}Exportar</button>
      <button class="btn sec" type="button" id="f-saida">${icone.mais}Saída</button><button class="btn" type="button" id="f-entrada">${icone.mais}Entrada</button>`;
    const porTipo = t => d.categorias.filter(c => c.tipo === t);
    const linhaCat = (c, total) => `<li><span>${esc(c.nome)}</span><b>${brl(c.valor)}</b><i style="width:${total ? (c.valor / total * 100).toFixed(1) : 0}%"></i></li>`;
    corpo(`
      <div class="mes-nav"><button class="icone-btn" type="button" id="mes-ant" aria-label="Mês anterior">${icone.cima.replace('M6 15l6-6 6 6', 'M15 6l-6 6 6 6')}</button>
        <h2>${nomeMes(d.mes)}</h2><button class="icone-btn" type="button" id="mes-prox" aria-label="Próximo mês">${icone.cima.replace('M6 15l6-6 6 6', 'M9 6l6 6-6 6')}</button>
        <input type="month" class="input mes-escolha" id="mes-escolha" value="${d.mes}" aria-label="Escolher o mês"></div>
      <div class="numeros fin-numeros">
        <div class="numero"><b class="n-verde">${brl(d.entradas)}</b><span>Entradas recebidas</span></div>
        <div class="numero"><b class="n-vermelho">${brl(d.saidas)}</b><span>Saídas pagas</span></div>
        <div class="numero"><b class="${res < 0 ? 'n-vermelho' : ''}">${brl(res)}</b><span>Resultado do mês</span></div>
        <div class="numero"><b class="${saldo < 0 ? 'n-vermelho' : ''}">${brl(saldo)}</b><span>Saldo em caixa no fim do mês</span></div>
      </div>
      ${d.a_pagar ? `<p class="aviso-pend">Contas a pagar neste mês: <b>${brl(d.a_pagar)}</b>. Marque como paga quando quitar.</p>` : ''}
      <div class="grade-2 fin-grade">
        <div>
          <div class="painel-cab" style="margin-bottom:.6rem"><h3 style="margin:0">Lançamentos</h3><button class="btn sec mini" type="button" id="f-oferta">${icone.mais}Oferta de culto</button></div>
          ${d.lancamentos.length ? `<ul class="lanc-lista">${d.lancamentos.map(l => `<li class="lanc ${l.tipo}${l.status === 'pendente' ? ' pendente' : ''}" data-lanc="${l.id}" tabindex="0">
            <span class="lanc-data"><b>${l.data.slice(8)}</b>${mesAbrev(l.data)}</span>
            <span class="lanc-txt"><strong>${esc(l.descricao || l.culto || l.categoria || (l.tipo === 'entrada' ? 'Entrada' : 'Saída'))}</strong>
              <small>${[l.categoria, l.culto && l.descricao ? l.culto : '', l.membro_nome, l.forma, l.recorrencia_id ? 'mensal' : ''].filter(Boolean).map(esc).join(' · ')}</small></span>
            <span class="lanc-valor">${l.tipo === 'saida' ? '−' : '+'} ${brl(l.valor)}${l.status === 'pendente' ? `<button class="btn sec mini" type="button" data-pagar="${l.id}">${l.tipo === 'saida' ? 'Marcar como paga' : 'Marcar como recebida'}</button>` : ''}</span></li>`).join('')}</ul>`
            : `<div class="vazio"><strong>Nenhum lançamento em ${MESES[Number(d.mes.slice(5)) - 1]}</strong>Registre dízimos, ofertas de cada culto e as despesas da igreja. As contas fixas (aluguel, energia) podem ser cadastradas como mensais.</div>`}
        </div>
        <div>
          <div class="painel"><h3>Por categoria</h3>
            ${d.categorias.length ? `${porTipo('entrada').length ? `<p class="cat-tit">Entradas</p><ul class="cat-lista e">${porTipo('entrada').map(c => linhaCat(c, d.entradas)).join('')}</ul>` : ''}
              ${porTipo('saida').length ? `<p class="cat-tit">Saídas</p><ul class="cat-lista s">${porTipo('saida').map(c => linhaCat(c, d.saidas)).join('')}</ul>` : ''}` : '<p class="muted pequeno" style="margin:0">Aparece quando houver lançamentos pagos no mês.</p>'}
          </div>
          <div class="painel">
            <div class="painel-cab"><h3>Contas mensais</h3><button class="btn sec mini" type="button" id="r-nova">${icone.mais}Nova</button></div>
            <p class="muted pequeno" style="margin:-.4rem 0 .7rem">Entram sozinhas todo mês como “a pagar”.</p>
            ${d.recorrencias.length ? `<ul class="rec-lista">${d.recorrencias.map(r => `<li class="${r.ativo ? '' : 'pausada'}"><span><strong>${esc(r.descricao)}</strong><small>${r.tipo === 'saida' ? 'Saída' : 'Entrada'} · dia ${r.dia}${r.categoria ? ` · ${esc(r.categoria)}` : ''}${r.ativo ? '' : ' · pausada'}</small></span>
              <b>${brl(r.valor)}</b><button class="icone-btn" type="button" data-rec="${r.id}" aria-label="Editar ${esc(r.descricao)}">${icone.lapis}</button></li>`).join('')}</ul>`
              : '<p class="muted pequeno" style="margin:0">Nenhuma conta mensal cadastrada.</p>'}
          </div>
        </div>
      </div>`);
    $('#mes-ant').addEventListener('click', () => mover(-1)); $('#mes-prox').addEventListener('click', () => mover(1));
    $('#mes-escolha').addEventListener('change', e => { if (e.target.value) { mesFin = e.target.value; VB.rota(); } });
    $('#f-entrada').addEventListener('click', () => formLanc(d, { tipo: 'entrada' }));
    $('#f-saida').addEventListener('click', () => formLanc(d, { tipo: 'saida' }));
    $('#f-oferta').addEventListener('click', () => formLanc(d, { tipo: 'entrada', categoria: 'Oferta', culto: '' }, true));
    $$('[data-lanc]').forEach(li => { const abre = e => { if (e.target.closest('[data-pagar]')) return; formLanc(d, d.lancamentos.find(l => l.id === Number(li.dataset.lanc))); };
      li.addEventListener('click', abre); li.addEventListener('keydown', e => { if (e.key === 'Enter') abre(e); }); });
    $$('[data-pagar]').forEach(b => b.addEventListener('click', async () => {
      try { await VB.api(`/api/gestao/lancamentos/${b.dataset.pagar}`, { method: 'PUT', body: { status: 'pago' } }); VB.toast('Pagamento registrado'); VB.rota(); } catch (er) { VB.erro(er); }
    }));
    $('#r-nova').addEventListener('click', () => formRec(d, null));
    $$('[data-rec]').forEach(b => b.addEventListener('click', () => formRec(d, d.recorrencias.find(r => r.id === Number(b.dataset.rec)))));
    $('#f-exportar').addEventListener('click', () => {
      const [y, m] = d.mes.split('-').map(Number); const fim = new Date(y, m, 0).getDate();
      const md = VB.modal({ titulo: 'Exportar o financeiro', corpo: `
        <div class="linha-campos"><label class="campo"><span>De</span><input class="input" type="date" id="ex-de" value="${d.mes}-01"></label>
          <label class="campo"><span>Até</span><input class="input" type="date" id="ex-ate" value="${d.mes}-${String(fim).padStart(2, '0')}"></label></div>
        <div class="atalhos-periodo"><button type="button" class="link-btn" data-p="mes">Este mês</button><button type="button" class="link-btn" data-p="tri">Últimos 3 meses</button><button type="button" class="link-btn" data-p="ano">Ano de ${y}</button></div>
        <label class="campo"><span>O que entra</span><select class="input" id="ex-tipo"><option value="">Entradas e saídas</option><option value="entrada">Só entradas</option><option value="saida">Só saídas</option></select></label>
        <div class="formatos"><button class="btn" type="button" data-f="pdf">${icone.pdf}PDF</button><button class="btn sec" type="button" data-f="docx">${icone.texto}Word</button><button class="btn sec" type="button" data-f="csv">Planilha (CSV)</button></div>` });
      $$('[data-p]', md.el).forEach(b => b.addEventListener('click', () => {
        const de = $('#ex-de', md.el), ate = $('#ex-ate', md.el);
        if (b.dataset.p === 'mes') { de.value = `${d.mes}-01`; ate.value = `${d.mes}-${String(fim).padStart(2, '0')}`; }
        if (b.dataset.p === 'tri') { const i = new Date(y, m - 3, 1); de.value = `${i.getFullYear()}-${String(i.getMonth() + 1).padStart(2, '0')}-01`; ate.value = `${d.mes}-${String(fim).padStart(2, '0')}`; }
        if (b.dataset.p === 'ano') { de.value = `${y}-01-01`; ate.value = `${y}-12-31`; }
      }));
      $$('[data-f]', md.el).forEach(b => b.addEventListener('click', () => {
        baixar(`/api/gestao/financeiro/exportar?formato=${b.dataset.f}&de=${$('#ex-de', md.el).value}&ate=${$('#ex-ate', md.el).value}&tipo=${$('#ex-tipo', md.el).value}`); md.fechar();
      }));
    });
  });

  function formLanc(d, l, oferta = false) {
    const edit = !!l.id, ent = l.tipo === 'entrada';
    const cats = ent ? d.cat_entrada : d.cat_saida;
    const titulo = edit ? (ent ? 'Editar entrada' : 'Editar saída') : oferta ? 'Oferta de culto' : ent ? 'Nova entrada' : 'Nova saída';
    const md = VB.modal({ titulo, corpo: `<form id="f-lanc">
      <div class="linha-campos">
        <label class="campo"><span>Valor (R$)</span><input class="input input-valor" name="valor" inputmode="decimal" required placeholder="0,00" value="${valorEdit(l.valor)}"></label>
        <label class="campo"><span>Data</span><input class="input" type="date" name="data" required value="${esc(l.data || hojeIso())}"></label>
      </div>
      ${oferta || l.culto ? `<label class="campo"><span>Culto</span><input class="input" name="culto" maxlength="80" list="cultos" placeholder="Ex.: Culto de quinta" value="${esc(l.culto || '')}">
        <datalist id="cultos">${['Culto de domingo (manhã)', 'Culto de domingo (noite)', 'Culto de quarta', 'Culto de quinta', 'Culto de sexta', 'Escola Bíblica Dominical', 'Culto de jovens', 'Santa Ceia', 'Vigília'].map(c => `<option value="${c}">`).join('')}</datalist></label>` : ''}
      <div class="linha-campos">
        <label class="campo"><span>Categoria</span><select class="input" name="categoria">${opcoes([...new Set([...cats, ...(l.categoria && !cats.includes(l.categoria) ? [l.categoria] : [])])], l.categoria || cats[0])}</select></label>
        <label class="campo"><span>Forma</span><select class="input" name="forma"><option value="">—</option>${opcoes(d.formas, l.forma)}</select></label>
      </div>
      <label class="campo"><span>Descrição</span><input class="input" name="descricao" maxlength="300" placeholder="${ent ? 'Ex.: Dízimos do mês' : 'Ex.: Conta de energia de outubro'}" value="${esc(l.descricao || '')}"></label>
      ${ent ? `<label class="campo"><span>Membro (dízimo ou doação identificada)</span><select class="input" name="membro_id"><option value="">Não identificar</option>${d.membros.map(m => `<option value="${m.id}" ${m.id === l.membro_id ? 'selected' : ''}>${esc(m.nome)}</option>`).join('')}</select></label>` : ''}
      <label class="chave"><input type="checkbox" name="pendente" ${l.status === 'pendente' ? 'checked' : ''}>${ent ? 'Ainda não recebido' : 'Ainda não pago (a pagar)'}</label>
      <p class="erro-msg" id="fl-erro"></p></form>`,
      rodape: `${edit ? `<button class="btn perigo" type="button" id="fl-excluir" style="margin-right:auto">${icone.lixo}Excluir</button>` : ''}<button class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit" form="f-lanc">${edit ? 'Salvar' : 'Lançar'}</button>` });
    $('#f-lanc', md.el).addEventListener('submit', async e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
      const corpoF = { ...f, tipo: l.tipo, status: f.pendente ? 'pendente' : 'pago' }; delete corpoF.pendente;
      if (!corpoF.culto && !oferta && !l.culto) delete corpoF.culto;
      try { await VB.api(edit ? `/api/gestao/lancamentos/${l.id}` : '/api/gestao/lancamentos', { method: edit ? 'PUT' : 'POST', body: corpoF });
        md.fechar(); VB.toast(edit ? 'Lançamento atualizado' : 'Lançamento registrado'); if (!edit && corpoF.data && corpoF.data.slice(0, 7) !== mesFin) mesFin = corpoF.data.slice(0, 7); VB.rota(); }
      catch (er) { $('#fl-erro', md.el).textContent = er.message; }
    });
    const ex = $('#fl-excluir', md.el);
    if (ex) ex.addEventListener('click', async () => {
      if (!await VB.confirmar('Excluir lançamento', `${ent ? 'Entrada' : 'Saída'} de ${brl(l.valor)} em ${dBR(l.data)} será apagada.`, 'Excluir')) return;
      try { await VB.api(`/api/gestao/lancamentos/${l.id}`, { method: 'DELETE' }); VB.toast('Lançamento excluído'); VB.rota(); } catch (er) { VB.erro(er); }
    });
  }

  function formRec(d, r) {
    const v = r || { tipo: 'saida', dia: 10, ativo: 1 };
    const md = VB.modal({ titulo: r ? 'Conta mensal' : 'Nova conta mensal', corpo: `<form id="f-rec">
      ${r ? '' : `<div class="tipo-escolha-fin"><label><input type="radio" name="tipo" value="saida" checked> Saída (despesa fixa)</label><label><input type="radio" name="tipo" value="entrada"> Entrada fixa</label></div>`}
      <label class="campo"><span>Descrição</span><input class="input" name="descricao" required maxlength="120" placeholder="Ex.: Aluguel do templo" value="${esc(v.descricao || '')}"></label>
      <div class="linha-campos">
        <label class="campo"><span>Valor mensal (R$)</span><input class="input" name="valor" inputmode="decimal" required placeholder="0,00" value="${valorEdit(v.valor)}"></label>
        <label class="campo"><span>Vence todo dia</span><input class="input" type="number" name="dia" min="1" max="28" required value="${v.dia}"></label>
      </div>
      <div class="linha-campos">
        <label class="campo"><span>Categoria</span><select class="input" name="categoria">${opcoes(v.tipo === 'entrada' ? d.cat_entrada : d.cat_saida, v.categoria)}</select></label>
        ${r ? '' : `<label class="campo"><span>A partir de</span><input class="input" type="month" name="inicio" value="${mesFin || hojeIso().slice(0, 7)}"></label>`}
      </div>
      ${r ? `<label class="chave"><input type="checkbox" name="ativo" ${v.ativo ? 'checked' : ''}>Lançar todo mês</label>` : ''}
      <p class="erro-msg" id="fr-erro"></p></form>`,
      rodape: `${r ? `<button class="btn perigo" type="button" id="fr-excluir" style="margin-right:auto">${icone.lixo}Excluir</button>` : ''}<button class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit" form="f-rec">Salvar</button>` });
    $$('input[name=tipo]', md.el).forEach(x => x.addEventListener('change', () => { $('select[name=categoria]', md.el).innerHTML = opcoes(x.value === 'entrada' ? d.cat_entrada : d.cat_saida); }));
    $('#f-rec', md.el).addEventListener('submit', async e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); if (r) f.ativo = !!f.ativo;
      try { await VB.api(r ? `/api/gestao/recorrencias/${r.id}` : '/api/gestao/recorrencias', { method: r ? 'PUT' : 'POST', body: f }); md.fechar(); VB.toast('Conta mensal salva'); VB.rota(); }
      catch (er) { $('#fr-erro', md.el).textContent = er.message; }
    });
    const ex = $('#fr-excluir', md.el);
    if (ex) ex.addEventListener('click', async () => {
      if (!await VB.confirmar('Excluir conta mensal', 'Ela deixa de ser lançada. Os meses já pagos continuam no financeiro; os que estão “a pagar” são removidos.', 'Excluir')) return;
      try { await VB.api(`/api/gestao/recorrencias/${r.id}`, { method: 'DELETE' }); VB.toast('Conta mensal excluída'); VB.rota(); } catch (er) { VB.erro(er); }
    });
  }

  // ═════════ CONTAS DO APP
  VB.registrar(/^\/g\/contas$/, 'pastor', async () => {
    moldura('contas', 'Contas do app');
    const lista = await VB.api('/api/gestao/usuarios');
    $('#g-acoes').innerHTML = `<button class="btn" type="button" id="u-nova">${icone.mais}Criar conta</button>`;
    corpo(`<p class="muted" style="margin:0 0 1rem;max-width:62ch">Quem se cadastra pelo endereço da igreja aparece aqui. Você pode desativar o acesso, trocar a senha ou dar acesso de administração (rol, financeiro e dados da igreja).</p>
      <div class="tabela-wrap"><table class="tabela"><thead><tr><th>Pessoa</th><th>Acesso</th><th class="col-opc">Último acesso</th><th></th></tr></thead><tbody>
      ${lista.map(u => `<tr><td><strong>${esc(u.nome)}</strong>${u.papel === 'pastor' ? ' <span class="selo vinho">Administração</span>' : ''}<br><small class="muted">${esc(u.email || '')}</small></td>
        <td>${u.ativo ? '<span class="selo verde">Ativo</span>' : '<span class="selo">Desativado</span>'}</td>
        <td class="col-opc">${u.ultimo_acesso ? VB.quando(u.ultimo_acesso) : 'nunca entrou'}</td>
        <td><div class="acoes"><button class="btn sec mini" type="button" data-conta="${u.id}">Gerenciar</button></div></td></tr>`).join('')}
      </tbody></table></div>`);
    $('#u-nova').addEventListener('click', () => {
      const md = VB.modal({ titulo: 'Criar conta', corpo: `<form id="f-conta">
        <label class="campo"><span>Nome completo</span><input class="input" name="nome" required maxlength="120"></label>
        <label class="campo"><span>E-mail (é o login)</span><input class="input" type="email" name="email" required></label>
        <label class="campo"><span>Senha inicial</span><input class="input" name="senha" minlength="6" required><small>Envie para a pessoa; ela pode trocar no Perfil.</small></label>
        <label class="chave"><input type="checkbox" name="admin">Acesso de administração da igreja</label>
        <p class="erro-msg" id="fc-erro"></p></form>`, rodape: '<button class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit" form="f-conta">Criar conta</button>' });
      $('#f-conta', md.el).addEventListener('submit', async e => {
        e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); f.admin = !!f.admin;
        try { await VB.api('/api/gestao/usuarios', { method: 'POST', body: f }); md.fechar(); VB.toast('Conta criada'); VB.rota(); } catch (er) { $('#fc-erro', md.el).textContent = er.message; }
      });
    });
    $$('[data-conta]').forEach(b => b.addEventListener('click', () => {
      const u = lista.find(x => x.id === Number(b.dataset.conta)), eu = u.id === VB.me.id;
      const md = VB.modal({ titulo: esc(u.nome), corpo: `
        <p class="muted pequeno" style="margin:0 0 1rem">${esc(u.email || '')} · conta criada ${VB.quando(u.criado_em)}</p>
        <label class="chave" style="margin-bottom:.8rem"><input type="checkbox" id="c-ativo" ${u.ativo ? 'checked' : ''} ${eu ? 'disabled' : ''}>Acesso ativo</label>
        <label class="chave" style="margin-bottom:1.2rem"><input type="checkbox" id="c-admin" ${u.papel === 'pastor' ? 'checked' : ''} ${eu ? 'disabled' : ''}>Administração da igreja</label>
        <form id="f-senha-c" class="linha-senha"><label class="campo" style="flex:1;margin:0"><span>Nova senha</span><input class="input" name="senha" minlength="6" required></label><button class="btn sec" type="submit">Trocar senha</button></form>`,
        rodape: `${eu ? '' : `<button class="btn perigo" type="button" id="c-excluir" style="margin-right:auto">${icone.lixo}Excluir conta</button>`}<button class="btn" data-fechar>Fechar</button>` });
      const salvar = async corpoF => { try { await VB.api(`/api/gestao/usuarios/${u.id}`, { method: 'PUT', body: corpoF }); VB.toast('Alteração salva'); } catch (er) { VB.erro(er); } };
      $('#c-ativo', md.el).addEventListener('change', e => salvar({ ativo: e.target.checked }));
      $('#c-admin', md.el).addEventListener('change', e => salvar({ admin: e.target.checked }));
      $('#f-senha-c', md.el).addEventListener('submit', e => { e.preventDefault(); salvar({ senha: new FormData(e.target).get('senha') }); e.target.reset(); });
      md.el.querySelector('[data-fechar].btn').addEventListener('click', () => VB.rota());
      const ex = $('#c-excluir', md.el);
      if (ex) ex.addEventListener('click', async () => {
        if (!await VB.confirmar('Excluir conta', `A conta de ${esc(u.nome)} será apagada, com as publicações dela no mural. A ficha no rol de membros continua.`, 'Excluir')) return;
        try { await VB.api(`/api/gestao/usuarios/${u.id}`, { method: 'DELETE' }); VB.toast('Conta excluída'); VB.rota(); } catch (er) { VB.erro(er); }
      });
    }));
  });

  // ═════════ DADOS DA IGREJA: informações, logo, cores, declaração de fé e arquivos
  VB.registrar(/^\/g\/igreja$/, 'pastor', async () => {
    moldura('igreja', 'Dados da igreja');
    const d = await VB.api('/api/gestao/igreja');
    const link = `${location.origin}/${d.slug}`;
    corpo(`<div class="grade-2 gestao-grade">
      <form class="painel" id="f-igreja">
        <h3>Informações</h3>
        <label class="campo"><span>Nome da igreja</span><input class="input" name="nome" required maxlength="120" value="${esc(d.nome)}"></label>
        <div class="linha-campos">
          <label class="campo"><span>Cidade</span><input class="input" name="cidade" maxlength="80" value="${esc(d.cidade || '')}"></label>
          <label class="campo"><span>Telefone / WhatsApp</span><input class="input" name="telefone" maxlength="30" value="${esc(d.telefone || '')}"></label>
        </div>
        <label class="campo"><span>E-mail</span><input class="input" type="email" name="email" maxlength="160" value="${esc(d.email || '')}"></label>
        <label class="campo"><span>Endereço do templo</span><input class="input" name="endereco" maxlength="300" value="${esc(d.endereco || '')}"></label>
        <label class="campo"><span>Chave Pix para dízimos e ofertas</span><input class="input" name="pix" maxlength="160" value="${esc(d.pix || '')}"></label>
        <label class="campo"><span>Quem somos</span><textarea class="input" name="sobre" rows="4" maxlength="3000" placeholder="Uma apresentação curta: história, horários dos cultos, ministérios.">${esc(d.sobre || '')}</textarea></label>
        <label class="campo"><span>Declaração de fé</span><textarea class="input" name="declaracao" rows="8" maxlength="30000" placeholder="O que a igreja crê, artigo por artigo.">${esc(d.declaracao || '')}</textarea></label>
        <label class="chave" style="margin-bottom:1rem"><input type="checkbox" name="inscricoes_abertas" ${d.inscricoes_abertas ? 'checked' : ''}>Aceitar novos cadastros pelo endereço da igreja</label>
        <button class="btn" type="submit">Salvar informações</button>
      </form>
      <div>
        <div class="painel">
          <h3>Logo</h3>
          <div class="logo-edit">${d.logo ? `<img src="${esc(d.logo)}" alt="Logo atual">` : `<span class="logo-letra grande" aria-hidden="true">${esc(VB.iniciaisIgreja(d.nome))}</span>`}
            <div><label class="btn sec mini">${icone.upload}${d.logo ? 'Trocar a logo' : 'Enviar a logo'}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="sr" id="logo-arq"></label>
            ${d.logo ? `<button class="btn fantasma mini" type="button" id="logo-tirar">Remover</button>` : ''}
            <p class="muted pequeno" style="margin:.4rem 0 0">PNG, JPG, WebP ou SVG, até 5 MB. De preferência quadrada.</p></div></div>
        </div>
        <div class="painel">
          <h3>Cores</h3>
          <p class="muted pequeno" style="margin:.2rem 0 .8rem">As cores aparecem no app para todos os membros e nos relatórios.</p>
          <div class="temas">${d.temas.map(t => `<button type="button" class="tema-btn${t.primaria.toLowerCase() === d.cor_primaria.toLowerCase() && t.destaque.toLowerCase() === d.cor_destaque.toLowerCase() ? ' ativo' : ''}" data-p="${t.primaria}" data-d="${t.destaque}"><span style="background:${t.primaria}"></span><span style="background:${t.destaque}"></span>${esc(t.nome)}</button>`).join('')}</div>
          <div class="linha-campos" style="margin-top:1rem">
            <label class="campo"><span>Cor principal</span><input type="color" class="input cor-input" id="cor-p" value="${esc(d.cor_primaria)}"></label>
            <label class="campo"><span>Cor de destaque</span><input type="color" class="input cor-input" id="cor-d" value="${esc(d.cor_destaque)}"></label>
          </div>
          <div class="cor-previa" id="cor-previa"><span class="cp-barra"></span><span class="cp-btn">Botão</span><span class="cp-selo">Destaque</span></div>
          <button class="btn" type="button" id="salvar-cores" style="margin-top:.8rem">Salvar cores</button>
        </div>
        <div class="painel">
          <div class="painel-cab"><h3>Arquivos em PDF</h3><span class="selo">${d.arquivos.length} de 10</span></div>
          <p class="muted pequeno" style="margin:-.4rem 0 .8rem">Estatuto, calendário, escalas, estudos. Os membros abrem na página Igreja.</p>
          ${d.arquivos.length ? `<ul class="igreja-arqs edit">${d.arquivos.map(a => `<li><a href="${esc(a.url)}" target="_blank" rel="noopener">${icone.pdf}<span>${esc(a.titulo)}</span></a>
            <button class="icone-btn" type="button" data-ren="${a.id}" aria-label="Renomear ${esc(a.titulo)}">${icone.lapis}</button><button class="icone-btn" type="button" data-del="${a.id}" aria-label="Apagar ${esc(a.titulo)}">${icone.lixo}</button></li>`).join('')}</ul>` : ''}
          ${d.arquivos.length < 10 ? `<label class="btn sec mini" style="margin-top:.6rem">${icone.upload}Enviar PDF<input type="file" accept="application/pdf,.pdf" class="sr" id="pdf-arq"></label>` : '<p class="muted pequeno">Limite de 10 arquivos. Apague um para enviar outro.</p>'}
          <div id="pdf-prog" class="pequeno muted"></div>
        </div>
        <div class="painel">
          <h3>Endereço da igreja</h3>
          <div class="link-copiar"><code>${esc(link)}</code><button class="btn sec mini" type="button" id="copiar-link">Copiar</button></div>
        </div>
      </div></div>`);
    $('#copiar-link').addEventListener('click', () => navigator.clipboard.writeText(link).then(() => VB.toast('Link copiado')).catch(() => VB.toast('Não foi possível copiar', true)));
    $('#f-igreja').addEventListener('submit', async e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); f.inscricoes_abertas = !!f.inscricoes_abertas;
      try { const r = await VB.api('/api/gestao/igreja', { method: 'PUT', body: f }); VB.me.igreja = r.igreja; VB.toast('Informações salvas'); VB.rota(); } catch (er) { VB.erro(er); }
    });
    // cores: prévia ao vivo e temas prontos
    const previa = () => { const p = $('#cor-p').value, dd = $('#cor-d').value; const pv = $('#cor-previa'); pv.style.setProperty('--pp', p); pv.style.setProperty('--pd', dd); };
    previa();
    ['#cor-p', '#cor-d'].forEach(s => $(s).addEventListener('input', () => { $$('.tema-btn').forEach(x => x.classList.remove('ativo')); previa(); }));
    $$('.tema-btn').forEach(b => b.addEventListener('click', () => { $('#cor-p').value = b.dataset.p; $('#cor-d').value = b.dataset.d; $$('.tema-btn').forEach(x => x.classList.toggle('ativo', x === b)); previa(); }));
    $('#salvar-cores').addEventListener('click', async () => {
      try { const r = await VB.api('/api/gestao/igreja', { method: 'PUT', body: { cor_primaria: $('#cor-p').value, cor_destaque: $('#cor-d').value } });
        VB.me.igreja = r.igreja; VB.aplicarTemaIgreja(r.igreja); VB.toast('Cores aplicadas'); VB.rota(); } catch (er) { VB.erro(er); }
    });
    $('#logo-arq').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return; const fd = new FormData(); fd.append('logo', f);
      try { const r = await VB.enviar('/api/gestao/igreja/logo', fd, 'PUT'); VB.me.igreja = r.igreja; VB.toast('Logo atualizada'); VB.rota(); } catch (er) { VB.erro(er); }
    });
    const lt = $('#logo-tirar'); if (lt) lt.addEventListener('click', async () => {
      try { const r = await VB.api('/api/gestao/igreja/logo', { method: 'DELETE' }); VB.me.igreja = r.igreja; VB.rota(); } catch (er) { VB.erro(er); }
    });
    const pa = $('#pdf-arq'); if (pa) pa.addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return; const fd = new FormData(); fd.append('arquivo', f);
      try { await VB.enviar('/api/gestao/arquivos', fd, 'POST', pct => { $('#pdf-prog').textContent = `Enviando ${pct}%`; }); VB.toast('Arquivo publicado'); VB.rota(); }
      catch (er) { $('#pdf-prog').textContent = ''; VB.erro(er); }
    });
    $$('[data-ren]').forEach(b => b.addEventListener('click', () => {
      const a = d.arquivos.find(x => x.id === Number(b.dataset.ren));
      const md = VB.modal({ titulo: 'Renomear arquivo', corpo: `<form id="f-ren"><label class="campo"><span>Título</span><input class="input" name="titulo" required maxlength="120" value="${esc(a.titulo)}"></label></form>`,
        rodape: '<button class="btn sec" data-fechar>Cancelar</button><button class="btn" type="submit" form="f-ren">Salvar</button>' });
      $('#f-ren', md.el).addEventListener('submit', async e => { e.preventDefault();
        try { await VB.api(`/api/gestao/arquivos/${a.id}`, { method: 'PUT', body: { titulo: new FormData(e.target).get('titulo') } }); md.fechar(); VB.rota(); } catch (er) { VB.erro(er); } });
    }));
    $$('[data-del]').forEach(b => b.addEventListener('click', async () => {
      const a = d.arquivos.find(x => x.id === Number(b.dataset.del));
      if (!await VB.confirmar('Apagar arquivo', `“${esc(a.titulo)}” sai da página da igreja.`, 'Apagar')) return;
      try { await VB.api(`/api/gestao/arquivos/${a.id}`, { method: 'DELETE' }); VB.toast('Arquivo apagado'); VB.rota(); } catch (er) { VB.erro(er); }
    }));
  });

  VB.registrar(/^\/g\/?$/, 'pastor', () => { location.hash = '#/g/painel'; });
})();
