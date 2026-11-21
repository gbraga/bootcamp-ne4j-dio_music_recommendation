import { Injectable, inject } from '@angular/core';
import { ListeningRepository } from '../data/repositories/listening.repository';
import { TrackRepository } from '../data/repositories/track.repository';
import { ListenedTrack } from './models';

const NOT_FOUND = 'Ouvinte ou música não encontrados no grafo. Recarregue a página.';

@Injectable({ providedIn: 'root' })
export class ListeningService {
  private readonly listening = inject(ListeningRepository);
  private readonly tracks = inject(TrackRepository);

  async getHistory(userId: string): Promise<ListenedTrack[]> {
    const rows = await this.listening.findHistory(userId);
    const details = await this.tracks.findByIds(rows.map((row) => row.trackId));
    const byId = new Map(details.map((track) => [track.trackId, track]));

    return rows.map(({ trackId, ...stats }) => ({ track: byId.get(trackId)!, ...stats }));
  }

  /** Persists a play: first play creates LISTENED_TO, later plays increment timesListened. */
  async registerListen(userId: string, trackId: string): Promise<void> {
    if (!(await this.listening.registerListen(userId, trackId))) throw new Error(NOT_FOUND);
  }

  async setLiked(userId: string, trackId: string, liked: boolean): Promise<void> {
    if (!(await this.listening.setLiked(userId, trackId, liked))) throw new Error(NOT_FOUND);
  }
}
