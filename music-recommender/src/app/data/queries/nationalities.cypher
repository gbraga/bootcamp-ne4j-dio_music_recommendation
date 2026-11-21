// Nacionalidades disponíveis para novos ouvintes
MATCH (nationality:Nationality)
RETURN nationality.nationalityId AS nationalityId,
       nationality.name          AS name
ORDER BY name
