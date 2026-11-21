// Histórico de escuta do usuário, das mais ouvidas para as menos ouvidas
MATCH (:User {userId: $userId})-[listen:LISTENED_TO]->(track:Track)
RETURN track.trackId           AS trackId,
       listen.timesListened    AS timesListened,
       listen.liked            AS liked,
       toString(listen.listenDate) AS listenDate
ORDER BY timesListened DESC
