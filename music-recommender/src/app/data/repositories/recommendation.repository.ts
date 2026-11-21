import { Injectable, inject } from '@angular/core';
import { Neo4jClient } from '../../core/neo4j/neo4j-client';
import { Queries } from '../queries';

export interface SameAgeRow {
  trackId: string;
  listeners: number;
  plays: number;
}

export interface FromArtistsRow {
  trackId: string;
  knownArtists: string[];
  isPartnership: boolean;
}

export interface TopTrackRow {
  trackId: string;
  plays: number;
}

export interface LikedGenresRow {
  trackId: string;
  likedGenres: string[];
  score: number;
}

@Injectable({ providedIn: 'root' })
export class RecommendationRepository {
  private readonly db = inject(Neo4jClient);

  findBySameAge(userId: string, ageRange: number): Promise<SameAgeRow[]> {
    return this.db.read<SameAgeRow>(Queries.recommendSameAge, { userId, ageRange });
  }

  findFromListenedArtists(userId: string): Promise<FromArtistsRow[]> {
    return this.db.read<FromArtistsRow>(Queries.recommendFromArtists, { userId });
  }

  findTopTracks(userId: string): Promise<TopTrackRow[]> {
    return this.db.read<TopTrackRow>(Queries.recommendTopTracks, { userId });
  }

  findFromLikedGenres(userId: string): Promise<LikedGenresRow[]> {
    return this.db.read<LikedGenresRow>(Queries.recommendLikedGenres, { userId });
  }
}
