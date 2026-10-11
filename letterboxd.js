import Parser from "rss-parser";
import "dotenv/config";

const rssParser = new Parser({
  customFields: {
    item: [
      ["letterboxd:watchedDate", "watchedDate"],
      ["letterboxd:rewatch", "rewatch"],
      ["letterboxd:memberLike", "memberLike"],
      ["tmdb:movieId", "tmdbMovieId"],
    ],
  },
});

async function getNewWatchedMovies(lastSyncedTmdbId) {
  const feed = await rssParser.parseURL(process.env.LETTERBOXD_FEED_URL);
  console.log(feed.title);

  const watchedSinceLastSync = [];
  console.log(lastSyncedTmdbId);
  for (const item of feed.items) {
    if (item.tmdbMovieId && Number(item.tmdbMovieId) === lastSyncedTmdbId) {
      break;
    }
    watchedSinceLastSync.push(item);
  }

  const newWatches = watchedSinceLastSync.filter(
    (item) => item.rewatch === "No",
  );
  if (newWatches.length === 0) {
    return [];
  }

  return newWatches.map((item) => {
    const { watchedDate, rewatch, memberLike, tmdbMovieId } = item;
    return { watchedDate, rewatch, memberLike, tmdbMovieId };
  });
}

const letterboxd = { getNewWatchedMovies };

export default letterboxd;
