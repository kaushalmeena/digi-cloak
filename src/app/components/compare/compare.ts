import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="checkerboard relative h-[min(70vh,640px)] w-full overflow-hidden select-none"
    >
      <img
        class="absolute inset-0 size-full object-contain"
        alt="Original image"
        [src]="before()"
      />
      <img
        class="absolute inset-0 size-full object-contain"
        alt="Encoded image"
        [src]="after()"
        [style.clip-path]="'inset(0 0 0 ' + position() + '%)'"
      />
      <div
        class="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(16_22_26/0.25)]"
        [style.left.%]="position()"
        aria-hidden="true"
      >
        <div
          class="absolute top-1/2 left-1/2 flex h-8 w-5 -translate-1/2 items-center justify-center gap-0.5 rounded-full bg-white shadow-[0_1px_4px_rgb(16_22_26/0.3)]"
        >
          <span class="h-3 w-px bg-zinc-400"></span>
          <span class="h-3 w-px bg-zinc-400"></span>
        </div>
      </div>
      <span
        class="pointer-events-none absolute top-3 left-3 rounded-md bg-card/90 px-2 py-1 text-xs font-medium shadow-sm"
        aria-hidden="true"
        >Original</span
      >
      <span
        class="pointer-events-none absolute top-3 right-3 rounded-md bg-card/90 px-2 py-1 text-xs font-medium shadow-sm"
        aria-hidden="true"
        >With message</span
      >
      <input
        type="range"
        class="absolute inset-0 size-full cursor-ew-resize opacity-0"
        min="0"
        max="100"
        [value]="position()"
        aria-label="Reveal encoded image"
        (input)="onSlide($event)"
      />
    </div>
  `,
})
export class Compare {
  readonly before = input.required<string>();
  readonly after = input.required<string>();

  protected readonly position = signal(50);

  protected onSlide(event: Event): void {
    this.position.set(Number((event.target as HTMLInputElement).value));
  }
}
