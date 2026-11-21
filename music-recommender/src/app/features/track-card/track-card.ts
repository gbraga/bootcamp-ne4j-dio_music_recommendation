import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { Track } from '../../domain/models';
import { DurationPipe } from '../../shared/duration.pipe';

export type TrackCardState = 'default' | 'highlighted' | 'dimmed';

@Component({
  selector: 'app-track-card',
  imports: [DecimalPipe, DurationPipe],
  templateUrl: './track-card.html',
  styleUrl: './track-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-state]': 'state()' },
})
export class TrackCard {
  readonly track = input.required<Track>();
  readonly state = input<TrackCardState>('default');
  /** True while this track is loaded in the player. */
  readonly playing = input(false);
  readonly playRequested = output<void>();

  protected readonly year = computed(() => this.track().release.slice(0, 4));

  /** Falls back to the gradient cover if the artist photo cannot be loaded; resets per track. */
  protected readonly photoFailed = linkedSignal(() => {
    this.track();
    return false;
  });

  /** Deterministic gradient so each track keeps the same cover colour. */
  protected readonly cover = computed(() => {
    const hash = [...this.track().name].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue} 70% 58%), hsl(${(hue + 50) % 360} 75% 42%))`;
  });
}
