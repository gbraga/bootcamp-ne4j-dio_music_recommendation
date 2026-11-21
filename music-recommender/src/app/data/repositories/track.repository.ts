import { Injectable, inject } from '@angular/core';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { Track } from '../../domain/models';
import { Queries } from '../queries';

export interface ListeningRow {
  trackId: string;
  timesListened: number;
  liked: boolean;
  listenDate: string;
}

@Injectable({ providedIn: 'root' })
export class TrackRepository {
  private readonly db = inject(Neo4jClient);

  findByIds(trackIds: string[]): Promise<Track[]> {
    if (trackIds.length === 0) return Promise.resolve([]);
    return this.db.read<Track>(Queries.trackDetails, { trackIds });
  }

  findListeningHistory(userId: string): Promise<ListeningRow[]> {
    return this.db.read<ListeningRow>(Queries.listeningHistory, { userId });
  }
}
