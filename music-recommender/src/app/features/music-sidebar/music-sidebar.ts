import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlgorithmId, Recommendation } from '../../domain/models';
import { algorithmById } from '../../domain/recommendation-algorithms';
import { DiscoveryStore } from '../discovery/discovery.store';
import { TrackCard, TrackCardState } from '../track-card/track-card';

type SidebarTab = 'recommended' | 'history';

/** Right-hand sidebar with the selected user's recommendations and listening history. */
@Component({
  selector: 'app-music-sidebar',
  imports: [TrackCard, DatePipe],
  templateUrl: './music-sidebar.html',
  styleUrl: './music-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicSidebar {
  protected readonly store = inject(DiscoveryStore);
  protected readonly algorithmTitle = (id: AlgorithmId) => algorithmById(id).title;

  /** Highlighting an algorithm brings the recommendations tab into view. */
  protected readonly tab = linkedSignal<SidebarTab>(() => {
    this.store.highlightedAlgorithm();
    return 'recommended';
  });

  protected stateOf(recommendation: Recommendation): TrackCardState {
    const highlighted = this.store.highlightedAlgorithm();
    if (!highlighted) return 'default';
    return recommendation.algorithms.includes(highlighted) ? 'highlighted' : 'dimmed';
  }
}
