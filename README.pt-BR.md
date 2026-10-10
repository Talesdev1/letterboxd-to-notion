# notion-tmdb

[English](./README.md) | **Português (BR)**

Sincronize os filmes que você assiste no [Letterboxd](https://letterboxd.com/) com uma base de dados do [Notion](https://www.notion.so/), enriquecida automaticamente com metadados do [TMDb](https://www.themoviedb.org/).

O script lê o seu feed RSS do Letterboxd, encontra os filmes que você assistiu desde a última execução, busca os detalhes deles (diretor, compositor, gêneros, ano de lançamento etc.) no TMDb e cria uma página para cada um na sua base de dados de filmes do Notion.

## Como funciona

1. **Ler o estado** – Lê o último ID de filme do TMDb processado a partir de uma página de "metadados" no Notion.
2. **Buscar novos assistidos** – Faz o parse do seu feed RSS pessoal do Letterboxd e coleta todos os filmes novos desde aquele ID (ignorando reassistidos).
3. **Enriquecer os dados** – Para cada filme, chama a API do TMDb para obter o título, títulos original/nacional, diretor(es), compositor(es), gêneros e ano de lançamento.
4. **Criar páginas** – Cria uma página na sua fonte de dados do Notion para cada filme.
5. **Salvar o estado** – Após uma execução bem-sucedida, grava o ID mais recente do TMDb de volta na página de metadados, para que a próxima execução processe apenas filmes realmente novos.

Se algum filme falhar, o ID salvo anteriormente é restaurado antes que o erro seja lançado, para que nada seja ignorado silenciosamente.

## Requisitos

- [Node.js](https://nodejs.org/) `26.x`
- Uma integração do Notion com acesso à base de dados de destino
- Uma chave de API do TMDb
- A URL do seu feed RSS do Letterboxd

## Configuração

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Copie o arquivo de exemplo e preencha com os seus valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
| --- | --- |
| `NOTION_API_KEY` | Token secreto da integração do Notion. |
| `NOTION_DATA_SOURCE_ID` | ID da fonte de dados do Notion onde as páginas de filmes são criadas. |
| `NOTION_PAGE_METADATA_ID` | ID da página do Notion que armazena o estado da sincronização. |
| `NOTION_PAGE_METADATA_PROPERTY_ID` | ID da propriedade numérica da página de metadados que guarda o último ID do TMDb processado. |
| `LETTERBOXD_FEED_URL` | A URL do seu feed RSS do Letterboxd (ex.: `https://letterboxd.com/<usuário>/rss/`). |
| `TMDB_API_KEY` | Token de acesso de leitura da API do TMDb (token bearer v4). |

### 3. Preparar a sua base de dados do Notion

A sua fonte de dados de destino deve ter as seguintes propriedades (os nomes precisam corresponder, pois são referenciados no `notion.js`):

- `Name` – título
- `Título original` – texto
- `Título nacional` – texto
- `Status` – seleção
- `Assistiria novamente?` – seleção
- `Diretor` – seleção múltipla
- `Musica` – seleção múltipla
- `Gênero` – seleção múltipla
- `Lancamento` – número
- `tmdb` – URL
- `Assistido em` – data

Você também precisa de uma página de metadados separada, com uma propriedade do tipo **número** usada para armazenar o último ID de filme do TMDb sincronizado.

## Uso

Execute a sincronização:

```bash
npm run update-notion
```

Isso executa `node index.js`, que faz uma única passagem de sincronização e encerra. Agende isso com `cron`, uma automação do Notion, GitHub Actions ou qualquer executor de tarefas, se quiser mantê-lo atualizado automaticamente.

## Estrutura do projeto

| Arquivo | Descrição |
| --- | --- |
| `index.js` | Ponto de entrada. Orquestra a sincronização: lê o estado, busca os novos assistidos, enriquece os dados e grava no Notion. |
| `letterboxd.js` | Faz o parse do feed RSS do Letterboxd e retorna os filmes assistidos desde a última execução. |
| `tmdb.js` | Busca os dados dos filmes na API do TMDb. |
| `notion.js` | Encapsula a API do Notion: lê/grava o estado da sincronização e cria as páginas de filmes. |

## Observações

- O cliente do Notion usa a versão de API `2025-09-03` com o `parent_type` `data_source_id`.
- Filmes reassistidos são ignorados intencionalmente.

## Aviso

Este README foi gerado com o auxílio de IA e revisado pelo autor.
