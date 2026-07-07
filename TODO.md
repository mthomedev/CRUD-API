# TODO

Lista de tarefas pendentes, melhorias e bugs conhecidos. Priorizado do topo
(mais urgente) para baixo. Ao concluir um item, mova-o para
`docs/decisions.md` se envolveu uma decisão relevante, ou simplesmente
remova-o daqui.

## Prioridade alta

- [x] **Validar o build real com Docker.** A dockerização foi feita e
      revisada manualmente, mas sem acesso à internet no ambiente onde foi
      criada — rodar `docker compose up --build` de verdade e confirmar que
      os dois serviços sobem e conversam entre si.
- [ ] Adicionar lock de arquivo (`flock`) em `crud-api/src/src/data.php`
      para evitar corrupção/perda de dados em escritas concorrentes.
- [ ] Validar duplicidade de e-mail no `POST`/`PUT`/`PATCH` (hoje dois
      usuários podem ter o mesmo e-mail).

## Prioridade média

- [ ] Testes automatizados:
  - [ ] PHPUnit para `validation.php` e `services.php`.
  - [ ] Testes de integração para os endpoints da API.
- [ ] Loading state no frontend durante chamadas à API (hoje não há
      indicação visual de "carregando").
- [ ] Mensagens de erro do frontend um pouco mais amigáveis para o usuário
      final (hoje refletem quase 1:1 as mensagens da API).

## Prioridade baixa / melhorias futuras

- [ ] Trocar o dev server do Vite dentro do Docker por `vite build` + Nginx
      (ver `docs/roadmap.md` — v1.2).
- [ ] Trocar `php -S` por PHP-FPM + Nginx (ver `docs/roadmap.md` — v1.2).
- [ ] Avaliar migração de `data.json` para SQLite (esquema já esboçado em
      `docs/database.md`).
- [ ] Paginação em `GET /api/users`.

## Bugs conhecidos

- Nenhum bug funcional conhecido no momento da última atualização deste
  arquivo. Ver `docs/current_task.md → Problemas conhecidos` para riscos
  não confirmados (ex.: build não testado de ponta a ponta).

---

_Atualizado em: 2026-07-07._
