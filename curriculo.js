// Grade curricular inicial — Teologia Sistemática Pentecostal (CPAD)
// 10 módulos (as 10 doutrinas do livro) · 26 aulas semanais ≈ 6 meses
// p = [página inicial, página final] no PDF do livro-texto
// quiz = [pergunta, [opções], índice da correta, explicação]

module.exports = {
  curso: {
    titulo: 'Teologia Sistemática Pentecostal',
    descricao: 'Seis meses de estudo bíblico semanal pelas dez grandes doutrinas da fé cristã: das Escrituras às últimas coisas, com ênfase pentecostal.',
  },
  modulos: [
    // ───────────────────────────── MÓDULO 1
    {
      titulo: 'Bibliologia',
      descricao: 'A doutrina das Escrituras: o que é a Bíblia, como chegou até nós e por que é a nossa regra de fé e prática.',
      aulas: [
        {
          t: 'O Livro dos livros',
          s: 'O que é a Bíblia, sua dupla autoria e como o cânon foi formado',
          p: [12, 26],
          base: '2 Pedro 1.19-21',
          obj: 'Compreender o significado da palavra “Bíblia”, sua autoria divino-humana, as posições teológicas sobre ela e como os livros sagrados foram reconhecidos.',
          top: ['O significado da palavra grega biblia', 'A autoria divino-humana', 'A Bíblia como literatura', 'As posições liberal, neo-ortodoxa e conservadora', 'A necessidade da Bíblia', 'A formação do cânon'],
          html: `
<p>A palavra <strong>Bíblia</strong> vem do grego <em>biblia</em>, “livros” ou “coleção de pequenos livros”. O nome lembra a cidade fenícia de Biblos (Gebal), grande centro produtor de papiro. Desde João Crisóstomo e Jerônimo, os livros do Antigo e do Novo Testamento passaram a ser conhecidos simplesmente como <em>a Bíblia</em>.</p>
<h3>Um livro de dupla autoria</h3>
<p>A Escritura é divina e humana ao mesmo tempo. Deus é o autor principal; cerca de quarenta homens, ao longo de aproximadamente 1.600 anos, foram seus instrumentos. Cada escritor manteve seu estilo, vocabulário e personalidade, mas todos foram “movidos pelo Espírito Santo” (2 Pe 1.21). Por isso a mensagem é uma só, embora os estilos sejam muitos.</p>
<h3>Três posições sobre a Bíblia</h3>
<ul>
<li><strong>Liberal:</strong> coloca a razão humana acima da revelação e diz que a Bíblia apenas <em>contém</em> a Palavra de Deus.</li>
<li><strong>Neo-ortodoxa:</strong> afirma que a Bíblia <em>se torna</em> Palavra de Deus quando fala ao leitor, num encontro subjetivo.</li>
<li><strong>Conservadora (a nossa):</strong> a Bíblia <em>é</em> a Palavra de Deus, inspirada, inerrante e infalível.</li>
</ul>
<h3>Por que precisamos dela?</h3>
<p>A natureza revela que Deus existe (Sl 19.1), mas só a Escritura revela o caminho da salvação em Cristo. Sem ela não teríamos padrão seguro para a fé nem para a conduta.</p>
<h3>O cânon</h3>
<p><em>Cânon</em> significa “vara de medir”, “régua”. A Igreja não <em>criou</em> o cânon; ela <em>reconheceu</em> os livros que já carregavam a marca da inspiração: autoria profética ou apostólica, harmonia com a revelação anterior, uso universal pelo povo de Deus e poder transformador. Os 39 livros do AT e os 27 do NT formam a nossa Bíblia de 66 livros.</p>`,
          app: 'Esta semana, separe um horário fixo de leitura bíblica diária e anote um versículo que falou com você em cada dia.',
          ref: ['Que diferença prática faz crer que a Bíblia “é” e não apenas “contém” a Palavra de Deus?', 'Por que dizemos que a Igreja reconheceu, e não criou, o cânon?'],
          quiz: [
            ['O que significa a palavra grega “biblia”?', ['Palavra santa', 'Livros ou coleção de pequenos livros', 'Lei de Deus', 'Revelação'], 1, 'Biblia é o plural de biblos: livros, rolos.'],
            ['Aproximadamente quantos escritores Deus usou para compor a Bíblia?', ['Doze', 'Vinte', 'Quarenta', 'Setenta'], 2, 'Cerca de quarenta autores, em aproximadamente 1.600 anos.'],
            ['Qual posição afirma que a Bíblia apenas “contém” a Palavra de Deus?', ['Conservadora', 'Liberal', 'Pentecostal', 'Reformada'], 1, 'A teologia liberal submete a Escritura à razão humana.'],
            ['O que significa a palavra “cânon”?', ['Vara de medir, régua', 'Livro sagrado', 'Coleção antiga', 'Concílio'], 0, 'Cânon é o padrão que mede quais livros são inspirados.'],
          ],
        },
        {
          t: 'Inspirada, inerrante e suficiente',
          s: 'As qualidades da Escritura e como interpretá-la corretamente',
          p: [27, 42],
          base: '2 Timóteo 3.16-17',
          obj: 'Entender o que significam inspiração, inerrância, infalibilidade, clareza, supremacia e completude da Bíblia, e aprender princípios de interpretação.',
          top: ['A inspiração divina', 'A inerrância', 'A infalibilidade', 'A clareza', 'A supremacia em matéria de fé e prática', 'A completude', 'Como interpretar corretamente a Bíblia'],
          html: `
<p>“Toda Escritura é <strong>divinamente inspirada</strong>” (2 Tm 3.16). A palavra grega <em>theopneustos</em> significa “soprada por Deus”. A inspiração é <strong>plenária</strong> (alcança toda a Bíblia) e <strong>verbal</strong> (alcança as próprias palavras, não apenas as ideias).</p>
<h3>As qualidades da Escritura</h3>
<ul>
<li><strong>Inerrância:</strong> nos manuscritos originais, a Bíblia não contém erro em nada do que afirma — seja doutrina, história ou ciência.</li>
<li><strong>Infalibilidade:</strong> ela nunca falha em cumprir o propósito para o qual Deus a deu: levar à salvação e ensinar a justiça.</li>
<li><strong>Clareza:</strong> o essencial para a salvação pode ser entendido por qualquer pessoa sincera, guiada pelo Espírito.</li>
<li><strong>Supremacia:</strong> nenhuma tradição, experiência ou revelação está acima dela. É a regra final de fé e de conduta.</li>
<li><strong>Completude:</strong> o cânon está fechado. Nada se acrescenta nem se tira (Ap 22.18-19).</li>
</ul>
<h3>Interpretando bem</h3>
<p>Uma boa interpretação considera: o <strong>contexto</strong> imediato e o livro inteiro; o <strong>sentido literal e histórico</strong> do texto; o <strong>gênero literário</strong> (narrativa, poesia, profecia, epístola); a regra de que <strong>a Escritura interpreta a Escritura</strong>; e a dependência humilde da iluminação do Espírito Santo.</p>
<blockquote>Texto fora de contexto é pretexto para heresia.</blockquote>`,
          app: 'Escolha um versículo muito citado (por exemplo, Filipenses 4.13) e leia o capítulo inteiro. O contexto mudou ou aprofundou o sentido?',
          ref: ['Qual a diferença entre inerrância e infalibilidade?', 'Por que a experiência pessoal nunca pode estar acima da Bíblia?'],
          quiz: [
            ['O termo grego theopneustos significa:', ['Escrita por homens', 'Soprada por Deus', 'Guardada pela Igreja', 'Traduzida fielmente'], 1, 'Inspiração: a Escritura procede do sopro de Deus.'],
            ['Inspiração “verbal” quer dizer que:', ['Só as ideias foram inspiradas', 'As palavras foram ditadas mecanicamente', 'A inspiração alcança as próprias palavras', 'Apenas o NT é inspirado'], 2, 'Deus guiou os escritores até nas palavras, preservando seus estilos.'],
            ['A completude da Bíblia significa que:', ['Novas revelações completam a Bíblia', 'O cânon está fechado', 'A tradição completa a Bíblia', 'Só os evangelhos são completos'], 1, 'Nada se acrescenta nem se tira da Palavra.'],
            ['Um princípio básico de interpretação é:', ['Ler versículos isolados', 'A Escritura interpreta a Escritura', 'Seguir a primeira impressão', 'Priorizar sonhos e visões'], 1, 'Textos claros iluminam textos mais difíceis.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 2
    {
      titulo: 'Teologia — a doutrina de Deus',
      descricao: 'Quem é Deus, como O conhecemos, seus atributos, nomes, obras e a Santíssima Trindade.',
      aulas: [
        {
          t: 'Conhecendo o Deus vivo',
          s: 'A existência, o conhecimento e os atributos de Deus',
          p: [43, 70],
          base: 'Hebreus 11.6',
          obj: 'Entender o que é teologia pentecostal, as evidências da existência de Deus, como podemos conhecê-Lo e quais são seus atributos.',
          top: ['O que é teologia pentecostal', 'Teontologia e teorias inadequadas sobre Deus', 'A existência de Deus', 'O conhecimento de Deus', 'Um Deus pessoal', 'Atributos incomunicáveis', 'Atributos comunicáveis'],
          html: `
<p>A <strong>teologia pentecostal</strong> é a mesma fé histórica e bíblica da Igreja, vivida com ênfase na atuação presente do Espírito Santo: batismo com o Espírito, dons espirituais e a expectativa da volta de Cristo.</p>
<h3>Deus existe</h3>
<p>A Bíblia não tenta provar Deus — ela começa com Ele: “No princípio, criou Deus” (Gn 1.1). Ainda assim, a criação (argumento cosmológico), a ordem do universo (argumento teleológico) e a consciência moral humana (argumento moral) testemunham a seu respeito. Teorias como ateísmo, panteísmo (tudo é Deus), politeísmo e deísmo (Deus criou e se afastou) não correspondem à revelação bíblica.</p>
<h3>Como O conhecemos</h3>
<p>Pela <strong>revelação geral</strong> (natureza e consciência) e pela <strong>revelação especial</strong> (as Escrituras e, sobretudo, Jesus Cristo). Deus é <strong>pessoal</strong>: pensa, sente, decide, fala e se relaciona.</p>
<h3>Atributos de Deus</h3>
<p><strong>Incomunicáveis</strong> — pertencem só a Ele: eternidade, imutabilidade, onipresença, onisciência, onipotência, autoexistência.</p>
<p><strong>Comunicáveis</strong> — Ele os reflete em nós, em medida humana: santidade, amor, justiça, bondade, misericórdia, fidelidade, verdade, sabedoria.</p>`,
          app: 'Escolha um atributo comunicável de Deus e peça a Ele, em oração, que esse traço seja formado em você nesta semana.',
          ref: ['Por que é importante saber que Deus é pessoal, e não uma força?', 'Qual atributo de Deus mais consola você hoje? Por quê?'],
          quiz: [
            ['O deísmo ensina que:', ['Tudo é Deus', 'Há muitos deuses', 'Deus criou o mundo e se afastou dele', 'Deus não existe'], 2, 'O Deus da Bíblia governa e sustenta a criação.'],
            ['Qual destes é um atributo incomunicável?', ['Amor', 'Onipresença', 'Bondade', 'Fidelidade'], 1, 'Somente Deus está presente em todo lugar.'],
            ['A revelação especial de Deus se dá principalmente por meio de:', ['Natureza', 'Consciência', 'Escrituras e Jesus Cristo', 'Tradições'], 2, 'A natureza revela que Deus existe; a Escritura revela quem Ele é e como salva.'],
            ['Hebreus 11.6 ensina que, para agradar a Deus, é preciso:', ['Obras', 'Fé', 'Sacrifícios', 'Conhecimento'], 1, '“Sem fé é impossível agradar-lhe.”'],
          ],
        },
        {
          t: 'Os nomes e as obras de Deus',
          s: 'O nome YHWH, a criação, os decretos e a providência',
          p: [71, 82],
          base: 'Êxodo 3.13-15',
          obj: 'Conhecer os principais nomes de Deus no AT, o significado do tetragrama YHWH e a doutrina bíblica da criação, dos decretos e da providência.',
          top: ['Os nomes de Deus', 'O tetragrama YHWH', 'Os dias da criação', 'A criação do homem', 'Os decretos de Deus', 'A providência divina'],
          html: `
<p>Na Bíblia, o nome revela o caráter. Por isso os nomes de Deus são janelas para quem Ele é:</p>
<ul>
<li><strong>Elohim</strong> — o Deus forte, Criador (Gn 1.1).</li>
<li><strong>El Shaddai</strong> — o Deus Todo-Poderoso (Gn 17.1).</li>
<li><strong>Adonai</strong> — Senhor, dono, soberano.</li>
<li><strong>YHWH</strong> — o nome pessoal e da aliança: “EU SOU O QUE SOU” (Êx 3.14).</li>
</ul>
<p>Das combinações com YHWH vêm títulos como <em>Jireh</em> (provê), <em>Rafá</em> (sara), <em>Nissi</em> (bandeira), <em>Shalom</em> (paz) e <em>Tsidkenu</em> (justiça nossa).</p>
<h3>A criação</h3>
<p>Deus criou todas as coisas do nada (<em>ex nihilo</em>) pela sua palavra. O verbo hebraico <em>bara’</em> é usado com Deus como sujeito: só Ele cria nesse sentido absoluto. O ser humano é o ápice da criação, feito à imagem de Deus.</p>
<h3>Decretos e providência</h3>
<p>Os <strong>decretos</strong> são o plano eterno e sábio de Deus para tudo o que acontece. A <strong>providência</strong> é a ação contínua com que Ele preserva a criação e governa todas as coisas para o cumprimento dos seus propósitos — sem anular a responsabilidade humana.</p>`,
          app: 'Qual nome de Deus responde à sua necessidade atual? Ore usando esse nome durante a semana.',
          ref: ['O que a expressão “EU SOU O QUE SOU” revela sobre Deus?', 'Como a doutrina da providência muda a forma de enfrentar dificuldades?'],
          quiz: [
            ['O nome de Deus revelado a Moisés na sarça é:', ['Elohim', 'Adonai', 'YHWH — EU SOU', 'El Elyon'], 2, 'Êxodo 3.14-15.'],
            ['“Ex nihilo” significa que Deus criou:', ['A partir da matéria eterna', 'Do nada', 'Por evolução', 'Por emanação'], 1, 'Deus trouxe tudo à existência pela sua palavra.'],
            ['YHWH-Jireh significa:', ['O Senhor sara', 'O Senhor proverá', 'O Senhor é paz', 'O Senhor é minha bandeira'], 1, 'Gênesis 22.14.'],
            ['A providência divina é:', ['O destino cego', 'A ação contínua de Deus preservando e governando a criação', 'Apenas o ato inicial da criação', 'A sorte'], 1, 'Deus sustenta e governa todas as coisas.'],
          ],
        },
        {
          t: 'A Santíssima Trindade',
          s: 'Um só Deus em três Pessoas',
          p: [83, 107],
          base: 'Mateus 28.19; 2 Coríntios 13.13',
          obj: 'Compreender a doutrina bíblica da Trindade, seu desenvolvimento histórico, as bases bíblicas e a obra de cada Pessoa divina.',
          top: ['A doutrina da Trindade', 'Desenvolvimento histórico', 'Bases bíblicas', 'As três Pessoas', 'A divindade do Filho', 'As obras de cada Pessoa'],
          html: `
<p>A fé cristã confessa que <strong>há um só Deus</strong> (Dt 6.4) que subsiste eternamente em <strong>três Pessoas</strong> distintas: Pai, Filho e Espírito Santo — iguais em natureza, poder e glória.</p>
<h3>O que a Trindade não é</h3>
<ul>
<li>Não são três deuses (triteísmo).</li>
<li>Não é um só Deus que muda de “máscara” — ora Pai, ora Filho, ora Espírito (modalismo, unicismo).</li>
<li>Não é o Filho ou o Espírito como criaturas inferiores (arianismo).</li>
</ul>
<h3>História</h3>
<p>Embora a palavra “Trindade” não esteja na Bíblia, a verdade está. A Igreja a formulou nos concílios de <strong>Niceia (325)</strong>, afirmando a plena divindade do Filho, e de <strong>Constantinopla (381)</strong>, afirmando a divindade do Espírito Santo.</p>
<h3>Bases bíblicas</h3>
<p>Já no AT há indícios (“Façamos o homem”, Gn 1.26). No NT, as três Pessoas aparecem juntas no batismo de Jesus (Mt 3.16-17), na Grande Comissão (Mt 28.19) e na bênção apostólica (2 Co 13.13).</p>
<h3>A obra de cada Pessoa</h3>
<p>O <strong>Pai</strong> planeja a salvação; o <strong>Filho</strong> a realiza na cruz; o <strong>Espírito Santo</strong> a aplica ao coração do crente.</p>`,
          app: 'Ao orar esta semana, agradeça especificamente ao Pai, ao Filho e ao Espírito Santo pelo que cada um fez na sua salvação.',
          ref: ['Por que o modalismo é um erro, mesmo parecendo simples?', 'Em que passagem você vê as três Pessoas agindo juntas?'],
          quiz: [
            ['A doutrina da Trindade afirma:', ['Três deuses', 'Um Deus em três Pessoas', 'Um Deus com três modos', 'Deus Pai e duas criaturas'], 1, 'Unidade de natureza, distinção de Pessoas.'],
            ['O concílio que afirmou a plena divindade do Filho foi:', ['Niceia (325)', 'Trento (1545)', 'Jerusalém (At 15)', 'Vaticano I'], 0, 'Niceia combateu o arianismo.'],
            ['O modalismo ensina que:', ['O Filho é criatura', 'Há três deuses', 'Deus muda de forma: ora Pai, ora Filho, ora Espírito', 'O Espírito é uma força'], 2, 'É negada a distinção real das Pessoas.'],
            ['Em que evento as três Pessoas se manifestam juntas?', ['Na criação de Adão', 'No batismo de Jesus', 'No dilúvio', 'Na torre de Babel'], 1, 'Mateus 3.16-17.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 3
    {
      titulo: 'Cristologia',
      descricao: 'A pessoa e a obra de Jesus Cristo: verdadeiro Deus e verdadeiro homem.',
      aulas: [
        {
          t: 'Quem é Jesus',
          s: 'Nomes, eternidade e humanidade de Cristo',
          p: [108, 121],
          base: 'João 1.1-14',
          obj: 'Conhecer os principais nomes e títulos de Jesus, sua preexistência eterna e sua verdadeira humanidade.',
          top: ['Nomes e títulos de Jesus Cristo', 'A eternidade de Cristo', 'A humanidade de Jesus', 'O Homem-Deus e seus atributos'],
          html: `
<p><strong>Jesus</strong> (hebraico <em>Yeshua</em>) significa “o Senhor salva” (Mt 1.21). <strong>Cristo</strong> é a forma grega de <em>Messias</em>: “Ungido”. Outros títulos revelam sua missão: Filho de Deus, Filho do Homem, Verbo, Emanuel, Senhor, Cordeiro de Deus.</p>
<h3>Eterno</h3>
<p>Cristo não começou a existir em Belém. “No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus” (Jo 1.1). Ele mesmo declarou: “antes que Abraão existisse, eu sou” (Jo 8.58). Ele é o Criador de todas as coisas (Cl 1.16).</p>
<h3>Verdadeiramente homem</h3>
<p>Jesus teve corpo real, nasceu, cresceu, teve fome, sede, cansaço, chorou e morreu. Tinha alma e emoções humanas. Foi tentado em tudo, mas <strong>sem pecado</strong> (Hb 4.15).</p>
<h3>O Homem-Deus</h3>
<p>Em Cristo há <strong>duas naturezas</strong> — divina e humana — unidas numa só Pessoa, sem mistura e sem divisão. Só sendo homem Ele poderia morrer em nosso lugar; só sendo Deus sua morte teria valor infinito.</p>`,
          app: 'Leia João 1.1-14 em voz alta e escreva com suas palavras quem Jesus é para você.',
          ref: ['Por que era necessário que o Salvador fosse ao mesmo tempo Deus e homem?', 'Qual título de Jesus mais fala ao seu coração?'],
          quiz: [
            ['O nome Jesus significa:', ['Ungido', 'O Senhor salva', 'Deus conosco', 'Príncipe da paz'], 1, 'Mateus 1.21.'],
            ['“Cristo” é equivalente grego de:', ['Rabi', 'Messias, Ungido', 'Profeta', 'Senhor'], 1, 'Messias = Ungido.'],
            ['João 8.58 (“antes que Abraão existisse, eu sou”) ensina:', ['A humanidade de Jesus', 'A preexistência eterna de Cristo', 'A ressurreição', 'O batismo'], 1, 'Jesus aplica a si o “EU SOU”.'],
            ['Hebreus 4.15 afirma que Jesus foi tentado:', ['Somente no deserto', 'Em tudo, mas sem pecado', 'Apenas como Deus', 'E caiu uma vez'], 1, 'Sua humanidade era real e santa.'],
          ],
        },
        {
          t: 'O Verbo se fez carne',
          s: 'Encarnação, infância, vida e ministério de Jesus',
          p: [122, 138],
          base: 'Gálatas 4.4-5; Isaías 7.14',
          obj: 'Estudar a encarnação, o nascimento virginal, a infância, a genealogia, as profecias cumpridas e o ministério terreno e messiânico de Cristo.',
          top: ['A encarnação', 'Jesus nasceu na plenitude dos tempos', 'Os magos do Oriente', 'Infância e vida adulta', 'A genealogia de Jesus', 'Profecias cumpridas', 'O ministério terreno e messiânico'],
          html: `
<p>A <strong>encarnação</strong> é o ato pelo qual o Filho eterno assumiu natureza humana, sem deixar de ser Deus. Ele foi concebido pelo Espírito Santo e nasceu da <strong>virgem Maria</strong> (Is 7.14; Lc 1.35), “vindo a plenitude dos tempos” (Gl 4.4): unidade do Império Romano, língua grega comum, estradas, e expectativa messiânica.</p>
<h3>Infância e vida adulta</h3>
<p>Jesus crescia “em sabedoria, e em estatura, e em graça para com Deus e os homens” (Lc 2.52). Trabalhou como carpinteiro em Nazaré até iniciar seu ministério por volta dos trinta anos.</p>
<h3>Genealogia e profecias</h3>
<p>Mateus mostra Jesus como herdeiro legal de Davi (por José); Lucas, como descendente de Davi e de Adão (por Maria, segundo muitos intérpretes). Dezenas de profecias se cumpriram nele: nascimento em Belém (Mq 5.2), da linhagem de Davi, entrada triunfal (Zc 9.9), sofrimento substitutivo (Is 53).</p>
<h3>Profeta, sacerdote e rei</h3>
<p>Seu <strong>ministério messiânico</strong> é tríplice: como <strong>profeta</strong>, revela o Pai; como <strong>sacerdote</strong>, oferece a si mesmo e intercede; como <strong>rei</strong>, governa a Igreja e reinará sobre todas as coisas. Pelo seu sangue inaugurou a <strong>Nova Aliança</strong>.</p>`,
          app: 'Leia Isaías 53 e marque quantos detalhes se cumpriram na cruz.',
          ref: ['Por que o nascimento virginal é importante para a fé?', 'Como os três ofícios de Cristo se aplicam à sua vida diária?'],
          quiz: [
            ['A profecia de Miqueias 5.2 anuncia:', ['A entrada em Jerusalém', 'O nascimento em Belém', 'A fuga para o Egito', 'A ressurreição'], 1, 'Belém Efrata.'],
            ['Os três ofícios de Cristo são:', ['Mestre, pastor e juiz', 'Profeta, sacerdote e rei', 'Servo, amigo e irmão', 'Apóstolo, evangelista e doutor'], 1, 'O ministério messiânico é tríplice.'],
            ['Lucas 2.52 mostra que Jesus:', ['Não teve infância', 'Crescia em sabedoria, estatura e graça', 'Foi educado em Roma', 'Fez milagres aos doze anos'], 1, 'Desenvolvimento humano real.'],
            ['A encarnação significa que o Filho:', ['Deixou de ser Deus', 'Assumiu natureza humana sem deixar de ser Deus', 'Apenas parecia humano', 'Foi adotado como Filho no batismo'], 1, 'Verdadeiro Deus e verdadeiro homem.'],
          ],
        },
        {
          t: 'A cruz e o túmulo vazio',
          s: 'Morte, sepultamento, ressurreição e ministério celestial de Cristo',
          p: [139, 161],
          base: '1 Coríntios 15.1-8',
          obj: 'Compreender o caminho de Jesus até a cruz, o significado de sua morte, a realidade do sepultamento e da ressurreição, e seu ministério celestial.',
          top: ['A trajetória até a cruz', 'A crucificação', 'A morte de Jesus', 'O sepultamento', 'O ministério além-túmulo', 'A ressurreição', 'O ministério celestial'],
          html: `
<p>Jesus caminhou <strong>voluntariamente</strong> para Jerusalém sabendo o que o esperava (Lc 9.51). Na cruz, sofreu a forma de execução mais cruel e humilhante do mundo romano. Mas a cruz não foi um acidente: foi o plano de Deus para a nossa redenção (At 2.23).</p>
<h3>O sentido da morte de Cristo</h3>
<p>Sua morte foi <strong>substitutiva</strong>: Ele morreu em nosso lugar, levando sobre si o pecado (Is 53.5; 1 Pe 2.24). O véu do templo rasgado mostra que o caminho para Deus foi aberto.</p>
<h3>Sepultado de verdade</h3>
<p>O sepultamento confirma que Jesus morreu realmente. O túmulo de José de Arimateia foi selado e guardado por soldados.</p>
<h3>Ressuscitou!</h3>
<p>A ressurreição corporal de Jesus é o fundamento da fé (1 Co 15.14). Evidências: o túmulo vazio, as muitas aparições (a mais de quinhentos de uma vez), a transformação dos discípulos e o nascimento da Igreja.</p>
<h3>Ministério celestial</h3>
<p>Hoje Cristo está à direita do Pai como nosso <strong>sumo sacerdote</strong> e <strong>advogado</strong>, intercedendo por nós (Hb 7.25; 1 Jo 2.1), e de lá derramou o Espírito Santo (At 2.33).</p>`,
          app: 'Compartilhe nesta semana, com alguém, uma evidência da ressurreição de Jesus.',
          ref: ['Por que Paulo diz que, sem a ressurreição, a nossa fé é vã?', 'O que significa para você saber que Jesus intercede por você agora?'],
          quiz: [
            ['A morte de Cristo é chamada de substitutiva porque:', ['Foi um exemplo moral', 'Ele morreu em nosso lugar', 'Substituiu os profetas', 'Foi simbólica'], 1, 'Isaías 53.5.'],
            ['Segundo 1 Coríntios 15, Jesus apareceu de uma vez a mais de:', ['Doze', 'Setenta', 'Quinhentos irmãos', 'Mil pessoas'], 2, '1 Coríntios 15.6.'],
            ['O véu do templo rasgado significa:', ['Um terremoto comum', 'O acesso a Deus foi aberto', 'O fim de Israel', 'Juízo sobre os sacerdotes'], 1, 'Hebreus 10.19-20.'],
            ['Hoje Cristo, à direita do Pai:', ['Aguarda sem agir', 'Intercede por nós como sumo sacerdote', 'Reencarna', 'Julga os crentes diariamente'], 1, 'Hebreus 7.25.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 4
    {
      titulo: 'Pneumatologia',
      descricao: 'A doutrina do Espírito Santo: sua pessoa, o batismo com o Espírito, os dons e a vida no Espírito.',
      aulas: [
        {
          t: 'O Espírito Santo é Deus',
          s: 'Divindade, atributos, personalidade e ministrações do Espírito',
          p: [162, 178],
          base: 'João 14.16-17, 26',
          obj: 'Demonstrar pela Bíblia que o Espírito Santo é Deus e uma Pessoa, e conhecer suas ministrações ao crente.',
          top: ['A divindade do Espírito Santo', 'Atributos divinos do Espírito', 'A personalidade do Espírito', 'A Terceira Pessoa da Trindade', 'Ministrações do Espírito ao crente'],
          html: `
<p>O Espírito Santo <strong>não é uma força</strong> ou energia: é a terceira Pessoa da Trindade, plenamente Deus. Em Atos 5.3-4, mentir ao Espírito Santo é mentir a Deus.</p>
<h3>Atributos divinos</h3>
<p>Ele é <strong>eterno</strong> (Hb 9.14), <strong>onipresente</strong> (Sl 139.7), <strong>onisciente</strong> (1 Co 2.10-11) e <strong>onipotente</strong> (Lc 1.35). Participou da criação (Gn 1.2) e inspirou as Escrituras.</p>
<h3>Uma Pessoa</h3>
<p>Ele tem <strong>intelecto</strong> (Rm 8.27), <strong>vontade</strong> (1 Co 12.11) e <strong>emoções</strong> — pode ser entristecido (Ef 4.30). Ensina, guia, fala, intercede e testifica. Jesus o chamou de “outro Consolador” (<em>Paracletos</em>): alguém chamado para estar ao lado.</p>
<h3>O Espírito e o livro de Atos</h3>
<p>Atos é chamado de “Atos do Espírito Santo”: em cada capítulo Ele dirige, enche, envia e confirma a Igreja.</p>
<h3>Ministrações ao crente</h3>
<p>Convence do pecado (Jo 16.8), regenera (Tt 3.5), habita no crente (1 Co 6.19), sela (Ef 1.13), guia à verdade (Jo 16.13), intercede (Rm 8.26) e produz fruto (Gl 5.22).</p>`,
          app: 'Leia um capítulo de Atos por dia nesta semana e anote como o Espírito Santo agiu em cada um.',
          ref: ['Que diferença faz na vida de oração saber que o Espírito Santo é uma Pessoa?', 'Como podemos entristecer o Espírito no dia a dia?'],
          quiz: [
            ['Atos 5.3-4 mostra que mentir ao Espírito Santo é mentir:', ['Aos apóstolos', 'A Deus', 'À Igreja', 'A si mesmo'], 1, 'Prova da divindade do Espírito.'],
            ['Efésios 4.30 mostra que o Espírito pode ser:', ['Destruído', 'Entristecido', 'Substituído', 'Controlado'], 1, 'Ele tem emoções: é Pessoa.'],
            ['Paracletos significa:', ['Juiz', 'Alguém chamado para estar ao lado', 'Fogo', 'Vento'], 1, 'Consolador, advogado, ajudador.'],
            ['Quem distribui os dons “como quer”?', ['O pastor', 'O Espírito Santo', 'A congregação', 'O próprio crente'], 1, '1 Coríntios 12.11.'],
          ],
        },
        {
          t: 'O batismo com o Espírito Santo',
          s: 'A promessa do Pai e a evidência das línguas',
          p: [179, 183],
          base: 'Atos 1.8; Atos 2.1-4',
          obj: 'Compreender o batismo com o Espírito Santo como experiência distinta da salvação, sua finalidade e sua evidência física inicial.',
          top: ['A promessa do Pai', 'Distinto da regeneração', 'A finalidade: poder para testemunhar', 'A evidência física inicial', 'Como receber'],
          html: `
<p>Jesus ordenou aos discípulos que esperassem “a promessa do Pai” (At 1.4): serem <strong>batizados com o Espírito Santo</strong>. No dia de Pentecostes, “todos foram cheios do Espírito Santo e começaram a falar noutras línguas” (At 2.4).</p>
<h3>Uma experiência distinta da salvação</h3>
<p>Na conversão, o Espírito Santo <strong>habita</strong> no crente. No batismo com o Espírito, o crente é <strong>revestido de poder</strong>. Os samaritanos já haviam crido e sido batizados nas águas quando receberam o Espírito (At 8.12-17); Paulo perguntou aos discípulos em Éfeso: “Recebestes vós já o Espírito Santo quando crestes?” (At 19.2).</p>
<h3>Para quê?</h3>
<p>“Recebereis a virtude do Espírito Santo... e ser-me-eis testemunhas” (At 1.8). O propósito central é <strong>poder para o serviço e o testemunho</strong>, além de uma vida de adoração mais profunda e abertura aos dons.</p>
<h3>A evidência física inicial</h3>
<p>No ensino pentecostal, a evidência física inicial do batismo é o <strong>falar em outras línguas</strong>, conforme o Espírito concede — como aconteceu em Atos 2.4, 10.46 e 19.6. As línguas são a evidência <em>inicial</em>; a evidência contínua é uma vida cheia do Espírito.</p>
<h3>Como receber</h3>
<p>A promessa é para todos os crentes (At 2.39). Recebe-se pela <strong>fé</strong>, com sede (Jo 7.37-39), em oração perseverante (Lc 11.13), com vida consagrada e coração rendido.</p>`,
          app: 'Reserve um tempo de oração esta semana buscando o batismo com o Espírito Santo (ou um novo enchimento, se já foi batizado).',
          ref: ['Por que Atos 8 e Atos 19 mostram que o batismo com o Espírito é distinto da conversão?', 'Qual a diferença entre evidência inicial e evidência contínua?'],
          quiz: [
            ['A finalidade principal do batismo com o Espírito, segundo Atos 1.8, é:', ['Provar a salvação', 'Poder para testemunhar', 'Status espiritual', 'Profetizar o futuro'], 1, '“Ser-me-eis testemunhas.”'],
            ['A evidência física inicial do batismo com o Espírito Santo é:', ['Choro', 'Falar em outras línguas', 'Queda ao chão', 'Visões'], 1, 'Atos 2.4; 10.46; 19.6.'],
            ['Em Atos 8, os samaritanos receberam o Espírito:', ['Antes de crer', 'Depois de crer e serem batizados nas águas', 'Sem oração', 'Somente pela leitura'], 1, 'Experiência subsequente à conversão.'],
            ['Para quem é a promessa do Espírito (At 2.39)?', ['Só apóstolos', 'Só pastores', 'Para vós, vossos filhos e os que estão longe', 'Só para o primeiro século'], 2, 'A promessa é atual e para todos os crentes.'],
          ],
        },
        {
          t: 'Os dons do Espírito',
          s: 'Dons de manifestação, de ministério e seu uso correto',
          p: [184, 196],
          base: '1 Coríntios 12.4-11',
          obj: 'Conhecer os dons espirituais, suas categorias e os princípios bíblicos para seu uso ordeiro e edificante.',
          top: ['Os dons do Espírito Santo', 'Dons de manifestação', 'Dons de ministérios práticos', 'Dons na área do ministério', 'O mau uso dos dons'],
          html: `
<p>Os dons são <strong>capacitações sobrenaturais</strong> dadas pelo Espírito “para o que for útil” (1 Co 12.7): a edificação da Igreja. Não são prêmios de maturidade, mas ferramentas de serviço.</p>
<h3>Dons de manifestação (1 Co 12.8-10)</h3>
<ul>
<li><strong>De revelação:</strong> palavra da sabedoria, palavra da ciência, discernimento de espíritos.</li>
<li><strong>De poder:</strong> fé, dons de curar, operação de maravilhas.</li>
<li><strong>De elocução:</strong> profecia, variedade de línguas, interpretação de línguas.</li>
</ul>
<h3>Dons de ministérios práticos (Rm 12.6-8)</h3>
<p>Servir, ensinar, exortar, repartir, presidir, exercer misericórdia.</p>
<h3>Dons ministeriais (Ef 4.11)</h3>
<p>Apóstolos, profetas, evangelistas, pastores e mestres, dados “para o aperfeiçoamento dos santos”.</p>
<h3>O mau uso</h3>
<p>Corinto tinha dons, mas faltava amor e ordem. Paulo corrige: tudo deve ser feito com <strong>amor</strong> (1 Co 13), para <strong>edificação</strong> (14.26), com <strong>ordem e decência</strong> (14.40), e toda profecia deve ser <strong>julgada</strong> (14.29). O dom nunca está acima da Palavra.</p>`,
          app: 'Pergunte a duas pessoas da igreja em que área elas veem você sendo útil ao Corpo de Cristo. Ore sobre isso.',
          ref: ['Por que 1 Coríntios 13 está no meio dos capítulos sobre dons?', 'Como discernir uma profecia verdadeira?'],
          quiz: [
            ['Quantos dons de manifestação são listados em 1 Coríntios 12.8-10?', ['Sete', 'Nove', 'Doze', 'Cinco'], 1, 'Três de revelação, três de poder, três de elocução.'],
            ['Qual é um dom de revelação?', ['Fé', 'Discernimento de espíritos', 'Interpretação de línguas', 'Operação de maravilhas'], 1, 'Revela algo que naturalmente não se saberia.'],
            ['Os dons de Efésios 4.11 existem para:', ['Hierarquia', 'Aperfeiçoamento dos santos', 'Fama pessoal', 'Substituir a Bíblia'], 1, 'Efésios 4.12.'],
            ['Segundo 1 Coríntios 14.40, tudo deve ser feito:', ['Com volume', 'Com decência e ordem', 'Sem preparação', 'Só pelos líderes'], 1, 'Ordem no culto.'],
          ],
        },
        {
          t: 'Cheios do Espírito',
          s: 'Plenitude, avivamento, missão e santificação',
          p: [197, 237],
          base: 'Efésios 5.18; Gálatas 5.22-25',
          obj: 'Entender a plenitude contínua do Espírito, os pecados contra Ele, o avivamento, a obra missionária e a santificação como processo.',
          top: ['A plenitude do Espírito', 'Pecados contra o Espírito Santo', 'Avivamento pelo Espírito', 'O Espírito na obra missionária', 'A renovação pelo Espírito', 'O Espírito e a santificação'],
          html: `
<p>“Enchei-vos do Espírito” (Ef 5.18) está no presente contínuo: <strong>continuai sendo cheios</strong>. O batismo é uma porta; a plenitude é um caminho diário.</p>
<h3>Pecados contra o Espírito</h3>
<ul>
<li><strong>Entristecer</strong> o Espírito (Ef 4.30) — com palavras e atitudes que contradizem a nova vida.</li>
<li><strong>Extinguir</strong> o Espírito (1 Ts 5.19) — sufocar sua atuação.</li>
<li><strong>Resistir</strong> ao Espírito (At 7.51).</li>
<li><strong>Blasfemar</strong> contra o Espírito (Mt 12.31-32) — atribuir deliberadamente a obra de Deus ao diabo, com coração endurecido.</li>
</ul>
<h3>Avivamento</h3>
<p>Avivamento é Deus restaurando a vida espiritual do seu povo: arrependimento, fome da Palavra, oração, santidade e evangelização. A história pentecostal moderna lembra a Rua Azusa (1906) e, no Brasil, a chegada de Gunnar Vingren e Daniel Berg a Belém (1910-1911).</p>
<h3>Missão</h3>
<p>Em Atos, o Espírito escolhe, envia e dirige missionários (At 13.2-4). Onde há plenitude, há impulso missionário.</p>
<h3>Santificação</h3>
<p>A santificação é <strong>posicional</strong> (fomos separados para Deus em Cristo) e <strong>progressiva</strong> (o Espírito nos transforma dia a dia). O fruto do Espírito (Gl 5.22) é o sinal do caráter de Cristo sendo formado em nós.</p>`,
          app: 'Escolha um aspecto do fruto do Espírito em que você precisa crescer e pratique-o intencionalmente esta semana.',
          ref: ['Qual a diferença entre ser batizado com o Espírito e andar cheio do Espírito?', 'Que sinais mostram que uma igreja vive um avivamento verdadeiro?'],
          quiz: [
            ['“Enchei-vos do Espírito” indica uma experiência:', ['Única e definitiva', 'Contínua', 'Opcional', 'Só para líderes'], 1, 'Presente contínuo no grego.'],
            ['Extinguir o Espírito é:', ['Sufocar sua atuação', 'Negar a Trindade', 'Perder a salvação automaticamente', 'Não falar em línguas'], 0, '1 Tessalonicenses 5.19.'],
            ['O avivamento da Rua Azusa ocorreu em:', ['1517', '1906', '1950', '1800'], 1, 'Los Angeles, 1906.'],
            ['O fruto do Espírito revela principalmente:', ['Dons', 'O caráter de Cristo formado em nós', 'Prosperidade', 'Conhecimento teológico'], 1, 'Gálatas 5.22-23.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 5
    {
      titulo: 'Antropologia',
      descricao: 'A doutrina do homem: origem, natureza, queda e destino do ser humano.',
      aulas: [
        {
          t: 'À imagem de Deus',
          s: 'Origem do homem, formação, queda e promessa de redenção',
          p: [238, 257],
          base: 'Gênesis 1.26-27; 2.7',
          obj: 'Compreender a origem divina do ser humano, o que significa ser imagem de Deus, a criação do homem e da mulher, a queda e a primeira promessa de redenção.',
          top: ['A origem do homem', 'Imagem e semelhança de Deus', 'Macho e fêmea os criou', 'A formação do homem', 'A formação da mulher', 'A queda da humanidade', 'A promessa da redenção'],
          html: `
<p>O ser humano não é produto do acaso. Ele foi <strong>criado diretamente por Deus</strong>: formado do pó da terra e animado pelo fôlego divino (Gn 2.7).</p>
<h3>Imagem e semelhança</h3>
<p>Ser imagem de Deus significa que o homem tem <strong>natureza espiritual, racional e moral</strong>, capacidade de relacionamento com Deus e a missão de governar a criação como mordomo. Por isso toda vida humana tem dignidade e valor.</p>
<h3>Homem e mulher</h3>
<p>“Macho e fêmea os criou” (Gn 1.27). A mulher, formada da costela de Adão, é <strong>auxiliadora idônea</strong> — alguém correspondente, igual em dignidade, diferente em função. Aqui se institui o casamento: um homem e uma mulher, uma só carne (Gn 2.24).</p>
<h3>A queda</h3>
<p>Tentados pela serpente, Adão e Eva desobedeceram. Consequências: vergonha, medo, ruptura com Deus, conflito entre si, dor, trabalho penoso e morte.</p>
<h3>O protoevangelho</h3>
<p>Mesmo no juízo, Deus anunciou esperança: a descendência da mulher esmagaria a cabeça da serpente (Gn 3.15). É a primeira promessa do Redentor, cumprida em Cristo.</p>`,
          app: 'Trate alguém nesta semana lembrando conscientemente que essa pessoa carrega a imagem de Deus.',
          ref: ['Como a doutrina da imagem de Deus influencia temas como aborto e preconceito?', 'Por que Gênesis 3.15 é chamado de protoevangelho?'],
          quiz: [
            ['Segundo Gênesis 2.7, o homem foi formado:', ['Por evolução', 'Do pó da terra, com o fôlego de Deus', 'De um anjo', 'Da água'], 1, 'Criação direta.'],
            ['“Auxiliadora idônea” significa:', ['Serva inferior', 'Alguém correspondente e igual em dignidade', 'Ajudante temporária', 'Subordinada espiritual'], 1, 'Igual em valor, diferente em função.'],
            ['Gênesis 3.15 é chamado de:', ['Protoevangelho', 'Pentateuco', 'Decálogo', 'Shemá'], 0, 'Primeiro anúncio do Redentor.'],
            ['Ser imagem de Deus inclui:', ['Ter corpo como o de Deus', 'Natureza espiritual, racional e moral', 'Ser divino', 'Ser imortal fisicamente'], 1, 'O homem reflete atributos comunicáveis de Deus.'],
          ],
        },
        {
          t: 'Espírito, alma e corpo',
          s: 'A constituição do ser humano, seu destino e a verdadeira ciência',
          p: [258, 288],
          base: '1 Tessalonicenses 5.23',
          obj: 'Estudar a constituição do ser humano, o estado intermediário, a ressurreição do corpo e a relação entre fé e ciência.',
          top: ['Dicotomismo e tricotomismo', 'O espírito do homem', 'A alma do homem', 'O corpo humano', 'A dimensão espiritual do corpo', 'O estado intermediário', 'A ressurreição do corpo', 'A verdadeira ciência e o evolucionismo'],
          html: `
<p>“O vosso espírito, e alma, e corpo sejam plenamente conservados irrepreensíveis” (1 Ts 5.23). O livro adota a visão <strong>tricotômica</strong>: o ser humano é espírito, alma e corpo, formando uma unidade.</p>
<ul>
<li><strong>Espírito</strong> — a dimensão que se relaciona com Deus; consciência de Deus.</li>
<li><strong>Alma</strong> — sede da personalidade: mente, emoções e vontade; consciência de si.</li>
<li><strong>Corpo</strong> — a dimensão física; consciência do mundo. É templo do Espírito Santo (1 Co 6.19) e deve ser cuidado e santificado.</li>
</ul>
<h3>Depois da morte</h3>
<p>Na morte, o corpo volta ao pó, mas o espírito e a alma continuam conscientes. Os salvos vão “estar com Cristo” (Fp 1.23); os perdidos aguardam o juízo. Esse é o <strong>estado intermediário</strong>, até a ressurreição.</p>
<h3>A ressurreição do corpo</h3>
<p>Deus não descarta o corpo: Ele o ressuscitará glorificado, incorruptível, semelhante ao corpo glorioso de Cristo (1 Co 15.42-44; Fp 3.21).</p>
<h3>Fé e ciência</h3>
<p>A verdadeira ciência não contradiz a Bíblia, pois o mesmo Deus é autor da criação e da revelação. O evolucionismo — inclusive o chamado “evolucionismo teísta” — é uma interpretação filosófica que entra em choque com o relato bíblico da criação direta do homem.</p>`,
          app: 'Examine seus hábitos: há algo que você precisa mudar para honrar a Deus com o corpo, a mente e o espírito?',
          ref: ['Que consolo traz a doutrina do estado intermediário?', 'Como responder com respeito a quem diz que fé e ciência são inimigas?'],
          quiz: [
            ['A visão tricotômica afirma que o homem é formado por:', ['Corpo e alma', 'Espírito, alma e corpo', 'Mente e matéria', 'Apenas espírito'], 1, '1 Tessalonicenses 5.23.'],
            ['A alma é a sede de:', ['Mente, emoções e vontade', 'Apenas o corpo', 'Consciência do mundo físico', 'Anjos'], 0, 'Consciência de si.'],
            ['O estado intermediário é:', ['Purgatório', 'A condição da pessoa entre a morte e a ressurreição', 'Reencarnação', 'Sono da alma inconsciente'], 1, 'Consciência após a morte (Lc 16; Fp 1.23).'],
            ['Segundo 1 Coríntios 6.19, o corpo do crente é:', ['Prisão da alma', 'Templo do Espírito Santo', 'Sem importância', 'Mal em si'], 1, 'Deve ser santificado.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 6
    {
      titulo: 'Hamartiologia',
      descricao: 'A doutrina do pecado: sua natureza, origem, transmissão e consequências.',
      aulas: [
        {
          t: 'O que é o pecado',
          s: 'Natureza, definições e origem do pecado no universo',
          p: [289, 303],
          base: 'Romanos 3.23; 1 João 3.4',
          obj: 'Definir o pecado biblicamente, rejeitar teorias filosóficas que o relativizam e compreender sua origem no universo e na humanidade.',
          top: ['O que é pecado', 'Teorias filosóficas', 'Definições conceituais do pecado', 'O homem antes da queda', 'A origem do pecado no universo'],
          html: `
<p>A Bíblia usa várias palavras para o pecado. As principais significam <strong>errar o alvo</strong> (<em>hamartia</em>), <strong>transgredir</strong> uma linha (<em>parabasis</em>), <strong>iniquidade</strong> ou ilegalidade (<em>anomia</em>, 1 Jo 3.4) e <strong>rebelião</strong>. Em resumo: pecado é tudo aquilo — em pensamento, palavra, ação ou omissão — que não está conforme a santidade e a lei de Deus.</p>
<h3>Teorias que esvaziam o pecado</h3>
<p>Algumas filosofias dizem que o pecado é apenas ignorância, fruto do meio social, um estágio da evolução ou uma ilusão. A Bíblia, porém, o apresenta como <strong>ofensa pessoal contra um Deus santo</strong> (Sl 51.4), pela qual o homem é responsável.</p>
<h3>Antes da queda</h3>
<p>Adão foi criado inocente, em comunhão com Deus, com livre-arbítrio verdadeiro. Não havia nele inclinação para o mal.</p>
<h3>A origem do pecado</h3>
<p>O pecado começou no mundo espiritual, com a rebelião de <strong>Lúcifer</strong>, cujo orgulho o levou a querer ser semelhante ao Altíssimo (Is 14.12-14; Ez 28.12-17). Na terra, entrou pela desobediência de Adão (Rm 5.12). Deus não é autor do pecado; Ele criou seres livres capazes de amar — e, portanto, capazes de rejeitar.</p>`,
          app: 'Faça uma oração como a do Salmo 139.23-24, pedindo a Deus que sonde seu coração.',
          ref: ['Por que é perigoso tratar o pecado apenas como “erro” ou “fraqueza”?', 'Se Deus não é autor do pecado, por que permitiu a possibilidade dele?'],
          quiz: [
            ['A palavra grega hamartia significa:', ['Rebelião', 'Errar o alvo', 'Ignorância', 'Culpa'], 1, 'O homem não alcança o padrão de Deus.'],
            ['1 João 3.4 define pecado como:', ['Doença', 'Iniquidade, transgressão da lei', 'Fraqueza', 'Destino'], 1, 'Anomia: ilegalidade.'],
            ['O pecado começou no universo com:', ['Caim', 'Adão', 'A rebelião de Lúcifer', 'Babel'], 2, 'Isaías 14 e Ezequiel 28.'],
            ['Segundo Romanos 5.12, o pecado entrou no mundo por:', ['Um homem', 'Os anjos', 'A natureza', 'A lei'], 0, 'Por Adão.'],
          ],
        },
        {
          t: 'O salário do pecado',
          s: 'Pecado original, culpa, hereditariedade e castigo',
          p: [304, 320],
          base: 'Romanos 5.12-21; 6.23',
          obj: 'Compreender o pecado original e seus efeitos, a culpa, a transmissão da natureza pecaminosa e o castigo do pecado.',
          top: ['O pecado original e sua afetação', 'A culpa do pecado', 'A realidade da ação do pecado', 'A hereditariedade do pecado', 'O castigo do pecado'],
          html: `
<p>O <strong>pecado original</strong> é a condição de corrupção que todos herdamos de Adão. “Eis que em iniquidade fui formado” (Sl 51.5). Não nascemos neutros: nascemos com inclinação para o mal.</p>
<h3>Uma natureza afetada</h3>
<p>O pecado atingiu o ser humano por inteiro: a mente se obscureceu (Ef 4.18), as emoções se desordenaram, a vontade ficou escravizada (Jo 8.34). O homem não perdeu a imagem de Deus, mas ela foi profundamente desfigurada.</p>
<h3>Culpa</h3>
<p>Diante de Deus, o pecador é <strong>culpado</strong> e merecedor de juízo. A culpa não é só um sentimento; é uma condição legal perante a lei divina.</p>
<h3>Hereditariedade</h3>
<p>A natureza pecaminosa passa de geração em geração (Rm 5.12). Por isso todos pecam, sem exceção (Rm 3.23).</p>
<h3>O castigo</h3>
<p>“O salário do pecado é a morte” (Rm 6.23): morte <strong>espiritual</strong> (separação de Deus), <strong>física</strong> (separação entre corpo e alma) e <strong>eterna</strong> (separação definitiva). Mas o versículo continua: “o dom gratuito de Deus é a vida eterna, por Cristo Jesus”. Onde abundou o pecado, superabundou a graça (Rm 5.20).</p>`,
          app: 'Memorize Romanos 6.23 inteiro e use-o para explicar o evangelho a alguém.',
          ref: ['Que diferença há entre sentir culpa e ser culpado diante de Deus?', 'Como Romanos 5.20 traz esperança depois de estudar o pecado?'],
          quiz: [
            ['O pecado original é:', ['O primeiro pecado de cada pessoa', 'A natureza corrompida herdada de Adão', 'Um mito', 'O pecado de Caim'], 1, 'Salmo 51.5.'],
            ['Segundo Romanos 6.23, o salário do pecado é:', ['Pobreza', 'Morte', 'Doença', 'Tristeza'], 1, 'Morte espiritual, física e eterna.'],
            ['A morte espiritual é:', ['A separação entre corpo e alma', 'A separação do homem de Deus', 'O sono da alma', 'A aniquilação'], 1, 'Efésios 2.1.'],
            ['Romanos 5.20 afirma que onde abundou o pecado:', ['Veio o juízo', 'Superabundou a graça', 'Não há esperança', 'Veio a lei'], 1, 'A graça é maior que o pecado.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 7
    {
      titulo: 'Soteriologia',
      descricao: 'A doutrina da salvação: o que Deus fez por nós em Cristo e como isso se aplica a nós.',
      aulas: [
        {
          t: 'Tão grande salvação',
          s: 'O que é salvação, graça, expiação, redenção e propiciação',
          p: [321, 343],
          base: 'Efésios 2.8-9; Romanos 3.24-25',
          obj: 'Compreender a salvação em seus sentidos objetivo e subjetivo e as doutrinas da graça, expiação, redenção e propiciação.',
          top: ['O que é salvação', 'Sentido factual-objetivo', 'Sentido experimental-subjetivo', 'A graça de Deus', 'A expiação pelo sangue', 'A redenção', 'A propiciação'],
          html: `
<p><strong>Salvação</strong> é o livramento total que Deus oferece ao ser humano: do castigo, do poder e, um dia, da presença do pecado.</p>
<ul>
<li><strong>Sentido objetivo:</strong> o que Cristo <em>realizou</em> na cruz, de uma vez por todas, por toda a humanidade.</li>
<li><strong>Sentido subjetivo:</strong> o que o Espírito <em>aplica</em> à pessoa que crê, experimentado na vida.</li>
</ul>
<h3>Graça</h3>
<p>Graça é o <strong>favor imerecido</strong> de Deus. “Pela graça sois salvos, por meio da fé; e isso não vem de vós; é dom de Deus. Não vem das obras” (Ef 2.8-9).</p>
<h3>Quatro palavras da cruz</h3>
<ul>
<li><strong>Expiação</strong> — o sangue de Cristo cobre e remove o pecado (Hb 9.22).</li>
<li><strong>Redenção</strong> — fomos comprados e libertos mediante pagamento de um preço: o sangue de Jesus (1 Pe 1.18-19).</li>
<li><strong>Propiciação</strong> — a justa ira de Deus contra o pecado foi satisfeita em Cristo (Rm 3.25; 1 Jo 2.2).</li>
<li><strong>Reconciliação</strong> — a inimizade foi desfeita; temos paz com Deus (Rm 5.1, 10).</li>
</ul>`,
          app: 'Escreva em poucas linhas o seu testemunho de salvação, usando pelo menos duas palavras estudadas hoje.',
          ref: ['Por que a salvação não pode ser conquistada por obras?', 'Qual das quatro palavras da cruz mais toca você? Por quê?'],
          quiz: [
            ['Graça é:', ['Recompensa pelas obras', 'Favor imerecido de Deus', 'Sorte', 'Mérito religioso'], 1, 'Efésios 2.8-9.'],
            ['Redenção significa:', ['Ser comprado e liberto mediante um preço', 'Ser julgado', 'Ser batizado', 'Ser ensinado'], 0, '1 Pedro 1.18-19.'],
            ['Propiciação refere-se a:', ['A satisfação da justa ira de Deus em Cristo', 'O perdão humano', 'A oração', 'A disciplina da igreja'], 0, 'Romanos 3.25.'],
            ['O sentido objetivo da salvação é:', ['O que sentimos', 'O que Cristo realizou na cruz', 'O que a igreja decide', 'O batismo nas águas'], 1, 'A obra consumada de Cristo.'],
          ],
        },
        {
          t: 'Nascer de novo',
          s: 'Fé, arrependimento, confissão, perdão, regeneração, justificação e adoção',
          p: [344, 353],
          base: 'João 3.3-7; Romanos 5.1',
          obj: 'Entender os passos e as bênçãos da salvação na experiência do crente.',
          top: ['A fé salvífica', 'O arrependimento', 'A confissão', 'O perdão de pecados', 'A regeneração espiritual', 'A imputação da justiça de Deus', 'A adoção de filhos', 'A santificação do crente'],
          html: `
<h3>A resposta humana</h3>
<ul>
<li><strong>Arrependimento</strong> — mudança de mente e de direção: tristeza segundo Deus e abandono do pecado (2 Co 7.10).</li>
<li><strong>Fé salvífica</strong> — confiança pessoal em Cristo como Salvador e Senhor, não apenas concordância intelectual.</li>
<li><strong>Confissão</strong> — reconhecer o pecado diante de Deus e confessar Jesus como Senhor (Rm 10.9-10; 1 Jo 1.9).</li>
</ul>
<h3>O que Deus faz</h3>
<ul>
<li><strong>Perdão</strong> — Deus apaga a dívida e não se lembra mais dos pecados (Hb 8.12).</li>
<li><strong>Regeneração</strong> — o novo nascimento: o Espírito comunica vida nova (Jo 3.5; 2 Co 5.17).</li>
<li><strong>Justificação</strong> — Deus declara justo o pecador que crê, <em>imputando</em> a ele a justiça de Cristo (Rm 4.5; 5.1).</li>
<li><strong>Adoção</strong> — passamos a ser filhos de Deus, com direito de chamá-Lo “Aba, Pai” (Rm 8.15).</li>
<li><strong>Santificação</strong> — separados para Deus e transformados progressivamente à imagem de Cristo.</li>
</ul>
<blockquote>A justificação muda a nossa posição diante de Deus; a regeneração muda a nossa natureza; a adoção muda a nossa família.</blockquote>`,
          app: 'Leia Romanos 8 inteiro e sublinhe tudo o que você é por ter sido adotado por Deus.',
          ref: ['Qual a diferença entre justificação e santificação?', 'Por que a fé salvífica é mais do que crer que Deus existe?'],
          quiz: [
            ['Arrependimento bíblico é:', ['Apenas remorso', 'Mudança de mente e de direção', 'Penitência', 'Fazer promessas'], 1, '2 Coríntios 7.10.'],
            ['Justificação é:', ['Deus tornar o homem perfeito na hora', 'Deus declarar justo o pecador que crê', 'Fazer boas obras', 'A disciplina da igreja'], 1, 'Romanos 5.1.'],
            ['A regeneração é:', ['Reforma moral', 'O novo nascimento pelo Espírito', 'O batismo nas águas', 'Uma cerimônia'], 1, 'João 3.5.'],
            ['Pela adoção podemos chamar Deus de:', ['Juiz', 'Aba, Pai', 'Mestre', 'Rei distante'], 1, 'Romanos 8.15.'],
          ],
        },
        {
          t: 'O plano eterno de Deus',
          s: 'Presciência, eleição, predestinação, chamada, julgamento do crente e glorificação',
          p: [354, 366],
          base: 'Romanos 8.28-30; 2 Pedro 3.9',
          obj: 'Estudar a presciência, a eleição e a predestinação sob uma perspectiva bíblica que harmoniza a soberania de Deus com a responsabilidade humana, e a glorificação futura.',
          top: ['A presciência de Deus', 'A eleição divina', 'A predestinação', 'A chamada para a salvação', 'A justificação', 'O julgamento do crente', 'A glorificação futura dos salvos'],
          html: `
<p>“Os que <strong>dantes conheceu</strong>, também os <strong>predestinou</strong>... chamou... justificou... glorificou” (Rm 8.29-30). É a “corrente de ouro” da salvação.</p>
<h3>Presciência e eleição</h3>
<p>Deus conhece todas as coisas de antemão. A <strong>eleição</strong> é “segundo a presciência de Deus Pai” (1 Pe 1.2). Deus escolheu, <em>em Cristo</em>, um povo para si (Ef 1.4) — e todo aquele que está em Cristo, pela fé, faz parte desse povo eleito.</p>
<h3>Predestinação</h3>
<p>Na perspectiva adotada pelo livro, a predestinação não é uma escolha arbitrária de quem será salvo ou perdido. Deus <strong>predestinou o propósito</strong>: que os que creem sejam conformados à imagem de seu Filho. Ele “quer que todos os homens se salvem” (1 Tm 2.4) e “não quer que alguns se percam” (2 Pe 3.9). A salvação é oferecida a todos; o ser humano é responsável por aceitá-la ou rejeitá-la.</p>
<h3>A chamada</h3>
<p>Deus chama pelo evangelho e pelo Espírito. “Vinde a mim, todos” (Mt 11.28).</p>
<h3>Julgamento e glorificação</h3>
<p>O crente não será condenado (Rm 8.1), mas comparecerá ao <strong>Tribunal de Cristo</strong> para prestar contas de suas obras e receber galardões (2 Co 5.10). A etapa final é a <strong>glorificação</strong>: corpo ressurreto, livre para sempre da presença do pecado.</p>`,
          app: 'Leia Romanos 8.28-39 e agradeça a Deus por cada elo da “corrente de ouro” em sua vida.',
          ref: ['Como 1 Timóteo 2.4 e 2 Pedro 3.9 ajudam a entender a predestinação?', 'Que motivação o Tribunal de Cristo traz para o serviço cristão?'],
          quiz: [
            ['Segundo 1 Pedro 1.2, a eleição é segundo:', ['O mérito humano', 'A presciência de Deus Pai', 'O acaso', 'A nacionalidade'], 1, 'Eleitos segundo a presciência.'],
            ['2 Pedro 3.9 ensina que Deus:', ['Quer que alguns se percam', 'Não quer que alguns se percam', 'É indiferente', 'Já decidiu quem se perde sem considerar a fé'], 1, 'Deus deseja a salvação de todos.'],
            ['O Tribunal de Cristo serve para:', ['Condenar crentes', 'Avaliar obras e conceder galardões', 'Julgar nações', 'Julgar anjos'], 1, '2 Coríntios 5.10.'],
            ['A glorificação é:', ['A conversão', 'A etapa final: corpo ressurreto e livre do pecado', 'O batismo nas águas', 'A santificação diária'], 1, 'Romanos 8.30.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 8
    {
      titulo: 'Eclesiologia',
      descricao: 'A doutrina da Igreja: sua origem, natureza, missão e destino.',
      aulas: [
        {
          t: 'A Igreja de Cristo',
          s: 'Projeto de Deus, fundamento, igreja local, Reino e ordenanças',
          p: [367, 388],
          base: 'Mateus 16.18; Efésios 2.19-22',
          obj: 'Compreender a Igreja como projeto eterno de Deus, seu fundamento em Cristo, a igreja local e as ordenanças.',
          top: ['A Igreja como projeto de Deus', 'A Igreja e seu fundamento', 'A Igreja peregrina', 'A igreja local', 'A Igreja e o Reino de Deus', 'Os símbolos da Igreja'],
          html: `
<p><strong>Igreja</strong> (<em>ekklesia</em>) significa “chamados para fora”: a assembleia dos que foram chamados do mundo para pertencer a Cristo. Não é um prédio, mas um povo.</p>
<h3>Projeto eterno</h3>
<p>A Igreja não foi um “plano B”: estava no coração de Deus desde a eternidade (Ef 3.10-11). Seu <strong>fundamento é Cristo</strong>, a pedra angular (1 Co 3.11; Ef 2.20). “Sobre esta pedra edificarei a minha igreja” refere-se à confissão de Pedro: Jesus é o Cristo, o Filho do Deus vivo.</p>
<h3>Igreja universal e local</h3>
<p>A Igreja <strong>universal</strong> reúne todos os salvos de todos os tempos. A igreja <strong>local</strong> é a expressão visível desse Corpo num lugar, com liderança, comunhão, ensino, culto e disciplina (At 2.42).</p>
<h3>Peregrina e ligada ao Reino</h3>
<p>A Igreja é <strong>peregrina</strong>: está no mundo, mas não é do mundo. Ela anuncia e manifesta o Reino de Deus, que já chegou em Cristo e será consumado em sua volta.</p>
<h3>Símbolos e ordenanças</h3>
<p>A Bíblia descreve a Igreja como <strong>corpo</strong>, <strong>noiva</strong>, <strong>edifício</strong>, <strong>família</strong> e <strong>rebanho</strong>. Cristo deixou duas ordenanças: o <strong>batismo nas águas</strong>, por imersão, e a <strong>Ceia do Senhor</strong>, memorial de sua morte até que Ele venha.</p>`,
          app: 'Identifique uma forma concreta de servir à sua igreja local este mês e comprometa-se com ela.',
          ref: ['Qual imagem da Igreja (corpo, noiva, edifício...) mais fala com você?', 'Por que é impossível viver o cristianismo bíblico isolado da igreja local?'],
          quiz: [
            ['Ekklesia significa:', ['Templo', 'Chamados para fora', 'Denominação', 'Clero'], 1, 'Assembleia dos chamados.'],
            ['O fundamento da Igreja é:', ['Pedro', 'Cristo', 'Os concílios', 'A tradição'], 1, '1 Coríntios 3.11.'],
            ['As duas ordenanças deixadas por Cristo são:', ['Jejum e oração', 'Batismo nas águas e Ceia do Senhor', 'Dízimo e oferta', 'Casamento e confirmação'], 1, 'Mateus 28.19; 1 Coríntios 11.23-26.'],
            ['Atos 2.42 mostra que a igreja primitiva perseverava em:', ['Doutrina, comunhão, partir do pão e orações', 'Festas', 'Política', 'Rituais do templo'], 0, 'Marcas de uma igreja saudável.'],
          ],
        },
        {
          t: 'A Igreja no mundo',
          s: 'Espiritualidade, disciplina, missões, secularização e destino final',
          p: [389, 428],
          base: 'Mateus 28.18-20; João 17.15-18',
          obj: 'Refletir sobre os desafios práticos da Igreja hoje: espiritualidade, disciplina, missões, denominações, trabalho feminino, secularização, política e destino final.',
          top: ['Espiritualidade', 'Disciplina', 'Missiologia urbana', 'Missões transculturais', 'Denominacionalismo', 'O trabalho feminino', 'Secularização', 'Poder político', 'Colheita de almas', 'O destino final da Igreja'],
          html: `
<h3>Espiritualidade e disciplina</h3>
<p>A espiritualidade bíblica não se resume a emoções no culto: é vida diária de oração, Palavra, santidade e serviço. A <strong>disciplina</strong> na igreja (Mt 18.15-17) tem objetivo restaurador, não punitivo, e deve ser exercida com amor e justiça.</p>
<h3>Missões</h3>
<p>A Grande Comissão é para <strong>todas as nações</strong>. Isso inclui as grandes cidades, com seus desafios de violência, pobreza e solidão (missiologia urbana), e os povos de outras culturas e línguas (missões transculturais).</p>
<h3>Denominações e unidade</h3>
<p>As denominações podem conviver com respeito, desde que mantenham as doutrinas essenciais. A unidade verdadeira é espiritual, fundamentada na verdade.</p>
<h3>Mulheres na obra</h3>
<p>Desde o ministério de Jesus as mulheres servem com destaque: Maria Madalena, Priscila, Febe, as filhas de Filipe. Sua contribuição na evangelização, no ensino e na assistência é preciosa para a Igreja.</p>
<h3>Secularização e política</h3>
<p>A secularização tenta expulsar Deus da vida pública e da consciência. A Igreja deve ser <strong>sal e luz</strong>, exercendo cidadania com ética, sem se confundir com partidos nem trocar a missão espiritual por poder.</p>
<h3>Destino final</h3>
<p>A Igreja será arrebatada, apresentada a Cristo como noiva gloriosa, “sem mácula, nem ruga” (Ef 5.27), e reinará com Ele.</p>`,
          app: 'Escolha uma pessoa ou família para orar e evangelizar ao longo dos próximos meses.',
          ref: ['Como a igreja pode alcançar as pessoas da sua cidade hoje?', 'Quais são os riscos quando a igreja se mistura com o poder político?'],
          quiz: [
            ['O objetivo da disciplina na igreja é:', ['Punir', 'Restaurar', 'Expulsar', 'Humilhar'], 1, 'Mateus 18.15; Gálatas 6.1.'],
            ['A Grande Comissão alcança:', ['Apenas Israel', 'Todas as nações', 'Apenas a cidade local', 'Somente os líderes'], 1, 'Mateus 28.19.'],
            ['Ser “sal e luz” na sociedade significa:', ['Isolar-se do mundo', 'Influenciar com ética e testemunho', 'Tomar o poder político', 'Imitar o mundo'], 1, 'Mateus 5.13-16.'],
            ['Segundo Efésios 5.27, a Igreja será apresentada:', ['Dividida', 'Gloriosa, sem mácula nem ruga', 'Numerosa', 'Rica'], 1, 'Destino final da Igreja.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 9
    {
      titulo: 'Angelologia',
      descricao: 'A doutrina dos anjos: os anjos de Deus, Satanás e os demônios.',
      aulas: [
        {
          t: 'Os anjos de Deus',
          s: 'Quem são, sua natureza, categorias e ministério',
          p: [429, 448],
          base: 'Hebreus 1.13-14; Salmo 103.20',
          obj: 'Conhecer o ensino bíblico sobre os anjos, evitando tanto a negação quanto o culto a eles.',
          top: ['O perigo do culto aos anjos', 'Quem são os anjos', 'A natureza dos anjos', 'Categorias de anjos', 'Caráter dos anjos', 'Ministério dos anjos'],
          html: `
<p>A palavra <strong>anjo</strong> (hebraico <em>mal’ak</em>, grego <em>angelos</em>) significa “mensageiro”. Os anjos são seres espirituais, criados por Deus (Cl 1.16), pessoais, poderosos e inumeráveis.</p>
<h3>Cuidado com o culto aos anjos</h3>
<p>A Bíblia proíbe adorar ou orar a anjos (Cl 2.18; Ap 22.8-9). Eles são conservos, não mediadores. O único Mediador é Jesus Cristo (1 Tm 2.5).</p>
<h3>Natureza</h3>
<p>São <strong>espíritos</strong> (Hb 1.14), mas podem assumir forma visível. Não se casam (Mt 22.30), não morrem, têm inteligência, emoções e vontade. São superiores aos homens em poder, mas não são onipresentes nem oniscientes.</p>
<h3>Categorias</h3>
<ul>
<li><strong>Querubins</strong> — guardiões da santidade e da glória de Deus (Gn 3.24).</li>
<li><strong>Serafins</strong> — “os ardentes”, que proclamam “Santo, Santo, Santo” (Is 6).</li>
<li><strong>Arcanjo</strong> — Miguel, chefe dos exércitos celestiais (Jd 9; Ap 12.7).</li>
<li><strong>Gabriel</strong> — mensageiro de revelações especiais (Dn 9; Lc 1).</li>
</ul>
<h3>Ministério</h3>
<p>Adoram a Deus, executam seus juízos, protegem e servem os herdeiros da salvação (Sl 91.11; Hb 1.14), e acompanharão Cristo em sua volta.</p>`,
          app: 'Leia o Salmo 91 e agradeça a Deus pelo cuidado invisível que Ele tem com você.',
          ref: ['Por que é perigoso orar ou prestar culto a anjos?', 'O que muda saber que os anjos servem os herdeiros da salvação?'],
          quiz: [
            ['A palavra “anjo” significa:', ['Guerreiro', 'Mensageiro', 'Espírito', 'Santo'], 1, 'Mal’ak / angelos.'],
            ['Segundo Apocalipse 22.8-9, quando João se prostrou diante do anjo, ele disse:', ['Levanta-te, eu sou Deus', 'Olha, não faças tal; adora a Deus', 'Ora a mim', 'Adora os santos'], 1, 'Anjos não aceitam adoração.'],
            ['Quem é chamado de arcanjo na Bíblia?', ['Gabriel', 'Miguel', 'Rafael', 'Lúcifer'], 1, 'Judas 9.'],
            ['Os serafins aparecem em:', ['Isaías 6', 'Gênesis 1', 'Mateus 5', 'Romanos 8'], 0, 'Proclamando a santidade de Deus.'],
          ],
        },
        {
          t: 'O adversário e seus anjos',
          s: 'Satanás, os anjos caídos e os demônios',
          p: [449, 468],
          base: 'Efésios 6.10-18; 1 João 3.8',
          obj: 'Compreender a origem, a natureza e as estratégias de Satanás e dos demônios, e a vitória do crente em Cristo.',
          top: ['A existência do diabo', 'Quem é Satanás', 'A origem de Satanás', 'A natureza de Satanás', 'Os anjos caídos', 'Quem são os demônios'],
          html: `
<p>Satanás é real e pessoal. Jesus falou com ele, o venceu e o descreveu como “homicida desde o princípio” e “pai da mentira” (Jo 8.44).</p>
<h3>Origem</h3>
<p>Ele foi criado bom, como querubim ungido, cheio de sabedoria e beleza (Ez 28.12-15). Pelo orgulho, quis ser semelhante ao Altíssimo (Is 14.13-14) e foi lançado fora. Deus não criou o diabo; criou um anjo que se corrompeu.</p>
<h3>Seus nomes revelam sua natureza</h3>
<p><strong>Satanás</strong> (adversário), <strong>diabo</strong> (caluniador), <strong>tentador</strong>, <strong>acusador dos irmãos</strong> (Ap 12.10), <strong>príncipe deste mundo</strong>, <strong>enganador</strong>. Ele é poderoso, mas <strong>limitado</strong>: não é onipresente, onisciente nem onipotente.</p>
<h3>Anjos caídos e demônios</h3>
<p>Uma parte dos anjos acompanhou Satanás na rebelião (Ap 12.4, 9). Alguns estão presos aguardando o juízo (2 Pe 2.4; Jd 6); outros atuam como demônios, oprimindo, enganando e, em certos casos, possuindo pessoas.</p>
<h3>A vitória do crente</h3>
<p>“Para isto o Filho de Deus se manifestou: para desfazer as obras do diabo” (1 Jo 3.8). Na cruz, Cristo despojou os principados (Cl 2.15). O crente resiste ao diabo submetendo-se a Deus (Tg 4.7), revestido de toda a armadura (Ef 6), e tem autoridade no nome de Jesus (Mc 16.17). Um verdadeiro crente, habitação do Espírito Santo, não pode ser possuído por demônios.</p>`,
          app: 'Leia Efésios 6.10-18 e, em oração, “vista” cada peça da armadura de Deus durante a semana.',
          ref: ['Quais são as estratégias mais comuns do inimigo hoje?', 'Por que não devemos nem ignorar nem supervalorizar o diabo?'],
          quiz: [
            ['O nome “diabo” significa:', ['Adversário', 'Caluniador', 'Dragão', 'Serpente'], 1, 'Diabolos: caluniador, acusador.'],
            ['Segundo Isaías 14 e Ezequiel 28, a queda de Satanás foi causada por:', ['Inveja dos homens', 'Orgulho', 'Ignorância', 'Medo'], 1, 'Quis ser semelhante ao Altíssimo.'],
            ['1 João 3.8 afirma que o Filho de Deus se manifestou para:', ['Negociar com o diabo', 'Desfazer as obras do diabo', 'Ignorar o mal', 'Julgar os anjos bons'], 1, 'Vitória de Cristo.'],
            ['Tiago 4.7 ensina que, para o diabo fugir, devemos:', ['Gritar', 'Sujeitar-nos a Deus e resistir ao diabo', 'Ignorá-lo', 'Conversar com ele'], 1, 'Submissão e resistência.'],
          ],
        },
      ],
    },
    // ───────────────────────────── MÓDULO 10
    {
      titulo: 'Escatologia',
      descricao: 'A doutrina das últimas coisas: a volta de Cristo, a tribulação, o milênio e a eternidade.',
      aulas: [
        {
          t: 'Ele voltará',
          s: 'Segunda vinda, sinais, arrebatamento, ressurreições e estado intermediário',
          p: [469, 487],
          base: '1 Tessalonicenses 4.13-18; João 14.1-3',
          obj: 'Compreender a segunda vinda de Cristo em suas duas fases, os sinais dos tempos, o arrebatamento da Igreja, as duas ressurreições e o estado intermediário.',
          top: ['Introdução à Escatologia', 'Principais eventos escatológicos', 'A segunda vinda de Cristo', 'Sinais indicadores', 'O arrebatamento da Igreja', 'As duas ressurreições', 'O estado intermediário'],
          html: `
<p><strong>Escatologia</strong> (do grego <em>eschatos</em>, “último”) é o estudo das últimas coisas. Não é curiosidade sobre o futuro, mas esperança que nos santifica (1 Jo 3.2-3).</p>
<h3>Duas fases da vinda</h3>
<ul>
<li><strong>Arrebatamento</strong> — Cristo vem <em>para</em> a sua Igreja, nos ares, de modo repentino e invisível ao mundo (1 Ts 4.16-17). Pode acontecer a qualquer momento: é <strong>iminente</strong>.</li>
<li><strong>Revelação (vinda em glória)</strong> — Cristo vem <em>com</em> a sua Igreja, visivelmente, sobre o monte das Oliveiras, para julgar e reinar (Zc 14.4; Ap 19.11-16).</li>
</ul>
<p>Entre as duas fases ocorre a Grande Tribulação. O livro adota a posição <strong>pré-tribulacionista e pré-milenista</strong>.</p>
<h3>Sinais</h3>
<p>Jesus apontou sinais: engano religioso, guerras, fome, terremotos, aumento da iniquidade, esfriamento do amor, evangelho pregado a todas as nações, e a restauração de Israel (Mt 24). Sinais não marcam datas; despertam vigilância.</p>
<h3>Duas ressurreições</h3>
<p>A <strong>primeira ressurreição</strong> é a dos justos, em etapas, começando com Cristo, as primícias. A <strong>segunda</strong> é a dos ímpios, mil anos depois, para o Juízo Final (Ap 20.5-6; Jo 5.28-29).</p>
<h3>Estado intermediário</h3>
<p>Quem morre em Cristo está consciente na presença do Senhor (2 Co 5.8). O ímpio aguarda o juízo em tormento (Lc 16.23).</p>`,
          app: 'Pergunte-se com sinceridade: se Jesus voltasse hoje, há algo que eu precisaria acertar? Acerte ainda esta semana.',
          ref: ['Por que a iminência do arrebatamento é um incentivo à santidade?', 'Qual o perigo de marcar datas para a volta de Cristo?'],
          quiz: [
            ['No arrebatamento, Cristo vem:', ['Com a Igreja, visivelmente', 'Para a Igreja, nos ares', 'Para julgar as nações', 'Para reinar em Roma'], 1, '1 Tessalonicenses 4.17.'],
            ['“Iminente” significa que o arrebatamento:', ['Já aconteceu', 'Pode ocorrer a qualquer momento', 'Só ocorre depois da tribulação', 'É simbólico'], 1, 'Nenhum sinal precisa se cumprir antes dele.'],
            ['A posição adotada pelo livro é:', ['Amilenista', 'Pós-milenista', 'Pré-tribulacionista e pré-milenista', 'Preterista'], 2, 'A Igreja é arrebatada antes da tribulação, e Cristo reina mil anos.'],
            ['A segunda ressurreição é a:', ['Dos justos', 'Dos ímpios, para o Juízo Final', 'De Cristo', 'Dos anjos'], 1, 'Apocalipse 20.5.'],
          ],
        },
        {
          t: 'Os dias de angústia',
          s: 'Tribunal de Cristo, Bodas do Cordeiro, Grande Tribulação e Armagedom',
          p: [488, 517],
          base: 'Mateus 24.21; Apocalipse 19.6-16',
          obj: 'Estudar os eventos no céu (Tribunal de Cristo e Bodas do Cordeiro) e na terra (Grande Tribulação, Anticristo, Armagedom e julgamento das nações).',
          top: ['O Tribunal de Cristo', 'As Bodas do Cordeiro', 'A Grande Tribulação', 'O Armagedom e a prisão de Satanás', 'O julgamento das nações'],
          html: `
<h3>No céu</h3>
<p>Após o arrebatamento, os salvos comparecem ao <strong>Tribunal de Cristo</strong> (<em>bema</em>), não para condenação, mas para avaliação das obras e entrega de galardões e coroas (1 Co 3.12-15; 2 Co 5.10). Em seguida, celebram-se as <strong>Bodas do Cordeiro</strong>: a união festiva de Cristo com a sua Igreja (Ap 19.7-9).</p>
<h3>Na terra: a Grande Tribulação</h3>
<p>Um período de sete anos (a 70ª semana de Daniel, Dn 9.27), de juízos de Deus sobre um mundo rebelde. Nele se manifesta o <strong>Anticristo</strong>, líder mundial que fará aliança com Israel e a quebrará na metade do período, exigindo adoração; e o <strong>Falso Profeta</strong>, que promoverá seu culto e a marca da besta (Ap 13). Os juízos dos selos, trombetas e taças se derramam. Muitos se converterão nesse tempo, a alto preço.</p>
<h3>Armagedom</h3>
<p>As nações se reunirão contra Israel no vale de Megido. Cristo virá em glória com seus santos, derrotará o Anticristo e o Falso Profeta, que serão lançados no lago de fogo, e Satanás será preso por mil anos (Ap 19.19–20.3).</p>
<h3>Julgamento das nações</h3>
<p>Antes do Milênio, Cristo julgará os sobreviventes da tribulação, separando “ovelhas” e “bodes” conforme o tratamento dado aos seus irmãos (Mt 25.31-46).</p>`,
          app: 'Avalie o que você tem construído para a eternidade: “ouro, prata e pedras preciosas” ou “madeira, feno e palha”?',
          ref: ['O que o Tribunal de Cristo nos ensina sobre fidelidade nas pequenas coisas?', 'Por que a Igreja não passará pela Grande Tribulação, segundo a visão pré-tribulacionista?'],
          quiz: [
            ['O Tribunal de Cristo (bema) é para:', ['Condenar os salvos', 'Avaliar obras e conceder galardões', 'Julgar os ímpios', 'Julgar Satanás'], 1, '2 Coríntios 5.10.'],
            ['A Grande Tribulação corresponde a:', ['70ª semana de Daniel', 'Mil anos', 'Quarenta dias', 'Três dias'], 0, 'Daniel 9.27.'],
            ['O Armagedom ocorre:', ['Antes do arrebatamento', 'Ao fim da tribulação, na vinda gloriosa de Cristo', 'No fim do Milênio', 'Na criação'], 1, 'Apocalipse 16.16; 19.'],
            ['Durante o Milênio, Satanás estará:', ['Livre', 'Preso no abismo', 'Reinando', 'Convertido'], 1, 'Apocalipse 20.1-3.'],
          ],
        },
        {
          t: 'Eis que faço novas todas as coisas',
          s: 'O Milênio, o Juízo Final e o novo céu e a nova terra',
          p: [518, 539],
          base: 'Apocalipse 20.1-15; 21.1-7',
          obj: 'Compreender o reino milenial de Cristo, o Juízo Final diante do grande trono branco e o estado eterno — e encerrar o curso com gratidão e compromisso.',
          top: ['O Milênio segundo as Escrituras', 'Perguntas difíceis sobre o Milênio', 'A última revolta do diabo e sua condenação', 'O Juízo Final', 'Novo céu e nova terra'],
          html: `
<h3>O Milênio</h3>
<p>Cristo reinará literalmente sobre a terra por mil anos, com os santos (Ap 20.4-6). Será um tempo de justiça, paz e restauração da natureza (Is 11.6-9), com Jerusalém como centro. Cumprem-se as promessas feitas a Israel e a Davi.</p>
<h3>A última revolta</h3>
<p>No fim dos mil anos, Satanás será solto por pouco tempo e enganará as nações, mostrando que o coração humano, sem regeneração, permanece rebelde mesmo em condições perfeitas. Fogo do céu consumirá os rebeldes, e o diabo será lançado no <strong>lago de fogo</strong> para sempre (Ap 20.7-10).</p>
<h3>O Juízo Final</h3>
<p>Diante do <strong>grande trono branco</strong>, os mortos sem Cristo serão julgados segundo as suas obras. Quem não for achado inscrito no livro da vida será lançado no lago de fogo: a <strong>segunda morte</strong> (Ap 20.11-15).</p>
<h3>Novo céu e nova terra</h3>
<p>Deus fará novas todas as coisas. A Nova Jerusalém descerá do céu; Deus habitará com o seu povo; não haverá mais morte, nem pranto, nem clamor, nem dor (Ap 21.1-4). Veremos o seu rosto (Ap 22.4).</p>
<blockquote>“Ora, vem, Senhor Jesus!” (Ap 22.20)</blockquote>
<h3>Encerramento do curso</h3>
<p>Ao longo destes seis meses percorremos as dez grandes doutrinas da fé. Que esse conhecimento se transforme em adoração, santidade e testemunho.</p>`,
          app: 'Escreva uma carta de gratidão a Deus pelo que você aprendeu nestes seis meses e compartilhe um trecho no último encontro.',
          ref: ['O que a última revolta de Satanás revela sobre o coração humano?', 'Qual doutrina estudada neste curso mais transformou sua vida?'],
          quiz: [
            ['O Milênio é:', ['Um símbolo da era da Igreja', 'O reinado literal de Cristo por mil anos na terra', 'O céu', 'A tribulação'], 1, 'Apocalipse 20.4-6.'],
            ['O Juízo Final acontece diante do:', ['Tribunal de Cristo', 'Grande trono branco', 'Sinédrio', 'Templo'], 1, 'Apocalipse 20.11.'],
            ['A “segunda morte” é:', ['A morte física', 'O lago de fogo', 'O sono da alma', 'O fim do Milênio'], 1, 'Apocalipse 20.14.'],
            ['Em Apocalipse 21.4, Deus promete que não haverá mais:', ['Adoração', 'Morte, pranto, clamor nem dor', 'Trabalho', 'Música'], 1, 'Estado eterno de glória.'],
          ],
        },
      ],
    },
  ],
};
