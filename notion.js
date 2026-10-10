import { Client } from "@notionhq/client";
import "dotenv/config";

const data_source_id = process.env.NOTION_DATA_SOURCE_ID;

const token = process.env.NOTION_API_KEY;

const notion = new Client({ auth: token, notionVersion: "2025-09-03" });

async function retrieveDataSourceProperties() {
  const response = await notion.dataSources.retrieve({
    data_source_id: data_source_id,
  });
  return response;
}

async function getLastUpdatedTmdb() {
  return (
    await retrievePageProperty(
      process.env.NOTION_PAGE_METADATA_ID,
      process.env.NOTION_PAGE_METADATA_PROPERTY_ID,
    )
  ).number;
}

async function updateLastUpdatedTmdb(tmdbId) {
  let properties = {
    tmdbId: {
      number: Number(tmdbId),
    },
  };
  await updatePage(process.env.NOTION_PAGE_METADATA_ID, properties);
}

async function retrievePageProperty(pageId, property_id) {
  const response = await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id,
  });
  return response;
}

async function updatePage(pageId, properties) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties,
  });
  return response;
}

async function createPage(movie_info) {
  const response = await notion.pages.create({
    parent: {
      type: "data_source_id",
      data_source_id: process.env.NOTION_DATA_SOURCE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: movie_info.titulo,
            },
          },
        ],
      },
      "Título original": {
        rich_text: [{ text: { content: movie_info.titulo_original } }],
      },
      "Título nacional": {
        rich_text: [{ text: { content: movie_info.titulo_nacional } }],
      },
      Status: {
        select: {
          name: movie_info.status,
        },
      },
      "Assistiria novamente?": {
        select: {
          name: movie_info.assistiria_novamente,
        },
      },
      Diretor: {
        multi_select: movie_info.diretor.map((diretor) => {
          return { name: diretor };
        }),
      },
      Musica: {
        multi_select: movie_info.musica.map((crewMember) => {
          return { name: crewMember };
        }),
      },
      Gênero: {
        multi_select: movie_info.generos.map((genre) => {
          return { name: genre };
        }),
      },
      Lancamento: {
        number: Number(movie_info.lancamento),
      },
      tmdb: {
        url: movie_info.tmdb,
      },
      "Assistido em": {
        date: { start: movie_info.assistido_em, end: null, time_zone: null },
      },
    },
  });
  return response;
}

const oper = { createPage, getLastUpdatedTmdb, updateLastUpdatedTmdb };

export default oper;
