# notion-tmdb

**English** | [Português (BR)](./README.pt-BR.md)

Sync the movies you watch on [Letterboxd](https://letterboxd.com/) into a [Notion](https://www.notion.so/) database, automatically enriched with metadata from [TMDb](https://www.themoviedb.org/).

The script reads your Letterboxd RSS feed, finds the films you have watched since the last run, fetches their details (director, composer, genres, release year, etc.) from TMDb, and creates a page for each one in your Notion movie database.

## How it works

1. **Read state** – It reads the last processed TMDb movie ID from a Notion "metadata" page.
2. **Fetch new watches** – It parses your personal Letterboxd RSS feed and collects every new film since that ID (ignoring rewatches).
3. **Enrich data** – For each film it calls the TMDb API to retrieve title, original/national titles, director(s), composer(s), genres, and release year.
4. **Create pages** – It creates a page in your Notion data source for each film.
5. **Persist state** – After a successful run it stores the newest TMDb ID back on the metadata page, so the next run only processes genuinely new watches.

If any film fails, the previously saved ID is restored before the error is thrown, so nothing is silently skipped.

## Requirements

- [Node.js](https://nodejs.org/) `26.x`
- A Notion integration with access to the target database
- A TMDb API key
- Your Letterboxd RSS feed URL

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NOTION_API_KEY` | Notion integration secret token. |
| `NOTION_DATA_SOURCE_ID` | ID of the Notion data source where movie pages are created. |
| `NOTION_PAGE_METADATA_ID` | ID of the Notion page that stores the sync state. |
| `NOTION_PAGE_METADATA_PROPERTY_ID` | ID of the numeric property on the metadata page holding the last processed TMDb ID. |
| `LETTERBOXD_FEED_URL` | Your Letterboxd RSS feed URL (e.g. `https://letterboxd.com/<username>/rss/`). |
| `TMDB_API_KEY` | TMDb API read access token (v4 bearer token). |

### 3. Prepare your Notion database

Your target data source should have the following properties (names must match, as they are referenced in `notion.js`):

- `Name` – title
- `Título original` – rich text
- `Título nacional` – rich text
- `Status` – select
- `Assistiria novamente?` – select
- `Diretor` – multi-select
- `Musica` – multi-select
- `Gênero` – multi-select
- `Lancamento` – number
- `tmdb` – URL
- `Assistido em` – date

You also need a separate metadata page with a **number** property used to store the last synced TMDb movie ID.

## Usage

Run the sync:

```bash
npm run update-notion
```

This executes `node index.js`, which performs a single synchronization pass and exits. Schedule it with `cron`, a Notion automation, GitHub Actions, or any task runner if you want it to stay up to date automatically.

## Project structure

| File | Description |
| --- | --- |
| `index.js` | Entry point. Orchestrates the sync: reads state, gets new watches, enriches them, and writes to Notion. |
| `letterboxd.js` | Parses the Letterboxd RSS feed and returns the films watched since the last run. |
| `tmdb.js` | Fetches movie data from the TMDb API. |
| `notion.js` | Wraps the Notion API: reads/writes sync state and creates movie pages. |

## Notes

- The Notion client uses API version `2025-09-03` with the `data_source_id` parent type.
- Rewatches are intentionally skipped.

## Disclaimer

This README was generated with the help of AI and revised by the author.
