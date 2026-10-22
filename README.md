# VideiraBook

Plataforma web de estudo bíblico: o professor administra cursos, módulos, aulas, materiais (vídeos, PDFs, textos, links, áudios), checklist, questionários, presença e avisos; os alunos acessam com usuário e senha criados pelo professor e seguem a jornada aula por aula.

Já vem com a grade de **Teologia Sistemática Pentecostal**: 10 módulos (as 10 doutrinas do livro) e 26 aulas semanais — cerca de 6 meses de encontros de 1h30, uma vez por semana. Cada aula traz objetivo, tópicos, texto-base, explicação, perguntas de reflexão, aplicação, questionário de 4 perguntas, as páginas de leitura do livro e um checklist pronto.

## Rodar no computador

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

Primeiro acesso do professor:

- Usuário: `professor`
- Senha: `videira123`

Troque a senha logo em **Perfil**. Também dá para definir outro usuário/senha inicial pelas variáveis abaixo, antes do primeiro start.

## Publicar no EasyPanel

1. Crie um App e aponte para este código (GitHub ou upload). O `Dockerfile` já está pronto.
2. Porta interna: **3000**.
3. Crie um **volume** montado em `/app/data` — é onde ficam o banco (`videirabook.db`) e os arquivos enviados (PDFs, vídeos). Sem o volume, tudo se perde a cada deploy.
4. Variáveis de ambiente (opcionais):

| Variável | Para quê | Padrão |
|---|---|---|
| `PROFESSOR_USUARIO` | usuário do professor criado no primeiro start | `professor` |
| `PROFESSOR_SENHA` | senha inicial do professor | `videira123` |
| `PROFESSOR_NOME` | nome exibido | `Professor` |
| `JWT_SECRET` | segredo das sessões (se vazio, é gerado e guardado no banco) | — |
| `UPLOAD_MAX_MB` | tamanho máximo de upload | `1024` |
| `COOKIE_SECURE` | `1` para cookie só em HTTPS | — |

Para vídeos grandes, prefira YouTube (não listado) ou Google Drive e cole o link: o player aparece dentro da aula e não pesa no servidor. Se for enviar arquivo de vídeo direto, aumente o limite de upload do proxy no EasyPanel.

## Primeiros passos do professor

1. **Configurações** — nome da turma, dia e horário, local e a data do primeiro encontro. Use “Salvar e recalcular as datas das aulas”.
2. **Cursos e aulas → Teologia Sistemática Pentecostal** — envie o PDF do livro-texto. Cada aula passa a ter o botão “Abrir na página X”.
3. Em cada aula, aba **Materiais** — adicione o vídeo de pré-estudo e PDFs de apoio. Cada material entra no checklist.
4. **Alunos → Novo aluno** — o sistema sugere usuário e senha e já monta a mensagem para enviar pelo WhatsApp.
5. No dia do encontro, aba **Turma e presença** da aula — marque quem esteve presente.

## Regras de liberação

- A aula abre sozinha X dias antes do encontro (padrão: 7) para o pré-estudo.
- Com “Seguir a sequência” ligado, a próxima aula só abre quando o aluno conclui a anterior.
- Uma aula está concluída quando todos os itens do checklist estão marcados (a presença no encontro não trava a sequência).
- O professor pode liberar uma aula manualmente ou todas de uma vez.

## Textos das aulas

Cada aula tem um texto de estudo completo na pasta `teologia/` (`aula-01.html` … `aula-26.html`), escrito com base nos capítulos do livro, cobrindo todos os temas e subtemas, e terminando com um resumo.

- Numa instalação nova, esses textos entram automaticamente na explicação de cada aula.
- Numa instalação que já estava rodando, ao reiniciar o app os textos curtos antigos são trocados pelos completos — **apenas nas aulas que o professor não editou**.
- Depois disso, o professor pode ajustar qualquer texto pelo próprio app (aba “Conteúdo” da aula).


```
server.js        rotas da API e regras de acesso
db.js            banco SQLite, configuração padrão e importação da grade
curriculo.js     grade das 26 aulas (títulos, perguntas, páginas)
teologia/        textos completos de estudo, um arquivo por aula
index.html, style.css, core.js, aluno.js, professor.js, logo.svg, *.woff2   interface
Dockerfile       imagem para EasyPanel
```

Backup: copie a pasta `data/` (ou o volume `/app/data`).
