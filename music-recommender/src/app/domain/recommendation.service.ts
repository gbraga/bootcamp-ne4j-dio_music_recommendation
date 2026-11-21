import { Injectable, inject } from '@angular/core';
import { RecommendationRepository } from '../data/repositories/recommendation.repository';
import { TrackRepository } from '../data/repositories/track.repository';
import { CandidatePool, RecommendationCandidate } from './models';
import { CUSTOM_RESULT_LIMIT, SAME_AGE_RANGE } from './recommendation-algorithms';

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly recommendations = inject(RecommendationRepository);
  private readonly tracks = inject(TrackRepository);

  /**
   * Runs every algorithm in parallel. Enabling/disabling algorithms is applied later
   * by `unionRecommendations`, so toggling does not hit the database again.
   */
  async findCandidates(userId: string): Promise<CandidatePool> {
    const candidates = (
      await Promise.all([
        this.sameAge(userId),
        this.fromListenedArtists(userId),
        this.topTracks(userId),
        this.likedGenres(userId),
      ])
    ).flat();

    const tracks = await this.tracks.findByIds([...new Set(candidates.map((c) => c.trackId))]);
    return { candidates, tracks };
  }

  /** Runs the user's own Cypher and turns its rows into candidates of the `custom` algorithm. */
  async runCustom(userId: string, cypher: string): Promise<CandidatePool> {
    const rows = (await this.recommendations.runCustom(cypher, userId)).slice(0, CUSTOM_RESULT_LIMIT);
    if (rows.length > 0 && typeof rows[0]['trackId'] !== 'string') {
      throw new Error('A consulta precisa retornar a coluna "trackId" (ex.: RETURN track.trackId AS trackId).');
    }

    const candidates: RecommendationCandidate[] = rows.map((row) => ({
      trackId: String(row['trackId']),
      algorithm: 'custom',
      reason: typeof row['reason'] === 'string' ? row['reason'] : 'Sugerida pelo seu algoritmo',
    }));
    const tracks = await this.tracks.findByIds([...new Set(candidates.map((c) => c.trackId))]);
    return { candidates, tracks };
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

  private async likedGenres(userId: string): Promise<RecommendationCandidate[]> {
    const rows = await this.recommendations.findFromLikedGenres(userId);
    return rows.map(({ trackId, likedGenres }) => ({
      trackId,
      algorithm: 'liked-genres',
      reason: `Você curte ${likedGenres.join(' e ')}`,
    }));
  }
}
