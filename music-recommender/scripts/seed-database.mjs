// Recreates the AuraDB graph from resources/datasets/*.csv (wipes the instance first).
import neo4j from 'neo4j-driver';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readNeo4jEnv, repositoryRoot } from './neo4j-env.mjs';
import { SEED_CONSTRAINTS, SEED_STEPS } from '../src/app/data/seed/seed-plan.ts';

const datasets = resolve(repositoryRoot, 'resources/datasets');
const readCsv = (file) =>
  parse(readFileSync(resolve(datasets, file)), { columns: true, skip_empty_lines: true });

const { uri, username, password, database } = readNeo4jEnv();
const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

try {
  await driver.verifyConnectivity();
  const session = driver.session({ database });
  try {
    await session.run('MATCH (n) DETACH DELETE n');
    for (const statement of SEED_CONSTRAINTS) await session.run(statement);
    for (const { file, cypher } of SEED_STEPS) {
      const rows = readCsv(file);
      await session.executeWrite((tx) => tx.run(cypher, { rows }));
      console.log(`✔ ${file.padEnd(20)} ${rows.length} linhas`);
    }
    const { records } = await session.run(
      'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS total ORDER BY label',
    );
    records.forEach((r) => console.log(`  ${r.get('label').padEnd(12)} ${r.get('total')}`));
  } finally {
    await session.close();
  }
} finally {
  await driver.close();
}
