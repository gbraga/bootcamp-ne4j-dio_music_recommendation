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
  {
    id: 'liked-genres',
    title: 'Gêneros que você curte',
    description: 'Músicas dos três gêneros que mais receberam o seu like.',
    cypher: Queries.recommendLikedGenres,
  },
];

/** User-written algorithm. Its Cypher starts with this example and can be edited in the UI. */
export const CUSTOM_ALGORITHM: RecommendationAlgorithm = {
  id: 'custom',
  title: 'Seu algoritmo',
  description: 'Escreva a sua consulta Cypher. Ela recebe $userId e deve retornar trackId (reason é opcional).',
  cypher: Queries.customExample,
};

/** Maximum number of rows taken from a custom query. */
export const CUSTOM_RESULT_LIMIT = 25;

export const ALL_ALGORITHM_IDS: readonly AlgorithmId[] = [
  CUSTOM_ALGORITHM.id,
  ...RECOMMENDATION_ALGORITHMS.map(({ id }) => id),
];

export function algorithmById(id: AlgorithmId): RecommendationAlgorithm {
  return id === CUSTOM_ALGORITHM.id
    ? CUSTOM_ALGORITHM
    : RECOMMENDATION_ALGORITHMS.find((algorithm) => algorithm.id === id)!;
}
