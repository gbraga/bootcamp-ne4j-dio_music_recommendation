import { DestroyRef, Injectable, inject } from '@angular/core';
import neo4j, { Driver } from 'neo4j-driver';
import { NEO4J_CONFIG } from './neo4j-config';

export type QueryParams = Record<string, unknown>;

export interface Statement {
  cypher: string;
  params?: QueryParams;
}

/** Thin wrapper around the official driver with a single shared connection. */
@Injectable({ providedIn: 'root' })
export class Neo4jClient {
  private readonly config = inject(NEO4J_CONFIG);
  private driver?: Driver;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.driver?.close());
  }

  async read<T>(cypher: string, params: QueryParams = {}): Promise<T[]> {
    const { records } = await this.getDriver().executeQuery(cypher, params, {
      database: this.config.database,
      routing: neo4j.routing.READ,
    });
    return records.map((record) => record.toObject() as T);
  }

  /** Runs a statement in its own auto-commit write transaction (also used for schema changes). */
  async write<T = Record<string, unknown>>(cypher: string, params: QueryParams = {}): Promise<T[]> {
    const { records } = await this.getDriver().executeQuery(cypher, params, {
      database: this.config.database,
      routing: neo4j.routing.WRITE,
    });
    return records.map((record) => record.toObject() as T);
  }

  /** Runs all statements in a single transaction: either everything is written or nothing. */
  async writeInTransaction(statements: Statement[]): Promise<void> {
    const session = this.getDriver().session({ database: this.config.database });
    try {
      await session.executeWrite(async (tx) => {
        for (const { cypher, params } of statements) await tx.run(cypher, params);
      });
    } finally {
      await session.close();
    }
  }

  private getDriver(): Driver {
    this.driver ??= neo4j.driver(
      this.config.uri,
      neo4j.auth.basic(this.config.username, this.config.password),
      { disableLosslessIntegers: true },
    );
    return this.driver;
  }
}
