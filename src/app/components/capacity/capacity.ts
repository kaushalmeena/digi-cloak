import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Above this share of capacity the meter turns amber as an early warning. */
const WARN_RATIO = 0.85;

/**
 * How much of the image's hiding capacity the message uses, drawn as a strip
 * of pixel-like cells (the masked track) so it reads as "space in the image".
 */
@Component({
  selector: 'app-capacity',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-3' },
  template: `
    <div
      class="h-2 flex-1 overflow-hidden bg-muted mask-[repeating-linear-gradient(90deg,#000_0_5px,transparent_5px_7px)]"
      role="meter"
      aria-label="Image capacity used"
      aria-valuemin="0"
      [attr.aria-valuemax]="capacity()"
      [attr.aria-valuenow]="used()"
    >
      <div
        class="h-full transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none"
        [class]="barTone()"
        [style.width.%]="percent()"
      ></div>
    </div>
    <span
      data-testid="capacity-meter"
      class="text-xs whitespace-nowrap tabular-nums"
      [class]="textTone()"
      [attr.title]="
        tooLarge()
          ? 'Message too large for this image'
          : 'Bytes used / approximate image capacity'
      "
    >
      {{ used() | number }} / ~{{ capacity() | number }}
    </span>
  `,
})
export class Capacity {
  readonly used = input.required<number>();
  readonly capacity = input.required<number>();
  readonly tooLarge = input(false);

  protected readonly percent = computed(() => {
    const capacity = this.capacity();
    return capacity > 0 ? Math.min(100, (this.used() / capacity) * 100) : 100;
  });

  private readonly tone = computed(() => {
    if (this.tooLarge()) {
      return 'danger';
    }
    return this.percent() / 100 >= WARN_RATIO ? 'warn' : 'ok';
  });

  protected readonly barTone = computed(
    () =>
      ({ danger: 'bg-destructive', warn: 'bg-warning', ok: 'bg-primary' })[
        this.tone()
      ],
  );

  protected readonly textTone = computed(
    () =>
      ({
        danger: 'font-medium text-destructive',
        warn: 'text-warning',
        ok: 'text-muted-foreground',
      })[this.tone()],
  );
}
