# Decisões técnicas

Registro de decisões relevantes, o motivo por trás delas e o que foi
descartado no caminho. Ordem cronológica (mais recente no topo).

## 2026-07-07 — Manter o lock de arquivo (`flock`) em `crud-api/src/src/data.php`

**Decisão**: rodar as operações em data.php do jeito que estão agora:

1. loadData() → lê o arquivo inteiro, decodifica o JSON pra um array PHP
2. modifica → em memória (ex: adiciona um usuário, ou dá update)
3. saveData() → serializa o array de volta e sobrescreve o arquivo inteiro

**Motivo**: esse projeto foi feito com fins acadêmicos e como uma ferramenta de pesquisa e estudos, sem a intenção de ser lançado ou necessidade de ser escalável para produção, não haverá duas requisições simultâneas. O projeto rodará localmente apenas

---

## 2026-07-07 — Servidor embutido do PHP em vez de Nginx + PHP-FPM

**Decisão**: rodar a API com `php -S 0.0.0.0:8000 -t src/public
src/public/index.php` dentro do container, em vez de montar uma stack
Nginx + PHP-FPM.

**Motivo**: o objetivo era "dockerizar e fazer rodar" um CRUD simples, sem
tráfego concorrente relevante. O servidor embutido do PHP é suficiente,
elimina a necessidade de configurar Nginx e `php-fpm.conf`, e reduz o
`Dockerfile` a poucas linhas.

**Trade-off aceito**: o servidor embutido do PHP é single-threaded por
padrão e não é recomendado pela documentação oficial do PHP para produção.
Se o projeto crescer para uso real com múltiplos usuários simultâneos, essa
decisão deve ser revisitada (ver `roadmap.md`).

---

## 2026-07-07 — Vite em modo dev server dentro do container (não build estático)

**Decisão**: o `Dockerfile` do frontend roda `npm run dev -- --host` (Vite
dev server), em vez de `npm run build` + Nginx servindo os arquivos
estáticos.

**Motivo**: prioriza simplicidade e velocidade para "rodar agora", com
hot-reload disponível inclusive dentro do container. Não exige uma segunda
imagem (Nginx) nem configurar servir arquivos estáticos.

**Trade-off aceito**: não é a forma recomendada de rodar em produção — o
dev server do Vite não é otimizado para isso (sem minificação completa,
sem cache-control adequado, etc.). Ver `roadmap.md` para o plano de migração
para build estático quando/se o projeto for para produção.

---

## 2026-07-07 — Porta 8080 para o frontend (não a padrão 5173 do Vite)

**Decisão**: configurar `vite.config.js` com `server.port = 8080`.

**Motivo**: `crud-api/src/config/config.php` já continha uma allowlist de
CORS com `http://localhost:8080` (e `:5500`), indicando que o autor original
do projeto já esperava o frontend rodando nessa porta. Usar a porta padrão
do Vite (5173) exigiria alterar o `config.php` só para isso funcionar.

**Alternativa descartada**: manter a porta padrão do Vite e adicionar
`localhost:5173` à allowlist de CORS. Descartada por ser uma mudança
desnecessária ao código do backend quando a porta 8080 já era suportada.

---

## 2026-07-07 — Remoção das rotas `/docs` e `/openapi.json`

**Decisão**: remover, em `crud-api/src/public/index.php`, as rotas:

```php
'/docs' => serveView(__DIR__ . '/../views/docs.html'),
'/openapi.json' => serveJson(__DIR__ . '/../openapi.json'),
```

**Motivo**: essas rotas chamavam as funções `serveView()` e `serveJson()`,
que não existiam em nenhum arquivo do projeto — e os arquivos que elas
tentariam servir (`views/docs.html`, `openapi.json`) também não existiam.
Manter essas linhas causaria um erro fatal do PHP (`Call to undefined
function`) caso alguém acessasse `/docs` ou `/openapi.json`.

**Alternativa descartada**: implementar `serveView`/`serveJson` e criar uma
documentação OpenAPI mínima. Descartada nesta rodada por estar fora do
escopo pedido ("dockerizar e fazer rodar"); ver `roadmap.md` para
reconsiderar isso como funcionalidade futura (documentação interativa da
API).

---

## 2026-07-07 — Persistência em arquivo JSON (mantida, não migrada para SQL)

**Decisão**: manter `data.json` como mecanismo de persistência, sem
introduzir SQLite/MySQL/Postgres.

**Motivo**: essa já era a decisão original do projeto (código em
`data.php` já implementado dessa forma) e o escopo pedido foi dockerizar o
que já existia, não redesenhar a persistência.

**Trade-off aceito**: sem transações, sem lock de arquivo — duas escritas
concorrentes podem se sobrescrever. Ver `docs/storage.md` para detalhes e
`roadmap.md` para o plano de migração para um banco de dados real.

---

## 2026-07-07 — `data/` excluído do build da imagem Docker via `.dockerignore`

**Decisão**: adicionar `data/` ao `.dockerignore` da API, mesmo com
`data.json` já populado no host.

**Motivo**: como o `docker-compose.yaml` monta `./crud-api/data:/app/data`
como volume, o conteúdo da imagem nesse caminho é irrelevante em tempo de
execução — ele é sempre sobrescrito pelo volume do host. Excluir do build
context evita "assar" uma cópia dos dados dentro da imagem (que ficaria
desatualizada e poderia confundir se alguém rodar sem o volume montado).

---

## 2026-07-07 — Um `compose.yaml` na raiz + um `compose.yaml` por serviço

**Decisão**: manter os `compose.yaml` vazios que já existiam dentro de
`crud-api/` e `crud-frontend-axios/` (preenchendo-os para rodar cada serviço
isoladamente), e criar um terceiro `compose.yaml` na raiz do projeto para
orquestrar os dois juntos.

**Motivo**: os arquivos por serviço já faziam parte da estrutura original do
projeto (ainda que vazios), sugerindo a intenção de permitir rodar cada
serviço de forma independente. O `compose.yaml` da raiz cobre o caso comum
de "só quero rodar o projeto inteiro".
