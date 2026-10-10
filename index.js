import letterboxd from "./letterboxd.js";
import tmdb from "./tmdb.js";
import oper from "./notion.js";

function getThesePropertiesOnlyFactory(item) {
  return function getThesePropertiesOnly(json) {
    return {
      titulo: json.title,
      titulo_original: json.original_title,
      titulo_nacional: json.translations.translations.filter(
        (transl) => transl.iso_3166_1 === "BR",
      )[0]?.data.title || "",
      diretor: json.credits.crew
        .filter((crew_member) => crew_member.job === "Director")
        .map((crewMember) => crewMember.name),
      musica: json.credits.crew
        .filter((crewMember) => crewMember.job === "Original Music Composer")
        .map((crewMember) => crewMember.name),
      generos: json.genres.map((genre) => genre.name),
      lancamento: json.release_date.split("-")[0],
      assistido_em: item.watchedDate,
      assistiria_novamente: item.memberLike === "Yes" ? "Sim" : "Não",
      status: "Done",
      tmdb: `https://www.themoviedb.org/movie/${json.id}`,
    };
  };
}

async function main() {
  let lastUpdatedTmdb = await oper.getLastUpdatedTmdb();

  let moviesToAdd = await letterboxd.getMoviesToAdd(lastUpdatedTmdb);
  console.log(moviesToAdd);

  if (moviesToAdd.length === 0) return;
  for (const item of moviesToAdd.reverse()) {
    try {
      let movie = await tmdb.getMovieById(
        item.tmdbMovieId,
        getThesePropertiesOnlyFactory(item),
      );
      await oper.createPage(movie);
      lastUpdatedTmdb = item.tmdbMovieId;
    } catch (error) {
      await oper.updateLastUpdatedTmdb(lastUpdatedTmdb);
      throw error;
    }
  }
  console.log("updateLastUpdatedTmdb");
  await oper.updateLastUpdatedTmdb(lastUpdatedTmdb);
}

main();
