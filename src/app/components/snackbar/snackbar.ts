import { Component, signal } from '@angular/core';

export const SNACKBAR_TIMEOUT = 3000;

export type SnackbarKind = 'error' | 'success' | 'info';

@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.html',
  host: {
    role: 'status',
    'aria-live': 'polite',
  },
})
export class Snackbar {
  readonly visible = signal(false);
  readonly message = signal('');
  readonly kind = signal<SnackbarKind>('info');

  private timeout: number | undefined;

  show(message: string, kind: SnackbarKind = 'error'): void {
    clearTimeout(this.timeout);
    this.message.set(message);
    this.kind.set(kind);
    this.visible.set(true);
    this.timeout = window.setTimeout(() => this.hide(), SNACKBAR_TIMEOUT);
  }

  hide(): void {
    clearTimeout(this.timeout);
    this.visible.set(false);
  }
}
