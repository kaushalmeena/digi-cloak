import { Component, computed, input, signal } from '@angular/core';

interface Strength {
  label: string;
  colorClass: string;
}

function scorePassword(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return score;
}

@Component({
  selector: 'app-password',
  templateUrl: './password.html',
})
export class Password {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly withStrength = input(false);

  protected readonly revealed = signal(false);
  protected readonly value = signal('');

  protected readonly strength = computed<Strength | null>(() => {
    if (!this.withStrength() || !this.value()) {
      return null;
    }
    const score = scorePassword(this.value());
    if (score <= 2) {
      return { label: 'Weak', colorClass: 'text-destructive' };
    }
    if (score <= 3) {
      return { label: 'Fair', colorClass: 'opacity-70' };
    }
    return { label: 'Strong', colorClass: 'text-success' };
  });

  protected toggleRevealed(): void {
    this.revealed.update((revealed) => !revealed);
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
