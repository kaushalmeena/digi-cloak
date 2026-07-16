import { Component, signal } from '@angular/core';

export const SNACKBAR_TIMEOUT = 3000;

@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.html',
})
export class Snackbar {
  readonly visible = signal(false);
  readonly message = signal('');

  private timeout: number | undefined;

  show(message: string): void {
    clearTimeout(this.timeout);
    this.message.set(message);
    this.visible.set(true);
    this.timeout = window.setTimeout(() => this.hide(), SNACKBAR_TIMEOUT);
  }

  hide(): void {
    clearTimeout(this.timeout);
    this.visible.set(false);
  }
}
