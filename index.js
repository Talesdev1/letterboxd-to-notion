import letterboxd from "./letterboxd.js";
import tmdb from "./tmdb.js";
import notion from "./notion.js";

function createMovieMapper(letterboxdEntry) {
  return function mapMovieData(movieData) {
    return {
      titulo: movieData.title,
      titulo_original: movieData.original_title,
      titulo_nacional:
        movieData.translations.translations.filter(
          (translation) => translation.iso_3166_1 === "BR",
        )[0]?.data.title || "",
      diretor: movieData.credits.crew
        .filter((crewMember) => crewMember.job === "Director")
        .map((crewMember) => crewMember.name),
      musica: movieData.credits.crew
        .filter((crewMember) => crewMember.job === "Original Music Composer")
        .map((crewMember) => crewMember.name),
      generos: movieData.genres.map((genre) => genre.name),
      lancamento: movieData.release_date.split("-")[0],
      assistido_em: letterboxdEntry.watchedDate,
      assistiria_novamente:
        letterboxdEntry.memberLike === "Yes" ? "Sim" : "Não",
      cinema: null,
      status: "Done",
      tmdb: `https://www.themoviedb.org/movie/${movieData.id}`,
    };
  };
}

async function main() {
  let lastSyncedTmdbId = await notion.getLastSyncedTmdbId();

  const newWatches = await letterboxd.getNewWatchedMovies(lastSyncedTmdbId);
  console.log(newWatches);

  if (newWatches.length === 0) return;
  for (const letterboxdEntry of newWatches.reverse()) {
    try {
      const movie = await tmdb.getMovieById(
        letterboxdEntry.tmdbMovieId,
        createMovieMapper(letterboxdEntry),
      );
      await notion.createMoviePage(movie);
      lastSyncedTmdbId = letterboxdEntry.tmdbMovieId;
    } catch (error) {
      await notion.updateLastSyncedTmdbId(lastSyncedTmdbId);
      throw error;
    }
  }
  console.log("updateLastSyncedTmdbId");
  await notion.updateLastSyncedTmdbId(lastSyncedTmdbId);
}

main();
