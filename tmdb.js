import "dotenv/config";
const access_token = process.env.TMDB_API_KEY;

function getTodayDateFormatted() {
  const date = Temporal.Now.plainDateISO();
  return date.toString();
}

function getThesePropertiesOnly(json) {
  return {
    titulo: json.title,
    titulo_original: json.original_title,
    titulo_nacional:
      json.translations.filter((transl) => transl.iso_3166_1 === "BR")[0]?.data
        .title || "",
    diretor: json.credits.crew
      .filter((crew_member) => crew_member.job === "Director")
      .map((crewMember) => crewMember.name),
    musica: json.credits.crew
      .filter((crewMember) => crewMember.job === "Original Music Composer")
      .map((crewMember) => crewMember.name),
    generos: json.genres.map((genre) => genre.name),
    lancamento: json.release_date.split("-")[0],
    assistido_em: getTodayDateFormatted(),
    assistiria_novamente: "Não",
    status: "Done",
    tmdb: `https://www.themoviedb.org/movie/${json.id}`,
  };
}

async function getMovieById(
  movie_id,
  getTheseProperties = getThesePropertiesOnly,
) {
  console.log(movie_id);
  const url = `https://api.themoviedb.org/3/movie/${movie_id}?language=en-US&append_to_response=credits,translations`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };
  return await fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return getTheseProperties(json);
    });
}

async function getMovieByImdbId(imdb_id) {
  const url = `https://api.themoviedb.org/3/find/${imdb_id}?external_source=imdb_id&language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };
  return await fetch(url, options)
    .then((res) => res.json())
    .then((json) => getMovieById(json.movie_results[0].id))
    .then((movie) => {
      return movie;
    });
}

const tmdb = { getMovieById, getMovieByImdbId };

export default tmdb;
