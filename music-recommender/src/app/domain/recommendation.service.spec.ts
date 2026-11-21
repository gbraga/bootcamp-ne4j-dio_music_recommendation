import { TestBed } from '@angular/core/testing';
import { RecommendationRepository } from '../data/repositories/recommendation.repository';
import { TrackRepository } from '../data/repositories/track.repository';
import { RecommendationService } from './recommendation.service';

const track = (trackId: string) => ({
  trackId,
  name: trackId,
  duration: 200,
  release: '2020-01-01',
  artists: [],
  featuring: [],
  genres: [],
});

function serviceReturning(rows: Record<string, unknown>[]) {
  TestBed.configureTestingModule({
    providers: [
      { provide: RecommendationRepository, useValue: { runCustom: async () => rows } },
      { provide: TrackRepository, useValue: { findByIds: async (ids: string[]) => ids.map(track) } },
    ],
  });
  return TestBed.inject(RecommendationService);
}

describe('RecommendationService.runCustom', () => {
  it('maps rows to custom candidates, with a default reason when none is returned', async () => {
    const pool = await serviceReturning([
      { trackId: 'a', reason: 'Porque sim' },
      { trackId: 'b' },
    ]).runCustom('user-1', 'MATCH ...');

    expect(pool.candidates).toEqual([
      { trackId: 'a', algorithm: 'custom', reason: 'Porque sim' },
      { trackId: 'b', algorithm: 'custom', reason: 'Sugerida pelo seu algoritmo' },
    ]);
    expect(pool.tracks.map((t) => t.trackId)).toEqual(['a', 'b']);
  });

  it('rejects queries that do not return a trackId column', async () => {
    await expect(serviceReturning([{ name: 'Halo' }]).runCustom('user-1', 'MATCH ...')).rejects.toThrow(
      /trackId/,
    );
  });
});
