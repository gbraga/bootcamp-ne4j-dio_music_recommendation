import users from './users.cypher';
import listeningHistory from './listening-history.cypher';
import trackDetails from './track-details.cypher';
import recommendSameAge from './recommend-same-age.cypher';
import recommendFromArtists from './recommend-from-artists.cypher';
import recommendTopTracks from './recommend-top-tracks.cypher';
import recommendLikedGenres from './recommend-liked-genres.cypher';
import customExample from './custom-example.cypher';

/** Cypher queries live in .cypher files and are bundled as plain text. */
export const Queries = {
  users,
  listeningHistory,
  trackDetails,
  recommendSameAge,
  recommendFromArtists,
  recommendTopTracks,
  recommendLikedGenres,
  customExample,
} as const;
