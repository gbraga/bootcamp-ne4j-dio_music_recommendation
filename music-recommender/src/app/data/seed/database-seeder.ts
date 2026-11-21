import { Injectable, inject, signal } from '@angular/core';
import { parse } from 'csv-parse/browser/esm/sync';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { IS_DATABASE_EMPTY, SEED_CONSTRAINTS, SEED_STEPS } from './seed-plan';

export type DatabaseStatus = 'connecting' | 'seeding' | 'ready';

/** Imports the CSV datasets (served under /datasets) when the AuraDB instance is empty. */
@Injectable({ providedIn: 'root' })
export class DatabaseSeeder {
  private readonly db = inject(Neo4jClient);
  private pending?: Promise<void>;

  readonly status = signal<DatabaseStatus>('connecting');

  /** Safe to call many times: the check/import runs only once per page load. */
  ensureSeeded(): Promise<void> {
    this.pending ??= this.seedIfEmpty().catch((error) => {
      this.pending = undefined;
      throw error;
    });
    return this.pending;
  }

  private async seedIfEmpty(): Promise<void> {
    const [{ empty }] = await this.db.read<{ empty: boolean }>(IS_DATABASE_EMPTY);
    if (empty) {
      this.status.set('seeding');
      for (const constraint of SEED_CONSTRAINTS) await this.db.write(constraint);
      const statements = await Promise.all(
        SEED_STEPS.map(async ({ file, cypher }) => ({ cypher, params: { rows: await this.readCsv(file) } })),
      );
      await this.db.writeInTransaction(statements);
    }
    this.status.set('ready');
  }

  private async readCsv(file: string): Promise<Record<string, string>[]> {
    const response = await fetch(`datasets/${file}`);
    if (!response.ok) throw new Error(`Não foi possível ler datasets/${file}`);
    return parse(await response.text(), { columns: true, skip_empty_lines: true });
  }
}
