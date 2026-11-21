import { Injectable, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { DatabaseSeeder } from '../../data/seed/database-seeder';
import { ListeningService } from '../../domain/listening.service';
import { AlgorithmId } from '../../domain/models';
import { RecommendationService } from '../../domain/recommendation.service';

/** UI state for the discovery page. Components read signals and call actions. */
@Injectable()
export class DiscoveryStore {
  private readonly database = inject(DatabaseSeeder);
  private readonly listening = inject(ListeningService);
  private readonly recommender = inject(RecommendationService);

  readonly databaseStatus = this.database.status;
  readonly activeAlgorithm = signal<AlgorithmId | null>(null);

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

  readonly recommendations = resource({
    params: () => this.selectedUserId(),
    loader: ({ params: userId }) => this.recommender.recommendFor(userId),
  });

  readonly selectedUser = computed(() =>
    this.users.value()?.find((user) => user.userId === this.selectedUserId()),
  );

  readonly loadingMessage = computed(() => {
    if (!this.users.isLoading()) return null;
    return this.databaseStatus() === 'seeding'
      ? 'Banco vazio · importando dados iniciais…'
      : 'Conectando ao Neo4j AuraDB…';
  });

  readonly countByAlgorithm = computed(() => {
    const counts: Record<AlgorithmId, number> = { 'same-age': 0, 'from-artists': 0, 'top-tracks': 0 };
    for (const recommendation of this.recommendations.value() ?? []) {
      recommendation.algorithms.forEach((id) => counts[id]++);
    }
    return counts;
  });

  selectUser(userId: string): void {
    this.activeAlgorithm.set(null);
    this.selectedUserId.set(userId || undefined);
  }

  toggleAlgorithm(id: AlgorithmId): void {
    this.activeAlgorithm.update((current) => (current === id ? null : id));
  }
}
