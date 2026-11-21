import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { User } from '../../domain/models';
import { CUSTOM_ALGORITHM, RECOMMENDATION_ALGORITHMS } from '../../domain/recommendation-algorithms';
import { AlgorithmCard } from '../algorithm-card/algorithm-card';
import { CustomAlgorithmCard } from '../custom-algorithm-card/custom-algorithm-card';
import { HeroOrb } from '../hero-orb/hero-orb';
import { MusicSidebar } from '../music-sidebar/music-sidebar';
import { NewUserDialog } from '../new-user-dialog/new-user-dialog';
import { Player } from '../player/player';
import { UserPicker } from '../user-picker/user-picker';
import { DiscoveryStore } from './discovery.store';

@Component({
  selector: 'app-discovery-page',
  imports: [AlgorithmCard, CustomAlgorithmCard, HeroOrb, MusicSidebar, NewUserDialog, Player, UserPicker],
  templateUrl: './discovery-page.html',
  styleUrl: './discovery-page.scss',
  providers: [DiscoveryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Room reserved for the fixed bottom player (used by the page padding and the sidebar height).
  host: { '[style.--player-space]': "store.nowPlaying() ? '6.5rem' : '0px'" },
})
export class DiscoveryPage {
  protected readonly store = inject(DiscoveryStore);
  protected readonly algorithms = RECOMMENDATION_ALGORITHMS;
  protected readonly customAlgorithm = CUSTOM_ALGORITHM;
  protected readonly newUserOpen = signal(false);

  protected onUserCreated(user: User): void {
    this.newUserOpen.set(false);
    this.store.addUser(user);
  }
}
