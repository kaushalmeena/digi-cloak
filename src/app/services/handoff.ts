import { Service } from '@angular/core';

/**
 * Carries an image from one mode to the other (e.g. "Reveal it instead"),
 * so the person never has to choose the same file twice.
 */
@Service()
export class Handoff {
  private pending: File | null = null;

  give(file: File): void {
    this.pending = file;
  }

  take(): File | null {
    const file = this.pending;
    this.pending = null;
    return file;
  }
}
