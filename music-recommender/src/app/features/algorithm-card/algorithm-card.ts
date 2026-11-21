import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RecommendationAlgorithm } from '../../domain/models';
import { highlightCypher } from '../../shared/cypher-highlight';

@Component({
  selector: 'app-algorithm-card',
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-algorithm]': 'algorithm().id' },
})
export class AlgorithmCard {
  readonly algorithm = input.required<RecommendationAlgorithm>();
  readonly count = input<number | null>(null);
  readonly enabled = input(true);
  readonly highlighted = input(false);
  readonly enabledChange = output<boolean>();
  readonly highlightToggled = output<void>();

  /** The card already shows the description, so the leading comment is omitted. */
  protected readonly cypherHtml = computed(() =>
    highlightCypher(this.algorithm().cypher.replace(/^(\s*\/\/.*\n)+/, '')),
  );
}
