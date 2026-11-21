// Registra uma audição: cria LISTENED_TO na primeira vez e soma um play nas seguintes
MATCH (user:User {userId: $userId}), (track:Track {trackId: $trackId})
MERGE (user)-[listen:LISTENED_TO]->(track)
  ON CREATE SET listen.timesListened = 1,
                listen.liked         = false,
                listen.listenDate    = datetime()
  ON MATCH SET  listen.timesListened = listen.timesListened + 1
RETURN listen.timesListened AS timesListened,
       listen.liked         AS liked
