import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../domain/models';
import { USER_AGE_RANGE, UserService } from '../../domain/user.service';
import { flagOf } from '../../shared/person';

/** Modal form (native <dialog>) that creates a User node linked to a Nationality. */
@Component({
  selector: 'app-new-user-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './new-user-dialog.html',
  styleUrl: './new-user-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewUserDialog {
  private readonly users = inject(UserService);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly created = output<User>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly ageRange = USER_AGE_RANGE;
  protected readonly flagOf = flagOf;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Loaded only once the dialog is opened for the first time. */
  protected readonly nationalities = resource({
    params: () => this.open() || undefined,
    loader: () => this.users.getNationalities(),
  });

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    age: [25, [Validators.required, Validators.min(USER_AGE_RANGE.min), Validators.max(USER_AGE_RANGE.max), Validators.pattern(/^\d+$/)]],
    nationalityId: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        this.form.reset();
        this.error.set(null);
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const { name, age, nationalityId } = this.form.getRawValue();
      this.created.emit(await this.users.createUser({ name, age: Number(age), nationalityId }));
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.saving.set(false);
    }
  }

  /** Clicks on the backdrop land on the <dialog> element itself. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement && !this.saving()) this.closed.emit();
  }

  protected showError(control: 'name' | 'age' | 'nationalityId'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }
}
