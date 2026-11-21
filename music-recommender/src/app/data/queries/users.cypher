// Todos os usuários com a respectiva nacionalidade
MATCH (user:User)
OPTIONAL MATCH (user)-[:BORN_IN]->(nationality:Nationality)
RETURN user.userId       AS userId,
       user.name         AS name,
       user.age          AS age,
       nationality.name  AS nationality
ORDER BY name
