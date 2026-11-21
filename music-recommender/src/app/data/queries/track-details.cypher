// Detalhes das faixas: artistas, participações, gêneros e a foto do artista principal
MATCH (track:Track)
WHERE track.trackId IN $trackIds
RETURN track.trackId  AS trackId,
       track.name     AS name,
       track.duration AS duration,
       track.release  AS release,
       track.previewUrl    AS previewUrl,
       track.appleMusicUrl AS appleMusicUrl,
       COLLECT { MATCH (track)<-[:PRODUCES]-(artist:Artist)    RETURN artist.name } AS artists,
       COLLECT { MATCH (track)<-[:FEATURED_IN]-(guest:Artist)  RETURN guest.name  } AS featuring,
       COLLECT { MATCH (track)-[:BELONGS_TO]->(genre:Genre)    RETURN genre.name  } AS genres,
       head(COLLECT {
         MATCH (track)<-[:PRODUCES]-(artist:Artist)
         WHERE artist.photoUrl IS NOT NULL
         RETURN artist { .name, .photoUrl, .photoCredit }
       }) AS artistPhoto
