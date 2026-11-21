// Seu algoritmo: recebe $userId e deve retornar a coluna trackId (reason é opcional)
// Exemplo: músicas curtidas por ouvintes da mesma nacionalidade
MATCH (me:User {userId: $userId})-[:BORN_IN]->(country:Nationality)
MATCH (country)<-[:BORN_IN]-(peer:User)-[:LISTENED_TO {liked: true}]->(track:Track)
WHERE peer <> me
  AND NOT (me)-[:LISTENED_TO]->(track)
WITH track, country, count(DISTINCT peer) AS fans
RETURN track.trackId AS trackId,
       'Curtida por ' + fans + ' ouvinte(s) de nacionalidade ' + country.name AS reason
ORDER BY fans DESC
LIMIT 10
