// Generates src/environments/neo4j.env.ts from the repository .env (file is git-ignored).
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectRoot, readNeo4jEnv } from './neo4j-env.mjs';

const target = resolve(projectRoot, 'src/environments/neo4j.env.ts');
const env = readNeo4jEnv();

mkdirSync(resolve(projectRoot, 'src/environments'), { recursive: true });
writeFileSync(
  target,
  `// Arquivo gerado por scripts/generate-env.mjs — não edite nem versione.
import { Neo4jConfig } from '../app/core/neo4j/neo4j-config';

export const neo4jEnv: Neo4jConfig = ${JSON.stringify(env, null, 2)};
`,
);
console.log(`Configuração Neo4j gerada em ${target}`);
