# API — `crud-api`

Base URL (local/Docker): `http://localhost:8000`

Todos os endpoints ficam sob um único recurso: `/api/users`. O método HTTP
determina a operação.

## Autenticação

Nenhuma. Todos os endpoints são públicos (ver `roadmap.md` para plano
futuro de autenticação).

## CORS

Liberado apenas para as origens definidas em
`crud-api/src/config/config.php`:

```
http://0.0.0.0:8080, http://localhost:8080, http://127.0.0.1:8080
http://0.0.0.0:5500, http://localhost:5500, http://127.0.0.1:5500
```

Requisições de outras origens não recebem o header
`Access-Control-Allow-Origin` e são bloqueadas pelo navegador.

## Modelo de dados

```json
{
  "id": 1,
  "name": "Maria Silva",
  "age": 30,
  "email": "maria@example.com"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `id` | `int` | Gerado pelo servidor. Nunca enviado pelo cliente. |
| `name` | `string` | Obrigatório na criação. Não pode ser vazio (após `trim`). Máximo 100 caracteres. |
| `age` | `int` | Obrigatório na criação. Numérico, entre 1 e 150. |
| `email` | `string` | Obrigatório na criação. Deve ser um e-mail válido (`filter_var(FILTER_VALIDATE_EMAIL)`). **Sem checagem de duplicidade.** |

---

## `GET /api/users`

Lista todos os usuários.

**Request**: sem parâmetros, sem corpo.

**Response — 200 OK**

```json
{
  "users": [
    { "id": 1, "name": "Maria Silva", "age": 30, "email": "maria@example.com" },
    { "id": 2, "name": "João Souza", "age": 25, "email": "joao@example.com" }
  ]
}
```

**Response — 500 Internal Server Error** (falha inesperada ao ler o arquivo)

```json
{ "error": "Internal server error" }
```

**Exemplo (curl)**

```bash
curl http://localhost:8000/api/users
```

---

## `POST /api/users`

Cria um novo usuário.

**Request body**

```json
{ "name": "Maria Silva", "age": 30, "email": "maria@example.com" }
```

Todos os três campos são obrigatórios.

**Response — 201 Created**

```json
{ "id": 1, "name": "Maria Silva", "age": 30, "email": "maria@example.com" }
```

**Response — 400 Bad Request** (campo faltando)

```json
{ "error": "age, email are required" }
```

**Response — 400 Bad Request** (campo inválido)

```json
{ "error": "Age must be between 1 and 150" }
```

Outras mensagens possíveis de validação: `"Name cannot be empty"`,
`"Name must be at most 100 characters"`, `"Age must be a number"`,
`"Invalid email format"`, `"Invalid JSON body"` (corpo não é um JSON válido).

**Exemplo (curl)**

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","age":30,"email":"maria@example.com"}'
```

---

## `PUT /api/users?id={id}`

Substitui **todos** os campos de um usuário existente. Todos os três campos
são obrigatórios no corpo, mesmo os que não mudaram.

**Query string**: `id` (obrigatório) — identificador do usuário.

**Request body**

```json
{ "name": "Maria Silva", "age": 31, "email": "maria@example.com" }
```

**Response — 200 OK**

```json
{ "id": 1, "name": "Maria Silva", "age": 31, "email": "maria@example.com" }
```

**Response — 400 Bad Request**: `id` ausente (`"User id is required"`),
corpo inválido, ou campo obrigatório faltando/inválido (mesmas mensagens do
`POST`).

**Response — 404 Not Found**

```json
{ "error": "User not found" }
```

**Exemplo (curl)**

```bash
curl -X PUT "http://localhost:8000/api/users?id=1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","age":31,"email":"maria@example.com"}'
```

---

## `PATCH /api/users?id={id}`

Atualiza **parcialmente** um usuário — só os campos enviados são alterados.

**Query string**: `id` (obrigatório).

**Request body** (qualquer subconjunto de `name`/`age`/`email`)

```json
{ "age": 31 }
```

**Response — 200 OK** (retorna o usuário completo, já atualizado)

```json
{ "id": 1, "name": "Maria Silva", "age": 31, "email": "maria@example.com" }
```

**Response — 400 / 404**: mesmas regras do `PUT`, exceto que campos
ausentes no corpo não geram erro de "obrigatório" (só os campos
efetivamente enviados são validados).

**Exemplo (curl)**

```bash
curl -X PATCH "http://localhost:8000/api/users?id=1" \
  -H "Content-Type: application/json" \
  -d '{"age":31}'
```

> **Nota de implementação**: o frontend (`scripts/api/update.js`) decide
> sozinho entre `PUT` e `PATCH` — se os três campos mudaram em relação ao
> valor original, usa `PUT`; caso contrário, usa `PATCH` só com os campos
> alterados.

---

## `DELETE /api/users?id={id}`

Remove um usuário.

**Query string**: `id` (obrigatório).

**Response — 200 OK**

```json
{ "deleted": { "id": 1, "name": "Maria Silva", "age": 31, "email": "maria@example.com" } }
```

**Response — 400 Bad Request**

```json
{ "error": "User id is required" }
```

**Response — 404 Not Found**

```json
{ "error": "User not found" }
```

**Exemplo (curl)**

```bash
curl -X DELETE "http://localhost:8000/api/users?id=1"
```

---

## Outros métodos

Qualquer método HTTP diferente de `GET/POST/PUT/PATCH/DELETE` em
`/api/users` retorna:

**Response — 405 Method Not Allowed**

```json
{ "error": "Method not allowed" }
```

## Qualquer outra rota

Qualquer URI diferente de `/api/users` retorna:

**Response — 404 Not Found**

```json
{ "error": "Not found" }
```

> As antigas rotas `/docs` e `/openapi.json` foram removidas — ver
> `docs/decisions.md`.

## Preflight CORS

Requisições `OPTIONS` (preflight do navegador) sempre retornam `204 No
Content`, sem corpo.
