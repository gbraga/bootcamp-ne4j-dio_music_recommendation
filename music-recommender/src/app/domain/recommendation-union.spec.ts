import { AlgorithmId, CandidatePool } from './models';
import { unionRecommendations } from './recommendation-union';

const track = (trackId: string) => ({
  trackId,
  name: trackId,
  duration: 200,
  release: '2020-01-01',
  artists: [],
  featuring: [],
  genres: [],
  artistPhoto: null,
});

const pool: CandidatePool = {
  tracks: ['a', 'b', 'c'].map(track),
  candidates: [
    { trackId: 'a', algorithm: 'same-age', reason: 'idade' },
    { trackId: 'b', algorithm: 'from-artists', reason: 'artista' },
    { trackId: 'b', algorithm: 'top-tracks', reason: 'top' },
    { trackId: 'c', algorithm: 'liked-genres', reason: 'gênero' },
  ],
};

const ids = (enabled: AlgorithmId[]) =>
  unionRecommendations(pool, new Set(enabled)).map((r) => r.track.trackId);

describe('unionRecommendations', () => {
  it('merges tracks suggested by several algorithms and ranks them first', () => {
    const result = unionRecommendations(
      pool,
      new Set<AlgorithmId>(['same-age', 'from-artists', 'top-tracks', 'liked-genres']),
    );

    expect(result.map((r) => r.track.trackId)).toEqual(['b', 'a', 'c']);
    expect(result[0].algorithms).toEqual(['from-artists', 'top-tracks']);
    expect(result[0].reasons).toEqual(['artista', 'top']);
  });

  it('only uses enabled algorithms', () => {
    expect(ids(['liked-genres'])).toEqual(['c']);
    expect(ids(['same-age', 'top-tracks'])).toEqual(['a', 'b']);
    expect(ids([])).toEqual([]);
  });

  it('keeps a track while at least one of its algorithms is enabled', () => {
    const [b] = unionRecommendations(pool, new Set<AlgorithmId>(['top-tracks']));
    expect(b.algorithms).toEqual(['top-tracks']);
  });

  it('ignores candidates whose track does not exist (e.g. a custom query returning an unknown id)', () => {
    const withUnknown: CandidatePool = {
      ...pool,
      candidates: [{ trackId: 'missing', algorithm: 'custom', reason: 'x' }, ...pool.candidates],
    };
    const result = unionRecommendations(withUnknown, new Set<AlgorithmId>(['custom', 'same-age']));
    expect(result.map((r) => r.track.trackId)).toEqual(['a']);
  });
});
