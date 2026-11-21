import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CUSTOM_ALGORITHM, RECOMMENDATION_ALGORITHMS } from '../../domain/recommendation-algorithms';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { CustomAlgorithmCard } from '../custom-algorithm-card/custom-algorithm-card';
import { MusicSidebar } from '../music-sidebar/music-sidebar';
import { UserPicker } from '../user-picker/user-picker';
import { DiscoveryStore } from './discovery.store';

@Component({
  selector: 'app-discovery-page',
  imports: [AlgorithmCard, CustomAlgorithmCard, MusicSidebar, UserPicker],
  templateUrl: './discovery-page.html',
  styleUrl: './discovery-page.scss',
  providers: [DiscoveryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoveryPage {
  protected readonly store = inject(DiscoveryStore);
  protected readonly algorithms = RECOMMENDATION_ALGORITHMS;
  protected readonly customAlgorithm = CUSTOM_ALGORITHM;
}
