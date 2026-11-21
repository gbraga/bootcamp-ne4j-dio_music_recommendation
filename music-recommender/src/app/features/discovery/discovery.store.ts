import { Injectable, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { DatabaseSeeder } from '../../data/seed/database-seeder';
import { ListeningService } from '../../domain/listening.service';
import { AlgorithmId, CandidatePool } from '../../domain/models';
import { ALL_ALGORITHM_IDS, CUSTOM_ALGORITHM } from '../../domain/recommendation-algorithms';
import { unionRecommendations } from '../../domain/recommendation-union';
import { RecommendationService } from '../../domain/recommendation.service';

const CUSTOM_CYPHER_KEY = 'graph-music.custom-cypher';
const EMPTY_POOL: CandidatePool = { candidates: [], tracks: [] };

/** UI state for the discovery page. Components read signals and call actions. */
@Injectable()
export class DiscoveryStore {
  private readonly database = inject(DatabaseSeeder);
  private readonly listening = inject(ListeningService);
  private readonly recommender = inject(RecommendationService);

  readonly databaseStatus = this.database.status;

  /** Algorithms that take part in the union (changes the recommendation list). */
  readonly enabledAlgorithms = signal<ReadonlySet<AlgorithmId>>(new Set(ALL_ALGORITHM_IDS));
  /** Algorithm whose tracks are visually highlighted (does not change the list). */
  readonly highlightedAlgorithm = signal<AlgorithmId | null>(null);

  /** Imports the datasets on first use of an empty AuraDB, then loads the users. */
  readonly users = resource({
    loader: async () => {
      await this.database.ensureSeeded();
      return this.listening.getUsers();
    },
  });

  /** Starts with the first user so the page opens with data; the picker overrides it. */
  readonly selectedUserId = linkedSignal<string | undefined>(() => this.users.value()?.[0]?.userId);

  readonly history = resource({
    params: () => this.selectedUserId(),
    loader: ({ params: userId }) => this.listening.getHistory(userId),
  });

  readonly candidates = resource({
    params: () => this.selectedUserId(),
    loader: ({ params: userId }) => this.recommender.findCandidates(userId),
  });

  /** Last executed custom Cypher (persisted in the browser). */
  readonly customCypher = signal(localStorage.getItem(CUSTOM_CYPHER_KEY) ?? CUSTOM_ALGORITHM.cypher);

  readonly customResult = resource({
    params: () => {
      const userId = this.selectedUserId();
      return userId ? { userId, cypher: this.customCypher() } : undefined;
    },
    loader: ({ params }) => this.recommender.runCustom(params.userId, params.cypher),
  });

  readonly customError = computed(() => {
    const error = this.customResult.error();
    return error ? (error as Error).message : null;
  });

  /** Custom results come first; a failing custom query never hides the other algorithms. */
  private readonly pool = computed<CandidatePool>(() => {
    const builtIn = this.candidates.hasValue() ? this.candidates.value() : EMPTY_POOL;
    const custom = this.customResult.hasValue() ? this.customResult.value() : EMPTY_POOL;
    return {
      candidates: [...custom.candidates, ...builtIn.candidates],
      tracks: [...custom.tracks, ...builtIn.tracks],
    };
  });

  readonly recommendations = computed(() => unionRecommendations(this.pool(), this.enabledAlgorithms()));

  readonly selectedUser = computed(() =>
    this.users.value()?.find((user) => user.userId === this.selectedUserId()),
  );

  readonly loadingMessage = computed(() => {
    if (!this.users.isLoading()) return null;
    return this.databaseStatus() === 'seeding'
      ? 'Banco vazio · importando dados iniciais…'
      : 'Conectando ao Neo4j AuraDB…';
  });

  /** How many tracks each algorithm suggests for the selected user. */
  readonly countByAlgorithm = computed(() => {
    const counts = Object.fromEntries(ALL_ALGORITHM_IDS.map((id) => [id, 0])) as Record<AlgorithmId, number>;
    for (const { algorithm } of this.pool().candidates) counts[algorithm]++;
    return counts;
  });

  selectUser(userId: string): void {
    this.highlightedAlgorithm.set(null);
    this.selectedUserId.set(userId || undefined);
  }

  toggleHighlight(id: AlgorithmId): void {
    this.highlightedAlgorithm.update((current) => (current === id ? null : id));
  }

  setAlgorithmEnabled(id: AlgorithmId, enabled: boolean): void {
    this.enabledAlgorithms.update((current) => {
      const next = new Set(current);
      if (enabled) next.add(id);
      else next.delete(id);
      return next;
    });
    if (!enabled && this.highlightedAlgorithm() === id) this.highlightedAlgorithm.set(null);
  }

  runCustom(cypher: string): void {
    localStorage.setItem(CUSTOM_CYPHER_KEY, cypher);
    if (cypher === this.customCypher()) this.customResult.reload();
    else this.customCypher.set(cypher);
  }

  resetCustom(): void {
    localStorage.removeItem(CUSTOM_CYPHER_KEY);
    this.customCypher.set(CUSTOM_ALGORITHM.cypher);
  }
}
