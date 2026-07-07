# Tarefa atual

> Este arquivo reflete o estado no momento em que a documentação foi gerada.
> Atualize-o a cada sessão de trabalho — ele deve sempre refletir "o que está
> sendo feito agora", não um histórico.

## Tarefa

Validar duplicidade de e-mail no `POST`/`PUT`/`PATCH` (hoje dois
usuários podem ter o mesmo e-mail).

## Status

**Concluído.**

## Contexto

Adicionada checagem de duplicidade de e-mail (case-insensitive) na camada
de serviço, antes de gravar os dados. Erro retornado segue o padrão
existente: `400` com `{"error": "Email already in use"}`.

## Arquivos envolvidos

- `crud-api/src/src/data.php` — nova função `findUserByEmail(string $dataFile, string $email, ?int $excludeId = null): ?array`.
- `crud-api/src/src/services.php` — chamada a `findUserByEmail` em `createUser()` (sem exclusão de id) e em `editUser()` (excluindo o próprio `$id`, e só quando `email` é enviado no corpo).
- `crud-api/src/src/validation.php` — não alterado (continua responsável só por formato, não por duplicidade).
- `docs/api.md` — atualizado com a nova regra de unicidade e as respostas `400 Email already in use` em `POST`, `PUT` e `PATCH`.

## Próximo passo

Nenhum pendente para esta tarefa. Validar manualmente com `curl` os casos
descritos em `docs/api.md` antes de considerar encerrado no fluxo de PR.

## Problemas conhecidos

Nenhum identificado até o momento.
