import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { Icon } from '../icon/icon';

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
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './password.html',
})
export class Password {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly withStrength = input(false);
  readonly placeholder = input('');
  readonly hint = input('');
  readonly valueChange = output<string>();

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
      return { label: 'Fair', colorClass: 'text-warning' };
    }
    return { label: 'Strong', colorClass: 'text-success' };
  });

  protected toggleRevealed(): void {
    this.revealed.update((revealed) => !revealed);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.valueChange.emit(value);
  }
}
