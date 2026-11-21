// Músicas dos gêneros que o usuário mais curtiu
MATCH (me:User {userId: $userId})-[:LISTENED_TO {liked: true}]->(:Track)-[:BELONGS_TO]->(genre:Genre)
WITH me, genre, count(*) AS likes
ORDER BY likes DESC
LIMIT 3
MATCH (genre)<-[:BELONGS_TO]-(track:Track)
WHERE NOT (me)-[:LISTENED_TO]->(track)
WITH track,
     collect(genre.name) AS likedGenres,
     sum(likes)          AS score
RETURN track.trackId AS trackId,
       likedGenres,
       score
ORDER BY score DESC
LIMIT 5
