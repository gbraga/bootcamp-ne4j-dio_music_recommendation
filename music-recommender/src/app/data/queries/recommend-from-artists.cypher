// Músicas e parcerias dos artistas que o usuário já ouve
MATCH (me:User {userId: $userId})-[:LISTENED_TO]->(:Track)<-[:PRODUCES|FEATURED_IN]-(artist:Artist)
MATCH (artist)-[:PRODUCES|FEATURED_IN]->(track:Track)
WHERE NOT (me)-[:LISTENED_TO]->(track)
WITH track,
     collect(DISTINCT artist.name) AS knownArtists
RETURN track.trackId AS trackId,
       knownArtists,
       COUNT { (track)<-[:PRODUCES|FEATURED_IN]-(:Artist) } > 1 AS isPartnership
ORDER BY size(knownArtists) DESC, isPartnership DESC
