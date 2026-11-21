import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Decorative hero illustration: a glowing capsule holding a small graph. */
@Component({
  selector: 'app-hero-orb',
  templateUrl: './hero-orb.html',
  styleUrl: './hero-orb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class HeroOrb {
  protected readonly nodes = [
    { x: 200, y: 120, r: 6 },
    { x: 170, y: 160, r: 4 },
    { x: 232, y: 152, r: 5 },
    { x: 186, y: 206, r: 5 },
    { x: 226, y: 214, r: 4 },
    { x: 204, y: 250, r: 6 },
    { x: 160, y: 236, r: 3 },
    { x: 244, y: 186, r: 3 },
  ];

  protected readonly edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5], [1, 6], [6, 5], [2, 7], [7, 4],
  ].map(([from, to]) => ({ from: this.nodes[from], to: this.nodes[to] }));
}
