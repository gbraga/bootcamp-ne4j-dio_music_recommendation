export interface User {
  userId: string;
  name: string;
  age: number;
  nationality: string | null;
}

export interface Nationality {
  nationalityId: string;
  name: string;
}

export interface NewUser {
  name: string;
  age: number;
  nationalityId: string;
}

export interface ArtistPhoto {
  name: string;
  photoUrl: string;
  /** Author and licence, required by the Wikimedia Commons licences. */
  photoCredit: string;
}

export interface Track {
  trackId: string;
  name: string;
  duration: number;
  release: string;
  /** 30-second preview (iTunes Search API); null when no preview exists. */
  previewUrl: string | null;
  appleMusicUrl: string | null;
  artists: string[];
  featuring: string[];
  genres: string[];
  artistPhoto: ArtistPhoto | null;
}

export interface ListenedTrack {
  track: Track;
  timesListened: number;
  liked: boolean;
  listenDate: string;
}

export type AlgorithmId = 'custom' | 'same-age' | 'from-artists' | 'top-tracks' | 'liked-genres';

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

/** Everything every algorithm suggested for a user, plus the details of those tracks. */
export interface CandidatePool {
  candidates: RecommendationCandidate[];
  tracks: Track[];
}

/** A track after the union of all algorithms. */
export interface Recommendation {
  track: Track;
  algorithms: AlgorithmId[];
  reasons: string[];
}
