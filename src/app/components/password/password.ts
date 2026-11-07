import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { copyText } from '../../utils/browser';
import {
  estimateStrength,
  generatePassword,
  StrengthLevel,
} from '../../utils/password';
import { Collapse } from '../collapse/collapse';
import { Icon } from '../icon/icon';
import { COPIED_RESET_MS } from '../../constants';

const LEVEL_TEXT: Record<StrengthLevel, string> = {
  0: 'text-destructive',
  1: 'text-warning',
  2: 'text-primary',
  3: 'text-success',
};
const LEVEL_BAR: Record<StrengthLevel, string> = {
  0: 'bg-destructive',
  1: 'bg-warning',
  2: 'bg-primary',
  3: 'bg-success',
};

@Component({
  selector: 'app-password',
  imports: [Collapse, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './password.html',
})
export class Password {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly withStrength = input(false);
  /** Offer a "Generate" action that fills in a strong random password. */
  readonly withGenerator = input(false);
  readonly placeholder = input('');
  readonly hint = input('');
  readonly valueChange = output<string>();

  protected readonly revealed = signal(false);
  protected readonly value = signal('');
  protected readonly generated = signal(false);
  protected readonly copied = signal(false);

  protected readonly strength = computed(() =>
    this.withStrength() && this.value() ? estimateStrength(this.value()) : null,
  );
  protected readonly strengthText = computed(() => {
    const strength = this.strength();
    return strength ? LEVEL_TEXT[strength.level] : '';
  });
  protected readonly segments = computed(() => {
    const strength = this.strength();
    return [0, 1, 2, 3].map((index) =>
      strength && index <= strength.level
        ? LEVEL_BAR[strength.level]
        : 'bg-muted',
    );
  });

  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>('field');
  private copiedTimeout: number | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimeout));
  }

  protected toggleRevealed(): void {
    this.revealed.update((revealed) => !revealed);
  }

  protected onInput(event: Event): void {
    this.generated.set(false);
    this.setValue((event.target as HTMLInputElement).value);
  }

  protected handleGenerate(): void {
    const password = generatePassword();
    this.field().nativeElement.value = password;
    this.revealed.set(true);
    this.generated.set(true);
    this.copied.set(false);
    this.setValue(password);
  }

  protected handleCopy(): void {
    copyText(this.value())
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.copiedTimeout);
        this.copiedTimeout = window.setTimeout(
          () => this.copied.set(false),
          COPIED_RESET_MS,
        );
      })
      .catch(() => {
        // Clipboard can be blocked; the password is visible to copy by hand.
        this.revealed.set(true);
      });
  }

  private setValue(value: string): void {
    this.value.set(value);
    this.valueChange.emit(value);
  }
}
