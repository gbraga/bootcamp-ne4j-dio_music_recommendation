import { AlgorithmId, CandidatePool, Recommendation } from './models';

/**
 * Union of the candidates produced by the enabled algorithms.
 * Each track appears once; tracks suggested by more algorithms come first.
 */
export function unionRecommendations(
  pool: CandidatePool,
  enabled: ReadonlySet<AlgorithmId>,
): Recommendation[] {
  const tracksById = new Map(pool.tracks.map((track) => [track.trackId, track]));
  const merged = new Map<string, Recommendation>();

  for (const { trackId, algorithm, reason } of pool.candidates) {
    if (!enabled.has(algorithm)) continue;
    const entry = merged.get(trackId) ?? { track: tracksById.get(trackId)!, algorithms: [], reasons: [] };
    entry.algorithms.push(algorithm);
    entry.reasons.push(reason);
    merged.set(trackId, entry);
  }

  return [...merged.values()].sort((a, b) => b.algorithms.length - a.algorithms.length);
}
