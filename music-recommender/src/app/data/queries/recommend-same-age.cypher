// Músicas que outros usuários da mesma faixa etária (± $ageRange anos) ouvem
MATCH (me:User {userId: $userId})
MATCH (peer:User)-[listen:LISTENED_TO]->(track:Track)
WHERE peer <> me
  AND abs(peer.age - me.age) <= $ageRange
  AND NOT (me)-[:LISTENED_TO]->(track)
WITH track,
     count(DISTINCT peer)      AS listeners,
     sum(listen.timesListened) AS plays
RETURN track.trackId AS trackId,
       listeners,
       plays
ORDER BY listeners DESC, plays DESC
LIMIT 5
