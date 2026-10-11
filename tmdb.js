import "dotenv/config";

const tmdbAccessToken = process.env.TMDB_API_KEY;

function getTodayDate() {
  return Temporal.Now.plainDateISO().toString();
}

function mapMovieToFields(movieData) {
  return {
    titulo: movieData.title,
    titulo_original: movieData.original_title,
    titulo_nacional:
      movieData.translations.translation.filter(
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
    assistido_em: getTodayDate(),
    assistiria_novamente: "Não",
    cinema: null,
    status: "Done",
    tmdb: `https://www.themoviedb.org/movie/${movieData.id}`,
  };
}

async function getMovieById(movieId, mapMovie = mapMovieToFields) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&append_to_response=credits,translations`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${tmdbAccessToken}`,
    },
  };
  return await fetch(url, options)
    .then((res) => res.json())
    .then((movieData) => mapMovie(movieData));
}

async function getMovieByImdbId(imdbId) {
  const url = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${tmdbAccessToken}`,
    },
  };
  return await fetch(url, options)
    .then((res) => res.json())
    .then((movieData) => getMovieById(movieData.movie_results[0].id))
    .then((movie) => movie);
}

const tmdb = { getMovieById, getMovieByImdbId };

export default tmdb;
