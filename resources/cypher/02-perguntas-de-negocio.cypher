// =====================================================================================
// Graph Music · Perguntas de negócio
// -------------------------------------------------------------------------------------
// Cada pergunta tem duas versões:
//   • TABELA: responde a pergunta com números.
//   • GRAFO:  devolve nós e caminhos para o Neo4j Browser desenhar (use para os prints).
// As 4 consultas de recomendação usadas pela aplicação ficam em
// music-recommender/src/app/data/queries/*.cypher.
// =====================================================================================


// -------------------------------------------------------------------------------------
// P1. Quais são as músicas mais tocadas da plataforma?
//     Soma timesListened de todas as relações LISTENED_TO de cada música.
// -------------------------------------------------------------------------------------
// TABELA
MATCH (u:User)-[l:LISTENED_TO]->(t:Track)<-[:PRODUCES]-(a:Artist)
WITH t, collect(DISTINCT a.name) AS artistas, count(DISTINCT u) AS ouvintes, sum(l.timesListened) AS plays
RETURN t.name AS musica, artistas, ouvintes, plays
ORDER BY plays DESC
LIMIT 5;

// GRAFO: as 3 mais tocadas, com quem as ouviu
MATCH (:User)-[l:LISTENED_TO]->(t:Track)
WITH t, sum(l.timesListened) AS plays ORDER BY plays DESC LIMIT 3
MATCH path = (:User)-[:LISTENED_TO]->(t)<-[:PRODUCES]-(:Artist)
RETURN path;


// -------------------------------------------------------------------------------------
// P2. Quais artistas alcançam mais ouvintes diferentes?
//     Alcance (ouvintes distintos) e volume (plays) são métricas diferentes:
//     um artista pode ter muitos plays de poucos fãs.
// -------------------------------------------------------------------------------------
// TABELA
MATCH (a:Artist)-[:PRODUCES|FEATURED_IN]->(:Track)<-[l:LISTENED_TO]-(u:User)
RETURN a.name AS artista, count(DISTINCT u) AS ouvintes, sum(l.timesListened) AS plays
ORDER BY ouvintes DESC, plays DESC
LIMIT 5;


// -------------------------------------------------------------------------------------
// P3. Quais gêneros os ouvintes mais curtem?
//     Conta likes (liked = true) e plays atravessando Track → Genre.
// -------------------------------------------------------------------------------------
// TABELA
MATCH (:User)-[l:LISTENED_TO]->(:Track)-[:BELONGS_TO]->(g:Genre)
RETURN g.name AS genero,
       count(CASE WHEN l.liked THEN 1 END) AS likes,
       sum(l.timesListened) AS plays
ORDER BY likes DESC, plays DESC
LIMIT 5;

// GRAFO: curtidas chegando aos gêneros
MATCH path = (:User)-[:LISTENED_TO {liked: true}]->(:Track)-[:BELONGS_TO]->(:Genre)
RETURN path;


// -------------------------------------------------------------------------------------
// P4. Quais artistas colaboram entre si (parcerias / feat.)?
//     A base do algoritmo "Dos seus artistas": quem ouve um artista
//     descobre o outro pela parceria.
// -------------------------------------------------------------------------------------
// TABELA
MATCH (principal:Artist)-[:PRODUCES]->(t:Track)<-[:FEATURED_IN]-(convidado:Artist)
RETURN principal.name AS artista, convidado.name AS convidado, t.name AS musica;

// GRAFO
MATCH path = (:Artist)-[:PRODUCES]->(:Track)<-[:FEATURED_IN]-(:Artist)
RETURN path;


// -------------------------------------------------------------------------------------
// P5. Quais ouvintes têm gosto parecido?
//     Pares de ouvintes com mais músicas em comum: a base de uma
//     filtragem colaborativa ("quem ouviu o mesmo que você também ouviu…").
// -------------------------------------------------------------------------------------
// TABELA
MATCH (a:User)-[:LISTENED_TO]->(t:Track)<-[:LISTENED_TO]-(b:User)
WHERE elementId(a) < elementId(b)          // cada par aparece uma vez só
WITH a, b, count(t) AS emComum, collect(t.name) AS musicas
RETURN a.name AS ouvinte1, b.name AS ouvinte2, emComum, musicas
ORDER BY emComum DESC
LIMIT 5;

