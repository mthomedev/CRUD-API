# CLAUDE.md — Guia para trabalhar neste projeto

Este arquivo define como qualquer IA (ou desenvolvedor humano) deve trabalhar neste repositório: ordem de leitura, regras do projeto, convenções de código e fluxo de desenvolvimento.

## Ordem de leitura recomendada

Antes de alterar qualquer código, leia nesta ordem:

1. [`README.md`](README.md) — visão geral e como rodar o projeto
2. `CLAUDE.md` (este arquivo) — regras gerais
3. [`docs/current_task.md`](docs/current_task.md) — o que está em andamento agora
4. [`docs/architecture.md`](docs/architecture.md) — como as camadas se encaixam
5. [`docs/decisions.md`](docs/decisions.md) — por que as coisas são como são
6. [`docs/storage.md`](docs/storage.md) / [`docs/api.md`](docs/api.md) / [`docs/database.md`](docs/database.md) — conforme a área que for mexer
7. [`TODO.md`](TODO.md) — tarefas pendentes e prioridades

Não pule direto para o código sem passar por `current_task.md` e
`architecture.md` — isso evita reinventar decisões já tomadas ou quebrar
convenções existentes.

## Regras do projeto

1. **Sem framework.** Backend é PHP puro (sem Laravel/Symfony) e frontend é
   JS vanilla (sem React/Vue). Não introduzir framework sem registrar a
   decisão em `docs/decisions.md` e concordância explícita do responsável
   pelo projeto.
2. **Sem banco de dados relacional por enquanto.** A persistência é um
   arquivo `data.json`. Se isso mudar, atualizar `docs/storage.md`,
   `docs/database.md` e `docs/decisions.md` no mesmo PR/commit.
3. **Contratos de API são a fonte da verdade do frontend.** Qualquer mudança
   em `crud-api/src/src/*.php` que afete request/response deve ser refletida
   em `docs/api.md` antes de ser considerada concluída.
4. **CORS via allowlist fixa** em `crud-api/src/config/config.php`. Se a porta
   do frontend mudar, essa lista precisa ser atualizada manualmente (não há
   wildcard `*`, por segurança).
5. **Não reintroduzir as rotas `/docs` e `/openapi.json`** em `index.php` sem
   antes implementar as funções `serveView`/`serveJson` que elas exigem —
   essas rotas foram removidas por apontar para código inexistente.
6. **Toda alteração de arquitetura, endpoint ou storage exige atualizar a
   documentação correspondente** (ver tabela de responsabilidade no
   `README.md`). Documentação desatualizada é considerada bug.

## Convenções de código

### PHP (`crud-api`)

- PHP 8.1+, tipagem estrita nos parâmetros e retornos de função sempre que
  possível (`string $dataFile`, `?int $id`, `: array`, `: void`).
- Uma responsabilidade por camada: `controllers.php` nunca acessa o arquivo
  de dados diretamente — sempre passa por `services.php` → `data.php`.
- Toda função pública de controller deve envolver a lógica em
  `try/catch (\Throwable $e)` e nunca deixar um erro PHP cru vazar para o
  cliente — sempre responder com JSON `{"error": "..."}`.
- Erros de validação retornam `400`; recurso não encontrado, `404`; erro
  interno, `500`.

### JavaScript (`crud-frontend-axios`)

- ES Modules (`import`/`export`), sem bundler de produção configurado além
  do Vite padrão.
- Separação estrita de responsabilidade:
  - `scripts/api/*.js` — só fala com a API via Axios. Nunca acessa
    `document`/DOM.
  - `scripts/dom/*.js` — só manipula o DOM. Nunca faz `fetch`/`axios`
    diretamente.
  - `app.js` — é o único lugar que liga eventos do DOM a chamadas de API.
- Toda função de `scripts/api/*.js` deve capturar erro do Axios e relançar
  com `error.response?.data?.error` como mensagem, para manter mensagens de
  erro consistentes na UI.
- Ao renderizar dados do usuário no DOM, sempre escapar HTML (ver
  `escapeHtml` em `render.js`) para evitar XSS.

### Docker

- `Dockerfile` de cada serviço deve continuar independente e buildável
  isoladamente (`docker build ./crud-api`, `docker build ./crud-frontend-axios`).
- O `compose.yaml` da raiz orquestra os dois; os `compose.yaml` de cada
  subpasta permitem subir cada serviço sozinho.
- Dados do backend (`crud-api/data`) sempre montados como volume — nunca
  "assados" dentro da imagem (ver `.dockerignore`).

## Fluxo de desenvolvimento

1. Consultar `docs/current_task.md` para saber o que já está em andamento.
2. Antes de começar algo novo, atualizar `docs/current_task.md` com a nova
   tarefa, status "Em andamento" e arquivos que serão tocados.
3. Implementar a mudança seguindo as convenções acima.
4. Se a mudança envolveu uma escolha técnica não óbvia (ex.: trocar servidor
   PHP embutido por PHP-FPM, adicionar banco de dados, mudar formato de
   resposta), registrar em `docs/decisions.md` com o motivo.
5. Se a API mudou, atualizar `docs/api.md`.
6. Se a estrutura de dados mudou, atualizar `docs/storage.md` e/ou
   `docs/database.md`.
7. Mover a tarefa concluída de `docs/current_task.md` para o histórico (ou
   apagar) e atualizar `TODO.md` (remover o item feito, adicionar novos que
   surgiram).
8. Atualizar `README.md` apenas se a forma de rodar o projeto ou a estrutura
   de pastas de alto nível mudou.
