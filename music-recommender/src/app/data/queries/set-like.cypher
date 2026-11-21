// Curte ou descurte uma música (curtir uma música nunca ouvida também registra a audição)
MATCH (user:User {userId: $userId}), (track:Track {trackId: $trackId})
MERGE (user)-[listen:LISTENED_TO]->(track)
  ON CREATE SET listen.timesListened = 1,
                listen.listenDate    = datetime()
SET listen.liked = $liked
RETURN listen.liked AS liked
