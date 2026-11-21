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

describe('RecommendationService', () => {
  it('unions the three algorithms, merging reasons and ranking multi-source tracks first', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RecommendationRepository,
          useValue: {
            findBySameAge: async () => [{ trackId: 'a', listeners: 2, plays: 10 }],
            findFromListenedArtists: async () => [
              { trackId: 'b', knownArtists: ['Djavan'], isPartnership: false },
            ],
            findTopTracks: async () => [
              { trackId: 'b', plays: 99 },
              { trackId: 'c', plays: 50 },
            ],
          },
        },
        { provide: TrackRepository, useValue: { findByIds: async (ids: string[]) => ids.map(track) } },
      ],
    });

    const result = await TestBed.inject(RecommendationService).recommendFor('user-1');

    expect(result.map((r) => r.track.trackId)).toEqual(['b', 'a', 'c']);
    expect(result[0].algorithms).toEqual(['from-artists', 'top-tracks']);
    expect(result[0].reasons).toEqual(['Mais de Djavan', '#1 da plataforma · 99 plays']);
    expect(result[1].reasons).toEqual(['Ouvida por 2 pessoas da sua idade']);
  });
});
