# Persistência de dados

> Este projeto **não usa LocalStorage/SessionStorage no navegador**. Toda
> persistência real acontece no backend, em um arquivo JSON no disco do
> container/host. O frontend mantém apenas um cache em memória (perdido a
> cada refresh da página) — documentado na seção "Cache do frontend" abaixo.

## Onde os dados ficam

```
crud-api/data/data.json
```

Esse caminho é resolvido em `crud-api/src/config/config.php`:

```php
$dataFile = __DIR__ . '/../../data/data.json';
```

Em Docker, esse arquivo é montado como **volume** (ver `compose.yaml` da
raiz):

```yaml
volumes:
  - ./crud-api/data:/app/data
```

Ou seja, o arquivo vive no host, não dentro da imagem — os dados sobrevivem
a `docker compose down`, rebuilds e recriação do container.

## Formato do arquivo

```json
{
  "users": [
    {
      "id": 1,
      "name": "Maria Silva",
      "age": 30,
      "email": "maria@example.com"
    }
  ],
  "nextId": 2
}
```

| Chave | Tipo | Descrição |
|---|---|---|
| `users` | `array` de objetos | Lista de todos os usuários cadastrados. |
| `users[].id` | `int` | Identificador único, atribuído automaticamente. |
| `users[].name` | `string` | Nome do usuário (até 100 caracteres, não vazio). |
| `users[].age` | `int` | Idade (entre 1 e 150). |
| `users[].email` | `string` | E-mail (validado com `filter_var(FILTER_VALIDATE_EMAIL)`, **sem** checagem de unicidade — ver `roadmap.md`). |
| `nextId` | `int` | Próximo ID a ser atribuído. Incrementado a cada criação, nunca reaproveitado. |

Estado inicial (arquivo recém-criado, sem nenhum usuário):

```json
{
  "users": [],
  "nextId": 1
}
```

## Regras de persistência

- **Leitura e escrita são sempre do arquivo inteiro.** Não há escrita
  parcial/incremental: `loadData()` lê o JSON inteiro e decodifica para um
  array PHP; `saveData()` serializa o array inteiro de volta e sobrescreve o
  arquivo (`data.php`).
- **IDs nunca são reaproveitados.** Mesmo depois de deletar um usuário,
  `nextId` não retrocede — ele só é lido e incrementado em `insertUser()`.
- **Sem transações e sem lock de arquivo.** Cada operação (`insertUser`,
  `updateUser`, `deleteUser`) faz um ciclo completo de
  `loadData()` → modifica em memória → `saveData()`. Se duas requisições
  concorrentes escreverem ao mesmo tempo, a segunda pode sobrescrever a
  primeira (race condition). Aceitável para uso local/demo — ver
  `roadmap.md` para o plano de adicionar `flock()`.
- **Sem schema enforcement automático.** A validação de formato acontece em
  `validation.php`, não no arquivo em si — é inteiramente possível editar o
  `data.json` manualmente e inserir dados inválidos (isso não é
  recomendado).
- **Arquivo vazio ou corrompido quebra a API.** Se `data.json` estiver vazio
  ou não for um JSON válido, `json_decode()` retorna `null`, e qualquer
  acesso a `$data['users']` causa erro. Por isso o arquivo deve sempre
  conter, no mínimo, `{"users": [], "nextId": 1}`.

## Cache do frontend (não é persistência)

`crud-frontend-axios/src/scripts/dom/render.js` mantém uma variável
`cachedUsers` em memória, atualizada toda vez que `renderUsers()` é chamado.
Ela existe só para permitir que `findUserById()` recupere os dados de um
usuário ao clicar em "Editar"/"Excluir" sem precisar de outra chamada à API.

Esse cache **não sobrevive a um refresh da página** e não é, de forma
alguma, um mecanismo de persistência — é puramente um detalhe de
implementação da UI.
