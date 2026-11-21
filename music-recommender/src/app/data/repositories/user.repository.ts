import { Injectable, inject } from '@angular/core';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { NewUser, User } from '../../domain/models';
import { Queries } from '../queries';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly db = inject(Neo4jClient);

  findAll(): Promise<User[]> {
    return this.db.read<User>(Queries.users);
  }

  /** Returns undefined when the nationality does not exist (nothing is created). */
  async create(userId: string, user: NewUser): Promise<User | undefined> {
    const [created] = await this.db.write<User>(Queries.createUser, { userId, ...user });
    return created;
  }
}
