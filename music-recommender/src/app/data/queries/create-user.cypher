// Cria um ouvinte e o liga à sua nacionalidade
MATCH (nationality:Nationality {nationalityId: $nationalityId})
CREATE (user:User {
  userId: $userId,
  name:   $name,
  age:    toInteger($age)
})
CREATE (user)-[:BORN_IN]->(nationality)
RETURN user.userId      AS userId,
       user.name        AS name,
       user.age         AS age,
       nationality.name AS nationality
