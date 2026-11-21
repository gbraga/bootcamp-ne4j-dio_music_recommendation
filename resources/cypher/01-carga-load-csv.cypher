// =====================================================================================
// Graph Music · Carga do grafo com LOAD CSV
// -------------------------------------------------------------------------------------
// Cole este arquivo no Neo4j Browser / Query (AuraDB ou local) e execute bloco a bloco.
// Os CSVs são lidos direto do GitHub. No AuraDB não existe pasta "import",
// então o LOAD CSV precisa de uma URL pública (file:/// só funciona no Neo4j local).
//
// Ordem: 1) constraints → 2) nós → 3) relacionamentos.
// Todos os comandos usam MERGE, então rodar o script duas vezes não duplica nada.
//
// A aplicação faz exatamente a mesma carga (mesmos MERGE/SET) em
// music-recommender/src/app/data/seed/seed-plan.ts, recebendo as linhas por $rows.
// =====================================================================================


// -------------------------------------------------------------------------------------
// 0) (Opcional) Começar do zero: apaga todos os nós e relacionamentos
// -------------------------------------------------------------------------------------
// MATCH (n) DETACH DELETE n;


// -------------------------------------------------------------------------------------
// 1) Constraints de unicidade
//    Garantem que cada id existe uma única vez e criam o índice que deixa
//    os MATCH/MERGE por id rápidos durante a carga dos relacionamentos.
// -------------------------------------------------------------------------------------
CREATE CONSTRAINT user_id        IF NOT EXISTS FOR (u:User)        REQUIRE u.userId        IS UNIQUE;
CREATE CONSTRAINT track_id       IF NOT EXISTS FOR (t:Track)       REQUIRE t.trackId       IS UNIQUE;
CREATE CONSTRAINT artist_id      IF NOT EXISTS FOR (a:Artist)      REQUIRE a.artistId      IS UNIQUE;
CREATE CONSTRAINT genre_id       IF NOT EXISTS FOR (g:Genre)       REQUIRE g.genreId       IS UNIQUE;
CREATE CONSTRAINT nationality_id IF NOT EXISTS FOR (n:Nationality) REQUIRE n.nationalityId IS UNIQUE;


// -------------------------------------------------------------------------------------
// 2) Nós
//    O CSV entrega tudo como texto: números são convertidos com toInteger().
// -------------------------------------------------------------------------------------

// Ouvintes: user_name,user_age,userId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/users.csv' AS row
MERGE (u:User {userId: row.userId})
SET u.name = row.user_name,
    u.age  = toInteger(row.user_age);

// Artistas: artist_age,artist_name,artistId,photo_url,photo_credit
// Foto e crédito vêm do Wikimedia Commons (licenças livres exigem exibir o autor).
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/artists.csv' AS row
MERGE (a:Artist {artistId: row.artistId})
SET a.name        = row.artist_name,
    a.age         = toInteger(row.artist_age),
    a.photoUrl    = row.photo_url,
    a.photoCredit = row.photo_credit;

// Gêneros: genre_name,genreId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/genres.csv' AS row
MERGE (g:Genre {genreId: row.genreId})
SET g.name = row.genre_name;

// Nacionalidades: nationality_name,nationalityId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/nationality.csv' AS row
MERGE (n:Nationality {nationalityId: row.nationalityId})
SET n.name = row.nationality_name;

// Músicas: duration,trackId,name,release,preview_url,apple_music_url
// duration está em segundos. Uma coluna vazia no CSV vira '' e não null, então
// nullIf() evita gravar string vazia quando a música não tem prévia.
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/tracks.csv' AS row
MERGE (t:Track {trackId: row.trackId})
SET t.name          = row.name,
    t.duration      = toInteger(row.duration),
    t.release       = row.release,
    t.previewUrl    = nullIf(row.preview_url, ''),
    t.appleMusicUrl = nullIf(row.apple_music_url, '');


// -------------------------------------------------------------------------------------
// 3) Relacionamentos
//    MATCH nas duas pontas (usa os índices das constraints) + MERGE da relação.
// -------------------------------------------------------------------------------------

// Música → gênero: genreId,trackId (uma música pode ter vários gêneros)
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/belongs_to.csv' AS row
MATCH (t:Track {trackId: row.trackId}), (g:Genre {genreId: row.genreId})
MERGE (t)-[:BELONGS_TO]->(g);

// Artista principal → música: trackId,artistId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/produces.csv' AS row
MATCH (a:Artist {artistId: row.artistId}), (t:Track {trackId: row.trackId})
MERGE (a)-[:PRODUCES]->(t);

// Artista convidado (feat.) → música: trackId,artistId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/featured_in.csv' AS row
MATCH (a:Artist {artistId: row.artistId}), (t:Track {trackId: row.trackId})
MERGE (a)-[:FEATURED_IN]->(t);

// Artista → nacionalidade: artistId,nationalityId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/artist_born_in.csv' AS row
MATCH (a:Artist {artistId: row.artistId}), (n:Nationality {nationalityId: row.nationalityId})
MERGE (a)-[:BORN_IN]->(n);

// Ouvinte → nacionalidade: userId,nationalityId
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/user_born_in.csv' AS row
MATCH (u:User {userId: row.userId}), (n:Nationality {nationalityId: row.nationalityId})
MERGE (u)-[:BORN_IN]->(n);

// Audições: trackId,userId,liked,listenDate,timesListened
// É o relacionamento central do grafo, e as propriedades ficam NA RELAÇÃO
// (quantas vezes, se curtiu, desde quando). Os tipos são convertidos aqui
// porque os algoritmos fazem sum(timesListened) e filtram {liked: true}.
LOAD CSV WITH HEADERS
  FROM 'https://raw.githubusercontent.com/gbraga/bootcamp-ne4j-dio_music_recommendation/main/resources/datasets/listened_to.csv' AS row
MATCH (u:User {userId: row.userId}), (t:Track {trackId: row.trackId})
MERGE (u)-[l:LISTENED_TO]->(t)
SET l.liked         = toBoolean(row.liked),
    l.listenDate    = datetime(row.listenDate),
    l.timesListened = toInteger(row.timesListened);


// -------------------------------------------------------------------------------------
// 4) Conferência: quantidade de nós por label e de relacionamentos por tipo
//    Esperado: 35 Track, 25 User, 25 Artist, 25 Genre, 14 Nationality
//              70 LISTENED_TO, 52 BELONGS_TO, 50 BORN_IN, 36 PRODUCES, 4 FEATURED_IN
// -------------------------------------------------------------------------------------
MATCH (n) RETURN labels(n)[0] AS label, count(*) AS total ORDER BY total DESC;
MATCH ()-[r]->() RETURN type(r) AS tipo, count(*) AS total ORDER BY total DESC;

// Visualização do esquema (labels e relacionamentos)
CALL db.schema.visualization();
