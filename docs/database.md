# Banco de dados

## Estado atual: não há banco de dados

Este projeto **não usa um banco de dados relacional ou NoSQL**. Toda a
persistência é feita em um único arquivo JSON (`crud-api/data/data.json`),
lido e reescrito por inteiro a cada operação. Os detalhes de como esse
arquivo funciona (formato, regras de escrita, limitações) estão documentados
em [`storage.md`](storage.md) — este arquivo (`database.md`) documenta o
**esquema lógico** dos dados, como se fosse um banco, para servir de
referência e de ponto de partida caso o projeto migre para um banco real.

## Esquema lógico (equivalente a uma tabela única)

### Tabela `users` (representada por `data.json → users[]`)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| `id` | `INTEGER` | Não | Chave primária. Autoincremento controlado manualmente via `data.json → nextId`. |
| `name` | `VARCHAR(100)` | Não | Nome do usuário. |
| `age` | `INTEGER` | Não | Idade, entre 1 e 150. |
| `email` | `VARCHAR(255)` | Não | E-mail. **Sem constraint de unicidade hoje** — dois usuários podem ter o mesmo e-mail. |

Não há outras tabelas. Não há relacionamentos (não existe nenhuma outra
entidade no domínio atual — apenas usuários).

### Índices

Nenhum. Buscas (`findUserById`) são feitas com um `foreach` linear sobre o
array `users` em `data.php` — custo O(n) por busca. Aceitável para o volume
de dados de uma demo; não escalável para milhares de registros (ver
`roadmap.md`).

## Diagrama (estado atual)

```
┌───────────────────────────────┐
│              users             │
├───────────────────────────────┤
│ id       INTEGER  PK            │
│ name     VARCHAR(100)  NOT NULL │
│ age      INTEGER       NOT NULL │
│ email    VARCHAR(255)  NOT NULL │
└───────────────────────────────┘
```

## Plano de migração (futuro — ver `roadmap.md`)

Se/quando o projeto migrar para um banco real (SQLite é o candidato mais
próximo, por não exigir um servidor de banco separado), o esquema SQL
equivalente seria:

```sql
CREATE TABLE users (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   VARCHAR(100) NOT NULL,
    age    INTEGER NOT NULL CHECK (age BETWEEN 1 AND 150),
    email  VARCHAR(255) NOT NULL UNIQUE
);
```

Mudanças em relação ao estado atual:

- `email UNIQUE` — hoje não há checagem de duplicidade; isso passaria a ser
  garantido pelo próprio banco.
- `CHECK (age BETWEEN 1 AND 150)` — hoje essa regra só existe em
  `validation.php` (camada de aplicação); um `CHECK` constraint adicionaria
  uma segunda camada de garantia direto no banco.
- Camada `data.php` seria reescrita para usar PDO (ou outra abstração de
  acesso a dados) em vez de `file_get_contents`/`file_put_contents`,
  mantendo a mesma assinatura de funções (`loadData`, `insertUser`,
  `updateUser`, `deleteUser`, `findUserById`) para minimizar o impacto em
  `services.php` e `controllers.php`.

Nenhuma migration foi criada ainda — este é apenas o esquema planejado.
