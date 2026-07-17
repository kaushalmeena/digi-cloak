import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-compare',
  template: `
    <div
      class="relative w-full h-[min(75vh,700px)] overflow-hidden rounded-[3px] bg-background select-none"
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
        class="absolute top-0 bottom-0 w-px bg-foreground/70 pointer-events-none"
        [style.left.%]="position()"
        aria-hidden="true"
      >
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-[0_2px_6px_#00000066]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z" />
          </svg>
        </div>
      </div>
      <span
        class="absolute bottom-0.5 left-0.5 px-3 py-1.5 bg-primary/80 text-primary-foreground text-sm pointer-events-none"
        aria-hidden="true"
        >Original</span
      >
      <span
        class="absolute bottom-0.5 right-0.5 px-3 py-1.5 bg-primary/80 text-primary-foreground text-sm pointer-events-none"
        aria-hidden="true"
        >Encoded</span
      >
      <input
        type="range"
        class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
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
