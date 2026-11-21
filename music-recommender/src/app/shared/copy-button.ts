import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';

const FEEDBACK_MS = 1500;

/** Icon button that copies `text` to the clipboard and briefly shows a check mark. */
@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [class.copied]="copied()"
      [title]="copied() ? 'Copiado!' : label()"
      [attr.aria-label]="label()"
      (click)="copy($event)"
    >
      @if (copied()) {
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      } @else {
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      }
    </button>
    <span class="sr-only" aria-live="polite">{{ copied() ? 'Copiado' : '' }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    button {
      display: inline-grid;
      place-items: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      background: var(--code-bg);
      color: var(--text-muted);
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.15s ease, color 0.15s ease, border-color 0.15s ease;

      &:hover,
      &:focus-visible {
        opacity: 1;
        color: var(--text);
      }

      &:focus-visible {
        outline: 3px solid var(--algo-soft);
        outline-offset: 1px;
      }

      &.copied {
        opacity: 1;
        color: var(--algo);
        border-color: var(--algo);
      }
    }

    svg {
      width: 15px;
      height: 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class CopyButton {
  readonly text = input.required<string>();
  readonly label = input('Copiar');

  protected readonly copied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(event: Event): Promise<void> {
    // Cards react to clicks (highlight, accordion); copying must not trigger them.
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(this.text());
    } catch {
      copyWithFallback(this.text());
    }
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), FEEDBACK_MS);
  }
}

/** The async Clipboard API is missing outside secure contexts (e.g. plain http on a LAN IP). */
function copyWithFallback(text: string): void {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.cssText = 'position:fixed;opacity:0';
  document.body.append(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}
