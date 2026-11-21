import { Injectable, inject } from '@angular/core';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { Nationality } from '../../domain/models';
import { Queries } from '../queries';

@Injectable({ providedIn: 'root' })
export class NationalityRepository {
  private readonly db = inject(Neo4jClient);

  findAll(): Promise<Nationality[]> {
    return this.db.read<Nationality>(Queries.nationalities);
  }
}
