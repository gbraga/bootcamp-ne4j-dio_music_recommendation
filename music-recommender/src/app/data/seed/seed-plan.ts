// Import plan shared by the browser auto-seed and `npm run seed`.
// Keep this file free of Angular imports so Node can load it directly.

export interface SeedStep {
  /** CSV file name inside resources/datasets. */
  file: string;
  /** Receives the CSV rows as `$rows`. */
  cypher: string;
}

export const SEED_CONSTRAINTS: readonly string[] = [
  'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.userId IS UNIQUE',
  'CREATE CONSTRAINT track_id IF NOT EXISTS FOR (t:Track) REQUIRE t.trackId IS UNIQUE',
  'CREATE CONSTRAINT artist_id IF NOT EXISTS FOR (a:Artist) REQUIRE a.artistId IS UNIQUE',
  'CREATE CONSTRAINT genre_id IF NOT EXISTS FOR (g:Genre) REQUIRE g.genreId IS UNIQUE',
  'CREATE CONSTRAINT nationality_id IF NOT EXISTS FOR (n:Nationality) REQUIRE n.nationalityId IS UNIQUE',
];

export const IS_DATABASE_EMPTY = 'RETURN NOT EXISTS { MATCH (:User) } AS empty';

export const SEED_STEPS: readonly SeedStep[] = [
  {
    file: 'users.csv',
    cypher: `
      UNWIND $rows AS row
      MERGE (u:User {userId: row.userId})
      SET u.name = row.user_name,
          u.age  = toInteger(row.user_age)`,
  },
  {
    file: 'artists.csv',
    cypher: `
      UNWIND $rows AS row
      MERGE (a:Artist {artistId: row.artistId})
      SET a.name = row.artist_name,
          a.age  = toInteger(row.artist_age)`,
  },
  {
    file: 'genres.csv',
    cypher: `
      UNWIND $rows AS row
      MERGE (g:Genre {genreId: row.genreId})
      SET g.name = row.genre_name`,
  },
  {
    file: 'nationality.csv',
    cypher: `
      UNWIND $rows AS row
      MERGE (n:Nationality {nationalityId: row.nationalityId})
      SET n.name = row.nationality_name`,
  },
  {
    file: 'tracks.csv',
    cypher: `
      UNWIND $rows AS row
      MERGE (t:Track {trackId: row.trackId})
      SET t.name     = row.name,
          t.duration = toInteger(row.duration),
          t.release  = row.release`,
  },
  {
    file: 'belongs_to.csv',
    cypher: `
      UNWIND $rows AS row
      MATCH (t:Track {trackId: row.trackId}), (g:Genre {genreId: row.genreId})
      MERGE (t)-[:BELONGS_TO]->(g)`,
  },
  {
    file: 'produces.csv',
    cypher: `
      UNWIND $rows AS row
      MATCH (a:Artist {artistId: row.artistId}), (t:Track {trackId: row.trackId})
      MERGE (a)-[:PRODUCES]->(t)`,
  },
  {
    file: 'featured_in.csv',
    cypher: `
      UNWIND $rows AS row
      MATCH (a:Artist {artistId: row.artistId}), (t:Track {trackId: row.trackId})
      MERGE (a)-[:FEATURED_IN]->(t)`,
  },
  {
    file: 'artist_born_in.csv',
    cypher: `
      UNWIND $rows AS row
      MATCH (a:Artist {artistId: row.artistId}), (n:Nationality {nationalityId: row.nationalityId})
      MERGE (a)-[:BORN_IN]->(n)`,
  },
  {
    file: 'user_born_in.csv',
    cypher: `
      UNWIND $rows AS row
      MATCH (u:User {userId: row.userId}), (n:Nationality {nationalityId: row.nationalityId})
      MERGE (u)-[:BORN_IN]->(n)`,
  },
  {
    file: 'listened_to.csv',
    cypher: `
      UNWIND $rows AS row
      MATCH (u:User {userId: row.userId}), (t:Track {trackId: row.trackId})
      MERGE (u)-[l:LISTENED_TO]->(t)
      SET l.liked         = toBoolean(row.liked),
          l.listenDate    = datetime(row.listenDate),
          l.timesListened = toInteger(row.timesListened)`,
  },
];
