import { Client } from "@notionhq/client";
import "dotenv/config";

const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;

const notionToken = process.env.NOTION_API_KEY;

const notionClient = new Client({
  auth: notionToken,
  notionVersion: "2025-09-03",
});

async function retrieveDataSourceProperties() {
  const response = await notionClient.dataSources.retrieve({
    data_source_id: dataSourceId,
  });
  return response;
}

async function getLastSyncedTmdbId() {
  return (
    await retrievePageProperty(
      process.env.NOTION_PAGE_METADATA_ID,
      process.env.NOTION_PAGE_METADATA_PROPERTY_ID,
    )
  ).number;
}

async function updateLastSyncedTmdbId(tmdbId) {
  const properties = {
    tmdbId: {
      number: Number(tmdbId),
    },
  };
  await updatePage(process.env.NOTION_PAGE_METADATA_ID, properties);
}

async function retrievePageProperty(pageId, propertyId) {
  const response = await notionClient.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  });
  return response;
}

async function updatePage(pageId, properties) {
  const response = await notionClient.pages.update({
    page_id: pageId,
    properties,
  });
  return response;
}

async function createMoviePage(movieInfo) {
  const response = await notionClient.pages.create({
    parent: {
      type: "data_source_id",
      data_source_id: dataSourceId,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: movieInfo.titulo,
            },
          },
        ],
      },
      "Título original": {
        rich_text: [{ text: { content: movieInfo.titulo_original } }],
      },
      "Título nacional": {
        rich_text: [{ text: { content: movieInfo.titulo_nacional } }],
      },
      Status: {
        select: {
          name: movieInfo.status,
        },
      },
      "Assistiria novamente?": {
        select: {
          name: movieInfo.assistiria_novamente,
        },
      },
      Diretor: {
        multi_select: movieInfo.diretor.map((director) => {
          return { name: director };
        }),
      },
      Musica: {
        multi_select: movieInfo.musica.map((crewMember) => {
          return { name: crewMember };
        }),
      },
      Gênero: {
        multi_select: movieInfo.generos.map((genre) => {
          return { name: genre };
        }),
      },
      Lancamento: {
        number: Number(movieInfo.lancamento),
      },
      tmdb: {
        url: movieInfo.tmdb,
      },
      "Assistido em": {
        date: { start: movieInfo.assistido_em, end: null, time_zone: null },
      },
    },
  });
  return response;
}

const notion = { createMoviePage, getLastSyncedTmdbId, updateLastSyncedTmdbId };

export default notion;
