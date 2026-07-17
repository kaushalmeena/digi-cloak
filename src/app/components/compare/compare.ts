import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-compare',
  template: `
    <div class="card-label mt-4 mb-2.5 text-base">
      Compare (original ↔ encoded)
    </div>
    <div
      class="relative h-[210px] rounded-[3px] bg-background ring-1 ring-border overflow-hidden"
    >
      <img
        class="absolute inset-0 w-full h-full object-contain"
        alt="Original image"
        [src]="before()"
      />
      <img
        class="absolute inset-0 w-full h-full object-contain"
        alt="Encoded image"
        [src]="after()"
        [style.clip-path]="'inset(0 0 0 ' + position() + '%)'"
      />
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-foreground/60"
        [style.left.%]="position()"
        aria-hidden="true"
      ></div>
    </div>
    <input
      type="range"
      class="w-full mt-2 accent-current cursor-ew-resize"
      min="0"
      max="100"
      [value]="position()"
      aria-label="Reveal encoded image"
      (input)="onSlide($event)"
    />
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
