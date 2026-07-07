# Arquitetura

## Visão geral

Duas aplicações independentes, sem código compartilhado, que se comunicam
por HTTP/JSON:

```
┌─────────────────────────┐        HTTP/JSON        ┌─────────────────────────┐
│  crud-frontend-axios     │  ───────────────────►   │        crud-api          │
│  (JS vanilla + Vite)     │  ◄───────────────────   │  (PHP puro, sem framework)│
│  porta 8080              │                          │  porta 8000              │
└─────────────────────────┘                          └───────────┬─────────────┘
                                                                    │
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │   data.json       │
                                                          │ (arquivo em disco) │
                                                          └──────────────────┘
```

Não existe SSR, não existe API Gateway, não existe banco de dados. Cada lado
pode ser desenvolvido, testado e "deployado" de forma isolada.

## Estrutura de pastas

```
crud-api/
├── Dockerfile
├── compose.yaml
├── data/
│   └── data.json
└── src/
    ├── config/
    │   └── config.php
    ├── public/
    │   └── index.php
    └── src/
        ├── api.php
        ├── controllers.php
        ├── services.php
        ├── validation.php
        └── data.php

crud-frontend-axios/
├── Dockerfile
├── compose.yaml
├── package.json
├── vite.config.js
└── src/
    ├── index.html
    ├── app.js
    ├── scripts/
    │   ├── api/
    │   │   ├── create.js
    │   │   ├── read.js
    │   │   ├── update.js
    │   │   └── delete.js
    │   └── dom/
    │       ├── form.js
    │       └── render.js
    └── styles/
        ├── reset.css
        └── style.css
```

## Fluxo da aplicação (backend)

Toda requisição HTTP passa pelas mesmas camadas, nesta ordem:

```
index.php  (roteamento por URI + CORS + tratamento de OPTIONS)
   │
   ▼
api.php  (despacha por método HTTP: GET/POST/PUT/PATCH/DELETE)
   │
   ▼
controllers.php  (lê input do request, chama o service, formata resposta)
   │
   ▼
services.php  (regras de negócio: valida, monta o objeto final)
   │              │
   │              ▼
   │         validation.php  (regras de validação de campo)
   ▼
data.php  (lê/escreve o data.json inteiro a cada operação)
```

### Responsabilidade de cada camada (backend)

| Arquivo | Responsabilidade |
|---|---|
| `config.php` | Caminho do `data.json` e allowlist de CORS. |
| `index.php` | Único ponto de entrada HTTP. Decide CORS, trata `OPTIONS`, roteia por URI (`match`). |
| `api.php` | Dentro da rota `/api/users`, despacha por método HTTP. |
| `controllers.php` | Faz o parse do request (`php://input`, `$_GET['id']`), chama o service certo, padroniza a resposta (`respond()`), envolve tudo em `try/catch`. |
| `services.php` | Regra de negócio: valida campos obrigatórios, valida formato, decide o que muda em um `PATCH` parcial. |
| `validation.php` | Regras puras de validação (nome, idade, e-mail). Não sabe nada de HTTP. |
| `data.php` | Único lugar que toca o arquivo `data.json`. Funções: `loadData`, `saveData`, `findUserById`, `insertUser`, `updateUser`, `deleteUser`. |

## Fluxo da aplicação (frontend)

```
index.html
   │  carrega
   ▼
app.js  (ponto de entrada — liga eventos do DOM a chamadas de API)
   │
   ├── scripts/dom/form.js     → estado do formulário (criar vs. editar)
   ├── scripts/dom/render.js   → desenha a lista de usuários no DOM
   │
   └── scripts/api/*.js        → chamadas Axios (create, read, update, delete)
                                    │
                                    ▼
                              crud-api (HTTP)
```

### Responsabilidade de cada camada (frontend)

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura estática: formulário e container da lista de usuários. |
| `app.js` | Orquestrador. É o único arquivo que "conecta" eventos do DOM a chamadas de API. |
| `scripts/api/create.js` | `POST /api/users`. |
| `scripts/api/read.js` | `GET /api/users`. |
| `scripts/api/update.js` | `PUT`/`PATCH /api/users` — decide sozinho qual verbo usar comparando campos alterados. |
| `scripts/api/delete.js` | `DELETE /api/users`. |
| `scripts/dom/form.js` | Controla o "modo edição" (guarda `editingId` e `originalUser`, alterna textos/botões). |
| `scripts/dom/render.js` | Busca a lista da API, mantém cache em memória (`cachedUsers`), desenha os cards, escapa HTML. |
| `styles/*.css` | Estilo visual, sem lógica. |

## Fluxo completo de exemplo — criar um usuário

1. Usuário preenche o formulário e clica em "Create" → `app.js` captura o
   evento `submit`.
2. Não há `editingId` ativo → `app.js` chama `createUser()` de `create.js`.
3. Axios faz `POST http://localhost:8000/api/users` com `{name, age, email}`.
4. No backend: `index.php` valida a origem (CORS) → roteia para `api.php` →
   `handlePost()` → `createUser()` em `services.php` → valida campos →
   `insertUser()` em `data.php` grava no `data.json` com um novo `id`.
5. Resposta `201` com o usuário criado volta para o frontend.
6. `app.js` chama `renderUsers()` novamente, que busca a lista atualizada e
   redesenha os cards.

## Por que essa separação de camadas

- **Testabilidade**: `validation.php` e `data.php` são funções puras (ou
  quase puras), fáceis de testar isoladamente sem precisar simular uma
  requisição HTTP.
- **Onde procurar quando algo quebra**: erro de validação → `validation.php`;
  resposta HTTP errada → `controllers.php`; dado não persistindo →
  `data.php`; CORS bloqueado → `config.php`/`index.php`.
- **Frontend**: separar `scripts/api` de `scripts/dom` permite trocar a
  biblioteca HTTP (Axios → fetch nativo, por exemplo) sem tocar em nenhuma
  linha que manipula o DOM, e vice-versa.
