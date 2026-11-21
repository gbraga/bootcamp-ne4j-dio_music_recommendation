export interface User {
  userId: string;
  name: string;
  age: number;
  nationality: string | null;
}

export interface Track {
  trackId: string;
  name: string;
  duration: number;
  release: string;
  artists: string[];
  featuring: string[];
  genres: string[];
}

export interface ListenedTrack {
  track: Track;
  timesListened: number;
  liked: boolean;
  listenDate: string;
}

export type AlgorithmId = 'same-age' | 'from-artists' | 'top-tracks';

export interface RecommendationAlgorithm {
  id: AlgorithmId;
  title: string;
  description: string;
  cypher: string;
}

/** A track suggested by one algorithm, with a human readable reason. */
export interface RecommendationCandidate {
  trackId: string;
  algorithm: AlgorithmId;
  reason: string;
}

/** A track after the union of all algorithms. */
export interface Recommendation {
  track: Track;
  algorithms: AlgorithmId[];
  reasons: string[];
}
