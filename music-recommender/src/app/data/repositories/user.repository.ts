import { Injectable, inject } from '@angular/core';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { User } from '../../domain/models';
import { Queries } from '../queries';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly db = inject(Neo4jClient);

  findAll(): Promise<User[]> {
    return this.db.read<User>(Queries.users);
  }
}
