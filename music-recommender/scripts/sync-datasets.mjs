// Copies resources/datasets/*.csv to public/datasets so the app can auto-seed an empty AuraDB.
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectRoot, repositoryRoot } from './neo4j-env.mjs';

const source = resolve(repositoryRoot, 'resources/datasets');
const target = resolve(projectRoot, 'public/datasets');

mkdirSync(target, { recursive: true });
const files = readdirSync(source).filter((file) => file.endsWith('.csv'));
files.forEach((file) => cpSync(resolve(source, file), resolve(target, file)));
console.log(`${files.length} CSVs copiados para ${target}`);
