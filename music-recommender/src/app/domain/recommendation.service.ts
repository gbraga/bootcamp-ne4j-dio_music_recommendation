import { Injectable, inject } from '@angular/core';
import { RecommendationRepository } from '../data/repositories/recommendation.repository';
import { TrackRepository } from '../data/repositories/track.repository';
import { Recommendation, RecommendationCandidate } from './models';
import { SAME_AGE_RANGE } from './recommendation-algorithms';

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly recommendations = inject(RecommendationRepository);
  private readonly tracks = inject(TrackRepository);

  /** Runs the three algorithms in parallel and returns their union. */
  async recommendFor(userId: string): Promise<Recommendation[]> {
    const candidates = (
      await Promise.all([
        this.sameAge(userId),
        this.fromListenedArtists(userId),
        this.topTracks(userId),
      ])
    ).flat();

    return this.union(candidates);
  }

  private async sameAge(userId: string): Promise<RecommendationCandidate[]> {
    const rows = await this.recommendations.findBySameAge(userId, SAME_AGE_RANGE);
    return rows.map(({ trackId, listeners }) => ({
      trackId,
      algorithm: 'same-age',
      reason: `Ouvida por ${plural(listeners, 'pessoa', 'pessoas')} da sua idade`,
    }));
  }

  private async fromListenedArtists(userId: string): Promise<RecommendationCandidate[]> {
    const rows = await this.recommendations.findFromListenedArtists(userId);
    return rows.map(({ trackId, knownArtists, isPartnership }) => ({
      trackId,
      algorithm: 'from-artists',
      reason: `${isPartnership ? 'Parceria de' : 'Mais de'} ${knownArtists.join(', ')}`,
    }));
  }

  private async topTracks(userId: string): Promise<RecommendationCandidate[]> {
    const rows = await this.recommendations.findTopTracks(userId);
    return rows.map(({ trackId, plays }, index) => ({
      trackId,
      algorithm: 'top-tracks',
      reason: `#${index + 1} da plataforma · ${plural(plays, 'play', 'plays')}`,
    }));
  }

  /** Merges candidates by track; tracks suggested by more algorithms come first. */
  private async union(candidates: RecommendationCandidate[]): Promise<Recommendation[]> {
    const merged = new Map<string, Omit<Recommendation, 'track'>>();
    for (const { trackId, algorithm, reason } of candidates) {
      const entry = merged.get(trackId) ?? { algorithms: [], reasons: [] };
      entry.algorithms.push(algorithm);
      entry.reasons.push(reason);
      merged.set(trackId, entry);
    }

    const details = await this.tracks.findByIds([...merged.keys()]);
    const byId = new Map(details.map((track) => [track.trackId, track]));

    return [...merged.entries()]
      .map(([trackId, entry]) => ({ track: byId.get(trackId)!, ...entry }))
      .sort((a, b) => b.algorithms.length - a.algorithms.length);
  }
}
