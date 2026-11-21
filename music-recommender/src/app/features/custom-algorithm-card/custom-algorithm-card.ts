import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { RecommendationAlgorithm } from '../../domain/models';
import { CopyButton } from '../../shared/copy-button';
import { highlightCypher } from '../../shared/cypher-highlight';

const EXPANDED_KEY = 'graph-music.custom-expanded';

@Component({
  selector: 'app-custom-algorithm-card',
  templateUrl: './custom-algorithm-card.html',
  styleUrl: './custom-algorithm-card.scss',
  imports: [CopyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-algorithm]': 'algorithm().id' },
})
export class CustomAlgorithmCard {
  readonly algorithm = input.required<RecommendationAlgorithm>();
  /** Last executed Cypher; the editor starts from it. */
  readonly cypher = input.required<string>();
  readonly count = input<number | null>(null);
  readonly enabled = input(true);
  readonly highlighted = input(false);
  readonly running = input(false);
  readonly error = input<string | null>(null);

  readonly run = output<string>();
  readonly reset = output<void>();
  readonly enabledChange = output<boolean>();
  readonly highlightToggled = output<void>();

  protected readonly draft = linkedSignal(() => this.cypher());
  protected readonly isDirty = computed(() => this.draft() !== this.cypher());
  /** Accordion state, remembered between visits. */
  protected readonly expanded = signal(localStorage.getItem(EXPANDED_KEY) !== 'false');

  /** A trailing space keeps the highlighted layer as tall as the textarea after a final newline. */
  protected readonly draftHtml = computed(() => highlightCypher(this.draft()) + ' ');

  protected toggleExpanded(): void {
    this.expanded.update((expanded) => !expanded);
    localStorage.setItem(EXPANDED_KEY, String(this.expanded()));
  }

  protected execute(): void {
    if (this.draft().trim()) this.run.emit(this.draft());
  }

  protected restoreExample(): void {
    this.draft.set(this.algorithm().cypher);
    this.reset.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.execute();
    }
  }
}
