import { Injectable, inject } from '@angular/core';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { Queries } from '../queries';

export interface ListeningRow {
  trackId: string;
  timesListened: number;
  liked: boolean;
  listenDate: string;
}

/** User ↔ track interactions: history (read), plays and likes (write). */
@Injectable({ providedIn: 'root' })
export class ListeningRepository {
  private readonly db = inject(Neo4jClient);

  findHistory(userId: string): Promise<ListeningRow[]> {
    return this.db.read<ListeningRow>(Queries.listeningHistory, { userId });
  }

  async registerListen(userId: string, trackId: string): Promise<boolean> {
    const rows = await this.db.write(Queries.registerListen, { userId, trackId });
    return rows.length > 0;
  }

  async setLiked(userId: string, trackId: string, liked: boolean): Promise<boolean> {
    const rows = await this.db.write(Queries.setLike, { userId, trackId, liked });
    return rows.length > 0;
  }
}
