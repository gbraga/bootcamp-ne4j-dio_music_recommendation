import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { User } from '../../domain/models';
import { flagOf, initialsOf } from '../../shared/person';

@Component({
  selector: 'app-user-picker',
  templateUrl: './user-picker.html',
  styleUrl: './user-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPicker {
  readonly users = input.required<User[]>();
  readonly selected = input<User | undefined>();
  readonly loadingMessage = input<string | null>(null);
  readonly selectedChange = output<string>();
  readonly addRequested = output<void>();

  protected readonly flagOf = flagOf;
  protected readonly initialsOf = initialsOf;
}
