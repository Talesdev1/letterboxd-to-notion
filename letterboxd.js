import Parser from "rss-parser";
import "dotenv/config";
let parser = new Parser({
  customFields: {
    item: [
      ["letterboxd:watchedDate", "watchedDate"],
      ["letterboxd:rewatch", "rewatch"],
      ["letterboxd:memberLike", "memberLike"],
      ["tmdb:movieId", "tmdbMovieId"],
    ],
  },
});

async function getMoviesToAdd(lastUpdatedTmdb) {
  let feed = await parser.parseURL(process.env.LETTERBOXD_FEED_URL);
  console.log(feed.title);

  let latestMovies = [];
  console.log(lastUpdatedTmdb);
  for (let i = 0; i < feed.items.length; i++) {
    if (
      feed.items[i].tmdbMovieId &&
      Number(feed.items[i].tmdbMovieId) === lastUpdatedTmdb
    ) {
      break;
    }
    latestMovies.push(feed.items[i]);
  }

  const moviesToAdd = latestMovies.filter((item) => item.rewatch === "No");
  if (moviesToAdd.length === 0) {
    return [];
  }

  return moviesToAdd.map((item) => {
    let { watchedDate, rewatch, memberLike, tmdbMovieId } = item;
    return { watchedDate, rewatch, memberLike, tmdbMovieId };
  });
}

const letterboxd = { getMoviesToAdd };

export default letterboxd;