// GRAFO: o par mais parecido e as músicas que os ligam
MATCH (a:User)-[:LISTENED_TO]->(t:Track)<-[:LISTENED_TO]-(b:User)
WHERE elementId(a) < elementId(b)
WITH a, b, count(t) AS emComum ORDER BY emComum DESC LIMIT 1
MATCH path = (a)-[:LISTENED_TO]->(:Track)<-[:LISTENED_TO]-(b)
RETURN path;


// -------------------------------------------------------------------------------------
// P6. Os ouvintes consomem música do próprio país?
//     Compara User-[:BORN_IN]->Nationality com Artist-[:BORN_IN]->Nationality
//     no mesmo caminho: uma pergunta de 4 saltos que em SQL exigiria vários JOINs.
// -------------------------------------------------------------------------------------
// TABELA
MATCH (u:User)-[:BORN_IN]->(nu:Nationality),
      (u)-[l:LISTENED_TO]->(:Track)<-[:PRODUCES]-(:Artist)-[:BORN_IN]->(na:Nationality)
WITH nu.name AS nacionalidade,
     sum(l.timesListened) AS plays,
     sum(CASE WHEN nu = na THEN l.timesListened ELSE 0 END) AS playsNacionais
RETURN nacionalidade, plays, playsNacionais, round(100.0 * playsNacionais / plays, 1) AS pctNacional
ORDER BY plays DESC
LIMIT 6;

// GRAFO: ouvintes brasileiros ouvindo artistas brasileiros
MATCH path = (n:Nationality {name: 'Brasileira'})<-[:BORN_IN]-(:User)-[:LISTENED_TO]->(:Track)<-[:PRODUCES]-(:Artist)-[:BORN_IN]->(n)
RETURN path;


// -------------------------------------------------------------------------------------
// P7. O gosto muda com a idade?
//     Top 3 músicas por faixa etária: a pergunta que motivou o
//     algoritmo "Da sua geração".
// -------------------------------------------------------------------------------------
// TABELA
MATCH (u:User)-[l:LISTENED_TO]->(t:Track)
WITH CASE WHEN u.age < 30 THEN '< 30'
          WHEN u.age < 50 THEN '30-49'
          ELSE '50+' END AS faixaEtaria,
     t, sum(l.timesListened) AS plays
ORDER BY plays DESC
WITH faixaEtaria, collect(t.name + ' (' + plays + ')')[0..3] AS top3
RETURN faixaEtaria, top3
ORDER BY faixaEtaria;


// -------------------------------------------------------------------------------------
// P8. O que recomendar para um ouvinte? (exemplo: Lukas Schmidt, 26 anos)
//     "Da sua geração": ouvintes com até 5 anos de diferença → o que eles
//     ouvem e ele ainda não ouviu.
// -------------------------------------------------------------------------------------
// TABELA
MATCH (me:User {name: 'Lukas Schmidt'})
MATCH (peer:User)-[listen:LISTENED_TO]->(track:Track)
WHERE peer <> me
  AND abs(peer.age - me.age) <= 5
  AND NOT (me)-[:LISTENED_TO]->(track)
WITH track, count(DISTINCT peer) AS ouvintes, sum(listen.timesListened) AS plays
RETURN track.name AS recomendacao, ouvintes, plays
ORDER BY ouvintes DESC, plays DESC
LIMIT 5;

// GRAFO: o ouvinte, os pares da mesma geração e as músicas recomendadas
MATCH (me:User {name: 'Lukas Schmidt'})
MATCH path = (me)-[:BORN_IN|LISTENED_TO]->()
RETURN path
UNION
MATCH (me:User {name: 'Lukas Schmidt'})
MATCH path = (peer:User)-[:LISTENED_TO]->(track:Track)
WHERE peer <> me AND abs(peer.age - me.age) <= 5 AND NOT (me)-[:LISTENED_TO]->(track)
RETURN path;
