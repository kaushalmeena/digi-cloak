import { Component, input } from '@angular/core';

@Component({
  selector: 'app-figure',
  template: `
    <div data-testid="figure-label" class="mt-4 mb-2.5 text-base">{{ label() }}</div>
    <div class="relative rounded-[3px] bg-background ring-1 ring-border">
      <div data-testid="figure-media" class="flex items-center justify-center h-[210px]">
        @if (source()) {
          <img
            class="max-w-full h-[210px] transition-opacity duration-300 starting:opacity-0 motion-reduce:transition-none"
            [alt]="alt()"
            [src]="source()"
          />
        } @else {
          <svg
            class="h-[52px] w-[52px] opacity-55 fill-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            aria-hidden="true"
          >
            <path
              d="M480.6 11H31.4C20.1 11 11 20.1 11 31.4v449.2c0 11.3 9.1 20.4 20.4 20.4h449.2c11.3 0 20.4-9.1 20.4-20.4V31.4c0-11.3-9.1-20.4-20.4-20.4zm-20.4 40.8v133.8c-67.3 8.2-119.4 31.2-159.7 60.9C181.2 235.6 96.9 302 51.8 350.8v-299h408.4zM51.8 416.1c15-22.2 87-119 203.8-129.1-58 63.7-79.4 139.1-86.5 173.1H51.8v-44zm158.7 44.1c12.7-58.1 63.5-208.3 249.7-233.4v233.4H210.5z"
            />
            <path
              d="M153.8 213.4c35.2 0 63.9-28.7 63.9-63.9s-28.6-63.9-63.9-63.9c-35.2 0-63.9 28.7-63.9 63.9.1 35.2 28.7 63.9 63.9 63.9zm0-86.9c12.7 0 23 10.3 23 23s-10.3 23-23 23-23-10.3-23-23 10.3-23 23-23z"
            />
          </svg>
        }
      </div>
    </div>
  `,
})
export class Figure {
  readonly label = input.required<string>();
  readonly source = input('');
  readonly alt = input('Image');
}
