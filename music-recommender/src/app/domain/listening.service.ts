import { Injectable, inject } from '@angular/core';
import { TrackRepository } from '../data/repositories/track.repository';
import { UserRepository } from '../data/repositories/user.repository';
import { ListenedTrack, User } from './models';

@Injectable({ providedIn: 'root' })
export class ListeningService {
  private readonly users = inject(UserRepository);
  private readonly tracks = inject(TrackRepository);

  getUsers(): Promise<User[]> {
    return this.users.findAll();
  }

  async getHistory(userId: string): Promise<ListenedTrack[]> {
    const rows = await this.tracks.findListeningHistory(userId);
    const details = await this.tracks.findByIds(rows.map((row) => row.trackId));
    const byId = new Map(details.map((track) => [track.trackId, track]));

    return rows.map(({ trackId, ...stats }) => ({ track: byId.get(trackId)!, ...stats }));
  }
}
