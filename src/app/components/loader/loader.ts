import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div
      class="box-border shrink-0 animate-spin rounded-full border-solid border-current border-t-transparent"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.border-width.px]="borderWidth()"
      role="status"
      aria-label="Loading"
    ></div>
  `,
})
export class Loader {
  /** Outer diameter in pixels */
  readonly size = input(18);
  /** Border thickness in pixels */
  readonly borderWidth = input(2);
}
