// Top 3 músicas mais ouvidas da plataforma que o usuário ainda não ouviu
MATCH (me:User {userId: $userId})
MATCH (:User)-[listen:LISTENED_TO]->(track:Track)
WHERE NOT (me)-[:LISTENED_TO]->(track)
WITH track,
     sum(listen.timesListened) AS plays
RETURN track.trackId AS trackId,
       plays
ORDER BY plays DESC
LIMIT 3
