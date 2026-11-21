import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DiscoveryPage } from './features/discovery/discovery-page';

@Component({
  selector: 'app-root',
  imports: [DiscoveryPage],
  template: '<app-discovery-page />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
