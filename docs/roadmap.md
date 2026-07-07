# Roadmap

## Objetivo de longo prazo

Evoluir de um CRUD de demonstração local (arquivo JSON, sem autenticação,
dev server) para uma aplicação apta a rodar em produção com dados reais e
múltiplos usuários simultâneos, mantendo a simplicidade arquitetural atual
(sem framework pesado) sempre que possível.

## v1.0 — Estado atual

- [x] CRUD completo de usuários (name, age, email) via API REST em PHP puro.
- [x] Frontend em JS vanilla + Vite + Axios.
- [x] Dockerização de ambos os serviços, orquestrados via Docker Compose.
- [x] Persistência simples em arquivo `data.json`.
- [x] Validação de campos no backend (nome, idade, e-mail).
- [x] Documentação completa (`README.md`, `CLAUDE.md`, `docs/*.md`).

## v1.1 — Robustez sem mudar a stack

- [ ] Adicionar lock de arquivo (`flock`) em `data.php` para evitar
      condição de corrida em escritas concorrentes.
- [ ] Testes automatizados:
  - [ ] PHPUnit para `validation.php` e `services.php`.
  - [ ] Testes de integração para os endpoints (`api.md` como referência de
        contrato).
  - [ ] Testes de frontend para `scripts/api/*.js` (mock do Axios).
- [ ] Validação de e-mail duplicado (atualmente dois usuários podem ter o
      mesmo e-mail).
- [ ] Paginação em `GET /api/users` (hoje retorna a lista inteira sempre).
- [ ] Loading state visível no frontend durante chamadas à API.

## v1.2 — Produção-ready

- [ ] Build estático do frontend (`vite build`) servido por Nginx, em vez do
      dev server do Vite dentro do container (ver `decisions.md`).
- [ ] Trocar `php -S` (servidor embutido) por PHP-FPM + Nginx na API.
- [ ] Variáveis de ambiente para configurar `allowedOrigins` e porta, em vez
      de valores fixos em `config.php`.
- [ ] HTTPS (certificado via Nginx ou proxy reverso, ex. Traefik/Caddy).

## v2.0 — Banco de dados real

- [ ] Migrar `data.json` para SQLite (mudança mínima, sem exigir servidor de
      banco separado) — ver `database.md` para o esquema já esboçado.
- [ ] Alternativamente, migrar para MySQL/Postgres se o projeto exigir
      múltiplas instâncias da API compartilhando o mesmo estado.
- [ ] Migrations versionadas.
- [ ] Índice único em `email`.

## v2.1 — Autenticação e autorização

- [ ] Autenticação (ex. JWT ou sessão) para proteger os endpoints de
      escrita (`POST`, `PUT`, `PATCH`, `DELETE`).
- [ ] Rate limiting básico na API.

## Ideias descartadas por ora (reconsiderar apenas com justificativa forte)

- Reintroduzir as rotas `/docs` e `/openapi.json` com uma especificação
  OpenAPI real e uma página de documentação interativa (tipo Swagger UI) —
  ver motivo do descarte em `decisions.md`.
- Migrar o backend para um framework (Laravel/Slim) — só faz sentido se o
  escopo da API crescer muito além de um CRUD simples.
- Migrar o frontend para React/Vue — só faz sentido se a complexidade de
  estado do frontend justificar.
