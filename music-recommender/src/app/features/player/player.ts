import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Track } from '../../domain/models';

/** Bottom player bar for the 30-second previews. Persistence is handled by the parent (store). */
@Component({
  selector: 'app-player',
  templateUrl: './player.html',
  styleUrl: './player.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Player {
  readonly track = input.required<Track>();
  readonly liked = input(false);
  readonly error = input<string | null>(null);
  readonly likeToggled = output<void>();
  readonly closed = output<void>();

  private readonly audio = viewChild.required<ElementRef<HTMLAudioElement>>('audio');

  protected readonly paused = signal(true);
  protected readonly current = signal(0);
  protected readonly duration = signal(30);
  protected readonly loadFailed = signal(false);
  protected readonly progress = computed(() => (this.duration() ? (this.current() / this.duration()) * 100 : 0));

  /** iTunes previews are AAC (.m4a); some embedded browsers (e.g. VS Code/Electron) lack that codec. */
  protected readonly supportsAac = !!new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"');

  constructor() {
    // Loads and auto-plays whenever a different track is chosen.
    effect(() => {
      const audio = this.audio().nativeElement;
      const src = this.track().previewUrl;
      this.loadFailed.set(false);
      this.current.set(0);
      if (!src) return;
      audio.src = src;
      audio.play().catch(() => this.paused.set(true));
    });
  }

  protected toggle(): void {
    const audio = this.audio().nativeElement;
    if (audio.paused) audio.play().catch(() => this.loadFailed.set(true));
    else audio.pause();
  }

  protected seek(event: Event): void {
    const audio = this.audio().nativeElement;
    audio.currentTime = (Number((event.target as HTMLInputElement).value) / 100) * (audio.duration || 30);
  }

  protected onTimeUpdate(audio: HTMLAudioElement): void {
    this.current.set(audio.currentTime);
    if (Number.isFinite(audio.duration)) this.duration.set(audio.duration);
  }

  protected format(seconds: number): string {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
}
