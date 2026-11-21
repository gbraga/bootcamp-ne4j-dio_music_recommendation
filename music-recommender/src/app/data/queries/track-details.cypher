// Detalhes das faixas: artistas, participações e gêneros
MATCH (track:Track)
WHERE track.trackId IN $trackIds
RETURN track.trackId  AS trackId,
       track.name     AS name,
       track.duration AS duration,
       track.release  AS release,
       COLLECT { MATCH (track)<-[:PRODUCES]-(artist:Artist)    RETURN artist.name } AS artists,
       COLLECT { MATCH (track)<-[:FEATURED_IN]-(guest:Artist)  RETURN guest.name  } AS featuring,
       COLLECT { MATCH (track)-[:BELONGS_TO]->(genre:Genre)    RETURN genre.name  } AS genres
