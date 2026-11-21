import { Queries } from '../data/queries';
import { AlgorithmId, RecommendationAlgorithm } from './models';

export const SAME_AGE_RANGE = 5;

export const RECOMMENDATION_ALGORITHMS: readonly RecommendationAlgorithm[] = [
  {
    id: 'same-age',
    title: 'Da sua geração',
    description: `Músicas que usuários com até ${SAME_AGE_RANGE} anos de diferença estão ouvindo.`,
    cypher: Queries.recommendSameAge,
  },
  {
    id: 'from-artists',
    title: 'Dos seus artistas',
    description: 'Outras músicas e parcerias dos artistas que você já escuta.',
    cypher: Queries.recommendFromArtists,
  },
  {
    id: 'top-tracks',
    title: 'Top 3 da plataforma',
    description: 'As três músicas mais tocadas que você ainda não ouviu.',
    cypher: Queries.recommendTopTracks,
  },
];

export function algorithmById(id: AlgorithmId): RecommendationAlgorithm {
  return RECOMMENDATION_ALGORITHMS.find((algorithm) => algorithm.id === id)!;
}
