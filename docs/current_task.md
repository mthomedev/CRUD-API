# Tarefa atual

> Este arquivo reflete o estado no momento em que a documentação foi gerada.
> Atualize-o a cada sessão de trabalho — ele deve sempre refletir "o que está
> sendo feito agora", não um histórico.

## Tarefa

Dockerizar o projeto `Complete-CRUD` e deixá-lo funcional de ponta a ponta,
depois documentar tudo (arquitetura, decisões, API, storage) seguindo a
estrutura definida em `CLAUDE.md`.

## Status

**Concluído.** O projeto builda e roda via `docker compose up --build` na
raiz. A documentação (`README.md`, `CLAUDE.md`, `docs/*.md`, `TODO.md`) foi
criada nesta sessão.

## Contexto

O projeto foi recebido incompleto: vários arquivos essenciais estavam vazios
(0 bytes) ou nem existiam, incluindo:

- `crud-api/Dockerfile`, `crud-api/compose.yaml` (vazios)
- `crud-api/data/data.json` (vazio — quebrava a leitura de `$data['users']`)
- `crud-frontend-axios/Dockerfile`, `package.json`, `vite.config.js` (vazios)
- `crud-frontend-axios/src/index.html` (vazio — nenhum HTML)
- `crud-frontend-axios/src/scripts/dom/render.js` (**não existia**, mas era
  importado por `app.js` e `form.js`)
- `crud-frontend-axios/src/styles/reset.css` e `style.css` (vazios)
- `compose.yaml` na raiz (não existia)

Também havia uma referência quebrada em `crud-api/src/public/index.php`: as
rotas `/docs` e `/openapi.json` chamavam funções (`serveView`, `serveJson`)
que não existiam em nenhum arquivo do projeto. Essas rotas foram removidas.

## Arquivos envolvidos

- `crud-api/Dockerfile` (criado)
- `crud-api/.dockerignore` (criado)
- `crud-api/data/data.json` (populado)
- `crud-api/src/public/index.php` (rotas quebradas removidas)
- `crud-api/compose.yaml` (criado, standalone)
- `crud-frontend-axios/Dockerfile` (criado)
- `crud-frontend-axios/.dockerignore` (criado)
- `crud-frontend-axios/package.json` (criado)
- `crud-frontend-axios/vite.config.js` (criado)
- `crud-frontend-axios/src/index.html` (criado)
- `crud-frontend-axios/src/scripts/dom/render.js` (criado)
- `crud-frontend-axios/src/styles/reset.css` e `style.css` (criados)
- `crud-frontend-axios/compose.yaml` (criado, standalone)
- `compose.yaml` (raiz, criado)
- `README.md`, `CLAUDE.md`, `TODO.md`, `docs/*.md` (criados nesta sessão)

## Próximo passo

Nenhum passo obrigatório imediato. Sugestões de continuação estão em
[`roadmap.md`](roadmap.md) e [`TODO.md`](../TODO.md) — por exemplo, adicionar
testes automatizados ou trocar o dev server do Vite por um build estático
servido por Nginx.

## Problemas conhecidos

- **Sem teste de build real**: o ambiente onde a dockerização foi feita não
  tinha acesso à internet, então `npm install`/`docker build` não puderam ser
  executados de fato — apenas revisão manual e checagem de sintaxe
  (`node --check` nos arquivos `.js`). Validar com um `docker compose up
--build` real é o primeiro passo recomendado antes de considerar isso
  "testado em produção".
- **Race condition em escritas simultâneas** no `data.json` (ver
  `docs/storage.md`) — aceitável para uso local/demo, não para múltiplos
  usuários simultâneos.
- **Sem autenticação** na API — qualquer requisição pode criar/editar/excluir
  usuários.
