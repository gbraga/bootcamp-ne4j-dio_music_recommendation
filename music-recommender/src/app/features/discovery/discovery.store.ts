import { Injectable, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { DatabaseSeeder } from '../../data/seed/database-seeder';
import { ListeningService } from '../../domain/listening.service';
import { AlgorithmId, CandidatePool, Track, User } from '../../domain/models';
import { ALL_ALGORITHM_IDS, CUSTOM_ALGORITHM } from '../../domain/recommendation-algorithms';
import { unionRecommendations } from '../../domain/recommendation-union';
import { RecommendationService } from '../../domain/recommendation.service';
import { UserService } from '../../domain/user.service';

const CUSTOM_CYPHER_KEY = 'graph-music.custom-cypher';
const EMPTY_POOL: CandidatePool = { candidates: [], tracks: [] };

/** UI state for the discovery page. Components read signals and call actions. */
@Injectable()
export class DiscoveryStore {
  private readonly database = inject(DatabaseSeeder);
  private readonly userService = inject(UserService);
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
      return this.userService.getUsers();
    },
  });

  /** Starts with the first user and keeps the current choice while it still exists in the list. */
  readonly selectedUserId = linkedSignal<User[] | undefined, string | undefined>({
    source: () => this.users.value(),
    computation: (users, previous) =>
      users?.some((user) => user.userId === previous?.value) ? previous!.value : users?.[0]?.userId,
  });

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

  /** Track loaded in the player; cleared when another listener is selected. */
  readonly nowPlaying = linkedSignal<string | undefined, Track | null>({
    source: () => this.selectedUserId(),
    computation: () => null,
  });

  /** Likes clicked but not yet reflected in the reloaded history (optimistic UI). */
  private readonly pendingLikes = linkedSignal<unknown, ReadonlyMap<string, boolean>>({
    source: () => this.history.value(),
    computation: () => new Map(),
  });

  readonly likedTrackIds = computed(() => {
    const liked = new Set((this.history.value() ?? []).filter((item) => item.liked).map((item) => item.track.trackId));
    this.pendingLikes().forEach((value, trackId) => (value ? liked.add(trackId) : liked.delete(trackId)));
    return liked;
  });

  /** Last error from a play/like write, shown in the player. */
  readonly actionError = signal<string | null>(null);

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

  /** Adds a freshly created user to the list (no refetch) and selects it. */
  addUser(user: User): void {
    this.users.update((users) =>
      [...(users ?? []), user].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    );
    this.selectUser(user.userId);
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

  /** Plays a preview and records the listen for the selected user (LISTENED_TO in the graph). */
  async play(track: Track): Promise<void> {
    const userId = this.selectedUserId();
    if (!userId || !track.previewUrl) return;
    this.nowPlaying.set(track);
    await this.persist(() => this.listening.registerListen(userId, track.trackId));
  }

  async toggleLike(track: Track): Promise<void> {
    const userId = this.selectedUserId();
    if (!userId) return;
    const liked = !this.likedTrackIds().has(track.trackId);
    this.pendingLikes.update((pending) => new Map(pending).set(track.trackId, liked));
    await this.persist(() => this.listening.setLiked(userId, track.trackId, liked));
  }

  stopPlayer(): void {
    this.nowPlaying.set(null);
  }

  /** Writes to the graph, then reloads what depends on the user's listening history. */
  private async persist(write: () => Promise<void>): Promise<void> {
    this.actionError.set(null);
    try {
      await write();
    } catch (error) {
      this.actionError.set((error as Error).message);
    }
    this.history.reload();
    this.candidates.reload();
    this.customResult.reload();
  }
}
