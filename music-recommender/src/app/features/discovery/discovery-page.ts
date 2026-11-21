import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlgorithmId, Recommendation } from '../../domain/models';
import { CUSTOM_ALGORITHM, RECOMMENDATION_ALGORITHMS, algorithmById } from '../../domain/recommendation-algorithms';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { CustomAlgorithmCard } from '../custom-algorithm-card/custom-algorithm-card';
import { TrackCard, TrackCardState } from '../track-card/track-card';
import { UserPicker } from '../user-picker/user-picker';
import { DiscoveryStore } from './discovery.store';

@Component({
  selector: 'app-discovery-page',
  imports: [AlgorithmCard, CustomAlgorithmCard, TrackCard, UserPicker, DatePipe],
  templateUrl: './discovery-page.html',
  styleUrl: './discovery-page.scss',
  providers: [DiscoveryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoveryPage {
  protected readonly store = inject(DiscoveryStore);
  protected readonly algorithms = RECOMMENDATION_ALGORITHMS;
  protected readonly customAlgorithm = CUSTOM_ALGORITHM;
  protected readonly algorithmTitle = (id: AlgorithmId) => algorithmById(id).title;

  protected stateOf(recommendation: Recommendation): TrackCardState {
    const highlighted = this.store.highlightedAlgorithm();
    if (!highlighted) return 'default';
    return recommendation.algorithms.includes(highlighted) ? 'highlighted' : 'dimmed';
  }
}
