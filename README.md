# Complete CRUD — Usuários

CRUD de usuários (nome, idade, e-mail) dividido duas aplicações independentes que conversam por HTTP/JSON:

- **`crud-api`** — backend em PHP puro (sem framework), expondo
  `GET/POST/PUT/PATCH/DELETE /api/users`.
- **`crud-frontend-axios`** — frontend em JavaScript vanilla (sem framework),
  usando Vite como dev server/bundler e Axios para as chamadas HTTP.

Não há banco de dados: a persistência é feita em um arquivo `data.json` no
backend. Veja [`docs/storage.md`](docs/storage.md) e [`docs/database.md`](docs/database.md)
para detalhes.

---

## Como executar

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) e Docker Compose
(já incluso no Docker Desktop e nas versões recentes do Docker Engine).

```bash
docker compose up --build
```

Isso sobe dois serviços:

| Serviço    | URL                             | Descrição                       |
| ---------- | ------------------------------- | ------------------------------- |
| `frontend` | http://localhost:8080           | Interface web (Vite dev server) |
| `api`      | http://localhost:8000/api/users | API REST em PHP                 |

Para parar:

```bash
docker compose down
```

Os dados ficam em `crud-api/data/data.json`, montado como volume — eles
persistem entre `docker compose down` / `up` e entre rebuilds da imagem.

### Rodar cada serviço separadamente

Cada pasta também tem seu próprio `compose.yaml`, caso você queira subir só
um dos dois:

```bash
cd crud-api && docker compose up --build
cd crud-frontend-axios && docker compose up --build
```

### Rodar sem Docker (opcional)

**API** (requer PHP 8.1+):

```bash
cd crud-api
php -S 0.0.0.0:8000 -t src/public src/public/index.php
```

**Frontend** (requer Node 20+):

```bash
cd crud-frontend-axios
npm install
npm run dev
```

---

## Estrutura de pastas

```
Complete-CRUD/
├── compose.yaml              # orquestra os dois serviços juntos
├── README.md                 # este arquivo
├── CLAUDE.md                 # regras para IA/desenvolvimento
├── TODO.md                   # tarefas pendentes
├── docs/
│   ├── architecture.md       # arquitetura e camadas do projeto
│   ├── current_task.md       # o que está em desenvolvimento agora
│   ├── decisions.md          # decisões técnicas e motivos
│   ├── storage.md            # persistência (data.json)
│   ├── api.md                # contratos da API (endpoints, payloads)
│   └── database.md           # esquema do "banco" (arquivo JSON)
│
├── crud-api/                 # backend PHP
│   ├── Dockerfile
│   ├── compose.yaml
│   ├── data/
│   │   └── data.json         # armazenamento dos usuários
│   └── src/
│       ├── config/config.php
│       ├── public/index.php  # roteador + CORS
│       └── src/
│           ├── api.php           # despacha por método HTTP
│           ├── controllers.php   # parse de request / resposta
│           ├── services.php      # regras de negócio
│           ├── validation.php    # validação de campos
│           └── data.php          # leitura/escrita do data.json
│
└── crud-frontend-axios/      # frontend JS + Vite
    ├── Dockerfile
    ├── compose.yaml
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── index.html
        ├── app.js                 # orquestra eventos + chamadas de API
        ├── scripts/
        │   ├── api/                   # só fala com a API (Axios)
        │   │   ├── create.js
        │   │   ├── read.js
        │   │   ├── update.js
        │   │   └── delete.js
        │   └── dom/                   # só mexe no DOM
        │       ├── form.js
        │       └── render.js
        └── styles/
            ├── reset.css
            └── style.css
```

---

## Para onde ir a partir daqui

- Quer entender a arquitetura em profundidade? → [`docs/architecture.md`](docs/architecture.md)
- Quer saber o que está sendo feito agora? → [`docs/current_task.md`](docs/current_task.md)
- Quer ver por que certas escolhas técnicas foram feitas? → [`docs/decisions.md`](docs/decisions.md)
- Quer consultar os endpoints da API? → [`docs/api.md`](docs/api.md)
- Quer entender a persistência de dados? → [`docs/storage.md`](docs/storage.md) e [`docs/database.md`](docs/database.md)
- Quer saber o que vem pela frente? → [`docs/roadmap.md`](docs/roadmap.md)
- Está desenvolvendo com ajuda de IA? Comece por [`CLAUDE.md`](CLAUDE.md)
- Quer ver tarefas pendentes? → [`TODO.md`](TODO.md)
